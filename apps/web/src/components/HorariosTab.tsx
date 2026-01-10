'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  Card,
  TimePicker,
  Divider,
  Typography,
  Row,
  Col,
  InputNumber,
  Select,
  Switch,
  Button,
  notification,
  Spin,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { api } from '@/lib/api'

const DAYS_MAP = [
  { name: 'Domingo', value: 'sunday', index: 0 },
  { name: 'Segunda-Feira', value: 'monday', index: 1 },
  { name: 'Terça-Feira', value: 'tuesday', index: 2 },
  { name: 'Quarta-Feira', value: 'wednesday', index: 3 },
  { name: 'Quinta-Feira', value: 'thursday', index: 4 },
  { name: 'Sexta-Feira', value: 'friday', index: 5 },
  { name: 'Sábado', value: 'saturday', index: 6 },
]

type EnabledState = Record<string, boolean>
type IntervalState = Record<string, boolean>

// Utilitário compartilhado para montar o payload de horários a partir do formulário
export function buildBusinessHoursPayload(
  values: Record<string, any>,
  enabledFallback?: EnabledState,
  intervalFallback?: IntervalState,
  options?: { skipIfEmpty?: boolean }
) {
  const businessHours: Record<string, string> = {}
  let hasAnyValue = false

  DAYS_MAP.forEach(({ value: dayName }) => {
    const enabled = values?.[`${dayName}_enabled`]
      ?? enabledFallback?.[dayName]
      ?? false
    const intervalEnabled = values?.[`${dayName}_interval_enabled`]
      ?? intervalFallback?.[dayName]
      ?? false

    if (values?.hasOwnProperty?.(`${dayName}_enabled`) || enabledFallback) {
      hasAnyValue = true
    }

    if (!enabled) {
      businessHours[dayName] = 'Fechado'
      return
    }

    const startTime = values?.[`${dayName}_start`]
    const endTime = values?.[`${dayName}_end`]

    if (!startTime || !endTime) return

    hasAnyValue = true

    const start = startTime.format ? startTime.format('HH:mm') : startTime
    const end = endTime.format ? endTime.format('HH:mm') : endTime

    let hoursString = `${start} - ${end}`

    if (intervalEnabled) {
      const intervalStart = values?.[`${dayName}_interval_start`]
      const intervalEnd = values?.[`${dayName}_interval_end`]

      if (intervalStart && intervalEnd) {
        hasAnyValue = true

        const iStart = intervalStart.format ? intervalStart.format('HH:mm') : intervalStart
        const iEnd = intervalEnd.format ? intervalEnd.format('HH:mm') : intervalEnd
        hoursString += ` (Intervalo: ${iStart}-${iEnd})`
      }
    }

    businessHours[dayName] = hoursString
  })

  if (options?.skipIfEmpty && !hasAnyValue) {
    return {}
  }

  return businessHours
}

const { Text } = Typography

interface HorariosTabProps {
  // Props opcionais para reutilizar em abas de formulários
  form?: any
  configData?: any
  onSaveSuccess?: () => void
}

/**
 * Componente de horários completamente autossuficiente
 * Pode ser usado:
 * 1. Dentro do Modal (sem props) - busca dados da API e gerencia seu próprio form
 * 2. Dentro de uma aba (com props) - reutiliza form e configData externos
 */
