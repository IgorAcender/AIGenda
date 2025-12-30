'use client'

import React, { useState } from 'react'
import { Card, Typography, Input, Button, message, Space, QRCode, Divider } from 'antd'
import { CopyOutlined, LinkOutlined, QrcodeOutlined, ShareAltOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export default function LinkAgendamentoPage() {
  const [copied, setCopied] = useState(false)

  // Pegar o tenant atual (você pode pegar do contexto/store)
  const tenantSlug = 'barbearia-exemplo' // TODO: Pegar do contexto real
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://seu-dominio.com'
  const landingPageUrl = `${baseUrl}/${tenantSlug}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(landingPageUrl)
      message.success('Link copiado para a área de transferência!')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      message.error('Erro ao copiar o link')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Agende seu horário!',
          text: 'Confira nossa página e agende seu horário online!',
          url: landingPageUrl,
        })
        message.success('Link compartilhado!')
      } catch (error) {
        console.log('Compartilhamento cancelado')
      }
    } else {
      handleCopy()
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
                onClick={handleCopy}
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
              onClick={handleShare}
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

          {/* QR Code */}
          <div>
            <Space align="start" size="large">
              <div>
                <Title level={4}>
                  <QrcodeOutlined /> QR Code
                </Title>
                <Paragraph type="secondary">
                  Seus clientes podem escanear este QR Code para acessar sua página de agendamento.
                </Paragraph>
                <Button
                  type="primary"
                  onClick={() => {
                    const canvas = document.querySelector('canvas')
                    if (canvas) {
                      const url = canvas.toDataURL()
                      const link = document.createElement('a')
                      link.download = 'qrcode-agendamento.png'
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
                  size={200}
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
