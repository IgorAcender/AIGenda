'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Input, Button, message, Space, QRCode, Divider, Row, Col, Tag } from 'antd'
import { CopyOutlined, LinkOutlined, QrcodeOutlined, ShareAltOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons'
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
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LinkOutlined style={{ color: '#1677ff' }} />
            Link de Agendamento
          </Title>
          <Paragraph type="secondary" style={{ marginTop: '8px' }}>
            Compartilhe estes links com seus clientes para que eles possam agendar online. Escolha entre a landing page completa ou acesso direto ao agendamento.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {/* Card Esquerda - Landing Page */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Titulo com Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <EyeOutlined style={{ fontSize: '20px', color: '#1677ff' }} />
                    <Title level={4} style={{ margin: 0 }}>Landing Page Completa</Title>
                    <Tag color="blue" style={{ marginLeft: 'auto' }}>Recomendado</Tag>
                  </div>
                  <Text type="secondary">
                    Link completo com visualização de serviços, equipe, galeria e agendamento. Melhor para conversão de clientes.
                  </Text>
                </div>

                {/* Seção de Link */}
                <div style={{ backgroundColor: '#f8f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #e6e6ff' }}>
                  <Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>Link para compartilhar:</Text>
                  <Space.Compact style={{ width: '100%', marginTop: '12px' }}>
                    <Input
                      value={landingPageUrl}
                      readOnly
                      size="large"
                      prefix={<LinkOutlined />}
                      style={{ borderRadius: '6px 0 0 6px' }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(landingPageUrl)}
                      style={{ borderRadius: '0 6px 6px 0' }}
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
                    style={{ borderRadius: '6px' }}
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
                    style={{ borderRadius: '6px' }}
                  >
                    Visualizar Página
                  </Button>
                </Space>

                <Divider style={{ margin: '12px 0' }} />

                {/* QR Code */}
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ marginTop: 0, marginBottom: '12px' }}>
                    <QrcodeOutlined /> QR Code
                  </Title>
                  <div style={{ 
                    padding: '20px', 
                    background: '#fff', 
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0',
                    display: 'inline-block',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <QRCode
                      value={landingPageUrl}
                      size={200}
                      level="H"
                    />
                  </div>
                  <Button
                    block
                    type="primary"
                    size="large"
                    style={{ borderRadius: '6px' }}
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

          {/* Card Direita - Agendamento Direto */}
          <Col xs={24} lg={12}>
            <Card 
              style={{ 
                height: '100%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: '12px',
                border: '1px solid #f0f0f0'
              }}
            >
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Titulo com Badge */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                    <Title level={4} style={{ margin: 0 }}>Agendamento Direto</Title>
                    <Tag color="green" style={{ marginLeft: 'auto' }}>Rápido</Tag>
                  </div>
                  <Text type="secondary">
                    Link direto para o calendário de agendamentos. Perfeito para RedirecionaR clientes rápidamente sem distrações.
                  </Text>
                </div>

                {/* Seção de Link */}
                <div style={{ backgroundColor: '#f6ffed', padding: '16px', borderRadius: '8px', border: '1px solid #b7eb8f' }}>
                  <Text strong style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666' }}>Link de agendamento:</Text>
                  <Space.Compact style={{ width: '100%', marginTop: '12px' }}>
                    <Input
                      value={bookingUrl}
                      readOnly
                      size="large"
                      prefix={<LinkOutlined />}
                      style={{ borderRadius: '6px 0 0 6px' }}
                    />
                    <Button
                      type="primary"
                      size="large"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(bookingUrl)}
                      style={{ borderRadius: '0 6px 6px 0' }}
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
                    style={{ borderRadius: '6px' }}
                  >
                    Compartilhar
                  </Button>
                  <Button
                    block
                    type="primary"
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="large"
                    style={{ borderRadius: '6px' }}
                  >
                    Agendar Agora
                  </Button>
                </Space>

                <Divider style={{ margin: '12px 0' }} />

                {/* QR Code */}
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ marginTop: 0, marginBottom: '12px' }}>
                    <QrcodeOutlined /> QR Code
                  </Title>
                  <div style={{ 
                    padding: '20px', 
                    background: '#fff', 
                    borderRadius: '12px',
                    border: '2px solid #f0f0f0',
                    display: 'inline-block',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                    <QRCode
                      value={bookingUrl}
                      size={200}
                      level="H"
                    />
                  </div>
                  <Button
                    block
                    type="primary"
                    size="large"
                    style={{ borderRadius: '6px' }}
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

        {/* Dicas - Full Width */}
        <Card 
          style={{ 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: '12px',
            border: '1px solid #f0f0f0',
            backgroundColor: '#fafafa'
          }}
        >
          <Title level={4} style={{ margin: '0 0 16px 0' }}>💡 Como usar estes links:</Title>
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#1677ff', fontSize: '20px' }}>📱</div>
                <div>
                  <Text strong>Redes Sociais</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Compartilhe no Instagram, Facebook e WhatsApp
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#52c41a', fontSize: '20px' }}>📋</div>
                <div>
                  <Text strong>Bio do Instagram</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Adicione na seção de link da sua bio
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#faad14', fontSize: '20px' }}>🎫</div>
                <div>
                  <Text strong>Materiais Impressos</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Imprima QR Codes em cartões e flyers
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#f5222d', fontSize: '20px' }}>✉️</div>
                <div>
                  <Text strong>Emails</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Adicione no rodapé de emails e assinatura
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#722ed1', fontSize: '20px' }}>🏪</div>
                <div>
                  <Text strong>No Estabelecimento</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Cole QR Codes na recepção e nos ambientes
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#13c2c2', fontSize: '20px' }}>📞</div>
                <div>
                  <Text strong>WhatsApp Business</Text>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Envie o link em mensagens automáticas
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  )
}
