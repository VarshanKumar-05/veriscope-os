import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development server or production environment
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Expose root health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'Veriscope OS',
    version: '1.2.0',
    timestamp: new Date().toISOString()
  });
});

// Mount central API routes
app.use('/api', apiRouter);

// Expose static frontend build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Basic catch-all handler for API routing errors
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Centralized error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Veriscope OS Backend Running           `);
  console.log(` Port: ${PORT}                          `);
  console.log(` Mode: ${process.env.GEMINI_API_KEY ? 'Live Gemini Connect' : 'Local Sandbox Mode'} `);
  console.log(`=========================================`);
});
