import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Compass, 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Zap,
  Bookmark, 
  History, 
  Download, 
  Trash2,
  TrendingUp,
  Settings,
  User,
  Eye,
  Archive
} from 'lucide-react';
import { fetchHistory, togglePin, deleteReport, getExportUrl, fetchSearch, type SearchSuggestion } from '../services/api.js';
import { useTheme } from '../providers/ThemeProvider';
import IntelligenceRibbon from '../components/IntelligenceRibbon.js';
import CommandPalette from '../components/CommandPalette.js';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [watchlist, setWatchlist] = useState<any[]>(() => {
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { ticker: 'AAPL', name: 'Apple Inc.', price: '$189.30', change: '+1.2%' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '$875.12', change: '+4.8%' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', price: '$420.55', change: '-0.3%' }
    ];
  });

  useEffect(() => {
    const handleWatchlistUpdate = () => {
      const saved = localStorage.getItem('watchlist');
      if (saved) {
        try { setWatchlist(JSON.parse(saved)); } catch (e) {}
      }
    };
    window.addEventListener('watchlist-update', handleWatchlistUpdate);
    window.addEventListener('storage', handleWatchlistUpdate);
    return () => {
      window.removeEventListener('watchlist-update', handleWatchlistUpdate);
      window.removeEventListener('storage', handleWatchlistUpdate);
    };
  }, []);

  // Load history list via React Query
  const { data: history = [] } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
    refetchInterval: 5000 // Poll every 5 seconds to show active runs status updates
  });

  const pinMutation = useMutation({
    mutationFn: togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      // If deleted active report, go to landing page
      if (id) {
        navigate('/');
      }
    }
  });

  // Accessibility Hotkey listeners: Ctrl+K / Alt+S to search, Alt+T to toggle theme, Alt+H for home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || (e.altKey && e.key.toLowerCase() === 's')) {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        toggleTheme();
      }
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, navigate]);
  // Theme is now managed by ThemeProvider
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      fetchSearch(searchQuery)
        .then(setSearchSuggestions)
        .catch(err => console.error('[Header Search] Failed to fetch suggestions:', err));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const cleanQuery = searchQuery.trim();
    navigate(`/?q=${encodeURIComponent(cleanQuery)}`);
    setSearchQuery('');
  };

  const handleSidebarItemClick = (reportId: string) => {
    navigate(`/research/${reportId}`);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Filter history based on local inline searching in sidebar
  const filteredHistory = history.filter(item => 
    item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${theme === 'dark' || theme === 'electric' ? 'dark text-slate-100 bg-[#0B1220]' : 'text-slate-900 bg-[#F8F7F4]'}`}>
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-white dark:bg-[#111827] border-r border-[#E7E5E4] dark:border-[#273449] flex flex-col transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* LOGO */}
        <div className="p-5 border-b border-[#E7E5E4] dark:border-[#273449] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => navigate('/')}>
            <span className="text-2xl">🔭</span>
            <span className="font-serif font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              Veriscope<span className="text-xs font-sans font-medium text-slate-400 align-super ml-0.5">OS</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X size={18} />
          </button>
        </div>
        {/* SIDEBAR NAVIGATION LIST (Workspace, Archive) */}
        <div className="p-5 border-b border-border-custom space-y-2">
          <Link 
            to="/" 
            className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold transition-all ${
              location.pathname === '/' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm' 
                : 'text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-text-primary'
            }`}
          >
            <Compass size={18} />
            <span>Workspace Terminal</span>
          </Link>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const recentHeader = document.getElementById('recent-research-section');
                if (recentHeader) recentHeader.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base font-bold text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-text-primary text-left cursor-pointer transition-all"
          >
            <Archive size={18} />
            <span>Research Archive</span>
          </button>
        </div>

        {/* SCROLLABLE SIDEBAR SECTIONS */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* WATCHLIST SECTION */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
              <Eye size={12} />
              <span>WATCHLIST</span>
            </div>
            {watchlist.length === 0 ? (
              <div className="px-4 py-2.5 text-xs italic text-text-secondary">
                No pinned watchlist items.
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {watchlist.map((item, idx) => {
                  const isChangePositive = !item.change || item.change.startsWith('+');
                  return (
                    <div 
                      key={item.ticker + idx}
                      onClick={() => navigate(`/?q=${item.ticker}`)}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-border-custom card-premium"
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold font-mono text-sm tracking-tight">{item.ticker}</span>
                          {/* We don't have exchange stored in history yet, but we will use companyName */}
                        </div>
                        <span className="text-[10px] text-text-secondary truncate max-w-[150px] font-medium mt-0.5" title={item.companyName}>{item.companyName}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs font-bold text-text-primary">{item.price || '$--.--'}</div>
                        <div className={`text-[10px] font-bold font-mono ${isChangePositive ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.change || '0.00%'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TRENDING COMPANIES *          {/* TRENDING COMPANIES */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
              <TrendingUp size={12} />
              <span>TRENDING</span>
            </div>
            <div className="space-y-2 mt-2">
              <button 
                onClick={() => navigate('/?q=TSLA')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer transition-all border border-transparent hover:border-border-custom"
              >
                <span className="truncate">Tesla Inc. (TSLA)</span>
                <span className="text-[10px] font-bold text-amber-600 font-mono">Volatile</span>
              </button>
              <button 
                onClick={() => navigate('/?q=GOOGL')}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 text-left cursor-pointer transition-all border border-transparent hover:border-border-custom"
              >
                <span className="truncate">Alphabet Inc. (GOOGL)</span>
                <span className="text-[10px] font-bold text-blue-600 font-mono">Stable</span>
              </button>
            </div>
          </div>

          {/* Pinned Reports */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
              <Bookmark size={12} />
              <span>PINNED REPORTS</span>
            </div>
            {history.filter(h => h.pinned).length === 0 ? (
              <div className="px-4 py-2.5 text-xs italic text-text-secondary">
                No pinned research.
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {history.filter(h => h.pinned).map(item => (
                  <div 
                    key={item.id}
                    className={`group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border border-transparent ${
                      id === item.id 
                        ? 'bg-slate-100 dark:bg-slate-800 text-text-primary border-border-custom shadow-xs' 
                        : 'text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-border-custom'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0" 
                      onClick={() => handleSidebarItemClick(item.id)}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span className="font-bold font-mono text-xs tracking-wider">{item.ticker}</span>
                      <span className="truncate font-normal text-text-secondary text-xs">{item.companyName}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        pinMutation.mutate(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-text-secondary hover:text-text-primary transition-opacity"
                      title="Unpin report"
                    >
                      <Bookmark size={14} className="fill-slate-400 dark:fill-slate-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent History */}
          <div>
            <div className="flex items-center gap-2 px-4 mb-2 text-xs font-bold text-text-secondary uppercase tracking-widest">
              <History size={12} />
              <span>RECENT RESEARCH</span>
            </div>
            {history.length === 0 ? (
              <div className="px-4 py-2.5 text-xs italic text-text-secondary">
                No recent history.
              </div>
            ) : (
              <div className="space-y-2 mt-2">
                {filteredHistory.map(item => (
                  <div 
                    key={item.id}
                    className={`group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border border-transparent ${
                      id === item.id 
                        ? 'bg-slate-100 dark:bg-slate-800 text-text-primary border-border-custom shadow-xs' 
                        : 'text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-border-custom'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-2 flex-1 min-w-0" 
                      onClick={() => handleSidebarItemClick(item.id)}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'completed' ? 'bg-emerald-600' :
                        item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'
                      }`} />
                      <span className="font-bold font-mono text-xs tracking-wider">{item.ticker}</span>
                      <span className="truncate font-normal text-text-secondary text-xs">{item.companyName}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          pinMutation.mutate(item.id);
                        }}
                        className="p-0.5 text-text-secondary hover:text-text-primary"
                        title={item.pinned ? "Unpin report" : "Pin report"}
                      >
                        <Bookmark size={13} className={item.pinned ? "fill-slate-400" : ""} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this report permanently?')) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="p-0.5 text-text-secondary hover:text-[var(--danger)]"
                        title="Delete report"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM METRICS, SETTINGS & PROFILE */}
        <div className="p-4 border-t border-[#E7E5E4] dark:border-[#273449] bg-slate-50/50 dark:bg-[#0c1322] space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Sandbox Mode</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-500 text-[9px] uppercase font-semibold">Active</span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/40 dark:border-slate-800/40 pt-2 text-slate-505 dark:text-slate-400">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <Settings size={12} />
              <span>SETTINGS</span>
            </button>

            <button 
              onClick={() => setShowProfileCard(prev => !prev)}
              className="flex items-center gap-1.5 text-[10px] font-bold hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <User size={12} />
              <span>PROFILE</span>
            </button>
          </div>

          {/* Quick Profile Popover */}
          {showProfileCard && (
            <div className="p-3 bg-white dark:bg-slate-900 border border-[#E7E5E4] dark:border-[#273449] rounded-lg shadow-md text-[11px] space-y-2">
              <div className="font-bold text-slate-900 dark:text-white">Workspace Analyst</div>
              <div className="text-slate-400">Varshan Kumar</div>
              <div className="text-slate-500 font-mono mt-1">Varshankumarchadaram@gmail.com</div>
            </div>
          )}
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-955/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        <IntelligenceRibbon />
        <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />

        {/* HEADER */}
        <header className="h-16 border-b border-[#E7E5E4] dark:border-[#273449] bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* GLOBAL SEARCH */}
            <form onSubmit={handleGlobalSearch} className="hidden sm:block relative w-64 md:w-96">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                <Search size={16} />
              </span>
              <input
                id="global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder="Search Ticker (e.g. AAPL, NVDA) or Cmd+K"
                className="w-full pl-10 pr-12 py-1.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-[#E7E5E4] dark:border-slate-700 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:focus:border-white dark:focus:ring-white transition-all text-slate-905 dark:text-white"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[10px] font-semibold text-slate-400">
                ⌘K
              </span>

              {/* SEARCH AUTOCOMPLETE DRAWER */}
              {searchFocused && searchQuery.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1.5 z-50 select-none">
                  {filteredHistory.length > 0 && (
                    <>
                      <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Recent Reports
                      </div>
                      {filteredHistory.map(item => (
                        <div
                          key={item.id}
                          onMouseDown={() => {
                            navigate(`/research/${item.id}`);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold tracking-wide font-mono text-slate-900 dark:text-white">{item.ticker}</span>
                            <span className="text-slate-400 truncate max-w-[180px]">{item.companyName}</span>
                          </div>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">{item.recommendation}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  {searchSuggestions.length > 0 && (
                    <>
                      <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800/60 mt-1 pt-1.5">
                        Global Directory Suggestions
                      </div>
                      {searchSuggestions.map((item, index) => (
                        <div
                          key={item.ticker + index}
                          onMouseDown={() => {
                            setSearchQuery('');
                            navigate(`/?q=${encodeURIComponent(item.ticker)}`);
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold tracking-wide font-mono text-blue-650 dark:text-blue-400">{item.ticker}</span>
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{item.name}</span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase">{item.exchange}</span>
                        </div>
                      ))}
                    </>
                  )}

                  {filteredHistory.length === 0 && searchSuggestions.length === 0 && (
                    <div
                      onMouseDown={() => {
                        navigate(`/?q=${encodeURIComponent(searchQuery)}`);
                        setSearchQuery('');
                      }}
                      className="px-2.5 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-medium"
                    >
                      Search global directory for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="flex items-center gap-3">
            {/* THEME TOGGLE */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
              title={`Toggle Theme (Current: ${theme})`}
            >
              {theme === 'dark' ? <Sun size={18} /> : theme === 'electric' ? <Zap size={18} className="text-[var(--primary)]" /> : <Moon size={18} />}
            </button>

            {/* DOWNLOAD EXPORT (IF ON REPORT PAGE) */}
            {id && history.find(h => h.id === id)?.status === 'completed' && (
              <a 
                href={getExportUrl(id)}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:opacity-90 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Export report as Markdown"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export Report</span>
              </a>
            )}
            
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#E7E5E4] dark:border-slate-700 flex items-center justify-center font-serif text-sm font-bold">
                A
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-semibold">Analyst</div>
                <div className="text-[10px] text-slate-450">Workspace Active</div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs">
          <div className="p-6 max-w-sm w-full bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] rounded-xl shadow-lg space-y-4">
            <h3 className="font-serif font-bold text-md text-slate-900 dark:text-white">Workspace Settings</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400">
              Veriscope is operating in **Local Sandbox Demo Mode**. Real-time internet lookups will fall back to local high-fidelity stock database files for popular tickers (AAPL, NVDA, GOOGL, TSLA, MSFT).
            </p>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold cursor-pointer"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
