import Fastify from 'fastify'
import path from 'path'
import { fileURLToPath } from 'url'
import view from '@fastify/view'
import fastifyStatic from '@fastify/static'
import cookie from '@fastify/cookie'
import ejs from 'ejs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const API_URL = process.env.API_URL || 'http://localhost:3001'

const app = Fastify({ logger: true })

// Registrar plugins
await app.register(cookie)

await app.register(view, {
  engine: { ejs },
  root: path.join(__dirname, '..', 'views'),
  viewExt: 'ejs',
})

await app.register(fastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  prefix: '/public/',
})

// Helper para fazer requisições à API
async function apiRequest(token, endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    console.error(`API Error ${response.status} on ${endpoint}:`, text)
    throw new Error(`API Error: ${response.status}`)
  }
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return text || {}
}

// Middleware de autenticação
function getToken(request) {
  return request.cookies?.token
}

function getUserFromToken(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    return payload
  } catch {
    return null
  }
}

// ============= PÁGINAS PRINCIPAIS =============

app.get('/login', async (request, reply) => {
  return reply.view('login.ejs', { title: 'Login - Agende AI' })
})

app.get('/', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.redirect('/login')
  return reply.redirect('/dashboard')
})

// Dashboard e outras páginas principais
const pages = ['dashboard', 'agenda', 'configuracoes']
const cadastroPages = ['clientes', 'profissionais', 'servicos']
const financeiroPages = ['caixa', 'transacoes']

pages.forEach(page => {
  app.get(`/${page}`, async (request, reply) => {
    const token = getToken(request)
    if (!token) return reply.redirect('/login')
    const user = getUserFromToken(token)
    
    try {
      const data = await getPageData(token, page, request.query)
      return reply.view('partials/layout.ejs', {
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Agende AI`,
        currentPage: page,
        pageTitle: page.charAt(0).toUpperCase() + page.slice(1),
        userName: user?.name,
        userRole: user?.role,
        tenantName: user?.tenantName,
        content: await ejs.renderFile(
          path.join(__dirname, '..', 'views', 'partials', `${page}.ejs`),
          data
        ),
      })
    } catch (error) {
      console.error(`Erro ao carregar ${page}:`, error)
      return reply.redirect('/login')
    }
  })
})

// Páginas de cadastro
cadastroPages.forEach(page => {
  app.get(`/cadastro/${page}`, async (request, reply) => {
    const token = getToken(request)
    if (!token) return reply.redirect('/login')
    const user = getUserFromToken(token)
    
    try {
      const data = await getPageData(token, page, request.query)
      return reply.view('partials/layout.ejs', {
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Agende AI`,
        currentPage: page,
        pageTitle: page.charAt(0).toUpperCase() + page.slice(1),
        userName: user?.name,
        userRole: user?.role,
        tenantName: user?.tenantName,
        content: await ejs.renderFile(
          path.join(__dirname, '..', 'views', 'partials', `${page}.ejs`),
          data
        ),
      })
    } catch (error) {
      console.error(`Erro ao carregar ${page}:`, error)
      return reply.redirect('/login')
    }
  })
})

// Páginas financeiro
financeiroPages.forEach(page => {
  app.get(`/financeiro/${page}`, async (request, reply) => {
    const token = getToken(request)
    if (!token) return reply.redirect('/login')
    const user = getUserFromToken(token)
    
    try {
      const data = await getPageData(token, page, request.query)
      return reply.view('partials/layout.ejs', {
        title: `${page.charAt(0).toUpperCase() + page.slice(1)} - Agende AI`,
        currentPage: page,
        pageTitle: page.charAt(0).toUpperCase() + page.slice(1),
        userName: user?.name,
        userRole: user?.role,
        tenantName: user?.tenantName,
        content: await ejs.renderFile(
          path.join(__dirname, '..', 'views', 'partials', `${page}.ejs`),
          data
        ),
      })
    } catch (error) {
      console.error(`Erro ao carregar ${page}:`, error)
      return reply.redirect('/login')
    }
  })
})

// ============= PARTIALS (HTMX) =============

app.get('/partials/dashboard', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'dashboard', request.query)
  return reply.view('partials/dashboard.ejs', data)
})

app.get('/partials/clientes', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'clientes', request.query)
  return reply.view('partials/clientes.ejs', data)
})

