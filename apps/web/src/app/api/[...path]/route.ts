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
  const { path } = await params
  const pathStr = path?.join('/') || ''
  const url = new URL(`${getApiUrl()}/${pathStr}`)

  // Copiar query parameters
  url.search = request.nextUrl.search

  try {
    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers),
      },
      body: request.method !== 'GET' ? request.body : undefined,
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error(`API Proxy Error [${request.method} /${pathStr}]:`, error.message)
    return NextResponse.json(
      { error: 'Erro ao conectar com a API' },
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
