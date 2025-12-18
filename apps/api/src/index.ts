import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rotas
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';
import professionalRoutes from './routes/professionals.routes';
import serviceRoutes from './routes/services.routes';
import appointmentRoutes from './routes/appointments.routes';
import transactionRoutes from './routes/transactions.routes';

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

// Middleware de logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root info (useful when the domain points directly to the API)
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'AIGenda API',
    status: 'ok',
    health: '/health',
    routes: [
      '/api/auth',
      '/api/clients',
      '/api/professionals',
      '/api/services',
      '/api/appointments',
      '/api/transactions',
    ],
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/transactions', transactionRoutes);

// Rota 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
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
app.listen(PORT, () => {
  console.log(`\n🚀 AIGenda API rodando em http://localhost:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

export default app;
export { prisma };
