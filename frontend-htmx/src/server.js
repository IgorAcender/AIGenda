import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import view from '@fastify/view'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = Fastify({
  logger: true,
})

// Registrar EJS como view engine
await app.register(view, {
  engine: {
    ejs: await import('ejs').then(m => m.render),
  },
  root: path.join(__dirname, '..', 'views'),
})

// Servir arquivos estáticos (CSS, JS, imagens)
app.register(await import('@fastify/static'), {
  root: path.join(__dirname, '..', 'public'),
})

// ============= ROTAS =============

// Página de login
app.get('/login', async (request, reply) => {
  return reply.view('login.ejs', {
    title: 'Login - Agende AI',
  })
})

// Página de dashboard
app.get('/dashboard', async (request, reply) => {
  // Verificar token JWT nos cookies
  const token = request.cookies.token
  if (!token) {
    return reply.redirect('/login')
  }
  
  return reply.view('dashboard.ejs', {
    title: 'Dashboard - Agende AI',
  })
})

// API: Login
app.post('/api/login', async (request, reply) => {
  const { email, password } = request.body
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }
    
    // Salvar token no cookie
    reply.setCookie('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
    })
    
    return { success: true, user: data.user }
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    return reply.status(500).send({ error: 'Erro ao fazer login' })
  }
})

// API: Logout
app.post('/api/logout', async (request, reply) => {
  reply.clearCookie('token')
  return { success: true }
})

// API: Listar clientes (proxy para backend Fastify)
app.get('/api/clients', async (request, reply) => {
  const token = request.cookies.token
  if (!token) {
    return reply.status(401).send({ error: 'Não autorizado' })
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/clients?${new URLSearchParams(request.query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    
    return response.json()
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return reply.status(500).send({ error: 'Erro ao buscar clientes' })
  }
})

// ============= START SERVER =============

try {
  const port = process.env.PORT || 3000
  const host = process.env.HOST || '0.0.0.0'
  
  await app.listen({ port, host })
  console.log(`🚀 Frontend HTMX rodando em http://${host}:${port}`)
  console.log(`📡 Conectando ao backend em http://localhost:3001`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
