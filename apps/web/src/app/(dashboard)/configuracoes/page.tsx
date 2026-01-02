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
  const [enabledDays, setEnabledDays] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
  })

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
        // Agendamento
        onlineBookingEnabled: configData.onlineBookingEnabled,
        minAdvanceHours: configData.minAdvanceHours,
        maxAdvanceDays: configData.maxAdvanceDays,
        slotDuration: configData.slotDuration,
        // Notificações
        emailNotifications: configData.emailNotifications,
        smsNotifications: configData.smsNotifications,
        whatsappNotifications: configData.whatsappNotifications,
        reminderHours: configData.reminderHours,
      }

      // Carregar businessHours (horários da tabela)
      if (configData.businessHours && typeof configData.businessHours === 'object') {
        const businessHours = configData.businessHours
        const daysMap = [
          'sunday', 'monday', 'tuesday', 'wednesday', 
          'thursday', 'friday', 'saturday'
        ]

        // Resetar enabledDays baseado nos dados salvos
        const newEnabledDays = { ...enabledDays }
        
        daysMap.forEach((dayName) => {
          const hoursData = businessHours[dayName]
          
          if (hoursData && hoursData !== 'Fechado') {
            // Dia está aberto
            newEnabledDays[dayName as keyof typeof enabledDays] = true
            
            // Parse "08:00 - 18:00" ou "08:00 - 18:00 (Intervalo: 12:00-13:30)"
            const match = hoursData.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})(?:\s*\(Intervalo:\s*(\d{2}):(\d{2})-(\d{2}):(\d{2})\))?/)
            
            if (match) {
              const startHour = match[1]
              const startMin = match[2]
              const endHour = match[3]
              const endMin = match[4]
              const lunchStartHour = match[5]
              const lunchStartMin = match[6]
              const lunchEndHour = match[7]
              const lunchEndMin = match[8]

              fieldsToSet[`${dayName}_start`] = dayjs(`${startHour}:${startMin}`, 'HH:mm')
              fieldsToSet[`${dayName}_end`] = dayjs(`${endHour}:${endMin}`, 'HH:mm')
              
              if (lunchStartHour) {
                fieldsToSet[`${dayName}_lunch_start`] = dayjs(`${lunchStartHour}:${lunchStartMin}`, 'HH:mm')
                fieldsToSet[`${dayName}_lunch_end`] = dayjs(`${lunchEndHour}:${lunchEndMin}`, 'HH:mm')
              }
            }
          } else {
            // Dia está fechado
            newEnabledDays[dayName as keyof typeof enabledDays] = false
          }
        })

        setEnabledDays(newEnabledDays)
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

      // HORÁRIOS - Construir objeto businessHours a partir dos campos da tabela
      const businessHours: any = {}
      const daysMap = [
        { dayName: 'sunday', label: 'Domingo' },
        { dayName: 'monday', label: 'Segunda-Feira' },
        { dayName: 'tuesday', label: 'Terça-Feira' },
        { dayName: 'wednesday', label: 'Quarta-Feira' },
        { dayName: 'thursday', label: 'Quinta-Feira' },
        { dayName: 'friday', label: 'Sexta-Feira' },
        { dayName: 'saturday', label: 'Sábado' },
      ]

      daysMap.forEach(({ dayName }) => {
        const isEnabled = enabledDays[dayName as keyof typeof enabledDays]
        
        if (!isEnabled) {
          businessHours[dayName] = 'Fechado'
        } else {
          const startTime = values[`${dayName}_start`]
          const endTime = values[`${dayName}_end`]
          const lunchStart = values[`${dayName}_lunch_start`]
          const lunchEnd = values[`${dayName}_lunch_end`]

          let hoursString = ''
          
          if (startTime && endTime) {
            const start = startTime.format ? startTime.format('HH:mm') : startTime
            const end = endTime.format ? endTime.format('HH:mm') : endTime
            hoursString = `${start} - ${end}`

            if (lunchStart && lunchEnd) {
              const lStart = lunchStart.format ? lunchStart.format('HH:mm') : lunchStart
              const lEnd = lunchEnd.format ? lunchEnd.format('HH:mm') : lunchEnd
              hoursString += ` (Intervalo: ${lStart}-${lEnd})`
            }
          }

          if (hoursString) {
            businessHours[dayName] = hoursString
          }
        }
      })

      if (Object.keys(businessHours).length > 0) {
        payload.businessHours = businessHours
      }

      // Dados de agendamento (aba Horários)
      if (values.onlineBookingEnabled !== undefined) payload.onlineBookingEnabled = values.onlineBookingEnabled
      if (values.minAdvanceHours !== undefined) payload.minAdvanceHours = values.minAdvanceHours
      if (values.maxAdvanceDays !== undefined) payload.maxAdvanceDays = values.maxAdvanceDays
      if (values.slotDuration !== undefined) payload.slotDuration = values.slotDuration

      // Notificações
      if (values.emailNotifications !== undefined) payload.emailNotifications = values.emailNotifications
      if (values.smsNotifications !== undefined) payload.smsNotifications = values.smsNotifications
      if (values.whatsappNotifications !== undefined) payload.whatsappNotifications = values.whatsappNotifications
      if (values.reminderHours !== undefined) payload.reminderHours = values.reminderHours

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
        <Card title="Horário de Funcionamento Padrão da Empresa">
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary">
              Configure o horário padrão da empresa para cada dia da semana. Cada profissional poderá ter um horário personalizado posteriormente.
            </Text>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #d9d9d9' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Dias de Atendimento</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Início Expediente</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Início Intervalo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Fim Intervalo</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Fim Expediente</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Domingo', value: 'sunday', index: 0 },
                  { name: 'Segunda-Feira', value: 'monday', index: 1 },
                  { name: 'Terça-Feira', value: 'tuesday', index: 2 },
                  { name: 'Quarta-Feira', value: 'wednesday', index: 3 },
                  { name: 'Quinta-Feira', value: 'thursday', index: 4 },
                  { name: 'Sexta-Feira', value: 'friday', index: 5 },
                  { name: 'Sábado', value: 'saturday', index: 6 },
                ].map((day) => {
                  const isEnabled = enabledDays[day.value as keyof typeof enabledDays]
                  
                  return (
                    <tr 
                      key={day.value} 
                      style={{ 
                        borderBottom: '1px solid #e8e8e8',
                        backgroundColor: isEnabled ? '#ffffff' : '#f5f5f5',
                        opacity: isEnabled ? 1 : 0.6,
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Checkbox
                            checked={isEnabled}
                            onChange={(e) => {
                              setEnabledDays(prev => ({
                                ...prev,
                                [day.value]: e.target.checked
                              }))
                            }}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ 
                            fontWeight: 500,
                            color: isEnabled ? '#1a1a1a' : '#999999'
                          }}>
                            {day.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Form.Item
                          name={`${day.value}_start`}
                          style={{ marginBottom: 0 }}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            placeholder="08:00"
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Form.Item
                          name={`${day.value}_lunch_start`}
                          style={{ marginBottom: 0 }}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            placeholder="12:00"
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Form.Item
                          name={`${day.value}_lunch_end`}
                          style={{ marginBottom: 0 }}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            placeholder="13:30"
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Form.Item
                          name={`${day.value}_end`}
                          style={{ marginBottom: 0 }}
                        >
                          <TimePicker 
                            format="HH:mm" 
                            placeholder="19:00"
                            disabled={!isEnabled}
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Divider />

          <Title level={5}>Configurações de Agendamento Online</Title>

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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="slotDuration"
                label="Duração do Slot (minutos)"
              >
                <Select placeholder="Selecione a duração">
                  <Select.Option value={15}>15 minutos</Select.Option>
                  <Select.Option value={30}>30 minutos</Select.Option>
                  <Select.Option value={60}>60 minutos</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="onlineBookingEnabled"
                valuePropName="checked"
                label="Habilitar agendamento online"
              >
                <Switch />
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
