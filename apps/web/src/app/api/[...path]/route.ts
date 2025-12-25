/**
 * API Proxy Route
 * Redireciona todas as requisições /api/* para o backend
 */

import { NextRequest, NextResponse } from 'next/server'

// Função para obter URL da API
function getApiUrl(): string {
  // Se houver NEXT_PUBLIC_API_URL, usa ele
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // Caso contrário, fallback para localhost em desenvolvimento
  return 'http://localhost:3001'
}

export async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const pathStr = path?.join('/') || ''
    
    // Construir URL corretamente
    const apiUrl = getApiUrl()
    const fullUrl = `${apiUrl}/api/${pathStr}${request.nextUrl.search}`

    console.log(`[API Proxy] ${request.method} ${fullUrl}`)

    // Preparar headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Copiar headers importantes do request original
    const forwardHeaders = ['authorization', 'cookie', 'user-agent']
    for (const header of forwardHeaders) {
      const value = request.headers.get(header)
      if (value) {
        headers[header] = value
      }
    }

    // Preparar body para POST/PUT/PATCH
    let body: string | undefined
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text()
      } catch (e) {
        console.error('Erro ao ler body:', e)
      }
    }

    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
    })

    // Tentar fazer parse do response como JSON
    let data: any
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    console.log(`[API Proxy] Response: ${response.status}`)

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error(`[API Proxy Error]:`, error.message)
    return NextResponse.json(
      { error: 'Erro ao conectar com a API', details: error.message },
      { status: 500 }
    )
  }
}

// Exportar handlers para todos os métodos HTTP
export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
