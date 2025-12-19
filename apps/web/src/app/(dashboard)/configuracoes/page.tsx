'use client'

import React, { useState } from 'react'
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
} from 'antd'
import {
  SaveOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  BellOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

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
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  // Mock initial values
  const initialValues = {
    name: 'Meu Salão de Beleza',
    phone: '(11) 99999-9999',
    email: 'contato@meusalao.com',
    address: 'Rua das Flores, 123',
    city: 'São Paulo - SP',
    workDays: [1, 2, 3, 4, 5, 6],
    workStart: dayjs('09:00', 'HH:mm'),
    workEnd: dayjs('19:00', 'HH:mm'),
    slotDuration: 30,
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    reminderHours: 24,
    // Online booking
    onlineBookingEnabled: true,
    requireApproval: false,
    maxAdvanceDays: 30,
    minAdvanceHours: 2,
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      // Simular chamada API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      message.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const tabItems = [
    {
      key: 'general',
      label: (
        <span>
          <ShopOutlined />
          Geral
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
        <Card title="Horário de Funcionamento">
          <Form.Item
            name="workDays"
            label="Dias de Funcionamento"
            rules={[{ required: true, message: 'Selecione ao menos um dia' }]}
          >
            <Checkbox.Group options={weekDays} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="workStart"
                label="Horário de Abertura"
                rules={[{ required: true }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="workEnd"
                label="Horário de Fechamento"
                rules={[{ required: true }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="slotDuration"
                label="Duração do Slot (minutos)"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value={15}>15 minutos</Select.Option>
                  <Select.Option value={30}>30 minutos</Select.Option>
                  <Select.Option value={60}>60 minutos</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5}>Agendamento Online</Title>

          <Form.Item
            name="onlineBookingEnabled"
            valuePropName="checked"
            label="Habilitar agendamento online"
          >
            <Switch />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxAdvanceDays"
                label="Máximo de dias para agendar"
              >
                <InputNumber
                  min={1}
                  max={365}
                  style={{ width: '100%' }}
                  addonAfter="dias"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="minAdvanceHours"
                label="Antecedência mínima"
              >
                <InputNumber
                  min={0}
                  max={72}
                  style={{ width: '100%' }}
                  addonAfter="horas"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="requireApproval"
            valuePropName="checked"
            label="Exigir aprovação dos agendamentos"
          >
            <Switch />
          </Form.Item>
        </Card>
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
          loading={loading}
        >
          Salvar Alterações
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Tabs items={tabItems} />
      </Form>
    </div>
  )
}
