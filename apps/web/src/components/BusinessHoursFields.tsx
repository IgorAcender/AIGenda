'use client'

import React, { useState } from 'react'
import {
  Form,
  Button,
  Typography,
  message,
  TimePicker,
  Checkbox,
  Divider,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useApiMutation } from '@/hooks/useApi'

const { Title, Text } = Typography

interface BusinessHoursFieldsProps {
  form: any
  enabledDays: any
  setEnabledDays: any
  onSaveSuccess?: () => void
  showSaveButton?: boolean
}

/**
 * Componente que renderiza a tabela de horários de funcionamento
 * Reutilizável em qualquer formulário (configurações, modal, etc)
 * Já funciona com a estrutura de businessHours da API
 */
export function BusinessHoursFields({
  form,
  enabledDays,
  setEnabledDays,
  onSaveSuccess,
  showSaveButton = true,
}: BusinessHoursFieldsProps) {
  // Mutation para salvar
  const { mutate: saveConfig, isPending: saving } = useApiMutation(
    async (payload: any) => {
      const { data } = await import('@/lib/api').then(m => m.api.put('/tenants/branding', payload))
      return data
    },
    [['branding']]
  )

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

      const payload: any = {}
      if (Object.keys(businessHours).length > 0) {
        payload.businessHours = businessHours
      }

      console.log('Payload enviado para /tenants/branding:', payload)

      saveConfig(payload, {
        onSuccess: () => {
          message.success('Horários salvos com sucesso!')
          onSaveSuccess?.()
        },
        onError: (error: any) => {
          console.error('Erro ao salvar:', error)
          message.error('Erro ao salvar horários: ' + (error?.message || 'Erro desconhecido'))
        },
      })
    } catch (error) {
      console.error('Erro:', error)
      message.error('Erro ao processar os horários')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                          setEnabledDays((prev: any) => ({
                            ...prev,
                            [day.value]: e.target.checked,
                          }))
                        }}
                        style={{ cursor: 'pointer' }}
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
                    <Form.Item name={`${day.value}_lunch_start`} style={{ marginBottom: 0 }}>
                      <TimePicker
                        format="HH:mm"
                        placeholder="12:00"
                        disabled={!isEnabled}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <Form.Item name={`${day.value}_lunch_end`} style={{ marginBottom: 0 }}>
                      <TimePicker
                        format="HH:mm"
                        placeholder="13:30"
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
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showSaveButton && (
        <>
          <Divider />
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            block
            size="large"
          >
            Salvar Horários
          </Button>
        </>
      )}
    </div>
  )
}
