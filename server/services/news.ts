import { MOCK_DATABASE } from './mockData.js';
import { NewsData } from '../../shared/types.js';

export async function getNews(ticker: string, useMock: boolean = false): Promise<NewsData> {
  const cleanTicker = ticker.toUpperCase().trim();

  // If mock mode is forced, or if it is one of our pre-configured sandbox tickers and we are running offline/demo, return mock
  if (useMock || MOCK_DATABASE[cleanTicker]) {
    if (MOCK_DATABASE[cleanTicker]) {
      return MOCK_DATABASE[cleanTicker].news;
    }
  }

  // Live Mode: Check for NewsAPI or Tavily Search API key
  const newsApiKey = process.env.NEWS_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (newsApiKey) {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(cleanTicker + ' stock')}&sortBy=publishedAt&pageSize=6&apiKey=${newsApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json() as any;
        if (data.articles && data.articles.length > 0) {
          let posCount = 0;
          let neuCount = 0;
          let negCount = 0;

          const articles = data.articles.map((art: any, index: number) => {
            // Basic heuristic sentiment analyzer (live fallback)
            const text = (art.title + ' ' + art.description).toLowerCase();
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
            if (text.includes('beat') || text.includes('surge') || text.includes('growth') || text.includes('buy') || text.includes('raise') || text.includes('expand')) {
              sentiment = 'positive';
              posCount++;
            } else if (text.includes('fall') || text.includes('drop') || text.includes('regulation') || text.includes('fine') || text.includes('lawsuit') || text.includes('decline')) {
              sentiment = 'negative';
              negCount++;
            } else {
              neuCount++;
            }

            return {
              id: `news_${index}`,
              title: art.title,
              sentiment,
              category: text.includes('earning') ? 'earnings' : text.includes('ai') ? 'AI announcements' : 'general',
              source: art.source?.name || 'News Source',
              summary: art.description || art.title,
              date: art.publishedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              url: art.url || ''
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
    } catch (error) {
      console.warn(`Failed to fetch news from NewsAPI for ${cleanTicker}:`, error);
    }
  } else if (tavilyApiKey) {
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: tavilyApiKey,
          query: `latest news and financials for ${cleanTicker} stock`,
          search_depth: 'advanced',
          include_answer: false,
          max_results: 5
        })
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data.results && data.results.length > 0) {
          const articles = data.results.map((res: any, index: number) => {
            const text = (res.title + ' ' + res.content).toLowerCase();
            let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
            if (text.includes('beat') || text.includes('surge') || text.includes('growth') || text.includes('buy')) {
              sentiment = 'positive';
            } else if (text.includes('fall') || text.includes('drop') || text.includes('regulation') || text.includes('fine') || text.includes('lawsuit')) {
              sentiment = 'negative';
            }

            return {
              id: `tavily_${index}`,
              title: res.title,
              sentiment,
              category: text.includes('earning') ? 'earnings' : 'general',
              source: new URL(res.url).hostname.replace('www.', ''),
              summary: res.content.length > 300 ? res.content.substring(0, 300) + '...' : res.content,
              date: new Date().toISOString().split('T')[0],
              url: res.url
            };
          });

          const pos = articles.filter((a: any) => a.sentiment === 'positive').length;
          const neg = articles.filter((a: any) => a.sentiment === 'negative').length;
          const neu = articles.length - pos - neg;

          return {
            articles,
            sentimentSummary: {
              positive: Math.round((pos / articles.length) * 100),
              neutral: Math.round((neu / articles.length) * 100),
              negative: Math.round((neg / articles.length) * 100)
            }
          };
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch news from Tavily for ${cleanTicker}:`, error);
    }
  }

  // Fallback to mock data for the requested ticker, or AAPL if not in mock database
  const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
  return MOCK_DATABASE[fallbackTicker].news;
}
