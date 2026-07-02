import { Handle, Position } from '@xyflow/react';
import { 
  ShieldAlert, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Newspaper, 
  Users, 
  Activity,
  ThumbsUp
} from 'lucide-react';
import type { RecommendationType } from '../types/shared.ts';

// 1. Purpose-Specific Evidence Nodes
export const EvidenceNode = ({ data }: any) => {
  const isHighConf = data.confidence === 'High';
  const isMedConf = data.confidence === 'Medium';
  
  // Custom design configurations based on evidence category
  const categoryConfigs: Record<string, {
    label: string;
    borderClass: string;
    iconColor: string;
    icon: React.ReactNode;
  }> = {
    general: {
      label: 'Verified Insight',
      borderClass: 'border-2 border-[var(--success)]',
      iconColor: 'text-[var(--success)]',
      icon: <Award size={16} />
    },
    financial: {
      label: 'Financial Metric',
      borderClass: 'border-2 border-[var(--primary)]',
      iconColor: 'text-[var(--primary)]',
      icon: <DollarSign size={16} />
    },
    news: {
      label: 'News Event',
      borderClass: 'border-2 border-[var(--border)]',
      iconColor: 'text-[var(--text-secondary)]',
      icon: <Newspaper size={16} />
    },
    risk: {
      label: 'Risk Indicator',
      borderClass: 'border-2 border-[var(--warning)]',
      iconColor: 'text-[var(--warning)]',
      icon: <ShieldAlert size={16} />
    },
    competitor: {
      label: 'Competitor Comparison',
      borderClass: 'border-2 border-[var(--primary)]',
      iconColor: 'text-[var(--primary)]',
      icon: <Users size={16} />
    }
  };

  const config = categoryConfigs[data.category] || categoryConfigs.general;

  return (
    <div className={`p-6 rounded-[20px] bg-surface border ${config.borderClass} shadow-md max-w-xs text-left relative group`}>
      {/* Source handle out to right */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="a" 
        className="w-2.5 h-2.5 bg-slate-400 border border-white dark:border-slate-900 hover:bg-slate-950 dark:hover:bg-white"
      />
      
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${config.iconColor}`}>
          {config.icon}
        </span>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            {config.label}
          </div>
          <h4 className="text-sm font-heading font-extrabold text-text-primary leading-tight">
            {data.finding}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed mt-1">
            {data.evidence}
          </p>
          <div className="flex items-center justify-between pt-2.5 border-t border-border-custom mt-2.5 text-[10px] font-semibold text-text-secondary">
            <span className="truncate max-w-[130px] italic">Source: {data.source}</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
              isHighConf ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
              isMedConf ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-text-secondary'
            }`}>
              {data.confidence} Conf
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Financial Summary Node Component
export const FinancialNode = ({ data }: any) => {
  return (
    <div className="p-6 rounded-[20px] bg-surface border border-border-custom shadow-md w-72 text-left relative">
      <Handle 
        type="source" 
        position={Position.Right} 
        id="a" 
        className="w-2.5 h-2.5 bg-slate-400 border border-white dark:border-slate-900 hover:bg-slate-950"
      />
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-[var(--primary)]" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Financial Summary</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-left font-mono">
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-sans font-bold">Mkt Capital</div>
            <div className="text-sm font-bold text-text-primary mt-1">{data.formattedMetrics.marketCap.value}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-sans font-bold">Revenue</div>
            <div className="text-sm font-bold text-text-primary mt-1">{data.formattedMetrics.revenue.value}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-sans font-bold">Operating Margin</div>
            <div className="text-sm font-bold text-text-primary mt-1">{data.formattedMetrics.operatingMargin.value}</div>
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-sans font-bold">YoY Growth</div>
            <div className="text-sm font-bold text-text-primary mt-1">{data.formattedMetrics.revenueGrowth.value}</div>
          </div>
        </div>
        
        <div className="text-[10px] text-text-secondary border-t border-border-custom pt-2.5 flex items-center gap-1.5 font-sans font-medium">
          <TrendingUp size={12} className="text-emerald-600" />
          <span>Veriscope Financial Score Index</span>
        </div>
      </div>
    </div>
  );
};

// 3. Custom Risk Summary Node Component
export const RiskNode = ({ data }: any) => {
  const isHighRisk = data.overallScore > 60;
  const isMedRisk = data.overallScore >= 40 && data.overallScore <= 60;
  
  return (
    <div className="p-6 rounded-[20px] bg-surface border border-border-custom shadow-md w-72 text-left relative">
      <Handle 
        type="source" 
        position={Position.Right} 
        id="a" 
        className="w-2.5 h-2.5 bg-slate-400 border border-white dark:border-slate-900 hover:bg-slate-950"
      />
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-[var(--warning)]" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Risk Assessment</span>
        </div>
        
        <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-border-custom">
          <div>
            <div className="text-[10px] text-text-secondary uppercase font-bold">Risk Index</div>
            <div className="text-base font-mono font-bold text-text-primary mt-1">{data.overallScore}/100</div>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isHighRisk ? 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-400 border border-red-200/40' :
            isMedRisk ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40' :
            'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40'
          }`}>
            {isHighRisk ? 'High' : isMedRisk ? 'Medium' : 'Low'}
          </span>
        </div>

        <div className="text-xs text-text-secondary leading-relaxed line-clamp-3">
          Primary Threat: {data.risks[0]?.explanation || 'No major threats identified.'}
        </div>
      </div>
    </div>
  );
};

// 4. Custom Recommendation (Decision Node) - Primary Focal Point
export const RecommendationNode = ({ data }: any) => {
  const rec: RecommendationType = data.recommendation;
  
  const badgeColors: Record<RecommendationType, string> = {
    'Strong Buy': 'bg-emerald-500 text-white dark:bg-emerald-600',
    'Buy': 'bg-emerald-650 text-white dark:bg-emerald-700',
    'Hold': 'bg-slate-400 text-white dark:bg-slate-600',
    'Watch': 'bg-amber-500 text-white dark:bg-amber-600',
    'Pass': 'bg-red-600 text-white dark:bg-red-750'
  };

  return (
    <div className="p-6 rounded-[20px] bg-surface border-2 border-slate-900 dark:border-white/20 shadow-xl w-[360px] text-left relative transition-all">
      {/* Inputs handle from left */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-2.5 h-2.5 bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900"
      />
      
      <div className="space-y-4">
        {/* Certificate Title */}
        <div className="flex items-center justify-between border-b border-border-custom pb-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
            <ThumbsUp size={12} className="text-emerald-600" />
            <span>Rating conviction</span>
          </div>
          <span className="text-[10px] font-bold text-text-secondary font-mono">
            UPDATED: {data.lastUpdated}
          </span>
        </div>
        
        {/* Investment Badge */}
        <div className="space-y-1.5">
          <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">Veriscope Rating</div>
          <div className="flex items-center justify-between gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-sm font-serif font-black tracking-widest uppercase ${badgeColors[rec] || 'bg-slate-500 text-white'}`}>
              {rec}
            </span>
            <div className="text-right">
              <div className="text-[10px] text-text-secondary uppercase font-bold">Conviction</div>
              <div className="text-base font-bold font-mono text-text-primary leading-tight">{data.confidence}%</div>
            </div>
          </div>
        </div>

        {/* Outlook Explanation */}
        <div className="p-3 rounded-xl bg-background border border-border-custom text-xs">
          <div className="flex items-center gap-1.5 font-bold text-text-primary uppercase tracking-wider mb-1">
            <Activity size={12} />
            <span>Outlook: {data.recommendation.includes('Buy') ? 'Positive' : data.recommendation.includes('Pass') ? 'Negative' : 'Neutral'}</span>
          </div>
          <p className="text-text-secondary leading-relaxed italic">
            "{data.futureOutlook}"
          </p>
        </div>

        {/* Evidence & Health Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono border-t border-border-custom pt-3.5">
          <div>
            <span className="text-text-secondary uppercase font-sans font-bold text-[10px]">Company Health</span>
            <div className="text-text-primary font-bold text-sm mt-1">{data.overallScore}/100</div>
          </div>
          <div>
            <span className="text-text-secondary uppercase font-sans font-bold text-[10px]">Evidence links</span>
            <div className="text-text-primary font-bold text-sm mt-1">{data.evidenceCount} verified cards</div>
          </div>
        </div>
      </div>
    </div>
  );
};
