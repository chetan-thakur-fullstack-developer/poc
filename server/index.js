import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { getSupabaseStatus, isSupabaseConfigured } from './supabase.js';
import authRoutes from './routes/auth.js';
import portfolioRoutes from './routes/portfolio.js';
import accountsRoutes from './routes/accounts.js';
import expensesRoutes from './routes/expenses.js';
import transactionsRoutes from './routes/transactions.js';
import syncRoutes from './routes/sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Health & Status endpoint
app.get('/api/health', (req, res) => {
  const supabaseStatus = getSupabaseStatus();
  res.json({
    status: 'online',
    app: 'Executive Wealth API',
    version: '5.0.0',
    timestamp: new Date().toISOString(),
    supabase: supabaseStatus,
    instructions: !supabaseStatus.configured
      ? 'To connect your Supabase account, add your SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.'
      : 'Supabase is configured and connected.'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/sync', syncRoutes);

// Serve static frontend build if it exists (for single-container/production deployments)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Fallback for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Executive Wealth API</title></head>
        <body style="background:#0b1120;color:#f8fafc;font-family:sans-serif;padding:40px;text-align:center;">
          <h2>Executive Wealth API Server Running on Port ${PORT}</h2>
          <p>Frontend is running separately via Vite at <a href="${CLIENT_URL}" style="color:#10b981;">${CLIENT_URL}</a></p>
          <p>Supabase Status: <strong>${isSupabaseConfigured() ? 'Connected' : 'Configure credentials in .env'}</strong></p>
        </body>
        </html>
      `);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Server Error]:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Executive Wealth API Server listening on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Supabase Configured: ${isSupabaseConfigured()}`);
  console.log(`=======================================================`);
});

export default app;
