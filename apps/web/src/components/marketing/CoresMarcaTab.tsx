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
  Switch,
  Upload,
  Radio,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import PhonePreview from './PhonePreview'

const { Title, Text } = Typography
const { TextArea } = Input

interface Section {
  id: string
  name: string
  enabled: boolean
  order: number
}

const defaultSections: Section[] = [
  { id: 'about', name: 'SOBRE NÓS', enabled: true, order: 0 },
  { id: 'professionals', name: 'PROFISSIONAIS', enabled: true, order: 1 },
  { id: 'hours', name: 'HORÁRIO DE FUNCIONAMENTO', enabled: true, order: 2 },
  { id: 'contact', name: 'CONTATO', enabled: true, order: 3 },
  { id: 'address', name: 'ENDEREÇO', enabled: true, order: 4 },
  { id: 'social', name: 'REDES SOCIAIS', enabled: true, order: 5 },
  { id: 'payment', name: 'FORMAS DE PAGAMENTO', enabled: true, order: 6 },
]

export default function CoresMarcaTab() {
  const [form] = Form.useForm()
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [theme, setTheme] = useState<'custom' | 'dark' | 'light'>('light')
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const { data: brandingData, isLoading } = useApiQuery(
    ['branding'],
    '/tenants/branding',
    { staleTime: 5 * 60 * 1000 }
  )

  const { mutate: saveBranding, isPending: saving } = useApiMutation(
    async (payload: any) => {
      const { api } = await import('@/lib/api')
      const { data } = await api.put('/tenants/branding', payload)
      return data
    },
    [['branding']]
  )

  useEffect(() => {
    if (brandingData) {
      console.log('Dados do branding recebidos:', brandingData)
      
      if (brandingData.themeTemplate) {
        setTheme(brandingData.themeTemplate as any)
      }

      if (brandingData.heroImage) {
        setBannerPreview(brandingData.heroImage)
      }

      let paymentMethodsValue = ''
      if (brandingData.paymentMethods) {
        try {
          const parsed = JSON.parse(brandingData.paymentMethods)
          if (Array.isArray(parsed)) {
            paymentMethodsValue = parsed.join('\n')
          } else {
            paymentMethodsValue = brandingData.paymentMethods
          }
        } catch {
          paymentMethodsValue = brandingData.paymentMethods
        }
      }

      form.setFieldsValue({
        about: brandingData.about || '',
        address: brandingData.address || '',
        district: brandingData.district || '',
        city: brandingData.city || '',
        state: brandingData.state || '',
        zipCode: brandingData.zipCode || '',
        phone: brandingData.phone || '',
        whatsapp: brandingData.whatsapp || '',
        email: brandingData.email || '',
        instagram: brandingData.instagram || '',
        facebook: brandingData.facebook || '',
        paymentMethods: paymentMethodsValue,
      })
    }
  }, [brandingData, form])

  const toggleSection = (id: string) => {
    setSections(prev => 
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    )
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id)
      if (
        (direction === 'up' && idx === 0) || 
        (direction === 'down' && idx === prev.length - 1)
      ) {
        return prev
      }
      const newSections = [...prev]
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      const temp = newSections[idx]
      newSections[idx] = newSections[targetIdx]
      newSections[targetIdx] = temp
      return newSections.map((s, i) => ({ ...s, order: i }))
    })
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const payload = {
        themeTemplate: theme,
        heroImage: bannerPreview,
        about: values.about,
        address: values.address,
        district: values.district,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        instagram: values.instagram,
        facebook: values.facebook,
        paymentMethods: values.paymentMethods,
        sectionsConfig: JSON.stringify(sections),
      }

      console.log('Salvando dados:', payload)

      saveBranding(payload, {
        onSuccess: () => {
          message.success('Configurações salvas com sucesso!')
        },
        onError: (error: any) => {
          console.error('Erro ao salvar:', error)
          message.error('Erro ao salvar configurações')
        },
      })
    } catch (error) {
      console.error('Erro de validação:', error)
    }
  }

  const handleBannerUpload = (info: any) => {
    const file = info.file.originFileObj || info.file
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const orderedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="!mb-1">Construtor da Landing Page</Title>
          <Text type="secondary">
            Configure o conteúdo e aparência da sua página de agendamentos
          </Text>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          size="large"
        >
          Salvar Alterações
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={14}>
          <Form form={form} layout="vertical">
            <Card 
              className="mb-4"
              title={<span className="font-semibold">MODELO DE TEMA</span>}
            >
              <Radio.Group 
                value={theme} 
                onChange={(e) => setTheme(e.target.value)}
                className="w-full"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Radio.Button value="custom" className="w-full text-center h-12 flex items-center justify-center">
                      Personalizado
                    </Radio.Button>
                  </Col>
                  <Col span={8}>
                    <Radio.Button value="dark" className="w-full text-center h-12 flex items-center justify-center">
                      Escuro
                    </Radio.Button>
                  </Col>
                  <Col span={8}>
                    <Radio.Button value="light" className="w-full text-center h-12 flex items-center justify-center">
                      Claro
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Card>

            <Card 
              className="mb-4"
              title={<span className="font-semibold">IMAGEM DE CAPA</span>}
            >
              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleBannerUpload}
                accept="image/*"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  {bannerPreview ? (
                    <div className="relative">
                      <img 
                        src={bannerPreview} 
                        alt="Banner" 
                        className="max-h-40 mx-auto rounded"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        Clique para alterar
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadOutlined className="text-3xl text-gray-400" />
                      <div className="mt-2">Clique para enviar imagem</div>
                      <div className="text-xs text-gray-400">PNG, JPG até 5MB</div>
                    </>
                  )}
                </div>
              </Upload>
            </Card>

            {orderedSections.map((section, index) => (
              <Card 
                key={section.id}
                className="mb-4"
                title={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch 
                        size="small"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                      />
                      <span className={section.enabled ? 'font-semibold' : 'font-semibold text-gray-400'}>
                        {section.name}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<ArrowUpOutlined />}
                        disabled={index === 0}
                        onClick={() => moveSection(section.id, 'up')}
                      />
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<ArrowDownOutlined />}
                        disabled={index === orderedSections.length - 1}
                        onClick={() => moveSection(section.id, 'down')}
                      />
                    </div>
                  </div>
                }
              >
                {section.id === 'about' && section.enabled && (
                  <Form.Item name="about" label="Descrição da empresa">
                    <TextArea 
                      rows={4} 
                      placeholder="Conte um pouco sobre sua empresa, história, valores..."
                    />
                  </Form.Item>
                )}

                {section.id === 'professionals' && section.enabled && (
                  <div className="text-center py-4">
                    <Text type="secondary">
                      Os profissionais são gerenciados automaticamente a partir do cadastro.
                    </Text>
                    <br />
                    <Button type="link" href="/admin/profissionais">
                      Gerenciar Profissionais
                    </Button>
                  </div>
                )}

                {section.id === 'hours' && section.enabled && (
                  <div className="text-center py-4">
                    <Text type="secondary">
                      Os horários são gerenciados automaticamente a partir do cadastro.
                    </Text>
                    <br />
                    <Button type="link" href="/admin/configuracoes">
                      Gerenciar Horários
                    </Button>
                  </div>
                )}

                {section.id === 'contact' && section.enabled && (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="phone" label="Telefone">
                        <Input placeholder="(11) 99999-9999" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="whatsapp" label="WhatsApp">
                        <Input placeholder="(11) 99999-9999" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="email" label="E-mail">
                        <Input placeholder="contato@empresa.com" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {section.id === 'address' && section.enabled && (
                  <>
                    <Row gutter={16}>
                      <Col span={16}>
                        <Form.Item name="address" label="Endereço">
                          <Input placeholder="Rua, número" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="zipCode" label="CEP">
                          <Input placeholder="00000-000" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="district" label="Bairro">
                          <Input placeholder="Bairro" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="city" label="Cidade">
                          <Input placeholder="São Paulo" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="state" label="Estado">
                          <Input placeholder="SP" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                {section.id === 'social' && section.enabled && (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="instagram" label="Instagram">
                        <Input placeholder="@seuusuario" prefix="instagram.com/" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="facebook" label="Facebook">
                        <Input placeholder="suapagina" prefix="facebook.com/" />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {section.id === 'payment' && section.enabled && (
                  <Form.Item name="paymentMethods" label="Formas de pagamento aceitas">
                    <TextArea 
                      rows={3} 
                      placeholder="PIX
Cartão de Crédito
Cartão de Débito
Dinheiro"
                    />
                    <Text type="secondary" className="text-xs">
                      Uma forma de pagamento por linha
                    </Text>
                  </Form.Item>
                )}

                {!section.enabled && (
                  <div className="text-center py-4 text-gray-400">
                    Seção desabilitada
                  </div>
                )}
              </Card>
            ))}
          </Form>
        </Col>

        <Col xs={24} lg={10}>
          <div className="sticky top-4">
            <Card title="Pré-visualização" className="text-center">
              <PhonePreview />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  )
}
