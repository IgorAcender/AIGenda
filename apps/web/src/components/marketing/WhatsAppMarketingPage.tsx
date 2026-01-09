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
  Switch,
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
  const [automationToggles, setAutomationToggles] = useState<Record<string, boolean>>({
    parabenize: false,
    reconquiste: false,
    evite_esquecimentos: false,
    cuidados: false,
    garanta_retornos: false,
    clientes_informados: false,
    boas_vindas: false,
    agendamento_online: false,
    cashback: false,
    pacote_expirando: false,
    realize_cobrancas: false,
  })

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
    // Se for ID de grupo, retorna como está
    if (phone.includes('@g.us') || phone.includes('@s.whatsapp.net')) {
      return phone
    }
    
    // Remove caracteres especiais
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se não tiver 55 no início, adiciona
    if (!cleanPhone.startsWith('55')) {
      return '55' + cleanPhone
    }
    
    return cleanPhone
  }

  const handleSendTestMessage = async (values: any) => {
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
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 8px rgba(82, 196, 26, 0.5);
          }
          50% {
            opacity: 0.6;
            box-shadow: 0 0 16px rgba(82, 196, 26, 0.8);
          }
        }
      `}</style>
      <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WechatOutlined /> WhatsApp Marketing
          </Title>
          <Text type="secondary">Gerencie sua conexão do WhatsApp para automação de agendamentos</Text>
        </div>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <Row gutter={16} style={{ height: '100%' }}>
                {/* Status Quadrado - Esquerda */}
                <Col flex="auto" style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ 
                    flex: 1,
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '24px',
                    backgroundColor: status?.isConnected ? 'rgba(82, 196, 26, 0.15)' : 'rgba(245, 34, 45, 0.15)',
                    borderRadius: '12px',
                    border: `2px solid ${status?.isConnected ? '#52c41a' : '#f5222d'}`,
                    minHeight: '240px'
                  }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: status?.isConnected ? '#52c41a' : '#f5222d',
                        boxShadow: status?.isConnected ? '0 0 12px rgba(82, 196, 26, 0.6)' : '0 0 12px rgba(245, 34, 45, 0.6)',
                        animation: status?.isConnected ? 'pulse 2s infinite' : 'none'
                      }}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <Text style={{ fontWeight: '700', fontSize: '14px', color: status?.isConnected ? '#52c41a' : '#f5222d', margin: 0, display: 'block' }}>
                        {status?.isConnected ? 'Conectado' : 'Desconectado'}
                      </Text>
                    </div>
                  </div>
                </Col>

                {/* Botões - Direita */}
                <Col flex="auto" style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    icon={<QrcodeOutlined />}
                    onClick={handleShowQR}
                    loading={loading}
                    size="large"
                    block
                    style={{ height: '56px', fontSize: '16px', fontWeight: '600' }}
                  >
                    Conectar
                  </Button>
                  <Button
                    type="default"
                    icon={<ReloadOutlined />}
                    onClick={handleUpdateStatus}
                    loading={loading}
                    size="large"
                    block
                  >
                    Atualizar
                  </Button>
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleDisconnect}
                    loading={loading}
                    size="large"
                    block
                  >
                    Desconectar
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Title level={4} style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SendOutlined style={{ color: '#1677ff' }} />
                    Enviar Mensagem de Teste
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    💡 Digite o número sem o 55 (ex: 11999999999)
                  </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleSendTestMessage} disabled={!status?.isConnected}>
                  <Form.Item label="Número do WhatsApp" name="phone" rules={[{ required: true, message: 'Digite um número válido' }]} style={{ marginBottom: '12px' }}>
                    <Input 
                      placeholder="11999999999" 
                      prefix={<PhoneOutlined />}
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Mensagem"
                    name="message"
                    initialValue={testMessage}
                    rules={[{ required: true, message: 'Digite uma mensagem' }]}
                    style={{ marginBottom: '12px' }}
                  >
                    <TextArea rows={3} placeholder="Digite sua mensagem..." />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      icon={<SendOutlined />}
                      disabled={!status?.isConnected}
                    >
                      Enviar Mensagem
                    </Button>
                  </Form.Item>
                </Form>

                {!status?.isConnected && <Tag color="warning">Conecte o WhatsApp para enviar mensagens</Tag>}
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Automações de WhatsApp */}
        <div>
          <Title level={3} style={{ marginBottom: '24px' }}>Automações Disponíveis</Title>
          <Row gutter={[24, 24]}>
            {/* Card 1 - Parabenize */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎁</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Parabenize seus clientes</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Reforce os laços com seus clientes e mostre o quanto eles são especiais! Envie uma mensagem automática parabenizando os aniversariantes do dia.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.parabenize}
                        onChange={(checked) => setAutomationToggles({...automationToggles, parabenize: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 2 - Reconquiste */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Reconquiste clientes</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Já faz um tempo que o seu cliente não vem no seu estabelecimento? Recupere ele criando uma oferta especial nesta campanha enviará uma mensagem aos clientes que nunca vieram ou não retornaram após um período.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.reconquiste}
                        onChange={(checked) => setAutomationToggles({...automationToggles, reconquiste: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 3 - Evite esquecimentos */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Evite esquecimentos</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Na correria do dia a dia o seu cliente pode esquecer do seu agendamento! Evite que isso aconteça e envie quantos lembretes forem necessários com lembretes personalizados para que ele não esqueça do seu horário.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.evite_esquecimentos}
                        onChange={(checked) => setAutomationToggles({...automationToggles, evite_esquecimentos: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 4 - Cuidados */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>❤️</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Cuidados</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Fortaleça o relacionamento com seus clientes enviando mensagens automáticas de pré-atendimento, personalizadas por serviço. Essas mensagens são enviadas apenas para agendamentos confirmados.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.cuidados}
                        onChange={(checked) => setAutomationToggles({...automationToggles, cuidados: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 5 - Garanta retornos */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📞</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Garanta retornos</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Já passou um tempo e está na hora do seu cliente retornar para fazer novamente o serviço ou o produto dele está acabando? Lembre-o que está na hora dele retornar ao estabelecimento!
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.garanta_retornos}
                        onChange={(checked) => setAutomationToggles({...automationToggles, garanta_retornos: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 6 - Clientes bem informados */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📅</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Clientes bem informados</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Atualize o seu cliente sobre o andamento do seu agendamento! Envie mensagens avisando que o agendamento dele foi criado ou o seu status foi atualizado.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.clientes_informados}
                        onChange={(checked) => setAutomationToggles({...automationToggles, clientes_informados: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 7 - Boas-vindas */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>↩️</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Boas-vindas a novos clientes</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Que tal dar boas-vindas a um cliente e lhe oferetar um desconto? Esta campanha é enviada automaticamente aos clientes 1 dia após a sua primeira compra.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.boas_vindas}
                        onChange={(checked) => setAutomationToggles({...automationToggles, boas_vindas: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 8 - Agendamento online */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Convide os clientes para agendar online</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Incentive os seus clientes a agendar online o seu próximo atendimento com uma oferta especial. Esta campanha é enviada aos clientes que nunca agendaram online.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.agendamento_online}
                        onChange={(checked) => setAutomationToggles({...automationToggles, agendamento_online: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 9 - Cashback */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💳</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Cashback</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Envie ao seu cliente uma mensagem avisando sobre o seu saldo atual de cashback.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.cashback}
                        onChange={(checked) => setAutomationToggles({...automationToggles, cashback: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 10 - Pacote expirando */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Pacote expirando</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Envie ao seu cliente uma mensagem avisando sobre o vencimento do pacote.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.pacote_expirando}
                        onChange={(checked) => setAutomationToggles({...automationToggles, pacote_expirando: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>

            {/* Card 11 - Realize cobranças */}
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
                    <Title level={5} style={{ margin: '0 0 8px 0' }}>Realize cobranças</Title>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Seu cliente deixou uma fatura em aberto e esqueceu de quitar no tempo combinado?! Lembre-o que há uma fatura em aberto no seu estabelecimento.
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px' }}>Envio automático</span>
                      <Switch 
                        checked={automationToggles.realize_cobrancas}
                        onChange={(checked) => setAutomationToggles({...automationToggles, realize_cobrancas: checked})}
                      />
                    </Space>
                    <Button type="primary" block>Personalizar</Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>
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
    </>
  )
}

