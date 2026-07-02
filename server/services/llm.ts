import { MOCK_DATABASE } from './mockData.js';
import { 
  ResearchPlanItem, 
  CompanyIntel, 
  FinancialData, 
  NewsData, 
  CompetitorData, 
  RiskData, 
  EvidenceCard, 
  Decision,
  CompetitorComparison,
  RiskItem
} from '../../shared/types.js';

// Unified helper to check if we can run Live LLM
export function hasLLMCredentials(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
}

async function callGemini(prompt: string, expectJson: boolean = false): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: expectJson ? { responseMimeType: 'application/json' } : undefined
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API.');
  return text;
}

async function callOpenAI(prompt: string, expectJson: boolean = false): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is not configured.');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: expectJson ? { type: 'json_object' } : undefined
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
  }

  const data = await response.json() as any;
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from OpenAI API.');
  return text;
}

async function queryLLM(prompt: string, expectJson: boolean = false): Promise<string> {
  if (process.env.GEMINI_API_KEY) {
    return callGemini(prompt, expectJson);
  } else if (process.env.OPENAI_API_KEY) {
    return callOpenAI(prompt, expectJson);
  }
  throw new Error('No LLM credentials available.');
}

// ----------------------------------------------------
// Agent Handlers (Live Callers & Fallbacks)
// ----------------------------------------------------

export async function runPlannerAgent(ticker: string, useMock: boolean = false): Promise<ResearchPlanItem[]> {
  const cleanTicker = ticker.toUpperCase().trim();
  
  if (useMock || !hasLLMCredentials()) {
    return [
      { id: '1', task: 'Gather core corporate profile and operations model', status: 'completed', agent: 'Company Intel' },
      { id: '2', task: 'Fetch income statements and compute financial ratios', status: 'completed', agent: 'Financial Analyst' },
      { id: '3', task: 'Gather recent news and calculate sentiment index', status: 'completed', agent: 'News Analyst' },
      { id: '4', task: 'Identify top competitors and map relative metrics', status: 'completed', agent: 'Competitor Analyst' },
      { id: '5', task: 'Assess business, legal, economic, and supply chain risks', status: 'completed', agent: 'Risk Analyst' },
      { id: '6', task: 'Synthesize evidence claims and source confidence levels', status: 'completed', agent: 'Evidence Builder' },
      { id: '7', task: 'Resolve evidence matrix to output recommendation', status: 'completed', agent: 'Decision Maker' }
    ];
  }

  try {
    const prompt = `You are the Lead Research Planner for Veriscope. The user wants to research the public company with ticker: "${cleanTicker}".
Generate a specific 7-step checklist of tasks that the specialized agents must complete to produce an investment rating.
Return your response ONLY as a JSON array of ResearchPlanItem objects. Do not include markdown code fence blocks.
TypeScript Interface:
interface ResearchPlanItem {
  id: string;
  task: string;
  status: 'pending';
  agent: 'Company Intel' | 'Financial Analyst' | 'News Analyst' | 'Competitor Analyst' | 'Risk Analyst' | 'Evidence Builder' | 'Decision Maker';
}
Example output:
[
  {"id": "1", "task": "Research corporate details and business model", "status": "pending", "agent": "Company Intel"},
  ...
]`;

    const result = await queryLLM(prompt, true);
    return JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.warn('Planner agent failed, falling back:', error);
    return runPlannerAgent(ticker, true);
  }
}

