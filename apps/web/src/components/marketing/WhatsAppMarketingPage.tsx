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
  const { user, tenant } = useAuth()
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  const [showQRModal, setShowQRModal] = useState(false)
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do sistema. 🎉')
  const [testPhone, setTestPhone] = useState('')
  const [form] = Form.useForm()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const tenantId = tenant?.id

  useEffect(() => {
    if (!tenantId) return

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/whatsapp/status/${tenantId}`)
        const data = await res.json()
        setStatus(data)
      } catch (error) {
        console.error('Erro ao buscar status:', error)
        setStatus({ success: false, error: 'Erro ao conectar com a API' })
      } finally {
        setCheckingStatus(false)
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 10000)
    return () => clearInterval(interval)
  }, [tenantId, API_URL])

  const handleShowQR = async () => {
    if (!tenantId) {
      message.error('Tenant não encontrado')
      return
    }

    setLoading(true)
    const loadingKey = 'qr_loading'
    message.loading({ content: 'Gerando QR Code...', key: loadingKey, duration: 0 })
    
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      const data: QRCodeResponse = await res.json()

      if (data.success && data.base64) {
        message.success({ content: 'QR Code gerado com sucesso!', key: loadingKey })
        setQrCode(data)
        setShowQRModal(true)
      } else if (data.success && !data.base64) {
        // Instância foi criada, mas QR Code ainda está sendo gerado
        message.info({ 
          content: 'Instância criada. Aguarde alguns segundos para o QR Code aparecer...', 
          key: loadingKey 
        })
        // Tenta novamente em 3 segundos
        setTimeout(() => handleShowQR(), 3000)
      } else {
        message.error({ content: data.error || 'Erro ao gerar QR Code', key: loadingKey })
      }
    } catch (error) {
      console.error('Erro:', error)
      message.error({ content: 'Erro ao gerar QR Code', key: loadingKey })
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

  const handleSendTestMessage = async (values: any) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/whatsapp/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          phoneNumber: values.phone,
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
              <Statistic title="Número" value={status?.whatsappPhone || 'N/A'} />
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
            💡 Você pode enviar para números individuais ou para grupos. Para grupos, use o ID do grupo do WhatsApp (formato: 120363xxx@g.us)
          </Paragraph>

          <Form form={form} layout="vertical" onFinish={handleSendTestMessage} disabled={!status?.isConnected}>
            <Form.Item label="Número do WhatsApp ou ID do Grupo" name="phone" rules={[{ required: true, message: 'Digite um número ou ID' }]}>
              <Input placeholder="551199999999 ou 120363xxx@g.us" prefix={<PhoneOutlined />} />
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
      </Modal>
    </div>
  )
}
