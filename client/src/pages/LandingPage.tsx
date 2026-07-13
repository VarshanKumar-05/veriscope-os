import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Cpu, Award, ChevronRight, BarChart4, BookOpen, Layers, ShieldAlert } from 'lucide-react';
import { startResearch, fetchHistory, fetchSearch, type SearchSuggestion } from '../services/api.js';
import FinancialTable from '../components/FinancialTable.js';
import StockPortfolioCard from '../components/StockPortfolioCard.js';
import ClickSpark from '../components/ClickSpark.js';
import SplitText from '../components/SplitText.js';

const POPULAR_TICKERS = [
  { ticker: 'AAPL', name: 'Apple Inc.', industry: 'Consumer Electronics' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', industry: 'AI & GPUs' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', industry: 'Cloud & Software' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', industry: 'Search & Infrastructure' },
  { ticker: 'TSLA', name: 'Tesla Inc.', industry: 'Automotive & Energy' }
];

const normalizeInput = (input: string): string => {
  return input.trim();
};

export default function LandingPage() {
  const [tickerInput, setTickerInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [focused, setFocused] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Load history list to display recent research
  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory
  });

  const researchMutation = useMutation({
    mutationFn: startResearch,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      navigate(`/research/${data.id}?stream=true`);
    },
    onError: (err: any) => {
      setErrorText(err.message || 'Failed to start research session');
    }
  });

  // Listen to search query parameter from URL (e.g. from global header redirect)
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      const normalized = normalizeInput(q);
      researchMutation.mutate(normalized);
    }
  }, [searchParams]);

  useEffect(() => {
    if (tickerInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchSearch(tickerInput)
        .then(setSuggestions)
        .catch(err => console.error('[Landing Search] Failed to fetch suggestions:', err));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [tickerInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;
    setErrorText('');
    const normalized = normalizeInput(tickerInput);
    researchMutation.mutate(normalized);
  };

  const handleTickerSelect = (selectedTicker: string) => {
    setErrorText('');
    researchMutation.mutate(selectedTicker);
  };

  return (
    <ClickSpark
      sparkColor='#3b82f6'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={12}
      duration={500}
      extraScale={1.2}
    >
    <div className="h-full overflow-y-auto bg-blueprint p-6 md:p-12 flex flex-col items-center gap-12 text-text-primary">
      
      {/* HERO SECTION */}
      <div className="w-full max-w-5xl text-center space-y-12 pt-6">
        
        {/* Hero Headings */}
        <div className="space-y-4">
          <h1 className="text-[48px] sm:text-[64px] md:text-[76px] font-heading font-extrabold tracking-tight leading-[1] text-text-primary flex flex-col items-center">
            <SplitText
              text="Intelligence,"
              tag="span"
              className="inline-block"
              delay={30}
              duration={1}
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 mt-2 block">
              <SplitText
                text="at your command."
                tag="span"
                delay={50}
                duration={1.2}
                from={{ opacity: 0, y: 30 }}
                to={{ opacity: 1, y: 0 }}
              />
            </span>
          </h1>
          <div className="text-lg md:text-xl font-sans font-medium text-text-secondary leading-relaxed max-w-2xl mx-auto">
            <SplitText
              text="Research public companies through evidence-backed AI intelligence."
              tag="span"
              splitType="words"
              delay={20}
              duration={0.8}
              from={{ opacity: 0, y: 10 }}
              to={{ opacity: 1, y: 0 }}
            />
          </div>
        </div>

        {/* MAIN SEARCH INPUT */}
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-text-secondary">
              <Search size={22} />
            </span>
            <input
              type="text"
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Search ticker or name (e.g. Alphabet, GOOGL, Microsoft)..."
              disabled={researchMutation.isPending}
              className="w-full h-[72px] pl-14 pr-36 rounded-[18px] bg-surface border border-border-custom shadow-md focus:outline-hidden focus:border-slate-950 focus:ring-1 focus:ring-slate-950 dark:focus:border-white dark:focus:ring-white transition-all text-[20px] placeholder:text-[20px] text-text-primary"
            />
            <button
              type="submit"
              disabled={researchMutation.isPending || !tickerInput.trim()}
              className="absolute top-2.5 bottom-2.5 right-2.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 rounded-[14px] text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {researchMutation.isPending ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-slate-450 border-t-white animate-spin" />
                  <span>Loading</span>
                </>
              ) : (
                <>
                  <span>Research</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>

          {focused && suggestions.length > 0 && (
            <div className="absolute top-[80px] left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1.5 z-50 select-none text-left">
              {suggestions.map((item, idx) => (
                <div
                  key={item.ticker + idx}
                  onMouseDown={() => {
                    setTickerInput(item.ticker);
                    setSuggestions([]);
                    researchMutation.mutate(item.ticker);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs text-slate-800 dark:text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-wide font-mono text-blue-650 dark:text-blue-400">{item.ticker}</span>
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[280px]">{item.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">{item.exchange}</span>
                </div>
              ))}
            </div>
          )}

          {/* Autocomplete Helper Tickers */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Trending:</span>
            {POPULAR_TICKERS.map(item => (
              <button
                key={item.ticker}
                onClick={() => handleTickerSelect(item.ticker)}
                disabled={researchMutation.isPending}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-custom bg-surface/50 hover:bg-surface hover:border-slate-900 dark:hover:border-white text-text-primary cursor-pointer shadow-xs transition-all"
                title={`${item.name} (${item.industry})`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {errorText && (
            <p className="mt-4 text-xs font-medium text-[var(--danger)] bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg inline-block border border-red-200 dark:border-red-900/30">
              {errorText}
            </p>
          )}
        </div>
        
        {/* GLOBAL MARKET PULSE / FINANCIAL TABLE */}
        <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-both pt-8">
          <FinancialTable title="Global Indices" />
        </div>

        {/* MOCK WATCHLIST / PORTFOLIO PREVIEW */}
        <div className="w-full text-left animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-both pt-8">
          <div className="flex items-end justify-between border-b border-border-custom pb-3 mb-6 max-w-7xl mx-auto">
            <h2 className="text-[32px] font-bold text-text-primary tracking-tight leading-none">Your Portfolio</h2>
            <span className="text-xs text-text-secondary font-mono mb-1">Live Tracking</span>
          </div>
          <StockPortfolioCard 
            totalGain={12450.75}
            returnPercentage={18.4}
            asOfDate={new Date().toLocaleDateString()}
            holdings={[
              { ticker: 'NVDA', name: 'NVIDIA Corporation', shares: 145, lastPrice: 875.28, changeValue: 12.45, changePercent: 1.44 },
              { ticker: 'AAPL', name: 'Apple Inc.', shares: 320, lastPrice: 173.50, changeValue: -2.10, changePercent: -1.20 },
              { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 85, lastPrice: 420.55, changeValue: 5.30, changePercent: 1.28 }
            ]}
            news={[
              { category: 'AI & Semiconductors', time: '10 mins ago', title: 'NVIDIA announces next-generation Blackwell architecture details', source: 'Reuters' },
              { category: 'Consumer Tech', time: '1 hr ago', title: 'Apple reportedly in talks with Google for Gemini AI integration on iPhone', source: 'Bloomberg' },
              { category: 'Cloud Computing', time: '3 hrs ago', title: 'Microsoft expands Azure capacity to meet surging AI enterprise demand', source: 'CNBC' }
            ]}
          />
        </div>
      </div>

      {/* RECENT RESEARCH ARCHIVE LIST */}
      {history.length > 0 && (
        <div id="recent-research-section" className="w-full max-w-4xl space-y-6 page-transition">
          <div className="flex items-end justify-between border-b border-border-custom pb-3 mb-6">
            <h2 className="text-[32px] font-bold text-text-primary tracking-tight leading-none">Research Archive</h2>
            <span className="text-xs text-text-secondary font-mono mb-1">{history.length} Session Reports</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border-custom bg-surface shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-custom bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-text-secondary uppercase tracking-wider font-mono">
                  <th className="px-6 py-4">Ticker / Company</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom text-xs">
                {history.map(item => {
                  const isCompleted = item.status === 'completed';
                  const dateVal = item.createdAt || new Date().toISOString();
                  const formattedDate = (() => {
                    try {
                      const d = new Date(dateVal);
                      const dStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                      const tStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                      return `${dStr} at ${tStr}`;
                    } catch (e) {
                      return dateVal;
                    }
                  })();

                  return (
                    <tr 
                      key={item.id}
                      className="hover:bg-slate-50/55 dark:hover:bg-slate-900/25 transition-colors cursor-pointer group"
                      onClick={() => isCompleted && navigate(`/research/${item.id}`)}
                    >
                      <td className="px-6 py-4 font-semibold text-text-primary">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-bold">{item.ticker}</span>
                          <span className="truncate max-w-[180px]">{item.companyName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-mono">
                        {formattedDate}
                      </td>
                      <td className="px-6 py-4 font-serif">
                        {item.recommendation ? (
                          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider ${
                            item.recommendation.includes('Buy') ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' :
                            item.recommendation.includes('Sell') ? 'bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {item.recommendation}
                          </span>
                        ) : (
                          <span className="text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            item.status === 'completed' ? 'bg-emerald-500' :
                            item.status === 'failed' ? 'bg-red-500' :
                            'bg-blue-500 animate-ping'
                          }`} />
                          <span className="capitalize font-mono text-[10px]">{item.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTickerSelect(item.ticker)}
                            className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          >
                            <Search size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOW VERISCOPE WORKS PIPELINE */}
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-[32px] font-bold text-center text-text-primary border-b border-border-custom pb-4 mb-6">
          How Veriscope Works
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 bg-surface border border-border-custom rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[var(--primary)]">01</span>
              <BookOpen size={18} className="text-text-secondary" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-text-primary">Research Planning</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              AI maps out research criteria, identifies competitor lists, and triggers targeted market query pipelines.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border-custom rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[var(--primary)]">02</span>
              <Layers size={18} className="text-text-secondary" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-text-primary">Evidence Scraping</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Sequential agents query Yahoo Finance, media sentiment metrics, and competitor valuation ratios.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border-custom rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[var(--primary)]">03</span>
              <ShieldAlert size={18} className="text-text-secondary" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-text-primary">Adversarial Review</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Risk analysis models scan supply chains, regulatory hurdles, and margins compression vectors.
            </p>
          </div>

          <div className="p-6 bg-surface border border-border-custom rounded-[20px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-[var(--primary)]">04</span>
              <Award size={18} className="text-text-secondary" />
            </div>
            <h3 className="font-heading font-extrabold text-base text-text-primary">Visual Recommendation</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Veriscope compiles verified evidence logs into an explainable canvas connecting claims to rating scores.
            </p>
          </div>
        </div>
      </div>

      {/* CORE CAPABILITIES & SYSTEM PREVIEW */}
      <div className="w-full max-w-4xl border-t border-border-custom pt-10 mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-custom flex items-center justify-center text-text-primary shadow-xs">
              <Cpu size={22} />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-text-primary">Multi-Agent State Graph</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Veriscope orchestrates 8 specialized autonomous agents (Planner, Financial, News, Risk, etc.) inside a strict state graph compiled via LangGraph logic. No direct chat wrappers.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-custom flex items-center justify-center text-text-primary shadow-xs">
              <Award size={22} />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-text-primary">Explainable & Verified</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every investment recommendation is derived strictly from a pool of compiled evidence cards. Claims are traceable to their source with calculated confidence scores.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-surface border border-border-custom flex items-center justify-center text-text-primary shadow-xs">
              <BarChart4 size={22} />
            </div>
            <h3 className="font-heading font-extrabold text-lg text-text-primary">Bloomberg-Style Aesthetics</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Designed around the Aurora Blueprint grid, floating nodes, geometric layouts, and semantic typography. An interface optimized for professional research data density.
            </p>
          </div>

        </div>
      </div>

    </div>
    </ClickSpark>
  );
}
