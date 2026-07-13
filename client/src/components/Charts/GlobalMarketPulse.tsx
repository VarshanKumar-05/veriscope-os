import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock } from 'lucide-react';

const mockData = [
  { time: '09:30', value: 15420, change: 0 },
  { time: '10:00', value: 15450, change: 0.19 },
  { time: '10:30', value: 15440, change: 0.12 },
  { time: '11:00', value: 15480, change: 0.38 },
  { time: '11:30', value: 15510, change: 0.58 },
  { time: '12:00', value: 15490, change: 0.45 },
  { time: '12:30', value: 15530, change: 0.71 },
  { time: '13:00', value: 15545, change: 0.81 },
  { time: '13:30', value: 15520, change: 0.64 },
  { time: '14:00', value: 15560, change: 0.90 },
  { time: '14:30', value: 15590, change: 1.10 },
  { time: '15:00', value: 15585, change: 1.07 },
  { time: '15:30', value: 15620, change: 1.29 },
  { time: '16:00', value: 15615, change: 1.26 },
];

const indices = ['NASDAQ', 'S&P 500', 'NIFTY 50', 'SENSEX', 'DAX', 'FTSE 100', 'NIKKEI 225'];
const timeframes = ['1D', '5D', '1M', '6M', '1Y'];

export default function GlobalMarketPulse() {
  const [selectedIndex, setSelectedIndex] = useState('NASDAQ');
  const [selectedTime, setSelectedTime] = useState('1D');

  return (
    <div className="w-full bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-border-custom shadow-xs p-6 flex flex-col md:flex-row gap-8">
      
      {/* Chart Section */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-text-primary">Global Market Pulse</h2>
            <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              LIVE • {selectedIndex}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border-custom">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTime(tf)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedTime === tf 
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {indices.map(idx => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                selectedIndex === idx 
                  ? 'bg-slate-50 border-slate-900 text-slate-900 dark:bg-slate-800 dark:border-white dark:text-white' 
                  : 'bg-transparent border-transparent text-text-secondary hover:bg-surface hover:border-border-custom'
              }`}
            >
              {idx}
            </button>
          ))}
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-custom)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary-custom)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="var(--border-custom)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
              <YAxis domain={['auto', 'auto']} stroke="var(--border-custom)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-custom)', borderRadius: '12px', fontSize: '12px', boxShadow: 'var(--shadow)' }}
                itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                formatter={(value: any) => [value.toLocaleString(), 'Index Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="var(--primary-custom)" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPulse)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary-custom)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Interpretation Side Panel */}
      <div className="w-full md:w-72 shrink-0 bg-surface/50 border border-border-custom rounded-2xl p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-primary-custom tracking-widest uppercase">
            <Activity size={14} />
            AI Market Interpretation
          </div>
          
          <h3 className="text-xl font-heading font-bold text-text-primary leading-tight">
            Technology momentum remains positive while regulatory pressure increased across semiconductor markets.
          </h3>
          
          <p className="text-sm text-text-secondary leading-relaxed">
            Market algorithms detect a strong influx of capital into AI infrastructure equities, offsetting short-term macroeconomic volatility indicators. 
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-border-custom flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            Updated 2m ago
          </div>
          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider">
            High Confidence
          </span>
        </div>
      </div>

    </div>
  );
}
