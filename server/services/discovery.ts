import { callGeminiWithRetry, hasLLMCredentials } from './llm.js';

export interface SearchSuggestion {
  ticker: string;
  name: string;
  exchange: string;
  industry?: string;
}

// Cache discover results to prevent repeated API/LLM calls
const discoveryCache = new Map<string, SearchSuggestion[]>();

function cleanJson(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
  }
  return cleaned;
}

export async function discoverCompanies(query: string): Promise<SearchSuggestion[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // Check cache
  const cached = discoveryCache.get(cleanQuery.toLowerCase());
  if (cached) {
    console.log(`[Discovery] Returning cached discovery results for "${cleanQuery}"`);
    return cached;
  }

  const results: SearchSuggestion[] = [];
  const tickersSeen = new Set<string>();

  // 1. Try raw Yahoo Finance Search API using fetch with User-Agent
  try {
    console.log(`[Discovery] Querying Yahoo Finance Search API for "${cleanQuery}"`);
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (response.ok) {
      const data = await response.json() as any;
      if (data.quotes) {
        data.quotes.forEach((q: any) => {
          if (q.symbol) {
            const ticker = q.symbol.toUpperCase().trim();
            const type = (q.quoteType || '').toUpperCase();
            if (type === 'EQUITY' || type === 'equity' || type === '' || q.exchange) {
              if (!tickersSeen.has(ticker)) {
                tickersSeen.add(ticker);
                results.push({
                  ticker,
                  name: q.longname || q.shortname || q.symbol,
                  exchange: q.exchange || 'Unknown',
                  industry: q.industry || undefined
                });
              }
            }
          }
        });
      }
    }
  } catch (err: any) {
    console.warn(`[Discovery] Yahoo Finance search API failed for "${cleanQuery}":`, err.message);
  }

  // 2. Call Gemini to resolve company queries and generate global suggestion matches
  if (hasLLMCredentials()) {
    try {
      console.log(`[Discovery] Requesting Gemini to resolve company query "${cleanQuery}"`);
      const prompt = `You are a financial company discovery engine. The user entered the search query: "${cleanQuery}".
Identify up to 6 publicly listed companies matching this query. Include major global companies matching this name or partial name.
For each company, resolve its standard stock ticker (including the exchange suffix if not listed in the US, e.g. "RELIANCE.NS" for NSE, "BMW.DE" for Frankfurt, "7203.T" for Tokyo, "005930.KS" for Korea, "TCS.NS" for NSE, "BARC.L" for LSE, "NESN.SW" for Swiss, etc.) and exchange.
Return your response ONLY as a JSON array matching this TypeScript interface:
interface DiscoveryMatch {
  ticker: string; // Stock ticker, e.g., "JPM", "RELIANCE.NS", "BMW.DE"
  name: string;   // Full company name
  exchange: string; // Exchange name, e.g., "NYSE", "NSE", "FRA", "TSE", "LSE", "SIX"
}
Format exactly as raw JSON without markdown formatting. Do not include markdown code fence blocks.`;

      const llmRes = await callGeminiWithRetry(prompt, true);
      const cleaned = cleanJson(llmRes);
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        parsed.forEach((item: any) => {
          if (item.ticker && item.name) {
            const ticker = item.ticker.toUpperCase().trim();
            if (!tickersSeen.has(ticker)) {
              tickersSeen.add(ticker);
              results.push({
                ticker,
                name: item.name.trim(),
                exchange: item.exchange?.toUpperCase().trim() || 'Unknown'
              });
            }
          }
        });
      }
    } catch (err: any) {
      console.warn(`[Discovery] Gemini suggestions failed for "${cleanQuery}":`, err.message);
    }
  }

  // Fallback to local trending tickers if absolutely nothing returned
  if (results.length === 0) {
    const popular = [
      { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
      { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE' },
      { ticker: 'TCS.NS', name: 'Tata Consultancy Services Limited', exchange: 'NSE' }
    ];
    popular.forEach(p => {
      if (p.name.toLowerCase().includes(cleanQuery.toLowerCase()) || p.ticker.includes(cleanQuery.toUpperCase())) {
        results.push(p);
      }
    });
  }

  discoveryCache.set(cleanQuery.toLowerCase(), results);
  return results;
}

export async function resolveBestMatch(query: string): Promise<SearchSuggestion | null> {
  const cleanQuery = query.trim().toUpperCase();
  if (!cleanQuery) return null;

  // Try direct ticker lookup via raw fetch
  try {
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${cleanQuery}`;
    const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (res.ok) {
      const data = await res.json() as any;
      const q = data.quoteResponse?.result?.[0];
      if (q && q.symbol) {
        return {
          ticker: q.symbol.toUpperCase(),
          name: q.longName || q.shortName || q.symbol,
          exchange: q.exchange || 'Unknown'
        };
      }
    }
  } catch (e) {
    // Direct quote lookup failed, continue to discovery engine
  }

  const matches = await discoverCompanies(query);
  if (matches.length > 0) {
    return matches[0];
  }

  return null;
}