export async function runCompetitorAgent(
  ticker: string, 
  intel: CompanyIntel, 
  financials: FinancialData, 
  useMock: boolean = false
): Promise<CompetitorData> {
  const cleanTicker = ticker.toUpperCase().trim();
  
  if (useMock || !hasLLMCredentials() || MOCK_DATABASE[cleanTicker]) {
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].competitors;
  }

  try {
    const prompt = `You are a Competitor Analyst. Research competitors for "${intel.name}" (${cleanTicker}) in the ${intel.industry} sector.
Using these financials: Revenue=${financials.metrics.revenue}, MarketCap=${financials.metrics.marketCap}.
Suggest 2-3 major competitors and score their Relative profitability (0-100), relative valuation (P/E or score), and innovation (0-100).
Return your response ONLY as a JSON object matching this TypeScript interface:
interface CompetitorData {
  competitors: Array<{
    name: string;
    ticker: string;
    revenue: number; // in USD
    marketCap: number; // in USD
    profitability: number; // 0-100
    valuation: number; // P/E ratio or relative score
    innovation: number; // 0-100
    strengths: string[];
    weaknesses: string[];
  }>;
  comparisonNotes: string; // 2-3 sentence overview comparison
}
Format exactly as raw JSON without markdown formatting.`;

    const result = await queryLLM(prompt, true);
    return JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.warn('Competitor agent failed, falling back:', error);
    return runCompetitorAgent(ticker, intel, financials, true);
  }
}

export async function runRiskAgent(
  ticker: string, 
  intel: CompanyIntel, 
  financials: FinancialData, 
  news: NewsData, 
  useMock: boolean = false
): Promise<RiskData> {
  const cleanTicker = ticker.toUpperCase().trim();

  if (useMock || !hasLLMCredentials() || MOCK_DATABASE[cleanTicker]) {
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].risks;
  }

  try {
    const prompt = `You are a Risk Assessment Analyst for "${intel.name}" (${cleanTicker}).
Analyze specific risks for this company based on its industry (${intel.industry}) and revenue size (${financials.formattedMetrics.revenue.value}).
Rate risk categories: Regulatory, Competition, Technology, Supply Chain, and Financial.
Return your response ONLY as a JSON object matching this TypeScript interface:
interface RiskData {
  risks: Array<{
    category: 'Business' | 'Financial' | 'Legal' | 'Economic' | 'Competition' | 'Technology' | 'Supply Chain' | 'Regulatory';
    severity: 'Low' | 'Medium' | 'High';
    explanation: string;
    mitigation: string;
  }>;
  overallScore: number; // 0-100 (high value means high risk environment)
}
Format exactly as raw JSON without markdown formatting.`;

    const result = await queryLLM(prompt, true);
    return JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.warn('Risk agent failed, falling back:', error);
    return runRiskAgent(ticker, intel, financials, news, true);
  }
}

export async function runEvidenceAgent(
  ticker: string,
  intel: CompanyIntel,
  financials: FinancialData,
  news: NewsData,
  competitors: CompetitorData,
  risks: RiskData,
  useMock: boolean = false
): Promise<EvidenceCard[]> {
  const cleanTicker = ticker.toUpperCase().trim();

  if (useMock || !hasLLMCredentials() || MOCK_DATABASE[cleanTicker]) {
    // Generate default evidence cards from our mock if they exist
    const base = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    const comp = MOCK_DATABASE[base];
    return [
      { id: 'ev1', finding: `Revenue is ${comp.financials.formattedMetrics.revenue.value}`, evidence: `Year-over-year growth rate is ${comp.financials.formattedMetrics.revenueGrowth.value}`, confidence: 'High', source: 'SEC Form 10-K Filings' },
      { id: 'ev2', finding: `Led by CEO ${comp.intel.ceo}`, evidence: `Founded in ${comp.intel.founded} with headquarters in ${comp.intel.headquarters}`, confidence: 'High', source: 'Corporate Governance Profile' },
      { id: 'ev3', finding: `Operating margin stands at ${comp.financials.formattedMetrics.operatingMargin.value}`, evidence: `Reflects high pricing power against peers`, confidence: 'High', source: 'Income Statement History' },
      { id: 'ev4', finding: `Top risk category identified as ${comp.risks.risks[0].category}`, evidence: `${comp.risks.risks[0].explanation}`, confidence: 'Medium', source: 'Risk Assessment Agent' },
      { id: 'ev5', finding: `News sentiment is currently positive`, evidence: `Lately, ${comp.news.articles[0]?.title || 'positive reviews'}`, confidence: 'Medium', source: 'News Sentiment Index' }
    ];
  }

  try {
    const prompt = `You are an Evidence Agent. Review all compiled facts:
Company Name: ${intel.name}
Revenue: ${financials.formattedMetrics.revenue.value}
Operating Margin: ${financials.formattedMetrics.operatingMargin.value}
Recent News Headline: "${news.articles[0]?.title || 'N/A'}"
Top Risk: "${risks.risks[0]?.explanation || 'N/A'}"
Competitors: ${competitors.competitors.map((c: CompetitorComparison) => c.name).join(', ')}

Convert these findings into exactly 5 key evidence cards. Each card must represent a single verifiable claim, specify the exact evidence supporting it, rate the confidence (High/Medium/Low), and name the primary source.
Return your response ONLY as a JSON array of EvidenceCard objects:
interface EvidenceCard {
  id: string; // e.g. "ev_1", "ev_2"
  finding: string; // Short title of finding
  evidence: string; // Detailed quantitative/qualitative proof
  confidence: 'Low' | 'Medium' | 'High';
  source: string; // SEC filing, news outlet, industry report, etc.
}
Format exactly as raw JSON without markdown formatting.`;

    const result = await queryLLM(prompt, true);
    return JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.warn('Evidence agent failed, falling back:', error);
    return runEvidenceAgent(ticker, intel, financials, news, competitors, risks, true);
  }
}

