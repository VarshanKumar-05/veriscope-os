import { Activity } from 'lucide-react';

export interface AIMarketSentimentProps {
  sentimentScore: number; // -100 to 100
  confidence: number; // 0 to 100
  shortTermOutlook: 'Bullish' | 'Bearish' | 'Neutral';
  longTermOutlook: 'Bullish' | 'Bearish' | 'Neutral';
  keyDrivers: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>;
}

export default function AIMarketSentiment({ decision }: { decision: any }) {
  // Generate a mock sentiment score based on recommendation
  const isBuy = decision.recommendation.toLowerCase().includes('buy');
  const isPass = decision.recommendation.toLowerCase().includes('pass');
  const score = isBuy ? Math.floor(Math.random() * 20) + 75 : isPass ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 20) + 50;
  
  const sentimentLabel = score >= 70 ? 'Bullish' : score <= 40 ? 'Bearish' : 'Neutral';
  const colorClass = score >= 70 ? 'text-emerald-500' : score <= 40 ? 'text-red-500' : 'text-amber-500';
  const bgClass = score >= 70 ? 'bg-emerald-50 dark:bg-emerald-950/20' : score <= 40 ? 'bg-red-50 dark:bg-red-950/20' : 'bg-amber-50 dark:bg-amber-950/20';

  return (
    <div className="w-full h-full min-h-[250px] bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={14} className="text-[var(--primary)]" />
            AI Market Sentiment
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${bgClass} ${colorClass}`}>
            {sentimentLabel}
          </span>
        </div>

        <div className="flex items-center justify-center py-6">
          <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
              <circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                strokeDasharray={`${(score / 100) * 283} 283`}
                className={`${colorClass} drop-shadow-sm transition-all duration-1000 ease-out`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-heading font-black ${colorClass}`}>{score}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-text-secondary leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
        <span className="font-bold text-text-primary">AI Consensus: </span>
        {isBuy ? "Strong buying pressure detected across institutional flows and retail sentiment." : isPass ? "Risk indicators suggest distribution. Institutional sentiment is leaning negative." : "Mixed signals. Awaiting key catalyst for directional breakout."}
      </div>
    </div>
  );
}
