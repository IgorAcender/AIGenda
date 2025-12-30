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
        themeTemplate: brandingData.themeTemplate || 'light',
        ...brandingData,
      })
    }
  }, [brandingData, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      saveBranding(values, {
        onSuccess: () => message.success('Configurações salvas com sucesso!'),
        onError: () => message.error('Erro ao salvar configurações'),
      })
    } catch (error) {
      console.error('Erro ao validar:', error)
    }
  }

  const themeValue = form.getFieldValue('themeTemplate')

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={isLoading}
    >
      {/* MODELO DE TEMA */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4}>🎨 Modelo de Tema</Title>
        <Paragraph type="secondary">
          Escolha um tema pré-configurado ou personalize as cores do seu site.
        </Paragraph>

        <Form.Item
          name="themeTemplate"
          noStyle
        >
          <Radio.Group>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col xs={24} sm={12} lg={8}>
                <Card 
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => form.setFieldValue('themeTemplate', 'custom')}
                >
                  <Radio value="custom" style={{ position: 'absolute', top: 8, left: 8 }} />
                  <div style={{ fontSize: 24, marginBottom: 8 }}>🎯</div>
                  <Text strong>Personalizado</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Escolha suas cores</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Card 
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => form.setFieldValue('themeTemplate', 'dark')}
                >
                  <Radio value="dark" style={{ position: 'absolute', top: 8, left: 8 }} />
                  <div style={{ 
                    backgroundColor: '#1f2937', 
                    height: 60, 
                    borderRadius: 8, 
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                    <div style={{ width: 12, height: 12, backgroundColor: '#000', borderRadius: 2 }} />
                    <div style={{ width: 30, height: 12, backgroundColor: '#fff', borderRadius: 2 }} />
                    <div style={{ width: 12, height: 12, backgroundColor: '#7c3aed', borderRadius: 2 }} />
                  </div>
                  <Text strong>Preto e Branco</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Tema Escuro</Text>
                </Card>
              </Col>

              <Col xs={24} sm={12} lg={8}>
                <Card 
                  hoverable
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => form.setFieldValue('themeTemplate', 'light')}
                >
                  <Radio value="light" style={{ position: 'absolute', top: 8, left: 8 }} />
                  <div style={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #f0f0f0',
                    height: 60, 
                    borderRadius: 8, 
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                    <div style={{ width: 12, height: 12, backgroundColor: '#fff', border: '1px solid #000', borderRadius: 2 }} />
                    <div style={{ width: 30, height: 12, backgroundColor: '#000', borderRadius: 2 }} />
                    <div style={{ width: 12, height: 12, backgroundColor: '#7c3aed', borderRadius: 2 }} />
                  </div>
                  <Text strong>Branco e Preto</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Tema Claro</Text>
                </Card>
              </Col>
            </Row>
          </Radio.Group>
        </Form.Item>
      </div>

      <Divider />

      {/* IMAGEM DE CAPA */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4}>🖼️ Imagem de Capa</Title>
        <Paragraph type="secondary">
          Faça upload da imagem principal do site.
        </Paragraph>

        <Form.Item
          name="heroImage"
          label="Foto de capa / hero do site"
          extra="Imagem exibida no topo do site. Formatos: JPG/PNG."
        >
          <Upload
            maxCount={1}
            accept="image/*"
            listType="picture"
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>Escolher Arquivo</Button>
          </Upload>
        </Form.Item>
      </div>

      <Divider />

      {/* CONTEÚDO DO SITE */}
      <div style={{ marginBottom: 32 }}>
        <Title level={4}>📄 Conteúdo do Site</Title>
        <Paragraph type="secondary">
          Organize as seções que aparecerão no seu site. Use as setas para reordenar.
        </Paragraph>

        {/* SOBRE NÓS */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>SOBRE NÓS</Text>
              <Form.Item
                name="showAbout"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              name="aboutText"
              label="Descrição"
              extra="Texto que aparece na seção Sobre nós do site."
            >
              <Input.TextArea
                placeholder="Somos uma barbearia..."
                rows={3}
              />
            </Form.Item>
          </Space>
        </Card>

        {/* PROFISSIONAIS */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>PROFISSIONAIS</Text>
              <Form.Item
                name="showProfessionals"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>Exibe os membros da sua equipe no site.</Text>
          </Space>
        </Card>

        {/* HORÁRIO DE FUNCIONAMENTO */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>HORÁRIO DE FUNCIONAMENTO</Text>
              <Form.Item
                name="showSchedule"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>Exibe os horários de funcionamento no site.</Text>
          </Space>
        </Card>

        {/* CONTATO */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>CONTATO</Text>
              <Form.Item
                name="showContact"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              name="contactPhone"
              label="Telefone"
              extra="Informações de contato exibidas no site."
            >
              <Input placeholder="(11) 99999-9999" />
            </Form.Item>

            <Form.Item
              name="contactWhatsapp"
              label="WhatsApp"
              extra="Número do WhatsApp para botão de contato."
            >
              <Input placeholder="(11) 99999-9999" />
            </Form.Item>
          </Space>
        </Card>

        {/* ENDEREÇO */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>ENDEREÇO</Text>
              <Form.Item
                name="showAddress"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>

            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label="Endereço"
                  extra="Endereço completo da sua empresa."
                >
                  <Input placeholder="Rua Pau Brasil 381" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="city"
                  label="Cidade"
                  extra="Cidade da empresa."
                >
                  <Input placeholder="Divinópolis" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="state"
                  label="Estado"
                  extra="Sigla do estado (ex: SP, RJ, MG)."
                >
                  <Input placeholder="MG" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="zipCode"
                  label="CEP"
                  extra="CEP da empresa."
                >
                  <Input placeholder="35501576" />
                </Form.Item>
              </Col>
            </Row>
          </Space>
        </Card>

        {/* REDES SOCIAIS */}
        <Card style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>REDES SOCIAIS</Text>
              <Form.Item
                name="showSocial"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              name="socialInstagram"
              label="Instagram (site)"
              extra="Link exibido na seção de redes sociais."
            >
              <Input placeholder="https://www.instagram.com/seu_perfil/" />
            </Form.Item>

            <Form.Item
              name="socialFacebook"
              label="Facebook (site)"
              extra="Link exibido na seção de redes sociais."
            >
              <Input placeholder="https://facebook.com/seu_perfil" />
            </Form.Item>
          </Space>
        </Card>

        {/* FORMAS DE PAGAMENTO */}
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>FORMAS DE PAGAMENTO</Text>
              <Form.Item
                name="showPayment"
                noStyle
              >
                <Switch />
              </Form.Item>
            </div>

            <Form.Item
              name="paymentMethods"
              label="Formas de Pagamento (site)"
              extra="Formas de pagamento aceitas. Separe por vírgula ou uma por linha."
            >
              <Input.TextArea
                placeholder="PIX, Cartão de Crédito, Cartão de Débito, Dinheiro"
                rows={3}
              />
            </Form.Item>
          </Space>
        </Card>
      </div>

      <Divider />

      {/* BOTÃO SALVAR */}
      <Space>
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Salvar Configurações
        </Button>
      </Space>
    </Form>
  )
}