export async function runDecisionAgent(
  ticker: string,
  intel: CompanyIntel,
  financials: FinancialData,
  news: NewsData,
  competitors: CompetitorData,
  risks: RiskData,
  evidence: EvidenceCard[],
  useMock: boolean = false
): Promise<Decision> {
  const cleanTicker = ticker.toUpperCase().trim();

  if (useMock || !hasLLMCredentials() || MOCK_DATABASE[cleanTicker]) {
    const fallbackTicker = MOCK_DATABASE[cleanTicker] ? cleanTicker : 'AAPL';
    return MOCK_DATABASE[fallbackTicker].decision;
  }

  try {
    const prompt = `You are the Lead Investment Decision Agent for Veriscope. Review the research folder for "${intel.name}" (${cleanTicker}):
Financial Metrics: P/E=${financials.formattedMetrics.peRatio.value}, Growth=${financials.formattedMetrics.revenueGrowth.value}, Operating Margin=${financials.formattedMetrics.operatingMargin.value}
News Sentiment: Positive ${news.sentimentSummary.positive}%, Neutral ${news.sentimentSummary.neutral}%, Negative ${news.sentimentSummary.negative}%
Key Risks: ${risks.risks.map((r: RiskItem) => r.category + ' (' + r.severity + ')').join(', ')}
Evidence Base:
${evidence.map(e => `- ${e.finding}: ${e.evidence} (Source: ${e.source})`).join('\n')}

Synthesize all findings to produce ONE final investment rating: "Strong Buy", "Buy", "Hold", "Watch", or "Pass".
Provide a numerical confidence score (0-100), bulleted lists of key strengths and key risks, and a qualitative future outlook.
Return your response ONLY as a JSON object matching this TypeScript interface:
interface Decision {
  recommendation: 'Strong Buy' | 'Buy' | 'Hold' | 'Watch' | 'Pass';
  confidence: number; // 0-100
  reasoning: string[]; // 3-4 bullet points detailing decision drivers
  keyStrengths: string[]; // 3 key strengths
  keyRisks: string[]; // 3 key risk statements
  futureOutlook: string; // 2-3 sentences on long term performance
}
Format exactly as raw JSON without markdown formatting.`;

    const result = await queryLLM(prompt, true);
    return JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.warn('Decision agent failed, falling back:', error);
    return runDecisionAgent(ticker, intel, financials, news, competitors, risks, evidence, true);
  }
}
