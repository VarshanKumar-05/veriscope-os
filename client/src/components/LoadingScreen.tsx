import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Terminal } from 'lucide-react';
import type { AgentLog } from '../types/shared.ts';

interface LoadingScreenProps {
  ticker: string;
  status: string;
  progress: number;
  logs: AgentLog[];
}

export default function LoadingScreen({ ticker, status, progress, logs }: LoadingScreenProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll the agent log console
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Stage timeline requested by the user
  const displayPlan = [
    { id: '1', task: 'Formulate search criteria & analysis schedule', agent: 'Research Planning' },
    { id: '2', task: 'Fetch organizational profile and metadata details', agent: 'Collecting Company Information' },
    { id: '3', task: 'Import statement metrics & growth indicators', agent: 'Collecting Financial Data' },
    { id: '4', task: 'Verify press articles and compute news sentiment scores', agent: 'Analyzing News' },
    { id: '5', task: 'Compare peer metrics, profitability & tech innovate scores', agent: 'Comparing Competitors' },
    { id: '6', task: 'Audit regulatory pressure, supply chain and margins risk', agent: 'Evaluating Risks' },
    { id: '7', task: 'Create traceable index cards linking data to facts', agent: 'Building Evidence' },
    { id: '8', task: 'Synthesize rating conviction and finalize recommendations', agent: 'Generating Recommendation' }
  ];

  // Map backend status strings to active plan step index
  const getStepStatus = (itemAgent: string) => {
    const activeAgentMap: Record<string, string> = {
      'planning': 'Research Planning',
      'collecting_intel': 'Collecting Company Information',
      'analyzing_finance': 'Collecting Financial Data',
      'analyzing_news': 'Analyzing News',
      'analyzing_competitors': 'Comparing Competitors',
      'assessing_risk': 'Evaluating Risks',
      'generating_evidence': 'Building Evidence',
      'deciding': 'Generating Recommendation'
    };

    const currentAgent = activeAgentMap[status];
    if (currentAgent === itemAgent) return 'in_progress';
    
    // Simple chronological fallback list
    const agentOrder = [
      'Research Planning',
      'Collecting Company Information',
      'Collecting Financial Data',
      'Analyzing News',
      'Comparing Competitors',
      'Evaluating Risks',
      'Building Evidence',
      'Generating Recommendation'
    ];
    
    const currentIndex = agentOrder.indexOf(currentAgent);
    const itemIndex = agentOrder.indexOf(itemAgent);

    if (itemIndex < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="absolute inset-0 z-30 bg-blueprint/95 dark:bg-blueprint-dark/95 flex flex-col md:flex-row items-stretch overflow-hidden">
      
      {/* LEFT: STATUS TIMELINE */}
      <div className="w-full md:w-[450px] border-b md:border-b-0 md:border-r border-[#E7E5E4] dark:border-[#273449] bg-white/60 dark:bg-[#111827]/60 p-6 md:p-10 overflow-y-auto flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Live Agent Execution
            </div>
            <h2 className="text-2xl font-serif font-extrabold mt-1 text-slate-950 dark:text-white">
              Researching {ticker}
            </h2>
          </div>

          {/* PROGRESS BAR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="capitalize">{status.replace('_', ' ')}...</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-slate-900 dark:bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            {/* Live Timer and Estimates */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 pt-1">
              <div>Elapsed: <span className="text-slate-600 dark:text-slate-300 font-bold">{elapsedTime}s</span></div>
              <div>Est. Remaining: <span className="text-slate-600 dark:text-slate-300 font-bold">{Math.max(0, 45 - elapsedTime)}s</span></div>
            </div>
          </div>

          {/* TIMELINE STEPS */}
          <div className="space-y-4 pt-4">
            {displayPlan.map((item, index) => {
              const stepStatus = getStepStatus(item.agent);
              
              return (
                <div key={item.id || index} className="flex items-start gap-4">
                  {/* STEP ICON */}
                  <div className="mt-0.5 relative flex items-center justify-center">
                    {stepStatus === 'completed' ? (
                      <CheckCircle2 size={16} className="text-emerald-600 bg-white dark:bg-[#111827] rounded-full z-10" />
                    ) : stepStatus === 'in_progress' ? (
                      <Loader2 size={16} className="text-blue-500 animate-spin bg-white dark:bg-[#111827] rounded-full z-10" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#E7E5E4] dark:border-[#273449] bg-white dark:bg-[#111827] flex items-center justify-center text-[8px] font-bold text-slate-400 z-10">
                        {index + 1}
                      </span>
                    )}

                    {/* CONNECTOR LINE */}
                    {index < displayPlan.length - 1 && (
                      <div className={`absolute top-4 bottom-0 left-2 w-px -ml-[0.5px] -mb-4 bg-slate-200 dark:bg-slate-800 ${
                        stepStatus === 'completed' ? 'border-l border-emerald-600' : ''
                      }`} />
                    )}
                  </div>

                  {/* STEP TEXT */}
                  <div className="leading-tight">
                    <div className={`text-xs font-semibold ${
                      stepStatus === 'in_progress' ? 'text-slate-900 dark:text-white font-serif' :
                      stepStatus === 'completed' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-600'
                    }`}>
                      {item.agent}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${
                      stepStatus === 'in_progress' ? 'text-slate-655 dark:text-slate-350' :
                      stepStatus === 'completed' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-300 dark:text-slate-700'
                    }`}>
                      {item.task}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 dark:text-slate-500 pt-6">
          *Veriscope utilizes isolated multi-agent graph branches. Claims will be compiled as evidence nodes.
        </div>
      </div>

      {/* RIGHT: LIVE AGENT LOG STREAM CONSOLE */}
      <div className="flex-1 bg-slate-950 text-slate-350 font-mono p-6 flex flex-col justify-between overflow-hidden">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-blue-500" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent Stream Logs</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          </div>
        </div>

        {/* LOG TERMINAL BOX */}
        <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-2 select-text selection:bg-blue-600/30">
          {logs.map((log, index) => {
            const colorClass = 
              log.type === 'success' ? 'text-emerald-500' :
              log.type === 'warning' ? 'text-amber-500' :
              log.type === 'error' ? 'text-red-500' : 'text-blue-400';
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2 border-b border-slate-900/40 pb-1.5"
              >
                <span className="text-slate-500 font-sans text-[10px] shrink-0 mt-0.5">[{log.timestamp}]</span>
                <span className={`font-semibold shrink-0 ${colorClass}`}>
                  [{log.agent}]:
                </span>
                <span className="text-slate-300 break-words leading-relaxed">{log.message}</span>
              </motion.div>
            );
          })}
          
          {logs.length === 0 && (
            <div className="text-slate-500 italic animate-pulse">
              Awaiting node initialization from Planner Agent...
            </div>
          )}
          
          <div ref={terminalEndRef} />
        </div>

        {/* Console Status */}
        <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500">
          <span>Active Session Ticker: {ticker}</span>
          <span className="flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            <span>Streaming</span>
          </span>
        </div>
      </div>

    </div>
  );
}
