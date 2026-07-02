import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ResearchGraph } from '../graph/graph.js';
import { ResearchState } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_FILE = path.join(__dirname, '..', 'history.json');

const router = Router();

// Zod schema for input validation
const TickerSchema = z.object({
  ticker: z.string()
    .min(1, 'Ticker is required')
    .max(10, 'Ticker must be 10 characters or less')
    .regex(/^[a-zA-Z0-9.\-]+$/, 'Ticker can only contain letters, numbers, dots, and dashes')
});

// Map of active streaming sessions
interface ActiveSession {
  ticker: string;
  state: ResearchState;
  pinned: boolean;
  createdAt: string;
}
const activeSessions = new Map<string, ActiveSession>();

// Helper to read history from local file
function readHistory(): Record<string, ActiveSession> {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to read history file:', error);
  }
  return {};
}

// Helper to write history to local file
function writeHistory(history: Record<string, ActiveSession>) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to write history file:', error);
  }
}

// GET /api/health
router.get('/health', (req: Request, res: Response) => {
  const historyExists = fs.existsSync(HISTORY_FILE);
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    config: {
      mode: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'Live API Connected' : 'Sandbox Demo Mode',
      hasHistoryFile: historyExists
    }
  });
});

// GET /api/history
router.get('/history', (req: Request, res: Response) => {
  const history = readHistory();
  
  // Format items for listing in the sidebar/dashboard
  const list = Object.entries(history).map(([id, session]) => ({
    id,
    ticker: session.ticker,
    companyName: session.state.companyIntel?.name || session.ticker,
    recommendation: session.state.decision?.recommendation || 'N/A',
    confidence: session.state.decision?.confidence || 0,
    status: session.state.status,
    pinned: session.pinned,
    createdAt: session.createdAt
  }));

  // Sort: pinned first, then newest first
  list.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  res.json(list);
});

// GET /api/history/:id
router.get('/history/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = readHistory();
  const session = history[id];

  if (!session) {
    res.status(404).json({ error: 'Research report not found' });
    return;
  }

  res.json({ id, ...session });
});

// POST /api/history/:id/pin
router.post('/history/:id/pin', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = readHistory();
  
  if (!history[id]) {
    res.status(404).json({ error: 'Research report not found' });
    return;
  }

  history[id].pinned = !history[id].pinned;
  writeHistory(history);
  res.json({ success: true, pinned: history[id].pinned });
});

// DELETE /api/history/:id
router.delete('/history/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = readHistory();

  if (!history[id]) {
    res.status(404).json({ error: 'Research report not found' });
    return;
  }

  delete history[id];
  writeHistory(history);
  res.json({ success: true });
});

// POST /api/research
router.post('/research', (req: Request, res: Response) => {
  const validation = TickerSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.errors[0].message });
    return;
  }

  const ticker = validation.data.ticker.toUpperCase();
  const id = crypto.randomUUID();

  // Create initial state
  const initialState: ResearchState = {
    ticker,
    status: 'idle',
    progress: 0,
    plan: [],
    logs: []
  };

  activeSessions.set(id, {
    ticker,
    state: initialState,
    pinned: false,
    createdAt: new Date().toISOString()
  });

  res.status(202).json({ id, ticker });
});

// GET /api/research/stream
router.get('/research/stream', (req: Request, res: Response) => {
  const { id, forceMock } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing session ID' });
    return;
  }

  const session = activeSessions.get(id);
  if (!session) {
    res.status(404).json({ error: 'Session not found or expired' });
    return;
  }

  // Configure response headers for Server-Sent Events (SSE)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no' // Prevent proxy buffering
  });

  // Client connection close handler
  req.on('close', () => {
    console.log(`SSE connection closed for session: ${id}`);
    res.end();
  });

  // Start graph execution with a callback that writes to the stream
  const graph = new ResearchGraph(
    session.ticker,
    (update) => {
      // Update our in-memory session state
      session.state = update.state;
      activeSessions.set(id, session);

      // Write SSE event
      res.write(`data: ${JSON.stringify(update)}\n\n`);
    },
    forceMock === 'true'
  );

  graph.execute()
    .then((finalState) => {
      // Save completed state to history
      const history = readHistory();
      history[id] = {
        ticker: session.ticker,
        state: finalState,
        pinned: false,
        createdAt: session.createdAt
      };
      writeHistory(history);

      // Remove from active map and close response
      activeSessions.delete(id);
      res.write('event: complete\ndata: {}\n\n');
      res.end();
    })
    .catch((error) => {
      console.error(`Graph execution failed for ${session.ticker}:`, error);
      
      // Save failed state to history so user can inspect log traces
      const history = readHistory();
      history[id] = {
        ticker: session.ticker,
        state: session.state,
        pinned: false,
        createdAt: session.createdAt
      };
      writeHistory(history);

      activeSessions.delete(id);
      res.write(`event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`);
      res.end();
    });
});

// GET /api/history/:id/export
router.get('/history/:id/export', (req: Request, res: Response) => {
  const { id } = req.params;
  const history = readHistory();
  const session = history[id];

  if (!session || !session.state.decision) {
    res.status(404).json({ error: 'Research report not found or incomplete' });
    return;
  }

  const { state } = session;
  const intel = state.companyIntel!;
  const financials = state.financials!;
  const dec = state.decision!;

  // Generate a clean markdown document for copy-paste/PDF export
  const report = `# VERISCOPE COMPANY INTELLIGENCE REPORT
## ${intel.name} (${intel.ticker})
**Recommendation:** ${dec.recommendation.toUpperCase()} (Confidence: ${dec.confidence}%)
**Generated:** ${new Date(session.createdAt).toLocaleDateString()}

---

### EXECUTIVE SUMMARY
${intel.summary}

### CORPORATE INFORMATION
- **CEO:** ${intel.ceo}
- **Headquarters:** ${intel.headquarters}
- **Founded:** ${intel.founded}
- **Founders:** ${intel.founders.join(', ')}
- **Industry:** ${intel.industry}
- **Employees:** ${intel.employeeCount.toLocaleString()}
- **Website:** ${intel.website}
- **Business Model:** ${intel.businessModel}

---

### FINANCIAL PROFILE (TTM)
- **Market Capitalization:** ${financials.formattedMetrics.marketCap.value}
- **Revenue:** ${financials.formattedMetrics.revenue.value} (YoY Growth: ${financials.formattedMetrics.revenueGrowth.value})
- **Net Income:** ${financials.formattedMetrics.netIncome.value}
- **Operating Margin:** ${financials.formattedMetrics.operatingMargin.value}
- **Free Cash Flow:** ${financials.formattedMetrics.cashFlow.value}
- **Total Debt:** ${financials.formattedMetrics.debt.value}
- **P/E Ratio:** ${financials.formattedMetrics.peRatio.value}

---

### INVESTMENT ARGUMENTS & REASONING
${dec.reasoning.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

#### Key Strengths:
${dec.keyStrengths.map((s: string) => `- ${s}`).join('\n')}

#### Key Risks:
${dec.keyRisks.map((r: string) => `- ${r}`).join('\n')}

### OUTLOOK
${dec.futureOutlook}

---
*Report generated securely by Veriscope AI Graph. Source data derived from SEC Filings and Market Indicators.*
`;

  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="Veriscope_${intel.ticker}_Report.md"`);
  res.send(report);
});

export default router;
