'use client'

import React, { useState } from 'react'
import {
  Modal,
  Form,
} from 'antd'
import { BusinessHoursFields } from './BusinessHoursFields'
import dayjs from 'dayjs'

interface BusinessHoursModalProps {
  visible: boolean
  onClose: () => void
  configData?: any
}

// Dias da semana
const daysConfig = [
  { key: 'sunday', label: 'Domingo' },
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
]

/**
 * Modal para configurar horários de funcionamento
 * Reutiliza o BusinessHoursFields que já funciona
 */
export function BusinessHoursModal({
  visible,
  onClose,
  configData,
}: BusinessHoursModalProps) {
  const [form] = Form.useForm()
  const [enabledDays, setEnabledDays] = useState<Record<string, boolean>>(() => {
    // Inicializar dias habilitados
    const initial: Record<string, boolean> = {}
    daysConfig.forEach(d => {
      initial[d.key] = d.key !== 'sunday' && d.key !== 'saturday'
    })
    return initial
  })

  React.useEffect(() => {
    if (visible && configData?.businessHours) {
      const fieldsToSet: any = {}
      const businessHours = configData.businessHours
      const daysMap = [
        'sunday', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday'
      ]

      daysMap.forEach((dayName) => {
        const hoursData = businessHours[dayName]

        if (hoursData && hoursData !== 'Fechado') {
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
        }
      })

      form.setFieldsValue(fieldsToSet)
    }
  }, [visible, configData, form])

  return (
    <Modal
      title="Configurar Horários de Funcionamento"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      <Form form={form} layout="vertical">
        <BusinessHoursFields
          form={form}
          enabledDays={enabledDays}
          setEnabledDays={setEnabledDays}
          onSaveSuccess={onClose}
          showSaveButton={true}
        />
      </Form>
    </Modal>
  )
}
