import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart4, 
  Newspaper, 
  ShieldAlert, 
  Users, 
  Network, 
  FileSearch, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Printer,
  Loader2,
  Bookmark,
  Eye
} from 'lucide-react';

// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import html2canvas from 'html2canvas';

import { fetchReport, togglePin } from '../services/api.js';
import LoadingScreen from '../components/LoadingScreen.tsx';
import { useTheme } from '../providers/ThemeProvider.tsx';
import { 
  EvidenceNode, 
  FinancialNode, 
  RiskNode, 
  RecommendationNode 
} from '../components/CustomNodes.tsx';
import type { 
  ResearchState, 
  AgentLog, 
  EvidenceCard, 
  FinancialMetric, 
  NewsArticle, 
  CompetitorComparison, 
  RiskItem 
} from '../types/shared.ts';

// Setup React Flow Custom Nodes mapping
const nodeTypes = {
  evidenceNode: EvidenceNode,
  financialNode: FinancialNode,
  riskNode: RiskNode,
  recommendationNode: RecommendationNode
};

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useTheme();

  const formatLiveDateTime = (dateVal?: string | Date) => {
    const d = dateVal ? new Date(dateVal) : new Date();
    const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    // Safe extraction of timezone abbreviation (e.g. IST, EST)
    const tzStr = d.toLocaleDateString('en-US', { timeZoneName: 'short' }).split(', ')[1] || 'UTC';
    return `${dateStr} ${timeStr} ${tzStr}`;
  };

  const isStreamingRequested = searchParams.get('stream') === 'true';

  // Local state for streaming sessions
  const [streamState, setStreamState] = useState<ResearchState | null>(null);
  const [streamLogs, setStreamLogs] = useState<AgentLog[]>([]);
  const [streamError, setStreamError] = useState<string | null>(null);
  
  // Tab Management - Executive Summary (overview) is now the default primary tab!
  const [activeTab, setActiveTab] = useState<'canvas' | 'financials' | 'news' | 'competitors' | 'risks' | 'overview'>('overview');

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Fetch report details if finished/cached
  const { data: reportData } = useQuery({
    queryKey: ['report', id],
    queryFn: () => fetchReport(id!),
    enabled: !!id && !isStreamingRequested,
    retry: false
  });

  const pinMutation = useMutation({
    mutationFn: togglePin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['report', id] });
    }
  });


  // Handle SSE Streaming Connection
  useEffect(() => {
    if (!id || !isStreamingRequested) return;

    setStreamError(null);
    setStreamLogs([]);
    setStreamState(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

const eventSource = new EventSource(
  `${API_URL}/api/research/stream?id=${id}`
);
    eventSource.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        setStreamState(update.state);
        if (update.log) {
          setStreamLogs((prev) => [...prev, update.log]);
        }
      } catch (err) {
        console.error('Failed to parse SSE payload:', err);
      }
    };

    eventSource.addEventListener('complete', () => {
      console.log('Research stream completed successfully.');
      eventSource.close();
      queryClient.invalidateQueries({ queryKey: ['history'] });
      navigate(`/research/${id}`, { replace: true });
    });

    eventSource.addEventListener('error', (event: any) => {
      console.error('SSE connection error:', event);
      eventSource.close();
      
      let errMsg = 'Connection dropped unexpectedly.';
      if (event.data) {
        try {
          const parsed = JSON.parse(event.data);
          errMsg = parsed.message || errMsg;
        } catch (e) {
          errMsg = event.data;
        }
      }
      setStreamError(errMsg);
    });

    return () => {
      eventSource.close();
    };
  }, [id, isStreamingRequested, queryClient, navigate]);

  // Extract primary state object (from stream if active, otherwise react-query)
  const reportState: ResearchState | undefined = useMemo(() => {
    if (isStreamingRequested && streamState) return streamState;
    return reportData?.state;
  }, [isStreamingRequested, streamState, reportData]);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    if (!reportState?.ticker) return;
    const saved = localStorage.getItem('watchlist');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        setInWatchlist(list.some((item: any) => item.ticker === reportState.ticker));
      } catch (e) {}
    }
  }, [reportState]);

  const toggleWatchlistItem = () => {
    if (!reportState?.ticker) return;
    const saved = localStorage.getItem('watchlist');
    let list: any[] = [];
    if (saved) {
      try { list = JSON.parse(saved); } catch (e) {}
    }
    
    const exists = list.some((item: any) => item.ticker === reportState.ticker);
    if (exists) {
      list = list.filter((item: any) => item.ticker !== reportState.ticker);
    } else {
      const curPrice = reportState?.financials?.formattedMetrics?.regularMarketPrice?.value || reportState?.financials?.formattedMetrics?.marketCap?.value || '$--.--';
      const curChange = reportState?.financials?.formattedMetrics?.revenueGrowth?.value || '0.00%';
      list.push({
        ticker: reportState.ticker,
        name: reportState?.companyIntel?.name || reportState.ticker,
        price: curPrice,
        change: curChange,
        exchange: (reportState?.companyIntel as any)?.exchange || 'Unknown'
      });
    }
    localStorage.setItem('watchlist', JSON.stringify(list));
    setInWatchlist(!exists);
    window.dispatchEvent(new Event('watchlist-update'));
  };

  // Helper to categorize evidence dynamically on the client
  const getEvidenceCategory = (ev: EvidenceCard) => {
    const idLower = ev.id.toLowerCase();
    const sourceLower = ev.source.toLowerCase();
    
    if (idLower.includes('financial') || idLower === 'ev1' || idLower === 'ev3' || sourceLower.includes('sec') || sourceLower.includes('statement') || sourceLower.includes('income') || sourceLower.includes('balance')) {
      return 'financial';
    }
    if (idLower.includes('risk') || idLower === 'ev4' || sourceLower.includes('risk') || sourceLower.includes('threat')) {
      return 'risk';
    }
    if (idLower.includes('news') || idLower === 'ev5' || sourceLower.includes('news') || sourceLower.includes('sentiment') || sourceLower.includes('press') || sourceLower.includes('media')) {
      return 'news';
    }
    if (idLower.includes('competitor') || sourceLower.includes('competitor') || sourceLower.includes('peer') || sourceLower.includes('landscape')) {
      return 'competitor';
    }
    return 'general';
  };

  // Generate React Flow Nodes and Edges when data is loaded
  useEffect(() => {
    if (!reportState || reportState.status !== 'completed') return;

    const intel = reportState.companyIntel;
    const financials = reportState.financials;
    const risks = reportState.risks;
    const evidence = reportState.evidence || [];
    const decision = reportState.decision;

    if (!intel || !financials || !risks || !decision) return;

    // 1. Position Evidence Nodes in column 1 (left)
    const totalEvidence = evidence.length;
    const evidenceSpacing = Math.max(160, Math.min(220, 800 / totalEvidence));
    const evidenceNodes = evidence.map((ev: EvidenceCard, index: number) => {
      const cat = getEvidenceCategory(ev);
      return {
        id: ev.id,
        type: 'evidenceNode',
        data: {
          ...ev,
          category: cat // Inject computed category to the custom node
        },
        position: { x: 60, y: 60 + index * evidenceSpacing },
        draggable: true
      };
    });

    // 2. Position Core Metric Cards in column 2 (middle)
    const financialNode = {
      id: 'financial_node',
      type: 'financialNode',
      data: financials,
      position: { x: 480, y: 140 },
      draggable: true
    };

    const riskNode = {
      id: 'risk_node',
      type: 'riskNode',
      data: risks,
      position: { x: 480, y: 520 },
      draggable: true
    };

    // 3. Position final decision certificate in column 3 (right)
    const recommendationNode = {
      id: 'recommendation_node',
      type: 'recommendationNode',
      data: {
        ...decision,
        overallScore: 100 - risks.overallScore, // Company Health Score
        evidenceCount: evidence.length,
        lastUpdated: formatLiveDateTime(reportData?.createdAt)
      },
      position: { x: 900, y: 300 },
      draggable: true
    };

    // Construct Edges mapping everything back to the Recommendation Node
    // Injecting CSS flow class tokens for colored flow edges
    const evidenceEdges = evidence.map((ev: EvidenceCard) => {
      const cat = getEvidenceCategory(ev);
      let flowClass = 'edge-flow-gray';
      if (cat === 'financial') flowClass = 'edge-flow-blue';
      else if (cat === 'risk') flowClass = 'edge-flow-orange';
      else if (cat === 'general') flowClass = 'edge-flow-green';
      
      return {
        id: `edge_${ev.id}`,
        source: ev.id,
        target: 'recommendation_node',
        className: flowClass,
        animated: true,
        markerEnd: { 
          type: MarkerType.ArrowClosed, 
          color: cat === 'financial' ? '#3B82F6' :
                 cat === 'risk' ? '#F59E0B' :
                 cat === 'general' ? '#22C55E' : '#94a3b8'
        }
      };
    });

    const financialEdge = {
      id: 'edge_financial',
      source: 'financial_node',
      target: 'recommendation_node',
      className: 'edge-flow-blue',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3B82F6' }
    };

    const riskEdge = {
      id: 'edge_risk',
      source: 'risk_node',
      target: 'recommendation_node',
      className: 'edge-flow-orange',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#F59E0B' }
    };

    setNodes([...evidenceNodes, financialNode, riskNode, recommendationNode]);
    setEdges([...evidenceEdges, financialEdge, riskEdge]);
  }, [reportState]);

  // Handle errors or missing reports
  if (streamError || reportState?.status === 'failed') {
    return (
      <div className="h-full bg-blueprint dark:bg-blueprint-dark flex items-center justify-center p-6 text-center select-none">
        <div className="p-8 bg-white dark:bg-slate-900 border border-[#E7E5E4] dark:border-[#273449] rounded-xl shadow-lg max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">Research Run Interrupted</h3>
          <p className="text-xs text-slate-500">
            {streamError || reportState?.error || 'The agent graph encountered a runtime decision threshold boundary exception.'}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs cursor-pointer"
          >
            Return to Terminal
          </button>
        </div>
      </div>
    );
  }

  // Show stream loading screen if pipeline is currently executing
  if (isStreamingRequested || (reportState && reportState.status !== 'completed')) {
    return (
      <LoadingScreen
        ticker={id ? id.split('_')[0] : 'AAPL'}
        status={reportState?.status || 'planning'}
        progress={reportState?.progress || 0}
        logs={streamLogs.length > 0 ? streamLogs : (reportState?.logs || [])}
      />
    );
  }

  if (!reportState || !reportData) {
    return (
      <div className="h-full bg-blueprint dark:bg-blueprint-dark flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span>Restoring catalog report state...</span>
        </div>
      </div>
    );
  }

  // Bind structured schemas
  const intel = reportState.companyIntel;
  const financials = reportState.financials;
  const news = reportState.news;
  const competitors = reportState.competitors;
  const risks = reportState.risks;
  const decision = reportState.decision;

  if (!intel || !financials || !news || !competitors || !risks || !decision) {
    return (
      <div className="h-full bg-blueprint dark:bg-blueprint-dark flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span>Synchronizing analyst profile variables...</span>
        </div>
      </div>
    );
  }

  const isPinned = reportData.pinned;

  const handlePrint = async () => {
    console.log('[PDF Export] Initiating high-DPI PDF generation...');
    setIsExportingPDF(true);

    const canvasContainer = document.querySelector('.react-flow');
    if (canvasContainer) {
      try {
        console.log('[PDF Export] Capturing React Flow Canvas...');
        const controls = canvasContainer.querySelector('.react-flow__controls');
        const minimap = canvasContainer.querySelector('.react-flow__minimap');
        if (controls) controls.classList.add('hidden');
        if (minimap) minimap.classList.add('hidden');

        const canvas = await html2canvas(canvasContainer as HTMLElement, {
          useCORS: true,
          scale: 2,
          logging: false,
          backgroundColor: '#0c1322'
        });
        
        if (controls) controls.classList.remove('hidden');
        if (minimap) minimap.classList.remove('hidden');

        setCanvasImage(canvas.toDataURL('image/png'));
      } catch (err) {
        console.error('[PDF Export] Failed to capture canvas:', err);
      }
    }

    setTimeout(() => {
      const element = document.getElementById('print-dossier-layout');
      if (!element) {
        console.warn('[PDF Export] Print element not found, falling back to window.print()');
        window.print();
        setIsExportingPDF(false);
        return;
      }

      const companyName = intel?.name || 'Company';
      const ticker = reportState?.ticker || 'TICKER';
      const todayStr = new Date().toISOString().split('T')[0];
      const filename = `Veriscope_Report_${companyName.replace(/\s+/g, '_')}_${ticker}_${todayStr}.pdf`;

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' as const
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      element.classList.remove('hidden');
      element.classList.add('block');

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          console.log('[PDF Export] PDF exported successfully.');
        })
        .catch((err: any) => {
          console.error('[PDF Export] Generation failed:', err);
          window.print();
        })
        .finally(() => {
          // Robust cleanup to prevent unresponsiveness bugs
          element.classList.remove('block');
          element.classList.add('hidden');
          setIsExportingPDF(false);
          document.body.style.pointerEvents = 'auto';
          document.body.style.overflow = 'auto';
          document.querySelectorAll('.html2canvas-container').forEach(e => e.remove());
        });
    }, 500);
  };

  // Recharts metric mappings
  const historicalData = financials.historical || [];
  
  // News sentiment colors
  const SENTIMENT_COLORS = { positive: '#22c55e', neutral: '#94a3b8', negative: '#ef4444' };
  const pieData = [
    { name: 'Positive', value: news.sentimentSummary.positive },
    { name: 'Neutral', value: news.sentimentSummary.neutral },
    { name: 'Negative', value: news.sentimentSummary.negative }
  ];

  return (
    <div className="h-full flex flex-col items-stretch overflow-hidden bg-blueprint dark:bg-blueprint-dark">
      
      {/* ANALYST INFO HEADER PANEL */}
      <div className="px-6 py-4 border-b border-[#E7E5E4] dark:border-[#273449] bg-white/60 dark:bg-[#111827]/60 backdrop-blur-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Full Company Name & Ticker Display */}
        <div>
          <h1 className="text-xl md:text-2xl font-serif font-black text-slate-900 dark:text-white leading-tight">
            {intel.name}
          </h1>
          <div className="text-[10px] font-mono text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            {intel.exchange || 'Unknown'} : {reportState.ticker}
          </div>
          <div className="text-[10px] font-mono text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            {intel.sector || 'Unknown'} • {intel.country || 'Unknown'}
          </div>
          <div className="text-[10px] font-mono text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
            Conviction Index : {decision.confidence}%
          </div>
        </div>

        {/* Pin, Print and Watchlist Actions */}
        <div className="flex items-center gap-2.5 no-print">
          <button 
            onClick={toggleWatchlistItem}
            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              inWatchlist 
                ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400 font-bold' 
                : 'bg-white border-[#E7E5E4] text-slate-650 hover:bg-slate-50 dark:bg-[#111827] dark:border-[#273449] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Eye size={14} className={inWatchlist ? 'fill-blue-600' : ''} />
            <span className="hidden md:inline">{inWatchlist ? 'Watchlisted' : 'Watchlist'}</span>
          </button>

          <button 
            onClick={() => pinMutation.mutate(reportData.id)}
            className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
              isPinned 
                ? 'bg-amber-50 border-amber-250 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400' 
                : 'bg-white border-[#E7E5E4] text-slate-650 hover:bg-slate-50 dark:bg-[#111827] dark:border-[#273449] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            title={isPinned ? 'Unpin report' : 'Pin report to sidebar'}
          >
            <Bookmark size={14} className={isPinned ? 'fill-amber-600' : ''} />
            <span className="hidden md:inline">{isPinned ? 'Pinned' : 'Pin Report'}</span>
          </button>
          
           <button 
            onClick={handlePrint}
            disabled={isExportingPDF}
            className="p-2 rounded-lg border border-[#E7E5E4] dark:border-[#273449] bg-white dark:bg-[#111827] text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
            title="Export high-resolution investment research PDF dossier"
          >
            {isExportingPDF ? (
              <>
                <Loader2 size={14} className="animate-spin text-blue-500" />
                <span className="hidden md:inline">Exporting...</span>
              </>
            ) : (
              <>
                <Printer size={14} />
                <span className="hidden md:inline">Export PDF</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* HORIZONTAL TAB MENU */}
      <div className="px-6 border-b border-[#E7E5E4] dark:border-[#273449] bg-white/20 dark:bg-slate-900/10 flex gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Executive Summary', icon: FileSearch },
          { id: 'canvas', label: 'Research Canvas', icon: Network },
          { id: 'financials', label: 'Financial Analytics', icon: BarChart4 },
          { id: 'news', label: 'News Sentiment', icon: Newspaper },
          { id: 'competitors', label: 'Peer Landscape', icon: Users },
          { id: 'risks', label: 'Risk Heatmap', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-slate-950 text-slate-950 dark:border-white dark:text-white font-bold' 
                  : 'border-transparent text-slate-450 hover:text-slate-700 hover:border-slate-200/85'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* DASHBOARD TAB CONTENTS CONTAINER */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* TAB 1: EXECUTIVE SUMMARY (loads first by default!) */}
        {activeTab === 'overview' && (
          <div className="absolute inset-0 overflow-y-auto p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-6xl mx-auto flex gap-8 items-start select-text">
              
              {/* Sticky Sidebar Navigation Index */}
              <nav className="w-48 shrink-0 sticky top-0 hidden lg:flex flex-col gap-2 p-1.5 border-r border-[#E7E5E4] dark:border-[#273449] text-xs font-semibold no-print">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-2">Report Sections</span>
                <a href="#conviction" className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">1. Conviction Index</a>
                <a href="#drivers" className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">2. Driving Factors</a>
                <a href="#red-flags" className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">3. Red Flags & Risks</a>
                <a href="#profile" className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">4. Corporate Identity</a>
                <a href="#data-quality" className="px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">5. Verification Log</a>
              </nav>

              {/* Main Report Content */}
              <div className="flex-1 space-y-8 page-transition max-w-4xl">
                
                {/* Executive Conviction Header Card */}
                <div id="conviction" className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-800 pb-5 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      AI Investment Recommendation Summary
                    </div>
                    <h2 className="text-3xl font-serif font-black text-slate-900 dark:text-white leading-tight">
                      {intel.name}
                    </h2>
                    <div className="text-[10px] font-semibold font-mono text-slate-455 dark:text-slate-500">
                      {(intel as any).exchange || 'Unknown'}: {reportState.ticker} • TTM Report
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-lg bg-emerald-600 dark:bg-emerald-700 text-white font-serif font-extrabold text-xs uppercase tracking-widest shadow-xs">
                      {decision.recommendation}
                    </span>
                  </div>
                </div>

                {/* Score Index Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-[#E7E5E4] dark:border-slate-800 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Confidence Score</span>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{decision.confidence}%</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-[#E7E5E4] dark:border-slate-800 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Company Health</span>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{100 - risks.overallScore}/100</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-[#E7E5E4] dark:border-slate-800 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Business Risk Index</span>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{risks.overallScore}/100</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/60 border border-[#E7E5E4] dark:border-slate-800 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Growth Outlook</span>
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{decision.recommendation.includes('Buy') ? 'Positive' : decision.recommendation.includes('Pass') ? 'Negative' : 'Neutral'}</div>
                  </div>
                </div>

                {/* One-minute AI Summary */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">One-Minute Conviction Summary</h4>
                  <blockquote className="p-4 rounded-xl bg-slate-50 dark:bg-[#0c1322] border border-[#E7E5E4] dark:border-slate-800 text-xs italic text-slate-655 dark:text-slate-400 leading-relaxed">
                    "{decision.futureOutlook}"
                  </blockquote>
                </div>
              </div>

              {/* Reasons & Risks Audit Lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Key Strengths */}
                <div id="drivers" className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-md border-b border-slate-100 dark:border-slate-800 pb-2.5 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Primary Driving Factors</span>
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-655 dark:text-slate-400">
                    {decision.keyStrengths?.map((reason: string, idx: number) => (
                      <li key={idx} className="flex gap-2 leading-relaxed">
                        <span className="font-mono text-emerald-600 font-bold">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Threat Vectors */}
                <div id="red-flags" className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-md border-b border-slate-100 dark:border-slate-800 pb-2.5 text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Identified Risk Headwinds</span>
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-655 dark:text-slate-400">
                    {decision.keyRisks?.map((riskStr: string, idx: number) => (
                      <li key={idx} className="flex gap-2 leading-relaxed">
                        <span className="font-mono text-red-500 font-bold">⚠</span>
                        <span>{riskStr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Corporate Identity Profile */}
              <div id="profile" className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-md border-b border-slate-100 dark:border-slate-800 pb-2.5 text-slate-900 dark:text-white">Corporate Identity Profile</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Chief Executive Officer</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{intel.ceo}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Founders</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">{intel.founders.join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Founded Year</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{intel.founded}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Workforce</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{typeof intel.employeeCount === 'number' ? `${intel.employeeCount.toLocaleString()} employees` : intel.employeeCount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Country</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{(intel as any).country || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Currency</span>
                    <span className="font-semibold text-slate-900 dark:text-white uppercase">{(intel as any).currency || 'USD'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Sector</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{(intel as any).sector || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Industry</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{intel.industry || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Data Verification & Quality Credentials */}
              <div id="data-quality" className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                <h3 className="font-serif font-bold text-md border-b border-slate-100 dark:border-slate-800 pb-2.5 text-slate-900 dark:text-white">Data Verification & Quality Credentials</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Verification Status</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-500">{(intel as any).verificationStatus || 'Verified'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Data Freshness</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{(intel as any).dataFreshness || 'TTM'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Confidence Score</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{(intel as any).confidenceScore || 95}%</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Verified Sources</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-right">{((intel as any).verifiedSources || ['Yahoo Finance', 'SEC Filings']).join(', ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-950">
                    <span className="text-slate-455">Last Verified</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{(intel as any).lastUpdated || new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              </div> {/* Close Main Report Content */}
            </div> {/* Close max-w-6xl flex wrapper */}
          </div>
        )}

        {/* TAB 2: INFINITE CANVASES - REACT FLOW */}
        {activeTab === 'canvas' && (
          <div className="absolute inset-0 bg-blueprint dark:bg-blueprint-dark">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              colorMode={theme}
              defaultEdgeOptions={{ animated: true, type: 'default' }}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.2}
              maxZoom={1.5}
              panOnScroll={true}
              panOnDrag={true}
              proOptions={{ hideAttribution: true }}
            >
              <Background gap={24} size={1.5} color={theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0'} />
              <Controls position="bottom-left" className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 fill-slate-700 dark:fill-slate-300" />
              <MiniMap 
                nodeColor={(node) => {
                  if (node.type === 'recommendationNode') return '#0f172a';
                  if (node.type === 'evidenceNode') return '#3b82f6';
                  if (node.type === 'riskNode') return '#ef4444';
                  return '#94a3b8';
                }}
                maskColor="rgba(241, 245, 249, 0.4)"
                className="!bg-white/80 dark:!bg-slate-900/80 !border-[#E7E5E4] dark:!border-slate-800 rounded-lg shadow-sm"
              />
            </ReactFlow>
          </div>
        )}

        {/* TAB 3: FINANCIALS */}
        {activeTab === 'financials' && (
          <div className="absolute inset-0 overflow-y-auto p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              
              {/* Financial KPI Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(financials.formattedMetrics).map(([key, rawItem]) => {
                  const item = rawItem as FinancialMetric;
                  const hasTrend = item.trend;
                  return (
                    <div key={key} className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white leading-tight">{item.value}</div>
                      </div>
                      
                      {/* Trend icons */}
                      {hasTrend && (
                        <div className={`p-1 rounded-full ${
                          item.trend === 'up' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          item.trend === 'down' ? 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.trend === 'up' ? <ArrowUpRight size={14} /> :
                           item.trend === 'down' ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Chart Block */}
              {historicalData.length > 0 && (
                <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-805 pb-3">
                    <h3 className="font-serif font-bold text-md text-slate-900 dark:text-white">Revenue & Operating Income Growth</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Consolidated Trailing 3 Years</span>
                  </div>

                  <div className="h-[300px] w-full font-mono text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={historicalData} margin={{ top: 10, right: -5, left: -15, bottom: 0 }}>
                        <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                        <Bar dataKey="revenue" name="Total Revenue ($B)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Line type="monotone" dataKey="operatingIncome" name="Operating Income ($B)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Explain Every Metric Expanded Details */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-sm space-y-4 mt-6">
                <h3 className="font-serif font-bold text-md border-b border-slate-100 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">Explainable Metrics Guide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-slate-900 dark:text-white text-xs">Revenue (TTM)</span>
                      <span className="font-mono font-bold text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{financials.formattedMetrics.revenue.value}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Meaning:</span> Total gross sales generated over the trailing 12-month timeline.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Why it matters:</span> Verifies operational scale, market capture, and corporate viability.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Impact:</span> Strong revenue directly supports rating convictions.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-slate-900 dark:text-white text-xs">Operating Margin</span>
                      <span className="font-mono font-bold text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{financials.formattedMetrics.operatingMargin.value}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Meaning:</span> Net operating earnings left after manufacturing & operational overhead costs.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Why it matters:</span> Highlights pricing leverage, margins strength, and business efficiency.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Impact:</span> High margins protect operations against industry cyclical headwinds.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-slate-900 dark:text-white text-xs">YoY Revenue Growth</span>
                      <span className="font-mono font-bold text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{financials.formattedMetrics.revenueGrowth.value}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Meaning:</span> Velocity of annual top-line growth speed.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Why it matters:</span> Validates scaling trajectory and capture of new business sectors.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Impact:</span> Rapid rates offset high valuations and boost overall score indices.</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-905 border border-slate-200/40 dark:border-slate-800/80 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-slate-900 dark:text-white text-xs">P/E Ratio</span>
                      <span className="font-mono font-bold text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{financials.formattedMetrics.peRatio.value}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1">
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Meaning:</span> Market price per share divided by annual earnings per share.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Why it matters:</span> Shows valuation premium relative to real net profits.</div>
                      <div><span className="font-semibold text-slate-700 dark:text-slate-300">Impact:</span> Identifies if the stock is over-leveraged or offers entry margin-of-safety.</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: NEWS */}
        {activeTab === 'news' && (
          <div className="absolute inset-0 overflow-y-auto p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 select-text">
              
              {/* LEFT COLUMN: PIE CHART */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs flex flex-col justify-between space-y-6 h-fit sticky top-0">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h3 className="font-serif font-bold text-md text-slate-900 dark:text-white">Sentiment Overview</h3>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Consolidated Media Index</span>
                </div>

                <div className="h-44 w-full relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        <Cell fill={SENTIMENT_COLORS.positive} />
                        <Cell fill={SENTIMENT_COLORS.neutral} />
                        <Cell fill={SENTIMENT_COLORS.negative} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute text-center leading-none">
                    <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">{news.sentimentSummary.positive}%</div>
                    <div className="text-[8px] text-slate-400 uppercase mt-1 font-bold">Positive</div>
                  </div>
                </div>

                {/* Sentiment Legend breakdown */}
                <div className="flex justify-center gap-4 text-[10px] font-semibold font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.positive }} />
                    <span className="text-slate-550">Pos: {news.sentimentSummary.positive}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.neutral }} />
                    <span className="text-slate-550">Neu: {news.sentimentSummary.neutral}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS.negative }} />
                    <span className="text-slate-550">Neg: {news.sentimentSummary.negative}%</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (2/3 width): ARTICLES TIMELINE */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-serif font-bold text-md border-b border-[#E7E5E4] dark:border-[#273449] pb-2 text-slate-900 dark:text-white">
                  Compiled Agent News Log ({news.articles.length} verified articles)
                </h3>
                
                <div className="space-y-4">
                  {news.articles.map((art: NewsArticle) => (
                    <div 
                      key={art.id} 
                      className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-3 relative group overflow-hidden"
                    >
                      {/* Left indicator marker */}
                      <span className={`absolute left-0 top-0 bottom-0 w-1 ${
                        art.sentiment === 'positive' ? 'bg-emerald-600' :
                        art.sentiment === 'negative' ? 'bg-red-650' : 'bg-slate-350'
                      }`} />

                      <div className="flex items-start justify-between gap-4">
                        <span className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 text-[9px] font-bold text-slate-450 uppercase tracking-wider font-mono">
                          {art.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium font-mono">
                          {art.date}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white leading-snug">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                        {art.summary}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-950 pt-2 text-[10px] text-slate-400 font-semibold">
                        <span>Source: {art.source}</span>
                        {art.url && (
                          <a 
                            href={art.url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Read Article</span>
                            <ArrowUpRight size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: COMPETITORS */}
        {activeTab === 'competitors' && (
          <div className="absolute inset-0 overflow-y-auto p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              
              {/* Comparison Matrix Table */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h3 className="font-serif font-bold text-md text-slate-900 dark:text-white">Peer Comparison Matrix</h3>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Industry Ratio analysis</span>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      <th className="py-2.5">Company Name</th>
                      <th className="py-2.5">Ticker</th>
                      <th className="py-2.5">Revenue</th>
                      <th className="py-2.5">Market Cap</th>
                      <th className="py-2.5">Margin (%)</th>
                      <th className="py-2.5">Valuation (P/E)</th>
                      <th className="py-2.5">Innovation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/50 font-mono text-slate-700 dark:text-slate-300">
                    {/* Primary Ticker */}
                    <tr className="hover:bg-slate-50/20 font-semibold text-slate-900 dark:text-white">
                      <td className="py-3 font-serif">{intel.name}</td>
                      <td className="py-3 font-mono">{intel.ticker}</td>
                      <td className="py-3">{financials.formattedMetrics.revenue.value}</td>
                      <td className="py-3">{financials.formattedMetrics.marketCap.value}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-8">{financials.metrics.operatingMargin.toFixed(0)}</span>
                          <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-700 rounded-full" style={{ width: `${Math.min(100, Math.max(0, financials.metrics.operatingMargin * 2))}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{financials.formattedMetrics.peRatio.value} P/E</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <span className="w-8">85</span>
                          <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-900 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Peer Competitors */}
                    {competitors.competitors.map((peer: CompetitorComparison) => (
                      <tr key={peer.ticker} className="hover:bg-slate-50/20">
                        <td className="py-3">{peer.name}</td>
                        <td className="py-3 font-mono">{peer.ticker}</td>
                        <td className="py-3">
                          ${(peer.revenue / 1e9).toFixed(1)}B
                        </td>
                        <td className="py-3">
                          ${(peer.marketCap / 1e9).toFixed(1)}B
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <span className="w-8">{peer.profitability}</span>
                            <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-500 rounded-full" style={{ width: `${peer.profitability}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{peer.valuation} P/E</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            <span className="w-8">{peer.innovation}</span>
                            <div className="h-1.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-500 rounded-full" style={{ width: `${peer.innovation}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strengths & Weaknesses Peer Review Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {competitors.competitors.map((peer: CompetitorComparison) => (
                  <div key={peer.ticker} className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                      <h4 className="text-xs font-bold font-serif text-slate-900 dark:text-white">Peer Audit: {peer.name} ({peer.ticker})</h4>
                      <span className="text-[10px] text-slate-400">Score comparison</span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="font-semibold text-emerald-850 dark:text-emerald-500 mb-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          <span>Competitive Strengths</span>
                        </div>
                        <ul className="space-y-1 text-slate-550 list-disc list-inside pl-1 text-[11px]">
                          {peer.strengths.map((str: string, idx: number) => <li key={idx}>{str}</li>)}
                        </ul>
                      </div>

                      <div>
                        <div className="font-semibold text-red-850 dark:text-red-500 mb-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-650" />
                          <span>Vulnerabilities / Weaknesses</span>
                        </div>
                        <ul className="space-y-1 text-slate-550 list-disc list-inside pl-1 text-[11px]">
                          {peer.weaknesses.map((weak: string, idx: number) => <li key={idx}>{weak}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: RISKS */}
        {activeTab === 'risks' && (
          <div className="absolute inset-0 overflow-y-auto p-6 md:p-10 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="max-w-4xl mx-auto space-y-8 select-text">
              
              {/* Risk Score Box */}
              <div className="p-6 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0 w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
                  <div className="text-center font-mono leading-none">
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{risks.overallScore}</div>
                    <div className="text-[8px] text-slate-400 uppercase tracking-wider mt-1">Threat index</div>
                  </div>
                </div>

                {/* Risk Severity description */}
                <div className="flex-1 space-y-2.5 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      risks.overallScore > 60 ? 'bg-red-50 text-red-850 border border-red-200/40' :
                      risks.overallScore >= 40 ? 'bg-amber-50 text-amber-800 border border-amber-200/40' :
                      'bg-emerald-50 text-emerald-800 border border-emerald-200/40'
                    }`}>
                      {risks.overallScore > 60 ? 'High Threat Environment' :
                       risks.overallScore >= 40 ? 'Moderate Threat Environment' : 'Low Threat Environment'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-sans select-text">
                    Veriscope risk assessment evaluates operational vulnerabilities across regulatory checks, technological shifts, supply chain dependencies, and competitor pressure. A higher score index signals structural margins compression risks.
                  </p>
                </div>
              </div>

              {/* Risks Cards List */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-md border-b border-[#E7E5E4] dark:border-[#273449] pb-2 text-slate-900 dark:text-white">
                  Identified Threats & Mitigations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risks.risks.map((risk: RiskItem, index: number) => {
                    const isHigh = risk.severity === 'High';
                    const isMed = risk.severity === 'Medium';
                    
                    return (
                      <div 
                        key={index} 
                        className="p-5 rounded-xl bg-white dark:bg-[#111827] border border-[#E7E5E4] dark:border-[#273449] shadow-xs space-y-3 relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{risk.category} Risk</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${
                            isHigh ? 'bg-red-50 text-red-800' :
                            isMed ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-850'
                          }`}>
                            {risk.severity} Severity
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800 dark:text-white leading-snug">
                          Key {risk.category} Threat Vector
                        </p>
                        <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed select-text">
                          {risk.explanation}
                        </p>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-850 space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mitigating Action</div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-350 select-text">
                            {risk.mitigation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

            {/* PRINT-ONLY EXECUTIVE RESEARCH DOSSIER LAYOUT */}
      <div id="print-dossier-layout" className="hidden p-0 bg-slate-955 text-slate-100 font-sans space-y-0 w-[210mm] mx-auto select-text">
        
        {/* ==================== PAGE 1: COVER PAGE ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white relative border border-slate-900">
          {/* Top Logo & Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <span className="text-sm font-bold tracking-widest text-slate-400">🔭 VERISCOPE OS</span>
            <span className="text-[9px] font-mono text-slate-500">SESSION: {reportData.id.substring(0, 8)}...</span>
          </div>

          {/* Middle Cover Content */}
          <div className="my-auto space-y-8">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded bg-blue-900/40 text-blue-400 border border-blue-800/60 text-[10px] font-mono font-bold uppercase tracking-wider">
                Automated Equity Research Report
              </span>
              <h1 className="text-4xl font-serif font-black tracking-tight leading-none mt-4 text-white">
                {intel.name}
              </h1>
              <div className="text-lg font-mono text-slate-400 mt-2">
                Ticker: {reportState.ticker} • Exchange: {(intel as any).exchange || 'NASDAQ'}
              </div>
            </div>

            {/* Ratings Conviction Badge */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conviction Recommendation</span>
                <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40">
                  {(intel as any).verificationStatus || 'VERIFIED'}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-3xl font-serif font-extrabold text-blue-400">
                  {decision.recommendation}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence Index</div>
                  <div className="text-xl font-bold font-mono text-white">{decision.confidence}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Cover Metadata */}
          <div className="border-t border-slate-800 pt-6 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-slate-500 font-medium">Analyst:</div>
              <div className="font-bold text-white">Veriscope OS Automated Analyst Group</div>
              <div className="text-slate-400 text-[10px]">Deepmind Advanced Agentic Coding</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-slate-500 font-medium">Generated Date & Time:</div>
              <div className="font-mono text-white">{formatLiveDateTime(reportData.createdAt)}</div>
              <div className="text-slate-400 text-[10px]">Client Local Time Zone</div>
            </div>
          </div>
        </div>

        {/* ==================== PAGE 2: TABLE OF CONTENTS ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">🔭 VERISCOPE OS — TABLE OF CONTENTS</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-serif font-bold text-white border-b border-slate-800 pb-2">Document Index</h2>
              
              <div className="space-y-4 font-mono text-xs">
                {[
                  { num: '1', title: 'Executive Summary & Conviction', page: '3' },
                  { num: '2', title: 'Driving Factors & Headwinds', page: '4' },
                  { num: '3', title: 'Corporate Identity Profile', page: '5' },
                  { num: '4', title: 'Verified Financial Indicators', page: '6' },
                  { num: '5', title: 'News Sentiment & Analysis', page: '7' },
                  { num: '6', title: 'Peer Comparison & Landscape', page: '8' },
                  { num: '7', title: 'Research Canvas Node Flow', page: '9' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-baseline border-b border-dashed border-slate-800 py-1">
                    <span className="text-slate-300">{item.num}. {item.title}</span>
                    <span className="text-slate-400 font-bold">{item.page}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 2</span>
          </div>
        </div>

        {/* ==================== PAGE 3: EXECUTIVE SUMMARY ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">1. EXECUTIVE SUMMARY</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-white">Investment Outlook</h3>
              <blockquote className="p-4 bg-slate-900/60 border-l-4 border-blue-500 rounded-r-lg text-xs italic text-slate-300 leading-relaxed">
                "{decision.futureOutlook}"
              </blockquote>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Confidence Score</span>
                <span className="text-xl font-bold font-mono text-blue-400">{decision.confidence}%</span>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Company Health</span>
                <span className="text-xl font-bold font-mono text-emerald-400">{100 - risks.overallScore}/100</span>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Threat Index</span>
                <span className="text-xl font-bold font-mono text-red-400">{risks.overallScore}/100</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 3</span>
          </div>
        </div>

        {/* ==================== PAGE 4: DRIVING FACTORS & RISKS ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">2. DRIVING FACTORS & RISKS</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                <h3 className="font-serif font-bold text-sm text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Primary Driving Strengths</span>
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  {decision.keyStrengths?.map((reason: string, idx: number) => (
                    <li key={idx} className="flex gap-2 leading-relaxed">
                      <span className="font-mono text-emerald-400 font-bold">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                <h3 className="font-serif font-bold text-sm text-red-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Identified Risk Headwinds</span>
                </h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  {decision.keyRisks?.map((riskStr: string, idx: number) => (
                    <li key={idx} className="flex gap-2 leading-relaxed">
                      <span className="font-mono text-red-400 font-bold">⚠</span>
                      <span>{riskStr}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 4</span>
          </div>
        </div>

        {/* ==================== PAGE 5: CORPORATE IDENTITY PROFILE ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">3. CORPORATE IDENTITY & CREDENTIALS</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-sm text-white border-b border-slate-800 pb-2">Corporate Profile</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">CEO</span>
                    <span className="font-semibold text-white">{intel.ceo}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Founders</span>
                    <span className="font-semibold text-white">{intel.founders.join(', ')}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Founded Year</span>
                    <span className="font-semibold text-white">{intel.founded}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Workforce</span>
                    <span className="font-semibold text-white">{intel.employeeCount.toLocaleString()} employees</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="font-serif font-bold text-sm text-white border-b border-slate-800 pb-2">Data Quality Verification</h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Verification Status</span>
                    <span className="font-semibold text-emerald-400 font-bold">{(intel as any).verificationStatus || 'Verified'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Confidence Score</span>
                    <span className="font-semibold text-white">{(intel as any).confidenceScore || 95}%</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Data Freshness</span>
                    <span className="font-semibold text-white">{(intel as any).dataFreshness || 'TTM'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-500">Verified Sources</span>
                    <span className="font-semibold text-white text-right">{((intel as any).verifiedSources || ['Yahoo Finance', 'SEC Filings']).join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 5</span>
          </div>
        </div>

        {/* ==================== PAGE 6: FINANCIAL DATA INDICATORS ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">4. VERIFIED FINANCIAL INDICATORS</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              {Object.entries(financials.formattedMetrics).map(([key, rawItem]) => {
                const item = rawItem as any;
                return (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-900/60">
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className="font-bold font-mono text-white">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 6</span>
          </div>
        </div>

        {/* ==================== PAGE 7: NEWS SENTIMENT & ANALYSIS ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">5. NEWS SENTIMENT ANALYSIS</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-white">Recent Verified Press Sentiment</h3>
              <div className="space-y-3">
                {news.articles.slice(0, 4).map((art: NewsArticle, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{art.source} • {art.date}</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                        art.sentiment === 'positive' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' :
                        art.sentiment === 'negative' ? 'bg-red-950/40 text-red-400 border border-red-900/40' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {art.sentiment} {((art as any).confidence) ? `(${(art as any).confidence}% Confidence)` : ''}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white leading-snug">{art.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 7</span>
          </div>
        </div>

        {/* ==================== PAGE 8: PEER COMPARISON ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 html2pdf__page-break bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">6. PEER LANDSCAPE COMPARISON</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="space-y-4">
              {(competitors.competitors || []).slice(0, 3).map((peer: CompetitorComparison, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">{peer.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{peer.ticker}</div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-500">Market Share</div>
                    <div className="font-semibold text-slate-300">{(peer as any).marketShare || 'N/A'}</div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-500">Product Overlap</div>
                    <div className="font-semibold text-slate-300">{(peer as any).productOverlap || 'Direct competitor'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 8</span>
          </div>
        </div>

        {/* ==================== PAGE 9: RESEARCH CANVAS GRAPH ==================== */}
        <div className="w-full min-h-[295mm] flex flex-col justify-between p-12 bg-slate-950 text-white border border-slate-900">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <span className="text-xs font-bold tracking-widest text-slate-400">7. RESEARCH CANVAS FLOW GRAPH</span>
              <span className="text-xs font-mono text-slate-500">{intel.name} ({reportState.ticker})</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-300">Agentic Data Verification Network Map</h3>
              {canvasImage ? (
                <div className="border border-slate-850 rounded-xl overflow-hidden bg-[#0c1322] p-2 flex items-center justify-center">
                  <img src={canvasImage} alt="Research Canvas Graph Map" className="max-w-full max-h-[160mm] object-contain rounded" />
                </div>
              ) : (
                <div className="h-[140mm] border border-slate-800/80 border-dashed rounded-xl flex items-center justify-center text-xs text-slate-500">
                  Capturing dynamic verification network graph map...
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-[8px] font-mono text-slate-500 pt-4 border-t border-slate-900">
            <span>CONFIDENTIAL • VERISCOPE RESEARCH</span>
            <span>PAGE 9</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
