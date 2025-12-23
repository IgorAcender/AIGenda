import { FastifyRequest, FastifyReply } from 'fastify'

// Tipos de roles
export type UserRole = 'MASTER' | 'OWNER' | 'PROFESSIONAL'

// Interface do usuário autenticado
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  tenantId: string | null
  professionalId: string | null
}

// Helper para extrair user do request
function getUser(request: FastifyRequest): AuthUser {
  return request.user as unknown as AuthUser
}

// ============= MIDDLEWARE DE AUTENTICAÇÃO =============

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Token inválido ou expirado' })
  }
}

// ============= MIDDLEWARES DE AUTORIZAÇÃO =============

/**
 * Permite apenas MASTER
 */
export async function requireMaster(request: FastifyRequest, reply: FastifyReply) {
  const user = getUser(request)
  if (user.role !== 'MASTER') {
    return reply.status(403).send({ 
      error: 'Acesso negado. Apenas administradores do sistema.' 
    })
  }
}

/**
 * Permite MASTER ou OWNER
 */
export async function requireOwnerOrMaster(request: FastifyRequest, reply: FastifyReply) {
  const user = getUser(request)
  if (user.role !== 'MASTER' && user.role !== 'OWNER') {
    return reply.status(403).send({ 
      error: 'Acesso negado. Apenas donos de salão.' 
    })
  }
}

/**
 * Permite qualquer usuário autenticado (MASTER, OWNER, PROFESSIONAL)
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const user = getUser(request)
  if (!user) {
    return reply.status(401).send({ error: 'Não autenticado' })
  }
}

// ============= HELPERS DE PERMISSÃO =============

/**
 * Retorna o tenantId baseado no role:
 * - MASTER: pode especificar qualquer tenantId
 * - OWNER/PROFESSIONAL: usa o tenantId do próprio usuário
 */
export function getTenantId(user: AuthUser, requestedTenantId?: string): string | null {
  if (user.role === 'MASTER') {
    // MASTER pode acessar qualquer tenant
    return requestedTenantId || null
  }
  // OWNER e PROFESSIONAL só acessam seu próprio tenant
  return user.tenantId
}

/**
 * Retorna o professionalId para filtrar dados:
 * - MASTER/OWNER: vê todos os profissionais do tenant
 * - PROFESSIONAL: vê apenas seus próprios dados
 */
export function getProfessionalFilter(user: AuthUser): string | null {
  if (user.role === 'PROFESSIONAL') {
    return user.professionalId
  }
  return null // Sem filtro - vê todos
}

/**
 * Verifica se o usuário pode acessar um tenant específico
 */
export function canAccessTenant(user: AuthUser, tenantId: string): boolean {
  if (user.role === 'MASTER') return true
  return user.tenantId === tenantId
}

/**
 * Verifica se o usuário pode acessar dados de um profissional específico
 */
export function canAccessProfessional(user: AuthUser, professionalId: string): boolean {
  if (user.role === 'MASTER') return true
  if (user.role === 'OWNER') return true // OWNER vê todos os profissionais do tenant
  return user.professionalId === professionalId
}

/**
 * Verifica se o usuário pode ver dados financeiros
 */
export function canAccessFinancials(user: AuthUser): boolean {
  return user.role === 'MASTER' || user.role === 'OWNER'
}

/**
 * Verifica se o usuário pode gerenciar configurações
 */
export function canManageSettings(user: AuthUser): boolean {
  return user.role === 'MASTER' || user.role === 'OWNER'
}

/**
 * Verifica se o usuário pode criar/editar/deletar profissionais
 */
export function canManageProfessionals(user: AuthUser): boolean {
  return user.role === 'MASTER' || user.role === 'OWNER'
}

/**
 * Verifica se o usuário pode criar/editar/deletar serviços
 */
export function canManageServices(user: AuthUser): boolean {
  return user.role === 'MASTER' || user.role === 'OWNER'
}

// ============= FILTROS DE QUERY =============

/**
 * Retorna o filtro WHERE para queries baseado no role
 */
export function getQueryFilter(user: AuthUser) {
  if (user.role === 'MASTER') {
    // MASTER vê tudo - sem filtro
    return {}
  }
  
  if (user.role === 'OWNER') {
    // OWNER vê apenas seu tenant
    return { tenantId: user.tenantId }
  }
  
  // PROFESSIONAL vê apenas seus dados
  return { 
    tenantId: user.tenantId,
    // Para queries de appointments, transactions, etc:
    // professionalId: user.professionalId
  }
}

/**
 * Retorna filtro específico para agendamentos
 */
export function getAppointmentFilter(user: AuthUser) {
  if (user.role === 'MASTER') {
    return {}
  }
  
  if (user.role === 'OWNER') {
    return { tenantId: user.tenantId }
  }
  
  // PROFESSIONAL vê apenas seus agendamentos
  return { 
    tenantId: user.tenantId,
    professionalId: user.professionalId
  }
}

/**
 * Retorna filtro para comissões
 */
export function getCommissionFilter(user: AuthUser) {
  if (user.role === 'MASTER') {
    return {}
  }
  
  if (user.role === 'OWNER') {
    return { tenantId: user.tenantId }
  }
  
  // PROFESSIONAL vê apenas suas comissões
  return { 
    tenantId: user.tenantId,
    professionalId: user.professionalId
  }
}
