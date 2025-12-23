import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Flag para saber se Redis está disponível
let redisAvailable = false

// Criar cliente Redis com opções de fallback
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    // Tentar reconectar apenas 3 vezes, depois desistir
    if (times > 3) {
      console.log('⚠️ Redis não disponível, funcionando sem cache')
      return null // Para de tentar
    }
    return Math.min(times * 200, 1000)
  },
  lazyConnect: true,
  enableOfflineQueue: false, // Não enfileirar comandos quando offline
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
  redisAvailable = true
})

redis.on('error', () => {
  redisAvailable = false
  // Silenciar erros repetidos
})

redis.on('close', () => {
  redisAvailable = false
})

// Tentar conectar ao iniciar (não bloqueia se falhar)
redis.connect().catch(() => {
  console.log('⚠️ Redis não disponível - funcionando sem cache/rate limiting')
})

/**
 * Verifica se Redis está disponível
 */
export function isRedisAvailable(): boolean {
  return redisAvailable
}

// ============= CACHE HELPERS (com fallback) =============

const DEFAULT_TTL = 60 * 5 // 5 minutos

/**
 * Cache com TTL automático - retorna null se Redis indisponível
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redisAvailable) return null
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, data: unknown, ttl = DEFAULT_TTL): Promise<void> {
  if (!redisAvailable) return
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch {
    // Silenciar erros
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redisAvailable) return
  try {
    await redis.del(key)
  } catch {
    // Silenciar erros
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!redisAvailable) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  } catch {
    // Silenciar erros
  }
}

// ============= SESSION HELPERS =============

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 dias

export async function setSession(userId: string, data: unknown): Promise<void> {
  if (!redisAvailable) return
  try {
    await redis.setex(`${SESSION_PREFIX}${userId}`, SESSION_TTL, JSON.stringify(data))
  } catch {
    // Silenciar erros
  }
}

export async function getSession<T>(userId: string): Promise<T | null> {
  if (!redisAvailable) return null
  try {
    const data = await redis.get(`${SESSION_PREFIX}${userId}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export async function deleteSession(userId: string): Promise<void> {
  if (!redisAvailable) return
  try {
    await redis.del(`${SESSION_PREFIX}${userId}`)
  } catch {
    // Silenciar erros
  }
}

// ============= RATE LIMITING HELPERS =============

/**
 * Rate limiting simples - retorna true se pode continuar, false se bloqueado
 * Se Redis não disponível, sempre permite (sem rate limiting)
 */
export async function checkRateLimit(
  key: string, 
  maxRequests: number, 
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  // Se Redis não disponível, permitir tudo
  if (!redisAvailable) {
    return { allowed: true, remaining: maxRequests, resetIn: 0 }
  }

  try {
    const fullKey = `ratelimit:${key}`
    const current = await redis.incr(fullKey)
    
    if (current === 1) {
      await redis.expire(fullKey, windowSeconds)
    }

    const ttl = await redis.ttl(fullKey)
    const remaining = Math.max(0, maxRequests - current)
    
    return {
      allowed: current <= maxRequests,
      remaining,
      resetIn: ttl > 0 ? ttl : windowSeconds,
    }
  } catch {
    // Se falhar, permitir
    return { allowed: true, remaining: maxRequests, resetIn: 0 }
  }
}

// ============= QUEUE HELPERS =============

export async function addToQueue(queueName: string, data: unknown): Promise<void> {
  if (!redisAvailable) return
  try {
    await redis.lpush(`queue:${queueName}`, JSON.stringify(data))
  } catch {
    // Silenciar erros
  }
}

export async function getFromQueue<T>(queueName: string): Promise<T | null> {
  if (!redisAvailable) return null
  try {
    const data = await redis.rpop(`queue:${queueName}`)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}
