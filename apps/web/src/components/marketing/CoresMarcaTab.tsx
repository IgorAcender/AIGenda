'use client'

import React, { useEffect } from 'react'
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  message,
  Typography,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'

const { Title, Text } = Typography
const { TextArea } = Input

export default function CoresMarcaTab() {
  const [form] = Form.useForm()

  // Buscar dados atuais
  const { data: brandingData, isLoading } = useApiQuery(
    ['branding'],
    '/tenants/branding'
  )

  // Mutation para salvar
  const mutation = useApiMutation(
    async (payload: any) => {
      const { api } = await import('@/lib/api')
      const response = await api.put('/tenants/branding', payload)
      return response.data
    },
    [['branding']]
  )

  // Carregar dados no formulário
  useEffect(() => {
    if (brandingData) {
      form.setFieldsValue({
        name: brandingData.name || '',
        about: brandingData.about || '',
        phone: brandingData.phone || '',
        whatsapp: brandingData.whatsapp || '',
        email: brandingData.email || '',
        address: brandingData.address || '',
        district: brandingData.district || '',
        city: brandingData.city || '',
        state: brandingData.state || '',
        zipCode: brandingData.zipCode || '',
        instagram: brandingData.instagram || '',
        facebook: brandingData.facebook || '',
      })
    }
  }, [brandingData, form])

  // Salvar dados
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      mutation.mutate(values, {
        onSuccess: () => {
          message.success('Configurações salvas com sucesso!')
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.error || 'Erro ao salvar')
        },
      })
    } catch (error) {
      message.error('Preencha os campos obrigatórios')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={3} className="!mb-1">Cores e Marca</Title>
          <Text type="secondary">Configure os dados da sua empresa</Text>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={mutation.isPending}
          size="large"
        >
          Salvar
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* Informações Básicas */}
        <Card title="Informações Básicas" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Nome da Empresa">
                <Input placeholder="Ex: Meu Negócio" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24}>
              <Form.Item name="about" label="Sobre a Empresa">
                <TextArea rows={4} placeholder="Descreva sua empresa..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Contato */}
        <Card title="Contato" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="phone" label="Telefone">
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="whatsapp" label="WhatsApp">
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="email" label="E-mail">
                <Input type="email" placeholder="contato@empresa.com" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Endereço */}
        <Card title="Endereço" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="address" label="Endereço">
                <Input placeholder="Rua, número" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="zipCode" label="CEP">
                <Input placeholder="00000-000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="district" label="Bairro">
                <Input placeholder="Bairro" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="city" label="Cidade">
                <Input placeholder="São Paulo" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="state" label="Estado">
                <Input placeholder="SP" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Redes Sociais */}
        <Card title="Redes Sociais" className="mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="instagram" label="Instagram">
                <Input placeholder="@seuusuario" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="facebook" label="Facebook">
                <Input placeholder="sua-pagina" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  )
}
