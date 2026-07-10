import { ResearchState, AgentLog } from '../../shared/types.js';
import { getCompanyProfile, getFinancials } from '../services/yfinance.js';
import { getNews } from '../services/news.js';
import {
  runPlannerAgent,
  runCompetitorAgent,
  runRiskAgent,
  runEvidenceAgent,
  runDecisionAgent,
  hasLLMCredentials
} from '../services/llm.js';

export interface GraphUpdate {
  state: ResearchState;
  log?: AgentLog;
}

export type GraphStepCallback = (update: GraphUpdate) => void;

export class ResearchGraph {
  private state: ResearchState;
  private onStep: GraphStepCallback;
  private useMock: boolean;

  constructor(ticker: string, onStep: GraphStepCallback, forceMock: boolean = false) {
    this.useMock = forceMock || !hasLLMCredentials();
    this.onStep = onStep;
    this.state = {
      ticker: ticker.toUpperCase().trim(),
      status: 'idle',
      progress: 0,
      plan: [],
      logs: []
    };
  }

  private addLog(
    agent: AgentLog['agent'],
    message: string,
    type: AgentLog['type'] = 'info'
  ) {
    const log: AgentLog = {
      timestamp: new Date().toLocaleTimeString(),
      agent,
      message,
      type
    };
    this.state.logs.push(log);
    this.onStep({ state: { ...this.state }, log });
  }

  private updateStatus(
    status: ResearchState['status'],
    progress: number
  ) {
    this.state.status = status;
    this.state.progress = progress;
    this.onStep({ state: { ...this.state } });
  }

  /**
   * Run the full multi-agent sequential pipeline.
   */
  public async execute(): Promise<ResearchState> {
    try {
      this.addLog('System', `Initiating research graph for ${this.state.ticker}. Mode: ${this.useMock ? 'Demo Sandbox' : 'Live Agent Context'}`);

      // ----------------------------------------------------
      // 1. PLANNER AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('planning', 10);
      this.addLog('Planner', `Creating structured research checklist for ticker ${this.state.ticker}...`);
      await this.sleep(1500); // Add natural processing delays for visual stream pacing
      
      let plan;
      try {
        plan = await runPlannerAgent(this.state.ticker, this.useMock);
        if (!plan || !Array.isArray(plan) || plan.length === 0) {
          throw new Error('Planner Agent returned an empty or invalid research checklist.');
        }
      } catch (err: any) {
        this.addLog('Planner', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Planner Node Failed] ${err.message}`);
      }
      
      this.state.plan = plan;
      this.addLog('Planner', `Formulated research checklist: ${plan.length} core segments mapped.`, 'success');
      this.state.plan[0].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 2. COMPANY INTEL AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('collecting_intel', 25);
      this.addLog('Company Intel', `Querying database for ${this.state.ticker} corporate profile...`);
      await this.sleep(2000);
      
      let intel;
      try {
        intel = await getCompanyProfile(this.state.ticker, this.useMock);
        if (!intel) {
          throw new Error('Company Intel Agent returned no corporate profile data.');
        }
      } catch (err: any) {
        this.addLog('Company Intel', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Company Intel Node Failed] ${err.message}`);
      }
      
      this.state.companyIntel = intel;
      this.addLog('Company Intel', `Identified CEO: ${intel.ceo}, Headquarters: ${intel.headquarters}.`, 'info');
      this.addLog('Company Intel', `Retrieved summary for ${intel.name}.`, 'success');
      this.state.plan[0].status = 'completed';
      if (this.state.plan[1]) this.state.plan[1].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 3. FINANCIAL ANALYSIS AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('analyzing_finance', 40);
      this.addLog('Financial Analyst', `Retrieving balance sheets, cash flow logs, and income history...`);
      await this.sleep(2000);
      
      let financials;
      try {
        financials = await getFinancials(this.state.ticker, this.useMock);
        if (!financials || !financials.formattedMetrics) {
          throw new Error('Financial Analyst Agent returned invalid or incomplete financial matrices.');
        }
      } catch (err: any) {
        this.addLog('Financial Analyst', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Financial Analyst Node Failed] ${err.message}`);
      }
      
      this.state.financials = financials;
      this.addLog('Financial Analyst', `Calculated P/E: ${financials.formattedMetrics.peRatio.value}, YoY Growth: ${financials.formattedMetrics.revenueGrowth.value}.`, 'info');
      this.addLog('Financial Analyst', `Successfully verified historical trend matrices.`, 'success');
      if (this.state.plan[1]) this.state.plan[1].status = 'completed';
      if (this.state.plan[2]) this.state.plan[2].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 4. NEWS ANALYSIS AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('analyzing_news', 55);
      this.addLog('News Analyst', `Scraping recent press releases and media items...`);
      await this.sleep(2000);
      
      let news;
      try {
        news = await getNews(this.state.ticker, this.useMock);
        if (!news || !news.sentimentSummary) {
          throw new Error('News Analyst Agent returned invalid news sentiment reports.');
        }
      } catch (err: any) {
        this.addLog('News Analyst', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[News Analyst Node Failed] ${err.message}`);
      }
      
