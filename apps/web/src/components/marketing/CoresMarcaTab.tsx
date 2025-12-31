'use client'

import React, { useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
} from 'antd'
import {
  SaveOutlined,
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
      console.log('📥 Dados do branding recebidos:', brandingData)
      
      form.setFieldsValue({
        about: brandingData.about || '',
        address: brandingData.address || '',
        city: brandingData.city || '',
        state: brandingData.state || '',
        zipCode: brandingData.zipCode || '',
        phone: brandingData.phone || '',
        whatsapp: brandingData.whatsapp || '',
        email: brandingData.email || '',
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
    } else {
      console.log('📭 Sem dados de branding')
    }
  }, [brandingData, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      // Payload com APENAS os campos essenciais
      const payload = {
        about: values.about,
        address: values.address,
        city: values.city,
        state: values.state,
        zipCode: values.zipCode,
        phone: values.phone,
        whatsapp: values.whatsapp,
        email: values.email,
        instagram: values.instagram,
        facebook: values.facebook,
        twitter: values.twitter,
        paymentMethods: values.paymentMethods,
        amenities: values.amenities,
        latitude: values.latitude ? parseFloat(values.latitude) : undefined,
        longitude: values.longitude ? parseFloat(values.longitude) : undefined,
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
          console.log('✅ Salvo com sucesso!')
          message.success('Configurações salvas com sucesso!')
          
          // Recarregar iframe após 500ms para garantir que dados foram atualizados
          setTimeout(() => {
            const iframes = document.querySelectorAll('iframe.phone-iframe')
            iframes.forEach(iframe => {
              (iframe as HTMLIFrameElement).src = (iframe as HTMLIFrameElement).src
            })
          }, 500)
        },
        onError: (error: any) => {
          console.error('❌ Erro detalhado:', error)
          message.error(error?.response?.data?.error || 'Erro ao salvar configurações')
        },
      })
    } catch (error) {
      console.error(error)
    }
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
              <Title level={4} style={{ margin: '0 0 16px 0' }}>SOBRE NÓS</Title>
              
              <Form.Item
                label="Descrição"
                name="about"
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Somos uma barbearia..."
                />
              </Form.Item>

              <Text type="secondary">Texto que aparece na seção Sobre nós do site.</Text>
            </Card>

            {/* 2. CONTATO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>CONTATO</Title>

              <Form.Item
                label="Telefone"
                name="phone"
              >
                <Input placeholder="37988051626" />
              </Form.Item>

              <Form.Item
                label="WhatsApp"
                name="whatsapp"
              >
                <Input placeholder="37988051626" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
              >
                <Input type="email" placeholder="contato@empresa.com" />
              </Form.Item>

              <Text type="secondary">Informações de contato exibidas no site.</Text>
            </Card>

            {/* 3. ENDEREÇO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>ENDEREÇO</Title>

              <Form.Item
                label="Endereço"
                name="address"
              >
                <Input placeholder="Rua Pau Brasil 381" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={8}>
                  <Form.Item
                    label="Cidade"
                    name="city"
                  >
                    <Input placeholder="Divinópolis" />
                  </Form.Item>
                </Col>
                <Col xs={8}>
                  <Form.Item
                    label="Estado"
                    name="state"
                  >
                    <Input placeholder="MG" />
                  </Form.Item>
                </Col>
                <Col xs={8}>
                  <Form.Item
                    label="CEP"
                    name="zipCode"
                  >
                    <Input placeholder="35501576" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label="Latitude"
                    name="latitude"
                  >
                    <Input placeholder="-19.8267" type="number" step="0.0001" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label="Longitude"
                    name="longitude"
                  >
                    <Input placeholder="-43.9945" type="number" step="0.0001" />
                  </Form.Item>
                </Col>
              </Row>

              <Text type="secondary">Localização e coordenadas do seu estabelecimento.</Text>
            </Card>

            {/* 4. REDES SOCIAIS */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>REDES SOCIAIS</Title>

              <Form.Item
                label="📸 Instagram"
                name="instagram"
              >
                <Input placeholder="https://instagram.com/seu_usuario" />
              </Form.Item>

              <Form.Item
                label="👥 Facebook"
                name="facebook"
              >
                <Input placeholder="https://facebook.com/seu_perfil" />
              </Form.Item>

              <Form.Item
                label="𝕏 Twitter"
                name="twitter"
              >
                <Input placeholder="https://twitter.com/seu_usuario" />
              </Form.Item>

              <Text type="secondary">Links para suas redes sociais.</Text>
            </Card>

            {/* 5. FORMAS DE PAGAMENTO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>FORMAS DE PAGAMENTO</Title>

              <Form.Item
                name="paymentMethods"
              >
                <Input.TextArea
                  rows={4}
                  placeholder={`PIX\nCartão de Crédito\nCartão de Débito\nDinheiro`}
                />
              </Form.Item>

              <Text type="secondary">Separe cada forma em uma linha nova.</Text>
            </Card>

            {/* 6. COMODIDADES */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>COMODIDADES</Title>

              <Form.Item
                name="amenities"
              >
                <Input.TextArea
                  rows={4}
                  placeholder={`WiFi\nEstacionamento\nBebidas Quentes\nConforto`}
                />
              </Form.Item>

              <Text type="secondary">Comodidades disponíveis no seu estabelecimento.</Text>
            </Card>

            {/* 7. HORÁRIO DE FUNCIONAMENTO */}
            <Card style={{ marginBottom: '16px', borderRadius: '8px' }}>
              <Title level={4} style={{ margin: '0 0 16px 0' }}>HORÁRIO DE FUNCIONAMENTO</Title>

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

              <Text type="secondary">Defina os horários de funcionamento de cada dia.</Text>
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
