'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
  Space,
  Divider,
  Radio,
  Switch,
  Alert,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import PhonePreview from './PhonePreview'

const { Title, Text, Paragraph } = Typography

export default function CoresMarcaTab() {
  const [form] = Form.useForm()

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

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (brandingData) {
      form.setFieldsValue({
        theme: brandingData.theme || 'light',
        tenantName: brandingData.name || '',
        about: brandingData.about || '',
        address: brandingData.address || '',
        district: brandingData.district || '',
        city: brandingData.city || '',
        state: brandingData.state || '',
        zipCode: brandingData.zipCode || '',
        phone: brandingData.phone || '',
        whatsapp: brandingData.whatsapp || '',
        email: brandingData.email || '',
        description: brandingData.description || '',
        instagram: brandingData.instagram || '',
        facebook: brandingData.facebook || '',
        twitter: brandingData.twitter || '',
        paymentMethods: brandingData.paymentMethods || '',
        amenities: brandingData.amenities || '',
        latitude: brandingData.latitude || '',
        longitude: brandingData.longitude || '',
        // BusinessHours
        mondayOpen: brandingData.businessHours?.monday?.split(' - ')[0] || '09:00',
        mondayClose: brandingData.businessHours?.monday?.split(' - ')[1] || '18:00',
        tuesdayOpen: brandingData.businessHours?.tuesday?.split(' - ')[0] || '09:00',
        tuesdayClose: brandingData.businessHours?.tuesday?.split(' - ')[1] || '18:00',
        wednesdayOpen: brandingData.businessHours?.wednesday?.split(' - ')[0] || '09:00',
        wednesdayClose: brandingData.businessHours?.wednesday?.split(' - ')[1] || '18:00',
        thursdayOpen: brandingData.businessHours?.thursday?.split(' - ')[0] || '09:00',
        thursdayClose: brandingData.businessHours?.thursday?.split(' - ')[1] || '18:00',
        fridayOpen: brandingData.businessHours?.friday?.split(' - ')[0] || '09:00',
        fridayClose: brandingData.businessHours?.friday?.split(' - ')[1] || '18:00',
        saturdayOpen: brandingData.businessHours?.saturday?.split(' - ')[0] || '09:00',
        saturdayClose: brandingData.businessHours?.saturday?.split(' - ')[1] || '18:00',
        sundayOpen: brandingData.businessHours?.sunday?.split(' - ')[0] || '09:00',
        sundayClose: brandingData.businessHours?.sunday?.split(' - ')[1] || '18:00',
      })
    }
  }, [brandingData, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      const payload = {
        theme: values.theme || 'light',
        name: values.tenantName,
        about: values.about,
        address: values.address,
        district: values.district,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        description: values.description,
        instagram: values.instagram,
        facebook: values.facebook,
        twitter: values.twitter,
        paymentMethods: values.paymentMethods,
        amenities: values.amenities,
        latitude: values.latitude,
        longitude: values.longitude,
        businessHours: {
          monday: `${values.mondayOpen} - ${values.mondayClose}`,
          tuesday: `${values.tuesdayOpen} - ${values.tuesdayClose}`,
          wednesday: `${values.wednesdayOpen} - ${values.wednesdayClose}`,
          thursday: `${values.thursdayOpen} - ${values.thursdayClose}`,
          friday: `${values.fridayOpen} - ${values.fridayClose}`,
          saturday: `${values.saturdayOpen} - ${values.saturdayClose}`,
          sunday: `${values.sundayOpen} - ${values.sundayClose}`,
        },
      }

      saveBranding(payload, {
        onSuccess: () => {
          message.success('Configurações salvas com sucesso!')
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

  // Dados para preview
  const previewData = {
    tenantName: form.getFieldValue('tenantName'),
    about: form.getFieldValue('about'),
    description: form.getFieldValue('description'),
    address: form.getFieldValue('address'),
    city: form.getFieldValue('city'),
    state: form.getFieldValue('state'),
    zipCode: form.getFieldValue('zipCode'),
    businessHours: {
      monday: `${form.getFieldValue('mondayOpen')} - ${form.getFieldValue('mondayClose')}`,
      tuesday: `${form.getFieldValue('tuesdayOpen')} - ${form.getFieldValue('tuesdayClose')}`,
      wednesday: `${form.getFieldValue('wednesdayOpen')} - ${form.getFieldValue('wednesdayClose')}`,
      thursday: `${form.getFieldValue('thursdayOpen')} - ${form.getFieldValue('thursdayClose')}`,
      friday: `${form.getFieldValue('fridayOpen')} - ${form.getFieldValue('fridayClose')}`,
      saturday: `${form.getFieldValue('saturdayOpen')} - ${form.getFieldValue('saturdayClose')}`,
      sunday: `${form.getFieldValue('sundayOpen')} - ${form.getFieldValue('sundayClose')}`,
    },
    paymentMethods: form.getFieldValue('paymentMethods'),
    amenities: form.getFieldValue('amenities'),
    socialMedia: {
      instagram: form.getFieldValue('instagram'),
      facebook: form.getFieldValue('facebook'),
      twitter: form.getFieldValue('twitter'),
    },
  }

  return (
    <Row gutter={[24, 24]}>
      {/* Formulário - Coluna Esquerda */}
      <Col xs={24} lg={14}>
        <Card
          title={<Title level={3}>Cores e Marca</Title>}
          loading={isLoading}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <Form
            form={form}
            layout="vertical"
            autoComplete="off"
          >
            {/* 1. SOBRE NÓS */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>SOBRE NÓS</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>
              
              <Form.Item
                label="Descrição"
                name="about"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Somos uma barbearia"
                />
              </Form.Item>

              <Text type="secondary">Texto que aparece na seção Sobre nós do site.</Text>
            </Card>

            {/* 2. PROFISSIONAIS */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>PROFISSIONAIS</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Alert 
                message="Exibe os membros da sua equipe no site." 
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Button 
                type="primary" 
                icon={<EditOutlined />}
                block
              >
                Gerenciar Profissionais
              </Button>
            </Card>

            {/* 3. HORÁRIO DE FUNCIONAMENTO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>HORÁRIO DE FUNCIONAMENTO</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Alert 
                message="Exibe os horários de funcionamento no site."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Button 
                type="primary" 
                icon={<EditOutlined />}
                block
              >
                Configurar Horários
              </Button>
            </Card>

            {/* 4. CONTATO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>CONTATO</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Form.Item
                label="Telefone"
                name="phone"
              >
                <Input placeholder="37988051626" />
              </Form.Item>

              <Text type="secondary">Informações de contato exibidas no site.</Text>

              <Divider />

              <Title level={5} style={{ marginTop: '16px' }}>📱 WhatsApp</Title>

              <Form.Item
                label="Número do WhatsApp"
                name="whatsapp"
              >
                <Input placeholder="37988051626" />
              </Form.Item>

              <Text type="secondary">Número do WhatsApp para botão de contato.</Text>
            </Card>

            {/* 5. ENDEREÇO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>ENDEREÇO</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Row gutter={16}>
                <Col xs={24}>
                  <Form.Item
                    label="📍 Endereço"
                    name="address"
                  >
                    <Input placeholder="Rua Pau Brasil 381" />
                  </Form.Item>
                  <Text type="secondary">Endereço completo da sua empresa.</Text>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label="# CEP"
                    name="zipCode"
                  >
                    <Input placeholder="35501576" />
                  </Form.Item>
                  <Text type="secondary">CEP da empresa.</Text>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={8}>
                  <Form.Item
                    label="Bairro"
                    name="district"
                  >
                    <Input placeholder="Jardinópolis" />
                  </Form.Item>
                  <Text type="secondary">Bairro onde fica sua empresa.</Text>
                </Col>
                <Col xs={8}>
                  <Form.Item
                    label="Cidade"
                    name="city"
                  >
                    <Input placeholder="Divinópolis" />
                  </Form.Item>
                  <Text type="secondary">Cidade da empresa.</Text>
                </Col>
                <Col xs={8}>
                  <Form.Item
                    label="Estado"
                    name="state"
                  >
                    <Input placeholder="MG" />
                  </Form.Item>
                  <Text type="secondary">Sigla do estado (ex: SP, RJ, MG).</Text>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label="Latitude"
                    name="latitude"
                  >
                    <Input placeholder="-23.5505" type="number" step="0.0001" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label="Longitude"
                    name="longitude"
                  >
                    <Input placeholder="-46.6333" type="number" step="0.0001" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 6. REDES SOCIAIS */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>REDES SOCIAIS</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Title level={5} style={{ color: '#888', fontSize: '14px' }}>📸 Instagram (site)</Title>

              <Form.Item
                name="instagram"
              >
                <Input placeholder="https://www.instagram.com/liderboxdivinopolis/" />
              </Form.Item>

              <Text type="secondary">Link exibido na seção de redes sociais.</Text>

              <Divider style={{ margin: '16px 0' }} />

              <Title level={5} style={{ color: '#888', fontSize: '14px' }}>👥 Facebook (site)</Title>

              <Form.Item
                name="facebook"
              >
                <Input placeholder="https://facebook.com/seu_perfil" />
              </Form.Item>

              <Text type="secondary">Link exibido na seção de redes sociais.</Text>
            </Card>

            {/* 7. FORMAS DE PAGAMENTO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>FORMAS DE PAGAMENTO</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Title level={5} style={{ color: '#888', fontSize: '14px' }}>💳 Formas de Pagamento (site)</Title>

              <Form.Item
                name="paymentMethods"
              >
                <Input.TextArea
                  rows={5}
                  placeholder={`PIX,\nCartão de Crédito,\nCartão de Débito,\nDinheiro,`}
                />
              </Form.Item>

              <Text type="secondary">Formas de pagamento aceitas. Separe por vírgula ou uma por linha.</Text>
            </Card>

            {/* 8. COMODIDADES */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>COMODIDADES</Title>
                <Switch defaultChecked style={{ float: 'right' }} />
              </div>

              <Form.Item
                name="amenities"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Descreva as comodidades oferecidas..."
                />
              </Form.Item>

              <Text type="secondary">Comodidades disponíveis no estabelecimento.</Text>
            </Card>

            {/* Botão Salvar */}
            <Form.Item style={{ marginTop: '24px' }}>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
                block
              >
                Salvar Configurações
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      {/* Preview do Telefone - Coluna Direita */}
      <Col xs={24} lg={10}>
        <div
          style={{
            position: 'sticky',
            top: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <PhonePreview
            loading={isLoading}
          />
        </div>
      </Col>
    </Row>
  )
}