      this.state.news = news;
      this.addLog('News Analyst', `Parsed ${news.articles.length} recent news reports. Sentiment: ${news.sentimentSummary.positive}% Pos, ${news.sentimentSummary.negative}% Neg.`, 'info');
      this.addLog('News Analyst', `Compiled media index.`, 'success');
      if (this.state.plan[2]) this.state.plan[2].status = 'completed';
      if (this.state.plan[3]) this.state.plan[3].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 5. COMPETITOR AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('analyzing_competitors', 70);
      this.addLog('Competitor Analyst', `Mapping competitor landscape and relative profitability scores...`);
      await this.sleep(2000);
      
      let competitors;
      try {
        competitors = await runCompetitorAgent(
          this.state.ticker,
          this.state.companyIntel!,
          this.state.financials!,
          this.useMock
        );
        if (!competitors || !competitors.competitors) {
          throw new Error('Competitor Analyst Agent returned invalid competitor landscape results.');
        }
      } catch (err: any) {
        this.addLog('Competitor Analyst', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Competitor Analyst Node Failed] ${err.message}`);
      }
      
      this.state.competitors = competitors;
      this.addLog('Competitor Analyst', `Matched ${competitors.competitors.length} key peers. Comparison: ${competitors.comparisonNotes.substring(0, 80)}...`, 'info');
      this.addLog('Competitor Analyst', `Competitor comparison matrix completed.`, 'success');
      if (this.state.plan[3]) this.state.plan[3].status = 'completed';
      if (this.state.plan[4]) this.state.plan[4].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 6. RISK AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('assessing_risk', 80);
      this.addLog('Risk Analyst', `Checking regulatory registries, technology moats, and financial metrics...`);
      await this.sleep(2000);
      
      let risks;
      try {
        risks = await runRiskAgent(
          this.state.ticker,
          this.state.companyIntel!,
          this.state.financials!,
          this.state.news!,
          this.useMock
        );
        if (!risks || !risks.risks) {
          throw new Error('Risk Analyst Agent returned invalid risk assessment vectors.');
        }
      } catch (err: any) {
        this.addLog('Risk Analyst', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Risk Analyst Node Failed] ${err.message}`);
      }
      
      this.state.risks = risks;
      this.addLog('Risk Analyst', `Identified ${risks.risks.length} key threat areas. Overall Risk Score: ${risks.overallScore}/100.`, 'warning');
      this.addLog('Risk Analyst', `Risk assessment matrix completed.`, 'success');
      if (this.state.plan[4]) this.state.plan[4].status = 'completed';
      if (this.state.plan[5]) this.state.plan[5].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 7. EVIDENCE AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('generating_evidence', 90);
      this.addLog('Evidence Builder', `Synthesizing factual inputs and mapping supporting sources...`);
      await this.sleep(2000);
      
      let evidence;
      try {
        evidence = await runEvidenceAgent(
          this.state.ticker,
          this.state.companyIntel!,
          this.state.financials!,
          this.state.news!,
          this.state.competitors!,
          this.state.risks!,
          this.useMock
        );
        if (!evidence || !Array.isArray(evidence)) {
          throw new Error('Evidence Builder Agent returned an invalid evidence card dataset.');
        }
      } catch (err: any) {
        this.addLog('Evidence Builder', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Evidence Builder Node Failed] ${err.message}`);
      }
      
      this.state.evidence = evidence;
      this.addLog('Evidence Builder', `Compiled ${evidence.length} trace evidence cards. Verification complete.`, 'success');
      if (this.state.plan[5]) this.state.plan[5].status = 'completed';
      if (this.state.plan[6]) this.state.plan[6].status = 'in_progress';
      this.onStep({ state: { ...this.state } });

      // ----------------------------------------------------
      // 8. DECISION AGENT NODE
      // ----------------------------------------------------
      this.updateStatus('deciding', 95);
      this.addLog('Decision Maker', `Synthesizing evidence nodes to calculate recommendation weight...`);
      await this.sleep(2000);
      
      let decision;
      try {
        decision = await runDecisionAgent(
          this.state.ticker,
          this.state.companyIntel!,
          this.state.financials!,
          this.state.news!,
          this.state.competitors!,
          this.state.risks!,
          this.state.evidence!,
          this.useMock
        );
        if (!decision || !decision.recommendation) {
          throw new Error('Decision Maker Agent failed to reach a conviction index rating.');
        }
      } catch (err: any) {
        this.addLog('Decision Maker', `Critical node error: ${err.message}`, 'error');
        throw new Error(`[Decision Maker Node Failed] ${err.message}`);
      }
      
      this.state.decision = decision;
      this.addLog('Decision Maker', `FINAL RECOMMENDATION: ${decision.recommendation} (Confidence: ${decision.confidence}%)`, 'success');
      if (this.state.plan[6]) this.state.plan[6].status = 'completed';
      this.updateStatus('completed', 100);
      this.addLog('System', `Research graph execution finished successfully. Report cached.`, 'success');
      
      return this.state;
    } catch (error: any) {
      console.error('Graph execution failed:', error);
      this.state.status = 'failed';
      this.state.error = error.message || 'Unknown graph execution error.';
      this.addLog('System', `Execution crashed: ${this.state.error}`, 'error');
      this.onStep({ state: { ...this.state } });
      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
