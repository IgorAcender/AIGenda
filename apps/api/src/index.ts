import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import prisma client at runtime to avoid TypeScript named-export issues
// in some container/build environments where generated client typings
// may not match the installed package. Using require with a ts-ignore
// keeps the code working while still allowing TypeScript compilation.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { PrismaClient } = require('@prisma/client');

// Importar rotas
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';
import professionalRoutes from './routes/professionals.routes';
import serviceRoutes from './routes/services.routes';
import appointmentRoutes from './routes/appointments.routes';
import transactionRoutes from './routes/transactions.routes';
import reportsRoutes from './routes/reports.routes';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Express
const app: Express = express();
const prisma = new PrismaClient();

function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

// Middleware
const allowedOrigins = getAllowedOrigins();
const defaultDevOrigins = new Set(['http://localhost:3000', 'http://127.0.0.1:3000']);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.length > 0) {
        if (allowedOrigins.includes('*')) return callback(null, true);
        return callback(null, allowedOrigins.includes(origin));
      }

      if (process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }

      return callback(null, defaultDevOrigins.has(origin));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Next.js frontend as static files from the root
// This allows Express to serve the compiled Next.js app on the same port as the API
import path from 'path';
import fs from 'fs';

// When Next.js is built with `output: 'export'`, it generates a static `out/` folder
// that can be served directly by Express (no Next.js server needed)
const nextExportPath = path.join(__dirname, '../../web/out');
app.use(express.static(nextExportPath));

// Also serve Next.js public folder (legacy files, etc.)
app.use(express.static(path.join(__dirname, '../../web/public')));

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler for API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// SPA fallback: serve index.html for all non-API routes (Next.js client-side routing)
app.use((req: Request, res: Response) => {
  const candidates = [
    path.join(nextExportPath, 'index.html'),
    path.join(nextExportPath, 'index', 'index.html'),
  ];

  for (const file of candidates) {
    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }
  }

  res.status(404).json({ error: 'Frontend build not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const server = app.listen(Number(PORT), HOST, () => {
  console.log(`\n🚀 AIGenda API rodando em http://${HOST}:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

async function shutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down...`);
  await new Promise<void>((resolve) => server.close(() => resolve()));
  await prisma.$disconnect().catch(() => undefined);
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

export default app;
export { prisma };
