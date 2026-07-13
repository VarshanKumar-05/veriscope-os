import React from 'react';
import { Activity, ShieldAlert, BarChart, Clock, Zap } from 'lucide-react';

export default function IntelligenceRibbon() {
  const syncTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' IST';

  return (
    <div className="w-full h-8 bg-slate-900 dark:bg-[#0a0a0a] text-slate-100 flex items-center overflow-hidden border-b border-slate-800 dark:border-slate-900 text-[10px] font-bold font-mono tracking-widest z-10 shrink-0">
      <div className="flex items-center gap-8 px-4 whitespace-nowrap animate-[scroll_30s_linear_infinite] md:animate-none w-full md:justify-around">
        
        <div className="flex items-center gap-2">
          <BarChart size={12} className="text-blue-400" />
          <span className="text-slate-400">GLOBAL MARKET:</span>
          <span className="text-amber-400">MIXED</span>
        </div>

        <div className="flex items-center gap-2">
          <Activity size={12} className="text-emerald-400" />
          <span className="text-slate-400">AI SENTIMENT:</span>
          <span className="text-emerald-400">68 / 100 POSITIVE</span>
        </div>

        <div className="flex items-center gap-2">
          <ShieldAlert size={12} className="text-red-400" />
          <span className="text-slate-400">HIGH IMPACT EVENTS:</span>
          <span className="text-red-400">4 DETECTED</span>
        </div>

        <div className="flex items-center gap-2">
          <Zap size={12} className="text-purple-400" />
          <span className="text-slate-400">RESEARCH TODAY:</span>
          <span className="text-white">8 COMPANIES</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={12} className="text-slate-500" />
          <span className="text-slate-400">LAST SYNC:</span>
          <span className="text-white">{syncTime}</span>
        </div>

      </div>
    </div>
  );
}
