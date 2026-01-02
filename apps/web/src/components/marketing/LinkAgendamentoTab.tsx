'use client'

import React, { useState } from 'react'
import { Card, Typography, Input, Button, message, Space, QRCode, Divider, Row, Col } from 'antd'
import { CopyOutlined, LinkOutlined, QrcodeOutlined, ShareAltOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export default function LinkAgendamentoTab() {
  const [copied, setCopied] = useState(false)

  // Pegar o tenant atual (você pode pegar do contexto/store)
  // Por enquanto vou usar um exemplo
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
    <div style={{ marginTop: 24 }}>
      <Title level={3}>
        <LinkOutlined /> Sua Landing Page Pública
      </Title>
      <Paragraph type="secondary">
        Compartilhe este link com seus clientes para que eles possam visualizar seus serviços e fazer agendamentos online.
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        {/* Coluna Esquerda - Link e Ações */}
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Link */}
              <div>
                <Text strong style={{ fontSize: 16 }}>Link para compartilhar:</Text>
                <Space.Compact style={{ width: '100%', marginTop: 12 }}>
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

              <Divider style={{ margin: '12px 0' }} />

              {/* Botões de Ação */}
              <div>
                <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>Ações Rápidas:</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button
                    block
                    type="default"
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
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
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Dicas */}
              <div>
                <Title level={4} style={{ marginTop: 0 }}>💡 Como usar:</Title>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Compartilhe nas redes sociais (Instagram, Facebook, WhatsApp)</li>
                  <li>Adicione na bio do Instagram</li>
                  <li>Envie para clientes via WhatsApp</li>
                  <li>Imprima o QR Code e coloque na sua loja</li>
                </ul>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Coluna Direita - QR Code */}
        <Col xs={24} lg={12}>
          <Card style={{ textAlign: 'center' }}>
            <Title level={4}>
              <QrcodeOutlined /> QR Code
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              Seus clientes podem escanear este QR Code para acessar sua página de agendamento.
            </Paragraph>
            
            <div style={{ 
              padding: 24, 
              background: '#fff', 
              borderRadius: 8,
              border: '2px solid #f0f0f0',
              display: 'inline-block',
              marginBottom: 16
            }}>
              <QRCode
                value={landingPageUrl}
                size={240}
                level="H"
              />
            </div>

            <div>
              <Button
                type="primary"
                icon={<QrcodeOutlined />}
                size="large"
                block
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

            <Divider style={{ margin: '16px 0' }} />

            <Text type="secondary" style={{ fontSize: 12 }}>
              📝 Dica: Imprima este QR Code e coloque em sua loja, cartão de visita ou materiais de marketing!
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