export function HorariosTab({
  form: externalForm,
  configData: externalConfigData,
  onSaveSuccess,
}: HorariosTabProps) {
  const [localForm] = Form.useForm()
  const form = externalForm || localForm
  const [loading, setLoading] = useState(!externalConfigData)
  const [saving, setSaving] = useState(false)
  const [configData, setConfigData] = useState<any>(externalConfigData || null)

  const [enabledDays, setEnabledDays] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
  })

  // Estado para intervalo por dia
  const [intervalEnabled, setIntervalEnabled] = useState({
    sunday: false,
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
  })

  // Sincroniza switches com o form externo para permitir salvar pelo botão global
  useEffect(() => {
    const switchValues: Record<string, boolean> = {}
    DAYS_MAP.forEach(({ value }) => {
      switchValues[`${value}_enabled`] = enabledDays[value as keyof typeof enabledDays]
      switchValues[`${value}_interval_enabled`] = intervalEnabled[value as keyof typeof intervalEnabled]
    })
    form.setFieldsValue(switchValues)
  }, [enabledDays, intervalEnabled, form])

  // Carregar dados diretamente da API quando não recebe configData externa
  useEffect(() => {
    if (!externalConfigData) {
      console.log('🔄 HorariosTab: Carregando dados diretamente da API...')
      setLoading(true)
      api.get('/tenants/branding')
        .then((response) => {
          console.log('✅ Dados carregados:', response.data)
          setConfigData(response.data)
        })
        .catch((error) => {
          console.error('❌ Erro ao carregar:', error)
          notification.error({
            message: 'Erro',
            description: 'Erro ao carregar configurações',
            placement: 'topRight',
          })
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [externalConfigData])

  // Carregar dados quando component monta
  useEffect(() => {
    if (configData) {
      const fieldsToSet: any = {
        onlineBookingEnabled: configData.onlineBookingEnabled,
        minAdvanceHours: configData.minAdvanceHours,
        maxAdvanceDays: configData.maxAdvanceDays,
        slotDuration: configData.slotDuration,
      }

      // Carregar businessHours (horários da tabela)
      if (configData.businessHours && typeof configData.businessHours === 'object') {
        const businessHours = configData.businessHours
        // Resetar enabledDays e intervalEnabled baseado nos dados salvos
        const newEnabledDays = { ...enabledDays }
        const newIntervalEnabled = { ...intervalEnabled }

        DAYS_MAP.forEach(({ value: dayName }) => {
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

              // Detectar intervalo para este dia
              if (lunchStartHour) {
                newIntervalEnabled[dayName as keyof typeof intervalEnabled] = true
                fieldsToSet[`${dayName}_interval_start`] = dayjs(`${lunchStartHour}:${lunchStartMin}`, 'HH:mm')
                fieldsToSet[`${dayName}_interval_end`] = dayjs(`${lunchEndHour}:${lunchEndMin}`, 'HH:mm')
              }
            }
          } else {
            // Dia está fechado
            newEnabledDays[dayName as keyof typeof enabledDays] = false
          }
        })

        // Guardar switches no formulário para serem reutilizados pelo botão global
        DAYS_MAP.forEach(({ value: dayName }) => {
          fieldsToSet[`${dayName}_enabled`] = newEnabledDays[dayName as keyof typeof enabledDays]
          fieldsToSet[`${dayName}_interval_enabled`] = newIntervalEnabled[dayName as keyof typeof intervalEnabled]
        })

        setEnabledDays(newEnabledDays)
        setIntervalEnabled(newIntervalEnabled)
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

      // HORÁRIOS - Construir objeto businessHours a partir dos campos da tabela
      const businessHours = buildBusinessHoursPayload(values, enabledDays, intervalEnabled)

      if (businessHours && Object.keys(businessHours).length > 0) {
        payload.businessHours = businessHours
      }

      // Dados de agendamento (aba Horários)
      if (values.onlineBookingEnabled !== undefined) payload.onlineBookingEnabled = values.onlineBookingEnabled
      if (values.minAdvanceHours !== undefined) payload.minAdvanceHours = values.minAdvanceHours
      if (values.maxAdvanceDays !== undefined) payload.maxAdvanceDays = values.maxAdvanceDays
      if (values.slotDuration !== undefined) payload.slotDuration = values.slotDuration

      console.log('📝 Payload enviado para /tenants/branding:', payload)

      setSaving(true)
      try {
        console.log('🔄 Enviando PUT para /tenants/branding...')
        const response = await api.put('/tenants/branding', payload)
        console.log('✅ Resposta recebida:', response)
        notification.success({
          message: 'Sucesso!',
          description: 'Configurações salvas com sucesso!',
          placement: 'topRight',
        })
        onSaveSuccess?.()
      } catch (error: any) {
        console.error('❌ Erro ao salvar:', error)
        console.error('Error response:', error?.response?.data)
        notification.error({
          message: 'Erro ao salvar',
          description: 'Erro ao salvar configurações: ' + (error?.message || error?.response?.data?.message || 'Erro desconhecido'),
          placement: 'topRight',
        })
      } finally {
        setSaving(false)
      }
    } catch (error) {
      console.error('Erro:', error)
      notification.error({
        message: 'Erro',
        description: 'Erro ao processar as configurações',
        placement: 'topRight',
      })
    }
  }

  if (loading) {
    return (
      <Card title="Horário de Funcionamento Padrão da Empresa">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <Spin size="large" tip="Carregando horários..." />
        </div>
      </Card>
    )
  }

  return (
    <Form form={form}>
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
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, width: '180px' }}>Dias de Atendimento</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Início</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>Fim</th>
              <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, width: '280px' }}>Intervalo</th>
            </tr>
          </thead>
          <tbody>
            {DAYS_MAP.map((day) => {
              const isEnabled = enabledDays[day.value as keyof typeof enabledDays]
              const hasIntervalForDay = intervalEnabled[day.value as keyof typeof intervalEnabled]

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Switch
                        size="small"
                        checked={isEnabled}
                        onChange={(checked) => {
                          setEnabledDays((prev) => ({
                            ...prev,
                            [day.value]: checked,
                          }))
                          form.setFieldsValue({
                            [`${day.value}_enabled`]: checked,
                          })
                          if (!checked) {
                            setIntervalEnabled((prev) => ({
                              ...prev,
                              [day.value]: false,
                            }))
                            form.setFieldsValue({
                              [`${day.value}_interval_enabled`]: false,
                            })
                          }
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 500,
                          color: isEnabled ? '#1a1a1a' : '#999999',
                        }}
                      >
                        {day.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Form.Item name={`${day.value}_start`} style={{ marginBottom: 0 }}>
                      <TimePicker
                        format="HH:mm"
                        placeholder="08:00"
                        disabled={!isEnabled}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Form.Item name={`${day.value}_end`} style={{ marginBottom: 0 }}>
                      <TimePicker
                        format="HH:mm"
                        placeholder="19:00"
                        disabled={!isEnabled}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Switch
                        size="small"
                        checked={hasIntervalForDay}
                        disabled={!isEnabled}
                        onChange={(checked) => {
                          setIntervalEnabled((prev) => ({
                            ...prev,
                            [day.value]: checked,
                          }))
                          form.setFieldsValue({
                            [`${day.value}_interval_enabled`]: checked,
                          })
                        }}
                      />
                      {hasIntervalForDay && isEnabled ? (
                        <>
                          <Form.Item name={`${day.value}_interval_start`} style={{ marginBottom: 0, flex: 1 }}>
                            <TimePicker
                              format="HH:mm"
                              placeholder="12:00"
                              disabled={!isEnabled}
                              size="small"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                          <span style={{ color: '#999' }}>-</span>
                          <Form.Item name={`${day.value}_interval_end`} style={{ marginBottom: 0, flex: 1 }}>
                            <TimePicker
                              format="HH:mm"
                              placeholder="13:30"
                              disabled={!isEnabled}
                              size="small"
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </>
                      ) : (
                        <span style={{ color: '#999', fontSize: 12 }}>
                          {isEnabled ? 'Sem intervalo' : '-'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 16 }}>Configurações de Agendamento Online</h4>

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
      </div>

      <Divider />

      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave} block size="large">
        Salvar Configurações
      </Button>
    </Card>
    </Form>
  )
}
