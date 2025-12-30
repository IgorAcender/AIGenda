'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Upload,
  Avatar,
  Spin,
  Space,
  Divider,
  Select,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import ColorPicker from '@/components/common/ColorPicker'

const { Title, Text, Paragraph } = Typography

interface BrandingConfig {
  themeTemplate: 'light' | 'dark' | 'custom'
  backgroundColor: string
  textColor: string
  buttonColorPrimary: string
  buttonTextColor: string
  heroImage?: string
  sectionsConfig?: string
}

const THEME_PRESETS = {
  light: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    buttonColorPrimary: '#505afb',
    buttonTextColor: '#FFFFFF',
  },
  dark: {
    backgroundColor: '#1f2937',
    textColor: '#FFFFFF',
    buttonColorPrimary: '#7c3aed',
    buttonTextColor: '#FFFFFF',
  },
}

export default function CoresMarcaTab() {
  const [form] = Form.useForm()
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Buscar configurações atuais
  const { data: brandingData, isLoading } = useApiQuery(
    ['branding'],
    '/tenants/branding',
    { staleTime: 5 * 60 * 1000 }
  )

  // Mutation para salvar
  const { mutate: saveBranding, isPending: saving } = useApiMutation(
    async (payload: Partial<BrandingConfig>) => {
      const { data } = await import('@/lib/api').then(m => m.api.put('/tenants/branding', payload))
      return data
    },
    [['branding']]
  )

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (brandingData) {
      form.setFieldsValue({
        themeTemplate: brandingData.themeTemplate || 'light',
        backgroundColor: brandingData.backgroundColor || '#FFFFFF',
        textColor: brandingData.textColor || '#000000',
        buttonColorPrimary: brandingData.buttonColorPrimary || '#505afb',
        buttonTextColor: brandingData.buttonTextColor || '#FFFFFF',
        heroImage: brandingData.heroImage || null,
      })
    }
  }, [brandingData, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      saveBranding(values, {
        onSuccess: () => message.success('Configurações de branding salvas com sucesso!'),
        onError: () => message.error('Erro ao salvar configurações de branding'),
      })
    } catch (error) {
      console.error('Erro ao validar:', error)
    }
  }

  const handleThemeChange = (value: string) => {
    const preset = THEME_PRESETS[value as keyof typeof THEME_PRESETS]
    if (preset) {
      form.setFieldsValue(preset)
    }
  }

  const currentValues = form.getFieldsValue()

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      <Title level={3}>🎨 Cores e Marca</Title>
      <Paragraph type="secondary">
        Personalize as cores do seu site para refletir a identidade da sua marca. As mudanças serão aplicadas automaticamente na página pública.
      </Paragraph>

      <Form form={form} layout="vertical">
        <Row gutter={24}>
          {/* Coluna Esquerda - Formulário */}
          <Col xs={24} lg={16}>
            <Card title="Configurações de Tema" style={{ marginBottom: 16 }}>
              <Form.Item
                name="themeTemplate"
                label="Modelo de Tema"
                rules={[{ required: true }]}
              >
                <Select onChange={handleThemeChange}>
                  <Select.Option value="light">
                    ☀️ Claro (Light)
                  </Select.Option>
                  <Select.Option value="dark">
                    🌙 Escuro (Dark)
                  </Select.Option>
                  <Select.Option value="custom">
                    🎨 Personalizado
                  </Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {currentValues.themeTemplate === 'custom' && (
              <Card title="Cores Personalizadas" style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="backgroundColor"
                      label="Cor de Fundo"
                      rules={[{ required: true }]}
                    >
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="textColor"
                      label="Cor do Texto"
                      rules={[{ required: true }]}
                    >
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="buttonColorPrimary"
                      label="Cor do Botão"
                      rules={[{ required: true }]}
                    >
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="buttonTextColor"
                      label="Cor do Texto do Botão"
                      rules={[{ required: true }]}
                    >
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            )}

            <Card title="Imagem de Capa" style={{ marginBottom: 16 }}>
              <Paragraph type="secondary">
                Faça upload de uma imagem para a seção hero (capa) do seu site.
              </Paragraph>
              <Form.Item
                name="heroImage"
                label="Imagem Principal"
              >
                <Upload
                  maxCount={1}
                  accept="image/*"
                  listType="picture"
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>
                    Selecionar Imagem
                  </Button>
                </Upload>
              </Form.Item>
            </Card>

            <Divider />

            {/* Botões de Ação */}
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                size="large"
              >
                Salvar Configurações
              </Button>
              <Button type="default" size="large">
                Visualizar Página Pública
              </Button>
            </Space>
          </Col>

          {/* Coluna Direita - Preview */}
          <Col xs={24} lg={8}>
            <Card title="Preview" style={{ position: 'sticky', top: 20 }}>
              <div
                style={{
                  padding: 24,
                  borderRadius: 8,
                  backgroundColor: currentValues.backgroundColor || '#FFFFFF',
                  color: currentValues.textColor || '#000000',
                  minHeight: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Title
                  level={3}
                  style={{
                    color: currentValues.textColor || '#000000',
                    margin: 0,
                  }}
                >
                  Seu Site
                </Title>

                <Text
                  style={{
                    color: currentValues.textColor || '#000000',
                    opacity: 0.7,
                  }}
                >
                  Confira sua página pública
                </Text>

                <Button
                  style={{
                    backgroundColor: currentValues.buttonColorPrimary || '#505afb',
                    borderColor: currentValues.buttonColorPrimary || '#505afb',
                    color: currentValues.buttonTextColor || '#FFFFFF',
                  }}
                >
                  Agendar Agora
                </Button>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  <p>Cores ativas:</p>
                  <p>Fundo: {currentValues.backgroundColor || '#FFFFFF'}</p>
                  <p>Texto: {currentValues.textColor || '#000000'}</p>
                  <p>Botão: {currentValues.buttonColorPrimary || '#505afb'}</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  )
}
