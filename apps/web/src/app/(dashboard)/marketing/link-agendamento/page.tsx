'use client'

import React, { useState, useEffect } from 'react'
import { Card, Typography, Input, Button, message, Space, QRCode, Divider } from 'antd'
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
  const bookingUrl = `${baseUrl}/${tenantSlug}/agendamento`

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

      <Card style={{ marginTop: 24 }}>
        <Title level={3}>
          <LinkOutlined /> Sua Landing Page Pública
        </Title>
        <Paragraph type="secondary">
          Compartilhe este link com seus clientes para que eles possam visualizar seus serviços e fazer agendamentos online.
        </Paragraph>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Link */}
          <div>
            <Text strong>Link para compartilhar:</Text>
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
          <Space wrap>
            <Button
              type="default"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(landingPageUrl, 'Agende seu horário!')}
              size="large"
            >
              Compartilhar
            </Button>
            <Button
              type="default"
              href={landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="large"
            >
              Visualizar Página
            </Button>
          </Space>

          <Divider />

          {/* Link de Agendamento Direto */}
          <div>
            <Title level={4}>
              <LinkOutlined /> Link de Agendamento Direto
            </Title>
            <Paragraph type="secondary">
              Compartilhe este link para que seus clientes agendem direto, sem passar pela landing page.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Link */}
              <div>
                <Text strong>Link de agendamento:</Text>
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
              <Space wrap>
                <Button
                  type="default"
                  icon={<ShareAltOutlined />}
                  onClick={() => handleShare(bookingUrl, 'Agende agora!')}
                  size="large"
                >
                  Compartilhar
                </Button>
                <Button
                  type="default"
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="large"
                >
                  Agendar Agora
                </Button>
              </Space>

              {/* QR Code */}
              <div>
                <Space align="start" size="large">
                  <div>
                    <Title level={5}>
                      <QrcodeOutlined /> QR Code
                    </Title>
                    <Button
                      type="primary"
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
                  <div style={{ 
                    padding: 16, 
                    background: '#fff', 
                    borderRadius: 8,
                    border: '1px solid #f0f0f0'
                  }}>
                    <QRCode
                      value={bookingUrl}
                      size={150}
                      level="H"
                    />
                  </div>
                </Space>
              </div>
            </Space>
          </div>

          <Divider />

          {/* QR Code da Landing Page */}
          <div>
            <Title level={4}>
              <QrcodeOutlined /> QR Code - Landing Page
            </Title>
            <Paragraph type="secondary">
              Seus clientes podem escanear este QR Code para acessar sua página de agendamento.
            </Paragraph>
            <Space align="start" size="large">
              <div>
                <Button
                  type="primary"
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
              <div style={{ 
                padding: 16, 
                background: '#fff', 
                borderRadius: 8,
                border: '1px solid #f0f0f0'
              }}>
                <QRCode
                  value={landingPageUrl}
                  size={150}
                  level="H"
                />
              </div>
            </Space>
          </div>

          <Divider />

          {/* Dicas */}
          <div>
            <Title level={4}>💡 Como usar este link:</Title>
            <ul style={{ paddingLeft: 20 }}>
              <li>Compartilhe nas redes sociais (Instagram, Facebook, WhatsApp)</li>
              <li>Adicione na bio do Instagram</li>
              <li>Envie para clientes via WhatsApp</li>
              <li>Imprima o QR Code e coloque no estabelecimento</li>
              <li>Adicione no rodapé de emails</li>
              <li>Use em materiais impressos (cartões, flyers)</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  )
}
