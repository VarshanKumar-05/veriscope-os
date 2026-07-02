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
import { fetchHistory, togglePin, deleteReport, getExportUrl } from '../services/api.js';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

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

  // Hotkey listener: Cmd+K / Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme (detecting system theme defaults if storage is empty)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    let isDark = false;
    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setDarkTheme(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-blueprint-dark');
      document.body.classList.remove('bg-blueprint');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-blueprint');
      document.body.classList.remove('bg-blueprint-dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkTheme;
    setDarkTheme(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-blueprint-dark');
      document.body.classList.remove('bg-blueprint');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-blueprint');
      document.body.classList.remove('bg-blueprint-dark');
    }
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Check if searched ticker exists in history, navigate to it
    const cleanQuery = searchQuery.toUpperCase().trim();
    const existing = history.find(h => h.ticker === cleanQuery);
    if (existing) {
      navigate(`/research/${existing.id}`);
      setSearchQuery('');
    } else {
      // Create new session via navigation query or redirect to landing page
      navigate(`/?q=${cleanQuery}`);
      setSearchQuery('');
    }
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
    <div className={`min-h-screen flex transition-colors duration-200 ${darkTheme ? 'dark text-slate-100 bg-[#0B1220]' : 'text-slate-900 bg-[#F8F7F4]'}`}>
      
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
            <div className="space-y-2 mt-2">
              <div 
                onClick={() => navigate('/?q=AAPL')}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-border-custom"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm">AAPL</span>
                  <span className="text-xs text-text-secondary font-medium">Apple</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-text-primary">$189.30</div>
                  <div className="text-xs font-bold text-emerald-600 font-mono">+1.2%</div>
                </div>
              </div>
              <div 
                onClick={() => navigate('/?q=NVDA')}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-border-custom"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm">NVDA</span>
                  <span className="text-xs text-text-secondary font-medium">NVIDIA</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-text-primary">$875.12</div>
                  <div className="text-xs font-bold text-emerald-600 font-mono">+4.8%</div>
                </div>
              </div>
              <div 
                onClick={() => navigate('/?q=MSFT')}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-border-custom"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-sm">MSFT</span>
                  <span className="text-xs text-text-secondary font-medium">Microsoft</span>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-text-primary">$420.55</div>
                  <div className="text-xs font-bold text-red-500 font-mono">-0.3%</div>
                </div>
              </div>
            </div>
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
              <div className="text-slate-400">Varsha Suresh</div>
              <div className="text-[10px] font-mono text-slate-500">Varsha.Suresh@gemini.net</div>
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
        
        {/* HEADER */}
        <header className="h-16 border-b border-[#E7E5E4] dark:border-[#273449] bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
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
                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg max-h-60 overflow-y-auto p-1.5 z-50">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Results
                  </div>
                  {filteredHistory.map(item => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/research/${item.id}`)}
                      className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-wide font-mono">{item.ticker}</span>
                        <span className="text-slate-400 truncate">{item.companyName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 capitalize">{item.recommendation}</span>
                    </div>
                  ))}
                  {filteredHistory.length === 0 && (
                    <div
                      onClick={() => navigate(`/?q=${searchQuery.toUpperCase()}`)}
                      className="px-2.5 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-medium"
                    >
                      Start new research for "{searchQuery.toUpperCase()}"
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
              title="Toggle Theme"
            >
              {darkTheme ? <Sun size={18} /> : <Moon size={18} />}
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
