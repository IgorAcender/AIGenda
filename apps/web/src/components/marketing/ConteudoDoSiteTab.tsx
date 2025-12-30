'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Button,
  Typography,
  message,
  Row,
  Col,
  Switch,
  Space,
  Divider,
  Alert,
} from 'antd'
import {
  SaveOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'

const { Title, Text, Paragraph } = Typography

interface Section {
  id: string
  name: string
  label: string
  description: string
  enabled: boolean
  order: number
}

const DEFAULT_SECTIONS: Section[] = [
  {
    id: 'about',
    name: 'Sobre Nós',
    label: 'Sobre Nós',
    description: 'Texto que aparece na seção Sobre nós do site.',
    enabled: true,
    order: 1,
  },
  {
    id: 'services',
    name: 'Serviços',
    label: 'Serviços',
    description: 'Exibe os serviços da sua empresa no site.',
    enabled: true,
    order: 2,
  },
  {
    id: 'professionals',
    name: 'Profissionais',
    label: 'Profissionais',
    description: 'Exibe os membros da sua equipe no site.',
    enabled: true,
    order: 3,
  },
  {
    id: 'businessHours',
    name: 'Horário de Funcionamento',
    label: 'Horário de Funcionamento',
    description: 'Exibe os horários de funcionamento no site.',
    enabled: true,
    order: 4,
  },
  {
    id: 'contact',
    name: 'Contato',
    label: 'Contato',
    description: 'Informações de contato exibidas no site.',
    enabled: true,
    order: 5,
  },
  {
    id: 'amenities',
    name: 'Amenidades',
    label: 'Amenidades',
    description: 'Exibe as comodidades/benefícios disponíveis.',
    enabled: true,
    order: 6,
  },
  {
    id: 'paymentMethods',
    name: 'Formas de Pagamento',
    label: 'Formas de Pagamento',
    description: 'Exibe os métodos de pagamento aceitos.',
    enabled: true,
    order: 7,
  },
  {
    id: 'socialMedia',
    name: 'Redes Sociais',
    label: 'Redes Sociais',
    description: 'Links para redes sociais da sua empresa.',
    enabled: true,
    order: 8,
  },
]

export default function ConteudoDoSiteTab() {
  const [form] = Form.useForm()
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS)

  // Buscar configurações atuais
  const { data: brandingData, isLoading } = useApiQuery(
    ['branding'],
    '/tenants/branding',
    { staleTime: 5 * 60 * 1000 }
  )

  // Mutation para salvar
  const { mutate: saveBranding, isPending: saving } = useApiMutation(
    async (payload: any) => {
      const { api } = await import('@/lib/api')
      const { data } = await api.put('/tenants/branding', payload)
      return data
    },
    [['branding']]
  )

  // Preencher sections quando dados carregarem
  useEffect(() => {
    if (brandingData?.sectionsConfig) {
      try {
        const config = JSON.parse(brandingData.sectionsConfig)
        setSections(config)
      } catch (error) {
        setSections(DEFAULT_SECTIONS)
      }
    }
  }, [brandingData])

  const handleToggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newSections = [...sections]
    ;[newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
    // Atualizar order
    newSections.forEach((s, i) => {
      s.order = i + 1
    })
    setSections(newSections)
  }

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return
    const newSections = [...sections]
    ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    // Atualizar order
    newSections.forEach((s, i) => {
      s.order = i + 1
    })
    setSections(newSections)
  }

  const handleSave = async () => {
    try {
      const payload = {
        sectionsConfig: JSON.stringify(sections),
      }

      saveBranding(payload, {
        onSuccess: () => {
          message.success('Conteúdo do site configurado com sucesso!')
        },
        onError: (error) => {
          message.error('Erro ao salvar configurações')
          console.error(error)
        },
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <Title level={3}>📋 Conteúdo do Site</Title>
      <Paragraph type="secondary">
        Organize as seções que aparecerão no seu site. Use as setas para reordenar.
      </Paragraph>

      <Alert
        message="As mudanças aparecerão em tempo real no preview do lado direito"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card loading={isLoading} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((section, index) => (
            <div
              key={section.id}
              style={{
                padding: 16,
                border: '1px solid #f0f0f0',
                borderRadius: 8,
                backgroundColor: section.enabled ? '#fafafa' : '#f5f5f5',
                opacity: section.enabled ? 1 : 0.6,
              }}
            >
              <Row gutter={16} align="middle">
                {/* Título e Descrição */}
                <Col flex="auto">
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      {section.label}
                    </Text>
                    <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
                      {section.description}
                    </Paragraph>
                  </div>
                </Col>

                {/* Toggle */}
                <Col>
                  <Switch
                    checked={section.enabled}
                    onChange={() => handleToggleSection(section.id)}
                  />
                </Col>

                {/* Setas */}
                <Col>
                  <Space>
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowUpOutlined />}
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Mover para cima"
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<ArrowDownOutlined />}
                      onClick={() => handleMoveDown(index)}
                      disabled={index === sections.length - 1}
                      title="Mover para baixo"
                    />
                  </Space>
                </Col>
              </Row>
            </div>
          ))}
        </div>

        <Divider />

        {/* Botão Salvar */}
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          block
        >
          Salvar Conteúdo do Site
        </Button>
      </Card>
    </div>
  )
}
