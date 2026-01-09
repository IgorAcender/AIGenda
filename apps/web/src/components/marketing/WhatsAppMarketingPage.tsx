'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  Button,
  Spin,
  message,
  Typography,
  Space,
  Input,
  Row,
  Col,
  Statistic,
  Modal,
  Divider,
  Tag,
  Form,
} from 'antd'
import {
  ReloadOutlined,
  QrcodeOutlined,
  LogoutOutlined,
  SendOutlined,
  PhoneOutlined,
  WechatOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface WhatsAppStatus {
  success: boolean
  isConnected?: boolean
  evolutionId?: number
  whatsappPhone?: string
  connectedAt?: string
  error?: string
  apiUrl?: string
  instanceName?: string
  state?: string
}

interface QRCodeResponse {
  success: boolean
  qr?: string
  code?: string
  base64?: string
  error?: string
  message?: string
}

export default function WhatsAppMarketingPage() {
  const { user, tenant, isLoading } = useAuth()
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [wasDisconnectedOnModalOpen, setWasDisconnectedOnModalOpen] = useState(false)
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do sistema. 🎉')
  const [testPhone, setTestPhone] = useState('')
  const [form] = Form.useForm()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const tenantId = tenant?.id

  // Verificar autenticação
  useEffect(() => {
    if (isLoading) return  // Aguardar hidratação
    if (!tenant || !user) {
      setCheckingStatus(false)
      message.error('Você precisa estar autenticado para acessar o WhatsApp Marketing')
    }
  }, [user, tenant, isLoading])

  // Polling de status - mais rápido quando modal está aberto
  useEffect(() => {
    if (!tenantId || isLoading) return

    const fetchStatus = async () => {
      try {
        console.log(`[WhatsApp] Consultando status para tenantId: "${tenantId}"`);
        const res = await fetch(`${API_URL}/api/whatsapp/status/${tenantId}`)
        const data = await res.json()
        console.log('[WhatsApp Polling]', { 
          tenantId, 
          isConnected: data.isConnected, 
          whatsappPhone: data.whatsappPhone,
          state: data.state,
          fullData: data,
          timestamp: new Date().toLocaleTimeString() 
        })
        setStatus(data)
      } catch (error) {
        console.error('Erro ao buscar status:', error)
        setStatus({ success: false, error: 'Erro ao conectar com a API' })
      } finally {
        setCheckingStatus(false)
      }
    }

    // Fetch imediato
    fetchStatus()
    
    // Polling interval: 2s se modal aberto (para detectar conexão rápido), 10s se fechado
    const pollInterval = showQRModal ? 2000 : 10000
    console.log('[WhatsApp] Iniciando polling com intervalo:', pollInterval, 'ms')
    const interval = setInterval(fetchStatus, pollInterval)
    return () => clearInterval(interval)
  }, [tenantId, API_URL, isLoading, showQRModal])

  // Fecha o modal QR Code automaticamente quando conecta
  useEffect(() => {
    if (!showQRModal) return  // Só faz algo se modal está aberto
    
    console.log('[WhatsApp] Auto-close check:', { 
      tenantId,
      isConnected: status?.isConnected, 
      showQRModal, 
      wasDisconnectedOnModalOpen,
      fullStatus: status
    })
    
    // Só fecha se: modal aberto + estava desconectado quando abriu + agora está conectado
    if (status?.isConnected === true && showQRModal && wasDisconnectedOnModalOpen) {
      console.log('[WhatsApp] ✅ Detectado isConnected=true para tenantId:', tenantId)
      console.log('[WhatsApp] Fechando modal em 1 segundo...')
      const timer = setTimeout(() => {
        setShowQRModal(false)
        setWasDisconnectedOnModalOpen(false)
        message.success('WhatsApp conectado com sucesso! 🎉')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [status?.isConnected, showQRModal, tenantId, wasDisconnectedOnModalOpen])

  const handleShowQR = async () => {
    if (!tenantId) {
      message.error('Tenant não encontrado')
      return
    }

    // Marca que estava desconectado quando abriu o modal (para auto-close funcionar)
    setWasDisconnectedOnModalOpen(!status?.isConnected)
    
    // Abre o modal IMEDIATAMENTE com spinner
    setShowQRModal(true)
    setQrCode(null)  // Limpa QR anterior
    setLoading(true)
    
    try {
      // Primeiro, tenta regenerar QR (se já foi alocado)
      let res = await fetch(`${API_URL}/api/whatsapp/refresh-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      let data: QRCodeResponse = await res.json()

      // Se falhar (tenant não alocado ainda), tenta fazer setup completo
      if (!data.success) {
        console.log('Tenant não alocado ainda, fazendo setup completo...')
        res = await fetch(`${API_URL}/api/whatsapp/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId }),
        })
        data = await res.json()
      }

      if (data.success && data.base64) {
        console.log('✅ QR Code gerado com sucesso')
        setQrCode(data)
      } else if (data.success && !data.base64) {
        // Instância foi criada, mas QR Code ainda está sendo gerado
        console.log('⏳ Aguardando QR Code...')
        // Tenta novamente em 2 segundos
        setTimeout(() => handleShowQR(), 2000)
      } else {
        message.error(data.error || 'Erro ao gerar QR Code')
        setShowQRModal(false)
      }
    } catch (error) {
      console.error('Erro:', error)
      message.error('Erro ao gerar QR Code')
      setShowQRModal(false)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/status/${tenantId}`)
      const data = await res.json()
      setStatus(data)
      message.success('Status atualizado!')
    } catch (error) {
      console.error('Erro:', error)
      message.error('Erro ao atualizar status')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    Modal.confirm({
      title: 'Desconectar WhatsApp',
      content: 'Tem certeza que deseja desconectar o WhatsApp?',
      okText: 'Sim',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        if (!tenantId) return

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
            message.success('WhatsApp desconectado com sucesso')
          } else {
            message.error(data.error || 'Erro ao desconectar')
          }
        } catch (error) {
          console.error('Erro:', error)
          message.error('Erro ao desconectar')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  // Formata número para o padrão brasileiro (adiciona 55 se necessário)
  const formatBrazilianPhoneNumber = (phone: string): string => {
    // Remove caracteres especiais
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se não tiver 55 no início, adiciona
    if (!cleanPhone.startsWith('55')) {
      return '55' + cleanPhone
    }
    
    return cleanPhone
  }

  // Valida se é número (não é grupo)
  const isValidPhoneNumber = (phone: string): boolean => {
    // Se contém @g.us ou @s.whatsapp.net é grupo, não número individual
    if (phone.includes('@g.us') || phone.includes('@s.whatsapp.net')) {
      return false
    }
    // Se contém apenas dígitos após limpeza, é número válido
    return /^\d+$/.test(phone.replace(/\D/g, ''))
  }

  const handleSendTestMessage = async (values: any) => {
    // Validar se é número individual
    if (!isValidPhoneNumber(values.phone)) {
      message.error('A mensagem de teste é exclusiva para números individuais. Para grupos, use outro método.')
      return
    }

    setLoading(true)
    try {
      const formattedPhone = formatBrazilianPhoneNumber(values.phone)
      
      const res = await fetch(`${API_URL}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          phoneNumber: formattedPhone,
          message: values.message,
        }),
      })

      const data = await res.json()

      if (data.success) {
        message.success('Mensagem enviada com sucesso!')
        form.resetFields()
      } else {
        message.error(data.error || 'Erro ao enviar mensagem')
      }
    } catch (error) {
      console.error('Erro:', error)
      message.error('Erro ao enviar mensagem')
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <WechatOutlined /> WhatsApp Marketing
          </Title>
          <Text type="secondary">Gerencie sua conexão do WhatsApp para automação de agendamentos</Text>
        </div>

        <Card
          title={
            <Space>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: status?.isConnected ? '#52c41a' : '#f5222d',
                }}
              />
              <span>{status?.isConnected ? 'Conectado' : 'Desconectado'}</span>
            </Space>
          }
          extra={
            <Space>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleUpdateStatus}
                loading={loading}
                size="small"
              >
                Atualizar
              </Button>
              <Button
                type="default"
                icon={<QrcodeOutlined />}
                onClick={handleShowQR}
                loading={loading}
                size="small"
              >
                QR Code
              </Button>
              <Button
                danger
                icon={<LogoutOutlined />}
                onClick={handleDisconnect}
                loading={loading}
                size="small"
              >
                Desconectar
              </Button>
            </Space>
          }
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Statistic title="Instância" value={status?.instanceName || 'N/A'} />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Estado"
                value={status?.state === 'open' ? 'Aberto' : 'Fechado'}
                valueStyle={{ color: status?.state === 'open' ? '#52c41a' : '#f5222d' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic 
                title="Número" 
                value={status?.whatsappPhone || 'N/A'}
                formatter={(value) => String(value)}
              />
            </Col>
          </Row>

          {status?.apiUrl && (
            <>
              <Divider />
              <Title level={5}>URL da API</Title>
              <Text copyable code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                {status.apiUrl}
              </Text>
            </>
          )}
        </Card>

        <Card
          title={
            <Space>
              <SendOutlined />
              <span>Enviar Mensagem de Teste</span>
            </Space>
          }
        >
          <Paragraph type="secondary">
            💡 Este formulário é exclusivo para enviar mensagens para <strong>números individuais</strong>. Digite o número sem o 55 (ex: 11999999999) que adicionamos automaticamente.
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={handleSendTestMessage} disabled={!status?.isConnected}>
            <Form.Item label="Número do WhatsApp" name="phone" rules={[{ required: true, message: 'Digite um número válido' }]}>
              <Input placeholder="11999999999" prefix={<PhoneOutlined />} />
            </Form.Item>

            <Form.Item
              label="Mensagem"
              name="message"
              initialValue={testMessage}
              rules={[{ required: true, message: 'Digite uma mensagem' }]}
            >
              <TextArea rows={4} placeholder="Digite sua mensagem..." />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<SendOutlined />}
                disabled={!status?.isConnected}
              >
                Enviar Mensagem
              </Button>
            </Form.Item>
          </Form>

          {!status?.isConnected && <Tag color="warning">Conecte o WhatsApp para enviar mensagens</Tag>}
        </Card>
      </Space>

      <Modal
        title="Escaneie o QR Code"
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowQRModal(false)}>
            Fechar
          </Button>,
          <Button key="regenerate" onClick={handleShowQR} loading={loading}>
            <ReloadOutlined /> Regenerar
          </Button>,
        ]}
      >
        <Spin spinning={loading} tip="Gerando QR Code...">
          {qrCode?.base64 && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={qrCode.base64}
                  alt="QR Code"
                  style={{ maxWidth: '100%', border: '1px solid #d9d9d9', borderRadius: '4px' }}
                />
              </div>
              <Paragraph>
                Abra o WhatsApp no seu celular, vá em <strong>Configurações → Aparelhos Vinculados</strong> e escaneie este QR Code.
              </Paragraph>
            </Space>
          )}
          {!qrCode?.base64 && loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p>Aguardando QR Code...</p>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  )
}
