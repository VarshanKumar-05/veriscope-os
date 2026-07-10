import { MOCK_DATABASE } from './mockData.js';
import { NewsData } from '../../shared/types.js';
import { runNewsSentimentAgent, hasLLMCredentials } from './llm.js';

// Helper to fetch with timeout using AbortController
async function fetchWithTimeout(url: string, options: any = {}, timeoutMs: number = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds`);
    }
    throw error;
  }
}

// Retry helper with exponential backoff
async function fetchWithRetry(url: string, options: any = {}, retries: number = 3, delay: number = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (e: any) {
      if (i === retries - 1) throw e;
      console.warn(`[News Fetch Retry] Attempt ${i + 1} failed for ${url}: ${e.message}. Retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error(`Fetch failed for ${url}`);
}

function parseGoogleNewsRss(xml: string) {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = content.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = content.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    
    if (titleMatch && linkMatch) {
      // Extract publisher from title like "Title - Source"
      const titleStr = titleMatch[1].trim().replace(/&amp;/g, '&');
      const parts = titleStr.split(' - ');
      const source = parts.length > 1 ? parts.pop() || 'Google News' : 'Google News';
      const cleanTitle = parts.join(' - ');

      items.push({
        title: cleanTitle || titleStr,
        source,
        url: linkMatch[1].trim(),
        date: pubDateMatch ? new Date(pubDateMatch[1]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }
  return items;
}

export async function getNews(ticker: string, useMock: boolean = false): Promise<NewsData> {
  const cleanTicker = ticker.toUpperCase().trim();

  // If mock mode is forced, or if it is running offline/demo, return mock
  if (useMock || !hasLLMCredentials()) {
    console.log(`[News Analyst] Running in Mock/Sandbox mode for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].news;
  }

  const newsApiKey = process.env.NEWS_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  let rawArticles: any[] = [];

  // 1. Try Google News RSS (always available, doesn't require keys)
  try {
    console.log(`[News Analyst] Requesting Google News RSS for ${cleanTicker}`);
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(cleanTicker + ' stock')}&hl=en-US&gl=US&ceid=US:en`;
    const response = await fetchWithRetry(url, {}, 3, 1000);
    if (response.ok) {
      const xml = await response.text();
      rawArticles = parseGoogleNewsRss(xml);
      console.log(`[News Analyst] Google News RSS fetched ${rawArticles.length} articles`);
    }
  } catch (err: any) {
    console.warn(`[News Analyst] Google News RSS failed for ${cleanTicker}:`, err.message);
  }

  // 2. Try NewsAPI (if key exists and RSS was empty or failed)
  if (rawArticles.length === 0 && newsApiKey) {
    try {
      console.log(`[News Analyst] Requesting NewsAPI for ${cleanTicker}`);
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(cleanTicker + ' stock')}&sortBy=publishedAt&pageSize=8&apiKey=${newsApiKey}`;
      const response = await fetchWithRetry(url, {}, 2, 1000);
      if (response.ok) {
        const data = await response.json() as any;
        if (data.articles && data.articles.length > 0) {
          rawArticles = data.articles.map((art: any) => ({
            title: art.title,
            source: art.source?.name || 'News Source',
            url: art.url || '',
            date: art.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0]
          }));
          console.log(`[News Analyst] NewsAPI fetched ${rawArticles.length} articles`);
        }
      }
    } catch (err: any) {
      console.warn(`[News Analyst] NewsAPI failed for ${cleanTicker}:`, err.message);
    }
  }

  // 3. Try Tavily (if key exists and others failed)
  if (rawArticles.length === 0 && tavilyApiKey) {
    try {
      console.log(`[News Analyst] Requesting Tavily API search for ${cleanTicker}`);
      const response = await fetchWithRetry('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `latest news and financials for ${cleanTicker} stock`,
          search_depth: 'advanced',
          max_results: 6
        })
      }, 2, 1000);

      if (response.ok) {
        const data = await response.json() as any;
        if (data.results && data.results.length > 0) {
          rawArticles = data.results.map((res: any) => ({
            title: res.title,
            source: new URL(res.url).hostname.replace('www.', ''),
            url: res.url,
            date: new Date().toISOString().split('T')[0]
          }));
          console.log(`[News Analyst] Tavily fetched ${rawArticles.length} articles`);
        }
      }
    } catch (err: any) {
      console.warn(`[News Analyst] Tavily search failed for ${cleanTicker}:`, err.message);
    }
  }

  // If no articles could be fetched from any live source, fallback to mock data
  if (rawArticles.length === 0) {
    console.log(`[News Analyst] No live news fetched. Falling back to Mock news for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].news;
  }

  // Take top 6 articles to avoid excessive token usage and analyze them with Gemini
  const topArticles = rawArticles.slice(0, 6);
  try {
    console.log(`[News Analyst] Analyzing sentiment for ${topArticles.length} articles via Gemini News Agent`);
    const analysis = await runNewsSentimentAgent(topArticles);

    // Merge original URLs, titles, and dates with LLM classified sentiment/summaries
    const articles = topArticles.map((art, index) => {
      const item = analysis.articles[index] || { sentiment: 'neutral', category: 'general', summary: art.title };
      return {
        id: `news_${index}`,
        title: art.title,
        sentiment: item.sentiment,
        category: item.category,
        source: art.source,
        summary: item.summary,
        date: art.date,
        url: art.url
      };
    });

    return {
      articles,
      sentimentSummary: analysis.sentimentSummary
    };
  } catch (error: any) {
    console.warn(`[News Analyst] Gemini sentiment analysis failed:`, error.message);
    // Graceful fallback to simple client-side keyword classification
    let posCount = 0, negCount = 0, neuCount = 0;
    const articles = topArticles.map((art, index) => {
      const text = art.title.toLowerCase();
      let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
      if (text.includes('beat') || text.includes('surge') || text.includes('growth') || text.includes('buy') || text.includes('raise') || text.includes('up')) {
        sentiment = 'positive';
        posCount++;
      } else if (text.includes('fall') || text.includes('drop') || text.includes('regulation') || text.includes('fine') || text.includes('lawsuit') || text.includes('down')) {
        sentiment = 'negative';
        negCount++;
      } else {
        neuCount++;
      }
      return {
        id: `news_${index}`,
        title: art.title,
        sentiment,
        category: 'general' as const,
        source: art.source,
        summary: art.title,
        date: art.date,
        url: art.url
      };
    });

    const total = articles.length;
    return {
      articles,
      sentimentSummary: {
        positive: Math.round((posCount / total) * 100),
        neutral: Math.round((neuCount / total) * 100),
        negative: Math.round((negCount / total) * 100)
      }
    };
  }
}
