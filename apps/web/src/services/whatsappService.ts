const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface WhatsAppStatus {
  success: boolean
  isConnected?: boolean
  evolutionId?: number
  whatsappPhone?: string
  connectedAt?: string
  error?: string
}

export interface QRCodeResponse {
  success: boolean
  qr?: string
  code?: string
  base64?: string
  evolutionId?: number
  message?: string
  error?: string
}

export interface EvolutionInstance {
  id: number
  name: string
  url: string
  tenantCount: number
  isActive: boolean
  occupancyPercent: number
}

export interface EvolutionStatusResponse {
  success: boolean
  instances?: EvolutionInstance[]
  error?: string
}

export const whatsappService = {
  /**
   * Conectar novo WhatsApp
   */
  async setupWhatsApp(tenantId: string): Promise<QRCodeResponse> {
    const res = await fetch(`${API_URL}/api/whatsapp/setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    })

    if (!res.ok) {
      throw new Error('Erro ao conectar WhatsApp')
    }

    return res.json()
  },

  /**
   * Regenerar QR Code
   */
  async refreshQRCode(tenantId: string): Promise<QRCodeResponse> {
    const res = await fetch(`${API_URL}/api/whatsapp/refresh-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    })

    if (!res.ok) {
      throw new Error('Erro ao regenerar QR Code')
    }

    return res.json()
  },

  /**
   * Verificar status de conexão
   */
  async getStatus(tenantId: string): Promise<WhatsAppStatus> {
    const res = await fetch(`${API_URL}/api/whatsapp/status/${tenantId}`)

    if (!res.ok) {
      throw new Error('Erro ao buscar status')
    }

    return res.json()
  },

  /**
   * Desconectar WhatsApp
   */
  async disconnect(tenantId: string): Promise<{ success: boolean; error?: string }> {
    const res = await fetch(`${API_URL}/api/whatsapp/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId }),
    })

    if (!res.ok) {
      throw new Error('Erro ao desconectar')
    }

    return res.json()
  },

  /**
   * Enviar mensagem
   */
  async sendMessage(
    tenantId: string,
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const res = await fetch(`${API_URL}/api/whatsapp/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, phoneNumber, message }),
    })

    if (!res.ok) {
      throw new Error('Erro ao enviar mensagem')
    }

    return res.json()
  },

  /**
   * Listar Evolution instances
   */
  async getInstances(): Promise<EvolutionStatusResponse> {
    const res = await fetch(`${API_URL}/api/whatsapp/instances`)

    if (!res.ok) {
      throw new Error('Erro ao buscar instances')
    }

    return res.json()
  },

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    success: boolean
    instances?: Array<{ id: number; healthy: boolean }>
    error?: string
  }> {
    const res = await fetch(`${API_URL}/api/whatsapp/health`)

    if (!res.ok) {
      throw new Error('Erro ao fazer health check')
    }

    return res.json()
  },
}
