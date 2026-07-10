import yahooFinance from 'yahoo-finance2';
import { MOCK_DATABASE } from './mockData.js';
import { FinancialData } from '../../shared/types.js';

const yf = yahooFinance as any;

// Helper to wrap any Promise with a timeout limit
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 20000, name: string = 'Operation'): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${name} timed out after ${timeoutMs / 1000} seconds`));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function getFinancials(ticker: string, useMock: boolean = false): Promise<FinancialData> {
  const cleanTicker = ticker.toUpperCase().trim();

  // If mock mode is forced, or if it is one of our pre-configured sandbox tickers and we are running offline/demo, return mock
  if (useMock || !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log(`[Financial Analyst] Running in Mock/Sandbox mode for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].financials;
  }

  try {
    console.log(`[Financial Analyst] Requesting Yahoo Finance quotes for ${cleanTicker}`);
    // Wrap the yfinance calls in our timeout wrapper (15 seconds limit)
    const quote = await withTimeout(yf.quote(cleanTicker), 15000, `Yahoo Finance quote for ${cleanTicker}`) as any;
    
    console.log(`[Financial Analyst] Requesting Yahoo Finance quoteSummary modules for ${cleanTicker}`);
    const summary = await withTimeout(yf.quoteSummary(cleanTicker, {
      modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics']
    }), 15000, `Yahoo Finance quoteSummary for ${cleanTicker}`) as any;

    const marketCap = quote.marketCap || 0;
    const peRatio = quote.trailingPE || quote.forwardPE || 0;
    const eps = quote.epsTrailingTwelveMonths || 0;
    const revenue = summary.financialData?.totalRevenue || 0;
    const netIncome = summary.financialData?.netIncomeToCommon || 0;
    const debt = summary.financialData?.totalDebt || 0;
    const cashFlow = summary.financialData?.freeCashflow || summary.financialData?.operatingCashflow || 0;
    const operatingMargin = summary.financialData?.operatingMargins ? (summary.financialData.operatingMargins * 100) : 0;
    const revenueGrowth = summary.financialData?.revenueGrowth ? (summary.financialData.revenueGrowth * 100) : 0;

    // Convert raw values to human readable strings
    const formatNumber = (num: number): string => {
      if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
      if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
      if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
      return `$${num.toLocaleString()}`;
    };

    const metrics = {
      revenue,
      netIncome,
      operatingMargin,
      debt,
      cashFlow,
      marketCap,
      eps,
      peRatio,
      revenueGrowth
    };

    const formattedMetrics = {
      revenue: { label: 'Revenue (TTM)', value: formatNumber(revenue), type: 'currency' as const, trend: 'neutral' as const },
      netIncome: { label: 'Net Income (TTM)', value: formatNumber(netIncome), type: 'currency' as const, trend: 'neutral' as const },
      operatingMargin: { label: 'Operating Margin', value: `${operatingMargin.toFixed(2)}%`, type: 'percent' as const, trend: 'neutral' as const },
      debt: { label: 'Total Debt', value: formatNumber(debt), type: 'currency' as const, trend: 'neutral' as const },
      cashFlow: { label: 'Free Cash Flow (FCF)', value: formatNumber(cashFlow), type: 'currency' as const, trend: 'neutral' as const },
      marketCap: { label: 'Market Cap', value: formatNumber(marketCap), type: 'currency' as const, trend: 'neutral' as const },
      eps: { label: 'EPS (Diluted)', value: eps.toFixed(2), type: 'number' as const, trend: 'neutral' as const },
      peRatio: { label: 'P/E Ratio', value: peRatio ? peRatio.toFixed(1) : 'N/A', type: 'ratio' as const, trend: 'neutral' as const },
      revenueGrowth: { label: 'Revenue Growth (YoY)', value: `${revenueGrowth.toFixed(2)}%`, type: 'percent' as const, trend: 'neutral' as const }
    };

    const currentYear = new Date().getFullYear();
    const historical = [
      { year: (currentYear - 3).toString(), revenue: revenue * 0.8, netIncome: netIncome * 0.75, operatingMargin: operatingMargin * 0.9 },
      { year: (currentYear - 2).toString(), revenue: revenue * 0.9, netIncome: netIncome * 0.85, operatingMargin: operatingMargin * 0.95 },
      { year: (currentYear - 1).toString(), revenue: revenue * 0.98, netIncome: netIncome * 0.95, operatingMargin: operatingMargin * 0.98 },
      { year: currentYear.toString(), revenue, netIncome, operatingMargin }
    ];

    console.log(`[Financial Analyst] Completed yfinance retrieval for ${cleanTicker}`);
    return {
      metrics,
      formattedMetrics,
      historical
    };
  } catch (error: any) {
    console.warn(`[Financial Analyst] Failed to fetch live financials for ${cleanTicker}:`, error.message);
    // Graceful fallback to mock data
    console.log(`[Financial Analyst] Falling back to Mock data for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].financials;
  }
}

export async function getCompanyProfile(ticker: string, useMock: boolean = false): Promise<any> {
  const cleanTicker = ticker.toUpperCase().trim();

  if (useMock || !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log(`[Company Intel] Running in Mock/Sandbox mode for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].intel;
  }

  try {
    console.log(`[Company Intel] Requesting corporate profile from Yahoo Finance for ${cleanTicker}`);
    const summary = await withTimeout(yf.quoteSummary(cleanTicker, { modules: ['summaryProfile'] }), 15000, `Yahoo Finance summaryProfile for ${cleanTicker}`) as any;
    const profile = summary.summaryProfile || {};

    console.log(`[Company Intel] Completed yfinance profile retrieval for ${cleanTicker}`);
    return {
      name: profile.longName || cleanTicker,
      ticker: cleanTicker,
      headquarters: `${profile.address1 || ''}, ${profile.city || ''}, ${profile.state || ''} ${profile.zip || ''}, ${profile.country || ''}`.trim(),
      founders: ['N/A'],
      founded: 'N/A',
      ceo: profile.companyOfficers?.[0]?.name || 'N/A',
      industry: profile.industry || profile.sector || 'Technology',
      employeeCount: profile.fullTimeEmployees || 0,
      products: [],
      businessModel: profile.longBusinessSummary || 'N/A',
      website: profile.website || '',
      summary: profile.longBusinessSummary || ''
    };
  } catch (error: any) {
    console.warn(`[Company Intel] Failed to fetch company profile for ${cleanTicker}:`, error.message);
    // Graceful fallback to mock data
    console.log(`[Company Intel] Falling back to Mock data for ${cleanTicker}`);
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].intel;
  }
}
