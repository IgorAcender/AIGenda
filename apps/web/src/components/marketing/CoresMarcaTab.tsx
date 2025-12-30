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
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
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
        city: brandingData.city || '',
        state: brandingData.state || '',
        zipCode: brandingData.zipCode || '',
        phone: brandingData.phone || '',
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
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        phone: values.phone,
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
            {/* Tema */}
            <Form.Item
              label="Tema"
              name="theme"
              initialValue="light"
            >
              <Radio.Group>
                <Radio.Button value="light">Claro</Radio.Button>
                <Radio.Button value="dark">Escuro</Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Divider />

            {/* Informações Básicas */}
            <Title level={5}>Informações Básicas</Title>

            <Form.Item
              label="Nome do Estabelecimento"
              name="tenantName"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input placeholder="Ex: Igor E Júnior Barbershop" />
            </Form.Item>

            <Form.Item
              label="Sobre"
              name="about"
            >
              <Input.TextArea
                rows={3}
                placeholder="Descrição breve sobre o estabelecimento"
              />
            </Form.Item>

            <Form.Item
              label="Descrição Detalhada"
              name="description"
            >
              <Input.TextArea
                rows={3}
                placeholder="Descrição mais completa da sua empresa"
              />
            </Form.Item>

            <Divider />

            {/* Endereço */}
            <Title level={5}>Localização</Title>

            <Form.Item
              label="Endereço"
              name="address"
              rules={[{ required: true, message: 'Campo obrigatório' }]}
            >
              <Input placeholder="Rua, número" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Cidade"
                  name="city"
                  rules={[{ required: true, message: 'Campo obrigatório' }]}
                >
                  <Input placeholder="Ex: São Paulo" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Estado"
                  name="state"
                  rules={[{ required: true, message: 'Campo obrigatório' }]}
                >
                  <Input placeholder="Ex: SP" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="CEP"
              name="zipCode"
            >
              <Input placeholder="Ex: 01234-567" />
            </Form.Item>

            <Form.Item
              label="Latitude"
              name="latitude"
            >
              <Input placeholder="Ex: -23.5505" type="number" step="0.0001" />
            </Form.Item>

            <Form.Item
              label="Longitude"
              name="longitude"
            >
              <Input placeholder="Ex: -46.6333" type="number" step="0.0001" />
            </Form.Item>

            <Divider />

            {/* Horários de Funcionamento */}
            <Title level={5}>Horários de Funcionamento</Title>

            {[
              { day: 'Segunda-feira', value: 'monday' },
              { day: 'Terça-feira', value: 'tuesday' },
              { day: 'Quarta-feira', value: 'wednesday' },
              { day: 'Quinta-feira', value: 'thursday' },
              { day: 'Sexta-feira', value: 'friday' },
              { day: 'Sábado', value: 'saturday' },
              { day: 'Domingo', value: 'sunday' },
            ].map(({ day, value }) => (
              <Row key={value} gutter={16} style={{ marginBottom: '12px' }}>
                <Col xs={24} sm={8}>
                  <Text strong>{day}</Text>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item
                    name={`${value}Open`}
                    noStyle
                  >
                    <Input type="time" placeholder="Abertura" />
                  </Form.Item>
                </Col>
                <Col xs={12} sm={8}>
                  <Form.Item
                    name={`${value}Close`}
                    noStyle
                  >
                    <Input type="time" placeholder="Fechamento" />
                  </Form.Item>
                </Col>
              </Row>
            ))}

            <Divider />

            {/* Redes Sociais */}
            <Title level={5}>Redes Sociais</Title>

            <Form.Item
              label="Instagram"
              name="instagram"
            >
              <Input placeholder="@seu_usuario" />
            </Form.Item>

            <Form.Item
              label="Facebook"
              name="facebook"
            >
              <Input placeholder="seu_perfil_facebook" />
            </Form.Item>

            <Form.Item
              label="Twitter"
              name="twitter"
            >
              <Input placeholder="@seu_usuario" />
            </Form.Item>

            <Divider />

            {/* Formas de Pagamento */}
            <Title level={5}>Formas de Pagamento</Title>

            <Form.Item
              label="Formas de Pagamento"
              name="paymentMethods"
            >
              <Input.TextArea
                rows={3}
                placeholder="Digite cada forma em uma linha. Ex:&#10;Dinheiro&#10;Cartão de Crédito&#10;PIX&#10;Cartão de Débito"
              />
            </Form.Item>

            <Divider />

            {/* Comodidades */}
            <Title level={5}>Comodidades</Title>

            <Form.Item
              label="Comodidades"
              name="amenities"
            >
              <Input.TextArea
                rows={3}
                placeholder="Digite cada comodidade em uma linha. Ex:&#10;WiFi Grátis&#10;Estacionamento&#10;Bebidas Quentes&#10;Conforto"
              />
            </Form.Item>

            <Divider />

            {/* Contato */}
            <Title level={5}>Contato</Title>

            <Form.Item
              label="Telefone"
              name="phone"
            >
              <Input placeholder="(11) 99999-9999" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
            >
              <Input placeholder="contato@example.com" type="email" />
            </Form.Item>

            {/* Botão Salvar */}
            <Form.Item>
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
