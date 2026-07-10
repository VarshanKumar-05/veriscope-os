export type RecommendationType = 'Strong Buy' | 'Buy' | 'Hold' | 'Watch' | 'Pass';

export interface ResearchPlanItem {
  id: string;
  task: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  agent: string;
}

export interface CompanyIntel {
  name: string;
  ticker: string;
  headquarters: string;
  founders: string[];
  founded: string;
  ceo: string;
  industry: string;
  employeeCount: number | "Verified information unavailable";
  products: string[];
  businessModel: string;
  website: string;
  summary: string;
  exchange?: string;
  country?: string;
  currency?: string;
  sector?: string;
  verifiedSources?: string[];
  lastUpdated?: string;
  confidenceScore?: number;
  verificationStatus?: string;
  dataFreshness?: string;
}

export interface FinancialMetric {
  label: string;
  value: string | number;
  type: 'currency' | 'percent' | 'ratio' | 'number';
  trend?: 'up' | 'down' | 'neutral';
}

export interface FinancialMetricGroup {
  revenue: number;
  netIncome: number;
  operatingMargin: number;
  debt: number;
  cashFlow: number;
  marketCap: number;
  eps: number;
  peRatio: number;
  revenueGrowth: number;
}

export interface HistoricalFinancial {
  year: string;
  revenue: number;
  netIncome: number;
  operatingMargin: number;
}

export interface FinancialData {
  metrics: FinancialMetricGroup;
  formattedMetrics: Record<string, FinancialMetric>;
  historical: HistoricalFinancial[];
}

export interface NewsArticle {
  id: string;
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  source: string;
  summary: string;
  date: string;
  url: string;
}

export interface NewsData {
  articles: NewsArticle[];
  sentimentSummary: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface CompetitorComparison {
  name: string;
  ticker: string;
  revenue: number;
  marketCap: number;
  profitability: number; // 0-100 scale
  valuation: number;     // PE ratio or relative valuation score
  innovation: number;    // 0-100 scale
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitorData {
  competitors: CompetitorComparison[];
  comparisonNotes: string;
}

export interface RiskItem {
  category: 'Business' | 'Financial' | 'Legal' | 'Economic' | 'Competition' | 'Technology' | 'Supply Chain' | 'Regulatory';
  severity: 'Low' | 'Medium' | 'High';
  explanation: string;
  mitigation?: string;
}

export interface RiskData {
  risks: RiskItem[];
  overallScore: number; // 0-100 scale
}

export interface EvidenceCard {
  id: string;
  finding: string;
  evidence: string;
  confidence: 'Low' | 'Medium' | 'High';
  source: string;
}

export interface Decision {
  recommendation: RecommendationType;
  confidence: number; // 0-100 scale
  reasoning: string[];
  keyStrengths: string[];
  keyRisks: string[];
  futureOutlook: string;
}

export interface AgentLog {
  timestamp: string;
  agent: 'Planner' | 'Company Intel' | 'Financial Analyst' | 'News Analyst' | 'Competitor Analyst' | 'Risk Analyst' | 'Evidence Builder' | 'Decision Maker' | 'System';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface ResearchState {
  ticker: string;
  status: 'idle' | 'planning' | 'collecting_intel' | 'analyzing_finance' | 'analyzing_news' | 'analyzing_competitors' | 'assessing_risk' | 'generating_evidence' | 'deciding' | 'completed' | 'failed';
  progress: number; // 0-100
  plan: ResearchPlanItem[];
  companyIntel?: CompanyIntel;
  financials?: FinancialData;
  news?: NewsData;
  competitors?: CompetitorData;
  risks?: RiskData;
  evidence?: EvidenceCard[];
  decision?: Decision;
  logs: AgentLog[];
  error?: string;
}