app.get('/partials/clientes/form', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  let client = null
  if (request.query.id) {
    try {
      client = await apiRequest(token, `/api/clients/${request.query.id}`)
    } catch (e) { /* ignore */ }
  }
  return reply.view('partials/clientes-form.ejs', { client })
})

app.get('/partials/profissionais', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'profissionais', request.query)
  return reply.view('partials/profissionais.ejs', data)
})

app.get('/partials/profissionais/form', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  let professional = null
  if (request.query.id) {
    try {
      professional = await apiRequest(token, `/api/professionals/${request.query.id}`)
    } catch (e) { /* ignore */ }
  }
  return reply.view('partials/profissionais-form.ejs', { professional })
})

app.get('/partials/servicos', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'servicos', request.query)
  return reply.view('partials/servicos.ejs', data)
})

app.get('/partials/servicos/form', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  let service = null
  if (request.query.id) {
    try {
      service = await apiRequest(token, `/api/services/${request.query.id}`)
    } catch (e) { /* ignore */ }
  }
  return reply.view('partials/servicos-form.ejs', { service })
})

app.get('/partials/agenda', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'agenda', request.query)
  return reply.view('partials/agenda.ejs', data)
})

app.get('/partials/caixa', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'caixa', request.query)
  return reply.view('partials/caixa.ejs', data)
})

app.get('/partials/transacoes', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'transacoes', request.query)
  return reply.view('partials/transacoes.ejs', data)
})

app.get('/partials/configuracoes', async (request, reply) => {
  const token = getToken(request)
  if (!token) return reply.status(401).send('Não autorizado')
  
  const data = await getPageData(token, 'configuracoes', request.query)
  return reply.view('partials/configuracoes.ejs', data)
})

// ============= DATA FETCHERS =============

async function getPageData(token, page, query = {}) {
  const today = new Date().toISOString().split('T')[0]
  
  switch (page) {
    case 'dashboard':
      try {
        const [stats, appointments] = await Promise.all([
          apiRequest(token, '/api/dashboard/stats').catch(() => ({})),
          apiRequest(token, `/api/appointments?date=${today}`).catch(() => ({ data: [] })),
        ])
        return { stats, appointments: appointments.data || [] }
      } catch {
        return { stats: {}, appointments: [] }
      }

    case 'clientes':
      try {
        const pageNum = parseInt(query.page) || 1
        const search = query.search || ''
        const result = await apiRequest(token, `/api/clients?page=${pageNum}&limit=10&search=${search}`)
        return {
          clients: result.data || [],
          total: result.total || 0,
          currentPage: pageNum,
          totalPages: Math.ceil((result.total || 0) / 10),
        }
      } catch {
        return { clients: [], total: 0, currentPage: 1, totalPages: 1 }
      }

    case 'profissionais':
      try {
        const result = await apiRequest(token, '/api/professionals')
        return { professionals: result.data || result || [], total: result.total || 0 }
      } catch {
        return { professionals: [], total: 0 }
      }

    case 'servicos':
      try {
        const result = await apiRequest(token, '/api/services')
        return { services: result.data || result || [], total: result.total || 0 }
      } catch {
        return { services: [], total: 0 }
      }

    case 'agenda':
      try {
        const date = query.date || today
        const currentDate = new Date(date)
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        const nextDate = new Date(currentDate)
        nextDate.setDate(nextDate.getDate() + 1)
        
        const [appointments, professionals] = await Promise.all([
          apiRequest(token, `/api/appointments?date=${date}`).catch(() => ({ data: [] })),
          apiRequest(token, '/api/professionals').catch(() => ({ data: [] })),
        ])
        
        return {
          appointments: appointments.data || [],
          professionals: professionals.data || professionals || [],
          currentDateFormatted: currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }),
          prevDate: prevDate.toISOString().split('T')[0],
          nextDate: nextDate.toISOString().split('T')[0],
        }
      } catch {
        return { appointments: [], professionals: [], currentDateFormatted: '', prevDate: '', nextDate: '' }
      }

    case 'caixa':
      try {
        const [cashRegister, movements] = await Promise.all([
          apiRequest(token, '/api/cash-register/today').catch(() => ({})),
          apiRequest(token, '/api/cash-register/movements').catch(() => ({ data: [] })),
        ])
        return { cashRegister, movements: movements.data || [] }
      } catch {
        return { cashRegister: {}, movements: [] }
      }

    case 'transacoes':
      try {
        const pageNum = parseInt(query.page) || 1
        const result = await apiRequest(token, `/api/transactions?page=${pageNum}&limit=20`)
        return {
          transactions: result.data || [],
          total: result.total || 0,
          currentPage: pageNum,
          totalPages: Math.ceil((result.total || 0) / 20),
        }
      } catch {
        return { transactions: [], total: 0, currentPage: 1, totalPages: 1 }
      }

    case 'configuracoes':
      try {
        const tenant = await apiRequest(token, '/api/tenant').catch(() => ({}))
        return { tenant }
      } catch {
        return { tenant: {} }
      }

    default:
      return {}
  }
}

