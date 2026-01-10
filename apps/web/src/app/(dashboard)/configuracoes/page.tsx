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
  Tabs,
  TimePicker,
  Checkbox,
  Select,
  Upload,
  Avatar,
  Divider,
  Switch,
  InputNumber,
  Spin,
  Table,
} from 'antd'
import {
  SaveOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { HorariosTab, buildBusinessHoursPayload } from '@/components/HorariosTab'

const { Title, Text } = Typography

const weekDays = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 },
]

export default function SettingsPage() {
  const [form] = Form.useForm()

  // Buscar configurações atuais da API
  const { data: configData, isLoading } = useApiQuery(
    ['branding'],
    '/tenants/branding',
    { staleTime: 5 * 60 * 1000 }
  )

  // Mutation para salvar
  const { mutate: saveConfig, isPending: saving } = useApiMutation(
    async (payload: any) => {
      const { data } = await import('@/lib/api').then(m => m.api.put('/tenants/branding', payload))
      return data
    },
    [['branding']]
  )

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (configData) {
      console.log('ConfigData recebida:', configData)
      
      const fieldsToSet: any = {
        // Informações da empresa
        name: configData.name,
        phone: configData.phone,
        email: configData.email,
        address: configData.address,
        city: configData.city,
        // Notificações
        emailNotifications: configData.emailNotifications,
        smsNotifications: configData.smsNotifications,
        whatsappNotifications: configData.whatsappNotifications,
        reminderHours: configData.reminderHours,
      }

      form.setFieldsValue(fieldsToSet)
    }
  }, [configData, form])

  const handleSave = async () => {
    try {
      // Tentar validar, mas se falhar continua assim mesmo
      let values: any = {}
      try {
        values = await form.validateFields()
      } catch (validationError) {
        // Se tiver erro de validação, pega apenas os valores preenchidos
        values = form.getFieldsValue()
      }

      // Construir payload para /tenants/branding (mais permissivo)
      const payload: any = {}

      // Dados da empresa (aba Configurações da Empresa)
      if (values.name !== undefined) payload.name = values.name
      if (values.phone !== undefined) payload.phone = values.phone
      if (values.email !== undefined) payload.email = values.email
      if (values.address !== undefined) payload.address = values.address
      if (values.city !== undefined) payload.city = values.city

      // Notificações (aba Notificações)
      if (values.emailNotifications !== undefined) payload.emailNotifications = values.emailNotifications
      if (values.smsNotifications !== undefined) payload.smsNotifications = values.smsNotifications
      if (values.whatsappNotifications !== undefined) payload.whatsappNotifications = values.whatsappNotifications
      if (values.reminderHours !== undefined) payload.reminderHours = values.reminderHours

      // Horários (aba Horários) - usa os valores do form compartilhado
      const businessHours = buildBusinessHoursPayload(values, undefined, undefined, { skipIfEmpty: true })
      if (businessHours && Object.keys(businessHours).length > 0) {
        payload.businessHours = businessHours
      }

      if (values.onlineBookingEnabled !== undefined) payload.onlineBookingEnabled = values.onlineBookingEnabled
      if (values.minAdvanceHours !== undefined) payload.minAdvanceHours = values.minAdvanceHours
      if (values.maxAdvanceDays !== undefined) payload.maxAdvanceDays = values.maxAdvanceDays
      if (values.slotDuration !== undefined) payload.slotDuration = values.slotDuration

      console.log('Payload enviado para /tenants/branding:', payload)

      saveConfig(payload, {
        onSuccess: () => {
          message.success('Configurações salvas com sucesso!')
          // Não precisa recarregar - o useEffect já vai atualizar quando os dados chegarem
        },
        onError: (error: any) => {
          console.error('Erro ao salvar:', error)
          message.error('Erro ao salvar configurações: ' + (error?.message || 'Erro desconhecido'))
        },
      })
    } catch (error) {
      console.error('Erro:', error)
      message.error('Erro ao processar as configurações')
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <ShopOutlined />
          Configurações da Empresa
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card title="Informações do Estabelecimento" style={{ marginBottom: 16 }}>
              <Form.Item
                name="name"
                label="Nome do Estabelecimento"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input placeholder="Ex: Salão da Maria" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Telefone"
                    rules={[{ required: true, message: 'Telefone é obrigatório' }]}
                  >
                    <Input placeholder="(00) 00000-0000" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="email" label="E-mail">
                    <Input placeholder="contato@email.com" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item name="address" label="Endereço">
                    <Input placeholder="Rua, número, bairro" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="city" label="Cidade">
                    <Input placeholder="Cidade - UF" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card title="Configurações Regionais">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="timezone" label="Fuso Horário">
                    <Select>
                      <Select.Option value="America/Sao_Paulo">
                        Brasília (GMT-3)
                      </Select.Option>
                      <Select.Option value="America/Manaus">
                        Manaus (GMT-4)
                      </Select.Option>
                      <Select.Option value="America/Fortaleza">
                        Fortaleza (GMT-3)
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="currency" label="Moeda">
                    <Select>
                      <Select.Option value="BRL">Real (R$)</Select.Option>
                      <Select.Option value="USD">Dólar (US$)</Select.Option>
                      <Select.Option value="EUR">Euro (€)</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Logo">
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={100}
                  icon={<ShopOutlined />}
                  style={{ backgroundColor: '#505afb', marginBottom: 16 }}
                />
                <div>
                  <Upload showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Alterar Logo</Button>
                  </Upload>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  PNG ou JPG, máximo 2MB
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'schedule',
      label: (
        <span>
          <ClockCircleOutlined />
          Horários
        </span>
      ),
      children: (
        <HorariosTab
          form={form}
          configData={configData}
          onSaveSuccess={() => message.success('Horários salvos com sucesso!')}
        />
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notificações
        </span>
      ),
      children: (
        <Card title="Configurações de Notificações">
          <Title level={5}>Canais de Notificação</Title>
          
          <Form.Item
            name="emailNotifications"
            valuePropName="checked"
          >
            <Checkbox>Enviar notificações por e-mail</Checkbox>
          </Form.Item>

          <Form.Item
            name="smsNotifications"
            valuePropName="checked"
          >
            <Checkbox>Enviar notificações por SMS</Checkbox>
          </Form.Item>

          <Form.Item
            name="whatsappNotifications"
            valuePropName="checked"
          >
            <Checkbox>Enviar notificações por WhatsApp</Checkbox>
          </Form.Item>

          <Divider />

          <Title level={5}>Lembretes de Agendamento</Title>

          <Form.Item
            name="reminderHours"
            label="Enviar lembrete com antecedência de"
          >
            <Select style={{ width: 200 }}>
              <Select.Option value={1}>1 hora</Select.Option>
              <Select.Option value={2}>2 horas</Select.Option>
              <Select.Option value={6}>6 horas</Select.Option>
              <Select.Option value={12}>12 horas</Select.Option>
              <Select.Option value={24}>24 horas</Select.Option>
              <Select.Option value={48}>48 horas</Select.Option>
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      key: 'account',
      label: (
        <span>
          <UserOutlined />
          Minha Conta
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card title="Dados da Conta">
              <Form.Item label="Nome">
                <Input defaultValue="Administrador" />
              </Form.Item>
              <Form.Item label="E-mail">
                <Input defaultValue="admin@meusalao.com" disabled />
              </Form.Item>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Alterar Senha">
              <Form.Item label="Senha Atual">
                <Input.Password placeholder="Senha atual" />
              </Form.Item>
              <Form.Item label="Nova Senha">
                <Input.Password placeholder="Nova senha" />
              </Form.Item>
              <Form.Item label="Confirmar Nova Senha">
                <Input.Password placeholder="Confirme a nova senha" />
              </Form.Item>
              <Button type="primary">Alterar Senha</Button>
            </Card>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Configurações
        </Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar Alterações
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
      >
        <Tabs items={tabItems} />
      </Form>
    </div>
  )
}
