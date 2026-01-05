'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  Button,
  Typography,
  message,
  Row,
  Col,
  TimePicker,
  Checkbox,
  Select,
  Divider,
  Switch,
  InputNumber,
  Spin,
  Card,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'

const { Title, Text } = Typography

/**
 * Componente de configuração de horários de funcionamento
 * Pode ser usado standalone ou dentro de um modal
 */
export function HorariosConfig({ onSuccess }: { onSuccess?: () => void }) {
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
      const fieldsToSet: any = {
        onlineBookingEnabled: configData.onlineBookingEnabled,
        minAdvanceHours: configData.minAdvanceHours,
        maxAdvanceDays: configData.maxAdvanceDays,
        slotDuration: configData.slotDuration,
      }

      // Carregar businessHours (horários da tabela)
      if (configData.businessHours) {
        const bh = configData.businessHours
        const dayMapping: Record<number, string> = {
          0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
          4: 'thursday', 5: 'friday', 6: 'saturday'
        }

        const newEnabledDays = { ...enabledDays }

        for (let i = 0; i < 7; i++) {
          const dayName = dayMapping[i]
          const dayHours = bh[i] || bh[String(i)]
          
          if (dayHours && dayHours.enabled !== undefined) {
            newEnabledDays[dayName as keyof typeof enabledDays] = dayHours.enabled
          }
          
          if (dayHours) {
            if (dayHours.start) {
              fieldsToSet[`${dayName}_start`] = dayjs(dayHours.start, 'HH:mm')
            }
            if (dayHours.end) {
              fieldsToSet[`${dayName}_end`] = dayjs(dayHours.end, 'HH:mm')
            }
            if (dayHours.lunchStart) {
              fieldsToSet[`${dayName}_lunch_start`] = dayjs(dayHours.lunchStart, 'HH:mm')
            }
            if (dayHours.lunchEnd) {
              fieldsToSet[`${dayName}_lunch_end`] = dayjs(dayHours.lunchEnd, 'HH:mm')
            }
          }
        }

        setEnabledDays(newEnabledDays)
      }

      form.setFieldsValue(fieldsToSet)
    }
  }, [configData])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      // Construir objeto businessHours a partir dos campos da tabela
      const businessHours: Record<string, any> = {}
      const dayMapping = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      
      dayMapping.forEach((day, index) => {
        const isEnabled = enabledDays[day as keyof typeof enabledDays]
        businessHours[index] = {
          enabled: isEnabled,
          start: values[`${day}_start`] ? values[`${day}_start`].format('HH:mm') : '08:00',
          end: values[`${day}_end`] ? values[`${day}_end`].format('HH:mm') : '19:00',
          lunchStart: values[`${day}_lunch_start`] ? values[`${day}_lunch_start`].format('HH:mm') : '12:00',
          lunchEnd: values[`${day}_lunch_end`] ? values[`${day}_lunch_end`].format('HH:mm') : '13:30',
        }
      })

      const payload = {
        businessHours,
        onlineBookingEnabled: values.onlineBookingEnabled,
        minAdvanceHours: values.minAdvanceHours,
        maxAdvanceDays: values.maxAdvanceDays,
        slotDuration: values.slotDuration,
      }

      saveConfig(payload, {
        onSuccess: () => {
          message.success('Horários salvos com sucesso!')
          onSuccess?.()
        },
        onError: () => {
          message.error('Erro ao salvar horários')
        },
      })
    } catch (error) {
      console.error('Erro na validação:', error)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <Form form={form} layout="vertical">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>Horário de Funcionamento</Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
        >
          Salvar Horários
        </Button>
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Configure o horário padrão da empresa para cada dia da semana.
      </Text>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #d9d9d9' }}>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Dia</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Início</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Intervalo Início</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Intervalo Fim</th>
              <th style={{ padding: '10px', textAlign: 'left', fontWeight: 600, fontSize: 12 }}>Fim</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Domingo', value: 'sunday' },
              { name: 'Segunda', value: 'monday' },
              { name: 'Terça', value: 'tuesday' },
              { name: 'Quarta', value: 'wednesday' },
              { name: 'Quinta', value: 'thursday' },
              { name: 'Sexta', value: 'friday' },
              { name: 'Sábado', value: 'saturday' },
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
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Checkbox
                        checked={isEnabled}
                        onChange={(e) => {
                          setEnabledDays(prev => ({
                            ...prev,
                            [day.value]: e.target.checked
                          }))
                        }}
                      />
                      <span style={{ 
                        fontWeight: 500,
                        fontSize: 13,
                        color: isEnabled ? '#1a1a1a' : '#999999'
                      }}>
                        {day.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Form.Item name={`${day.value}_start`} style={{ marginBottom: 0 }}>
                      <TimePicker 
                        format="HH:mm" 
                        placeholder="08:00"
                        disabled={!isEnabled}
                        size="small"
                        style={{ width: 90 }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Form.Item name={`${day.value}_lunch_start`} style={{ marginBottom: 0 }}>
                      <TimePicker 
                        format="HH:mm" 
                        placeholder="12:00"
                        disabled={!isEnabled}
                        size="small"
                        style={{ width: 90 }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Form.Item name={`${day.value}_lunch_end`} style={{ marginBottom: 0 }}>
                      <TimePicker 
                        format="HH:mm" 
                        placeholder="13:30"
                        disabled={!isEnabled}
                        size="small"
                        style={{ width: 90 }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <Form.Item name={`${day.value}_end`} style={{ marginBottom: 0 }}>
                      <TimePicker 
                        format="HH:mm" 
                        placeholder="19:00"
                        disabled={!isEnabled}
                        size="small"
                        style={{ width: 90 }}
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
          <Form.Item name="maxAdvanceDays" label="Máximo de dias para agendar">
            <InputNumber min={1} max={365} style={{ width: '100%' }} addonAfter="dias" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="minAdvanceHours" label="Antecedência mínima">
            <InputNumber min={0} max={72} style={{ width: '100%' }} addonAfter="horas" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="slotDuration" label="Duração do Slot (minutos)">
            <Select placeholder="Selecione a duração">
              <Select.Option value={15}>15 minutos</Select.Option>
              <Select.Option value={30}>30 minutos</Select.Option>
              <Select.Option value={60}>60 minutos</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="onlineBookingEnabled" valuePropName="checked" label="Habilitar agendamento online">
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