// ============= API PROXIES =============

// Login
app.post('/api/login', async (request, reply) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request.body),
    })
    
    const contentType = response.headers.get('content-type')
    let data = {}
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      console.error('API response not JSON:', text)
    }
    
    if (!response.ok) {
      reply.header('HX-Reswap', 'none')
      reply.header('HX-Trigger', JSON.stringify({ 
        showToast: { 
          message: data.error || 'Credenciais inválidas', 
          type: 'error' 
        } 
      }))
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }
    
    if (!data.token) {
      return reply.status(401).send({ error: 'Token não fornecido' })
    }
    
    reply.setCookie('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    
    reply.header('HX-Redirect', '/dashboard')
    return reply.status(200).send({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return reply.status(500).send({ error: 'Erro interno' })
  }
})

// Logout
app.post('/api/logout', async (request, reply) => {
  reply.clearCookie('token', { path: '/' })
  reply.header('HX-Redirect', '/login')
  return { success: true }
})

// CRUD Clients
app.post('/api/clients', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, '/api/clients', { method: 'POST', body: JSON.stringify(request.body) })
    reply.header('HX-Trigger', JSON.stringify({ showToast: { message: 'Cliente cadastrado!', type: 'success' } }))
    const data = await getPageData(token, 'clientes', {})
    return reply.view('partials/clientes.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao cadastrar' })
  }
})

app.put('/api/clients/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/clients/${request.params.id}`, { method: 'PUT', body: JSON.stringify(request.body) })
    reply.header('HX-Trigger', JSON.stringify({ showToast: { message: 'Cliente atualizado!', type: 'success' } }))
    const data = await getPageData(token, 'clientes', {})
    return reply.view('partials/clientes.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao atualizar' })
  }
})

app.delete('/api/clients/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/clients/${request.params.id}`, { method: 'DELETE' })
    reply.header('HX-Trigger', JSON.stringify({ showToast: { message: 'Cliente excluído!', type: 'success' } }))
    return ''
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao excluir' })
  }
})

// CRUD Professionals
app.post('/api/professionals', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, '/api/professionals', { method: 'POST', body: JSON.stringify(request.body) })
    const data = await getPageData(token, 'profissionais', {})
    return reply.view('partials/profissionais.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao cadastrar' })
  }
})

app.put('/api/professionals/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/professionals/${request.params.id}`, { method: 'PUT', body: JSON.stringify(request.body) })
    const data = await getPageData(token, 'profissionais', {})
    return reply.view('partials/profissionais.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao atualizar' })
  }
})

app.delete('/api/professionals/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/professionals/${request.params.id}`, { method: 'DELETE' })
    return ''
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao excluir' })
  }
})

// CRUD Services
app.post('/api/services', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, '/api/services', { method: 'POST', body: JSON.stringify(request.body) })
    const data = await getPageData(token, 'servicos', {})
    return reply.view('partials/servicos.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao cadastrar' })
  }
})

app.put('/api/services/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/services/${request.params.id}`, { method: 'PUT', body: JSON.stringify(request.body) })
    const data = await getPageData(token, 'servicos', {})
    return reply.view('partials/servicos.ejs', data)
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao atualizar' })
  }
})

app.delete('/api/services/:id', async (request, reply) => {
  const token = getToken(request)
  try {
    await apiRequest(token, `/api/services/${request.params.id}`, { method: 'DELETE' })
    return ''
  } catch (error) {
    return reply.status(500).send({ error: 'Erro ao excluir' })
  }
})

// ============= START SERVER =============

const port = parseInt(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

try {
  await app.listen({ port, host })
  console.log(`🚀 Frontend HTMX rodando em http://${host}:${port}`)
  console.log(`📡 Conectando ao backend em ${API_URL}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
