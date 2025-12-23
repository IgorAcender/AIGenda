import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import { authRoutes } from './routes/auth'
import { clientRoutes } from './routes/clients'
import { professionalRoutes } from './routes/professionals'
import { serviceRoutes } from './routes/services'
import { categoryRoutes } from './routes/categories'
import { appointmentRoutes } from './routes/appointments'
import { publicBookingRoutes } from './routes/public-bookings'
import { transactionRoutes } from './routes/transactions'
import { dashboardRoutes } from './routes/dashboard'
import { tenantRoutes } from './routes/tenants'

const app = Fastify({
  logger: true,
})

// Plugins
app.register(cors, {
  origin: true,
  credentials: true,
})

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'aigenda-secret-key',
  sign: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
})

// Rate Limiting (usa memória local - Redis opcional para produção)
app.register(rateLimit, {
  max: 100, // 100 requests
  timeWindow: '1 minute',
  // Redis será usado em produção quando configurado
  keyGenerator: (request) => {
    // Usa userId se autenticado, senão usa IP
    const user = request.user as { id?: string } | undefined
    return user?.id || request.ip
  },
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: 'Too Many Requests',
    message: 'Você excedeu o limite de requisições. Tente novamente em alguns minutos.',
  }),
})

// Auth decorator
app.decorate('authenticate', async function (request: any, reply: any) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Não autorizado' })
  }
})

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Routes
app.register(authRoutes, { prefix: '/api/auth' })
app.register(tenantRoutes, { prefix: '/api/tenants' })
app.register(clientRoutes, { prefix: '/api/clients' })
app.register(professionalRoutes, { prefix: '/api/professionals' })
app.register(serviceRoutes, { prefix: '/api/services' })
app.register(categoryRoutes, { prefix: '/api/categories' })
app.register(appointmentRoutes, { prefix: '/api/appointments' })
app.register(publicBookingRoutes, { prefix: '' }) // Sem prefixo para rotas públicas
app.register(transactionRoutes, { prefix: '/api/transactions' })
app.register(dashboardRoutes, { prefix: '/api/dashboard' })

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.API_PORT || '3001')
    const host = process.env.API_HOST || '0.0.0.0'
    
    await app.listen({ port, host })
    console.log(`🚀 API rodando em http://${host}:${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
