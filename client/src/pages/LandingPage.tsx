import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, Sparkles, TrendingUp, TrendingDown, Clock, Activity,
  ChevronRight, BookOpen, Star, Zap, Command
} from 'lucide-react';
import { 
  startResearch, fetchHistory, fetchSearch, 
  fetchMarketOverview, type SearchSuggestion
} from '../services/api.js';

const POPULAR_TICKERS = [
  { ticker: 'AAPL', name: 'Apple Inc.', industry: 'Consumer Electronics' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', industry: 'AI & GPUs' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', industry: 'Cloud & Software' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', industry: 'Search & Infrastructure' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', industry: 'Automotive & Energy' }
];

export default function LandingPage() {
  const [tickerInput, setTickerInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [focused, setFocused] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Fetch History (Watchlist & Recent)
  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory
  });

  // Fetch Market Overview
  const { data: marketData = [] } = useQuery({
    queryKey: ['market-overview'],
    queryFn: fetchMarketOverview,
    refetchInterval: 60000 // refresh every minute
  });

  const watchlist = history.filter(h => h.pinned);
  const recentResearch = history.slice(0, 4);

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

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      researchMutation.mutate(q.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    if (tickerInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchSearch(tickerInput.trim())
        .then(setSuggestions)
        .catch(err => console.error('[Search] Failed:', err));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [tickerInput]);

  // Keyboard shortcut listener (CMD/CTRL + K to focus search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tickerInput.trim()) return;
    setErrorText('');
    researchMutation.mutate(tickerInput.trim());
  };

  const handleTickerSelect = (selectedTicker: string) => {
    setErrorText('');
    researchMutation.mutate(selectedTicker);
  };

  const formatPrice = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatPercent = (val: number) => (val > 0 ? '+' : '') + val.toFixed(2) + '%';

  return (
    <div className="h-full overflow-y-auto bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16 space-y-12">
        
        {/* HEADER & MAIN SEARCH */}
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
            <Sparkles size={14} />
            <span>Veriscope OS v1.2</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white">
            Intelligence,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
              at your command.
            </span>
          </h1>

          <div className="w-full max-w-2xl relative group">
            <form onSubmit={handleSubmit} className="relative z-20">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={24} />
              </div>
              <input
                id="main-search"
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 200)}
                placeholder="Search by Official Name, Ticker, or ISIN..."
                disabled={researchMutation.isPending}
                className="w-full h-16 pl-16 pr-32 rounded-2xl bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 transition-all text-xl placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              
              <div className="absolute inset-y-0 right-4 flex items-center gap-2">
                {!tickerInput && (
                  <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-400 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 bg-slate-50 dark:bg-slate-900">
                    <Command size={12} /> K
                  </div>
                )}
                <button
                  type="submit"
                  disabled={researchMutation.isPending || !tickerInput.trim()}
                  className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {researchMutation.isPending ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <span>Analyze</span>
                  )}
                </button>
              </div>
            </form>

            {/* AUTOCOMPLETE DROPDOWN */}
            {focused && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-80 overflow-y-auto p-2 z-50">
                {suggestions.map((item, idx) => (
                  <div
                    key={item.ticker + idx}
                    onMouseDown={() => {
                      setTickerInput(item.ticker);
                      setSuggestions([]);
                      researchMutation.mutate(item.ticker);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{item.name}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">{item.ticker}</span>
                        {item.exchange}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errorText && (
              <div className="absolute top-full left-0 right-0 mt-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3 text-center">
                {errorText}
              </div>
            )}
          </div>
        </div>

        {/* BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out delay-150 fill-mode-both">
          
          {/* LEFT COLUMN: Market Overview & Trending */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Market Overview Card */}
            <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={18} className="text-blue-500" />
                  Market Overview
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketData.length > 0 ? marketData.map(idx => {
                  const isUp = idx.change > 0;
                  const Icon = isUp ? TrendingUp : TrendingDown;
                  return (
                    <div key={idx.ticker} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                      <div className="text-xs font-semibold text-slate-500 mb-2">{idx.name.replace('^', '')}</div>
                      <div className="text-lg font-bold font-mono tracking-tight mb-1">{formatPrice(idx.price)}</div>
                      <div className={`text-xs font-bold flex items-center gap-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                        <Icon size={12} />
                        <span>{formatPercent(idx.change)}</span>
                      </div>
                    </div>
                  );
                }) : (
                  // Loading placeholders
                  [1,2,3,4].map(i => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 animate-pulse h-[90px]" />
                  ))
                )}
              </div>
            </div>

            {/* Recent Research */}
            <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Clock size={18} className="text-indigo-500" />
                  Recent Research
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentResearch.length > 0 ? recentResearch.map(report => (
                  <div 
                    key={report.id} 
                    onClick={() => navigate(`/research/${report.id}`)}
                    className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-[120px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {report.ticker}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <BookOpen size={10} /> {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {report.companyName}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        report.recommendation === 'Buy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        report.recommendation === 'Sell' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {report.recommendation} • {report.confidence}%
                      </span>
                      <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-8 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No recent research. Start your first analysis above.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Watchlist & Quick Actions */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* Watchlist */}
            <div className="bg-white/60 dark:bg-[#1E293B]/40 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500/20" />
                  Watchlist
                </h2>
              </div>
              <div className="space-y-3">
                {watchlist.length > 0 ? watchlist.slice(0, 5).map(item => (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/research/${item.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="font-bold text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                        {item.companyName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {item.ticker}
                      </span>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    Pin research to add to Watchlist.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions & AI Activity */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl border border-blue-500/50 p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
              <div className="relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-blue-200 fill-blue-200/50" />
                  Trending AI Picks
                </h2>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TICKERS.map(item => (
                    <button
                      key={item.ticker}
                      onClick={() => handleTickerSelect(item.ticker)}
                      disabled={researchMutation.isPending}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm truncate max-w-full text-left"
                    >
                      <span className="opacity-70 font-mono mr-1.5">{item.ticker}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
