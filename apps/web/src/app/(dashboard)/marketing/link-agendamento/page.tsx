'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Input, Button, message, Space, QRCode, Divider, Row, Col } from 'antd'
import { CopyOutlined, LinkOutlined, QrcodeOutlined, ShareAltOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/stores/auth'

const { Title, Text, Paragraph } = Typography

export default function LinkAgendamentoPage() {
  const [copied, setCopied] = useState(false)
  const { tenant } = useAuthStore()
  
  // Pegar o slug do tenant atual
  const tenantSlug = tenant?.slug || 'seu-estabelecimento'
  const baseUrl = 'https://agendeai.net'
  const landingPageUrl = `${baseUrl}/${tenantSlug}`
  const bookingUrl = `${baseUrl}/agendar/${tenantSlug}`

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      message.success('Link copiado para a área de transferência!')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      message.error('Erro ao copiar o link')
    }
  }

  const handleShare = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'Confira nossa página e agende seu horário online!',
          url: url,
        })
        message.success('Link compartilhado!')
      } catch (error) {
        console.log('Compartilhamento cancelado')
      }
    } else {
      handleCopy(url)
    }
  }

  return (
    <div>
      <Title level={2}>
        <LinkOutlined style={{ marginRight: 12 }} />
        Link de Agendamento
      </Title>
      <Paragraph type="secondary">
        Compartilhe este link com seus clientes para que eles possam fazer agendamentos online.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Coluna Esquerda - Landing Page */}
        <Col xs={24} lg={12}>
          <Card style={{ height: '100%' }}>
            <Title level={3} style={{ marginTop: 0 }}>
              <LinkOutlined /> Landing Page
            </Title>
            <Paragraph type="secondary">
              Link completo com visualização de serviços e agendamento.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Link */}
              <div>
                <Text strong style={{ fontSize: 14 }}>Link para compartilhar:</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Input
                    value={landingPageUrl}
                    readOnly
                    size="large"
                    prefix={<LinkOutlined />}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(landingPageUrl)}
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </Space.Compact>
              </div>

              {/* Botões de Ação */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  type="default"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShare(landingPageUrl, 'Agende seu horário!')}
                  size="large"
                >
                  Compartilhar
                </Button>
                <Button
                  block
                  type="dashed"
                  href={landingPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="large"
                >
                  Visualizar Página
                </Button>
              </Space>

              <Divider style={{ margin: '12px 0' }} />

              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ marginTop: 0 }}>
                  <QrcodeOutlined /> QR Code
                </Title>
                <div style={{ 
                  padding: 16, 
                  background: '#fff', 
                  borderRadius: 8,
                  border: '2px solid #f0f0f0',
                  display: 'inline-block',
                  marginBottom: 12
                }}>
                  <QRCode
                    value={landingPageUrl}
                    size={180}
                    level="H"
                  />
                </div>
                <Button
                  block
                  type="primary"
                  size="small"
                  onClick={() => {
                    const canvas = document.querySelectorAll('canvas')[0]
                    if (canvas) {
                      const url = canvas.toDataURL()
                      const link = document.createElement('a')
                      link.download = 'qrcode-landing-page.png'
                      link.href = url
                      link.click()
                      message.success('QR Code baixado!')
                    }
                  }}
                >
                  Baixar QR Code
                </Button>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Coluna Direita - Link de Agendamento Direto */}
        <Col xs={24} lg={12}>
          <Card style={{ height: '100%' }}>
            <Title level={3} style={{ marginTop: 0 }}>
              <LinkOutlined /> Agendamento Direto
            </Title>
            <Paragraph type="secondary">
              Link direto para agendar, sem passar pela landing page.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Link */}
              <div>
                <Text strong style={{ fontSize: 14 }}>Link de agendamento:</Text>
                <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                  <Input
                    value={bookingUrl}
                    readOnly
                    size="large"
                    prefix={<LinkOutlined />}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(bookingUrl)}
                  >
                    Copiar
                  </Button>
                </Space.Compact>
              </div>

              {/* Botões de Ação */}
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  block
                  type="default"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShare(bookingUrl, 'Agende agora!')}
                  size="large"
                >
                  Compartilhar
                </Button>
                <Button
                  block
                  type="dashed"
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="large"
                >
                  Agendar Agora
                </Button>
              </Space>

              <Divider style={{ margin: '12px 0' }} />

              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ marginTop: 0 }}>
                  <QrcodeOutlined /> QR Code
                </Title>
                <div style={{ 
                  padding: 16, 
                  background: '#fff', 
                  borderRadius: 8,
                  border: '2px solid #f0f0f0',
                  display: 'inline-block',
                  marginBottom: 12
                }}>
                  <QRCode
                    value={bookingUrl}
                    size={180}
                    level="H"
                  />
                </div>
                <Button
                  block
                  type="primary"
                  size="small"
                  onClick={() => {
                    const canvas = document.querySelectorAll('canvas')[1]
                    if (canvas) {
                      const url = canvas.toDataURL()
                      const link = document.createElement('a')
                      link.download = 'qrcode-agendamento-direto.png'
                      link.href = url
                      link.click()
                      message.success('QR Code baixado!')
                    }
                  }}
                >
                  Baixar QR Code
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider style={{ marginTop: 24 }} />

      {/* Dicas - Full Width */}
      <Card>
        <Title level={4}>💡 Como usar estes links:</Title>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Compartilhe nas redes sociais (Instagram, Facebook, WhatsApp)</li>
          <li>Adicione na bio do Instagram</li>
          <li>Envie para clientes via WhatsApp</li>
          <li>Imprima os QR Codes e coloque no estabelecimento</li>
          <li>Adicione no rodapé de emails</li>
          <li>Use em materiais impressos (cartões, flyers)</li>
        </ul>
      </Card>
    </div>
  )
}
