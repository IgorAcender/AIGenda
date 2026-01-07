'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import { Copy, AlertCircle, CheckCircle, Loader, RefreshCw, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

interface WhatsAppStatus {
  success: boolean
  isConnected?: boolean
  evolutionId?: number
  whatsappPhone?: string
  connectedAt?: string
  error?: string
}

interface QRCodeResponse {
  success: boolean
  qr?: string
  code?: string
  base64?: string
  error?: string
  message?: string
}

interface EvolutionInstance {
  id: number
  name: string
  url: string
  tenantCount: number
  isActive: boolean
  occupancyPercent: number
}

export default function WhatsAppMarketingPage() {
  const { user, tenant } = useAuth()
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [instances, setInstances] = useState<EvolutionInstance[]>([])
  const [showQRModal, setShowQRModal] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const tenantId = tenant?.id

  // Buscar status inicial e instances
  useEffect(() => {
    if (!tenantId) return

    const fetchData = async () => {
      try {
        // Fetch status
        const statusRes = await fetch(`${API_URL}/api/whatsapp/status/${tenantId}`)
        const statusData = await statusRes.json()
        setStatus(statusData)

        // Fetch instances
        const instancesRes = await fetch(`${API_URL}/api/whatsapp/instances`)
        const instancesData = await instancesRes.json()
        if (instancesData.success) {
          setInstances(instancesData.instances)
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setCheckingStatus(false)
      }
    }

    fetchData()

    // Polling a cada 5 segundos enquanto não conecta
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [tenantId, API_URL])

  const handleConnectWhatsApp = async () => {
    if (!tenantId) {
      toast.error('Tenant não encontrado')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      const data: QRCodeResponse = await res.json()

      if (data.success && data.base64) {
        setQrCode(data)
        setShowQRModal(true)
        toast.success('QR Code gerado! Escaneie com seu WhatsApp')
      } else {
        toast.error(data.error || 'Erro ao gerar QR Code')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao conectar WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshQR = async () => {
    if (!tenantId) {
      toast.error('Tenant não encontrado')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/refresh-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      const data: QRCodeResponse = await res.json()

      if (data.success && data.base64) {
        setQrCode(data)
        toast.success('QR Code regenerado!')
      } else {
        toast.error(data.error || 'Erro ao regenerar QR Code')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao regenerar QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!tenantId) {
      toast.error('Tenant não encontrado')
      return
    }

    if (!confirm('Tem certeza que deseja desconectar seu WhatsApp?')) return

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      const data = await res.json()

      if (data.success) {
        setStatus(null)
        setQrCode(null)
        setShowQRModal(false)
        toast.success('WhatsApp desconectado com sucesso')
      } else {
        toast.error(data.error || 'Erro ao desconectar')
      }
    } catch (error) {
      console.error('Erro:', error)
      toast.error('Erro ao desconectar WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para área de transferência!')
  }

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando informações do WhatsApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Marketing</h1>
          </div>
          <p className="text-gray-600">Conecte seu WhatsApp para automação de agendamentos</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Connection Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status de Conexão</h2>

              {checkingStatus ? (
                <div className="flex justify-center">
                  <Loader className="w-8 h-8 animate-spin text-green-600" />
                </div>
              ) : status?.isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Conectado</p>
                      <p className="text-xs text-green-700">WhatsApp online</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Número:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {status.whatsappPhone}
                        </code>
                        <button
                          onClick={() => copyToClipboard(status.whatsappPhone || '')}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          title="Copiar"
                        >
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {status.connectedAt && (
                      <div>
                        <p className="text-gray-600">Conectado em:</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(status.connectedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}

                    {status.evolutionId && (
                      <div>
                        <p className="text-gray-600">Servidor:</p>
                        <p className="text-xs text-gray-500 mt-1">Evolution #{status.evolutionId}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Desconectar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Desconectado</p>
                      <p className="text-xs text-yellow-700">Clique para conectar</p>
                    </div>
                  </div>

                  <button
                    onClick={handleConnectWhatsApp}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Gerando QR Code...
                      </>
                    ) : (
                      <>
                        <span>📱</span>
                        Conectar WhatsApp
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Você receberá um QR Code para escanear com seu WhatsApp
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Info and Instances */}
          <div className="lg:col-span-2 space-y-6">
            {/* Evolution Instances */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Servidores de WhatsApp</h2>

              {instances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                  Carregando servidores...
                </div>
              ) : (
                <div className="space-y-3">
                  {instances.map((instance) => (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{instance.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${instance.occupancyPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {instance.tenantCount}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {instance.isActive ? (
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                        ) : (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Como Funciona</h3>
              <ol className="space-y-3 text-sm text-blue-900">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Clique em "Conectar WhatsApp"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Você receberá um QR Code</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Abra WhatsApp e escaneie o QR Code</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Seu WhatsApp será conectado automaticamente</span>
                </li>
              </ol>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                <p className="text-2xl mb-2">📨</p>
                <p className="font-semibold text-gray-900 text-sm">Confirmações</p>
                <p className="text-xs text-gray-600 mt-1">Envie confirmações de agendamento</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                <p className="text-2xl mb-2">⏰</p>
                <p className="font-semibold text-gray-900 text-sm">Lembretes</p>
                <p className="text-xs text-gray-600 mt-1">Envie lembretes automáticos</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                <p className="text-2xl mb-2">💬</p>
                <p className="font-semibold text-gray-900 text-sm">Mensagens</p>
                <p className="text-xs text-gray-600 mt-1">Responda clientes via WhatsApp</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
                <p className="text-2xl mb-2">📊</p>
                <p className="font-semibold text-gray-900 text-sm">Analytics</p>
                <p className="text-xs text-gray-600 mt-1">Veja estatísticas de uso</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCode?.base64 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Escaneie o QR Code
            </h3>

            <div className="bg-gray-100 rounded-lg p-4 mb-4 flex items-center justify-center">
              <img
                src={qrCode.base64}
                alt="QR Code"
                className="w-full h-auto"
                onError={(e) => {
                  const img = e.target as HTMLImageElement
                  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%236b7280"%3EErro ao carregar QR Code%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>

            <p className="text-sm text-gray-600 mb-4 text-center">
              Abra o WhatsApp no seu celular, vá em Configurações → Aparelhos Vinculados e
              escaneie este QR Code.
            </p>

            <div className="space-y-2">
              <button
                onClick={handleRefreshQR}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerar QR Code
              </button>

              <button
                onClick={() => setShowQRModal(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Fechar
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              QR Code válido por 5 minutos. Regenere se expirar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
