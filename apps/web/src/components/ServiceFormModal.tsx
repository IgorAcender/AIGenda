'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Button, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { Service, serviceService } from '@/services/serviceService'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

interface ServiceFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (service: Service) => void
  editingService?: Service | null
}

export function ServiceFormModal({
  open,
  onClose,
  onSuccess,
  editingService,
}: ServiceFormModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Mutation para salvar serviço
  const { mutate: saveService, isPending: isSaving } = useApiMutation(
    async (serviceData) => {
      if (editingService?.id) {
        return await api.put(`/services/${editingService.id}`, serviceData)
      } else {
        return await api.post('/services', serviceData)
      }
    },
    [['services']]
  )

  useEffect(() => {
    if (editingService) {
      form.setFieldsValue({
        name: editingService.name,
        description: editingService.description,
        duration: editingService.duration,
        price: editingService.price,
        active: editingService.active,
      })
    } else {
      form.resetFields()
    }
  }, [editingService, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      saveService(values, {
        onSuccess: (response: any) => {
          message.success(editingService ? 'Serviço atualizado com sucesso!' : 'Serviço criado com sucesso!')
          onSuccess(response.data || response)
          onClose()
          form.resetFields()
          setSubmitting(false)
        },
        onError: (error: any) => {
          message.error(error.message || 'Erro ao salvar serviço')
          setSubmitting(false)
        },
      })
    } catch (error) {
      console.error('Erro ao validar formulário:', error)
      setSubmitting(false)
    }
  }

  return (
    <ModalWithSidebar
      title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving || submitting}
      tabs={[]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        <Form.Item
          name="name"
          label="* Nome do Serviço"
          rules={[
            { required: true, message: 'Nome é obrigatório' },
            { min: 3, message: 'Mínimo 3 caracteres' },
          ]}
        >
          <Input placeholder="Ex: Corte de cabelo" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <Input.TextArea
            rows={4}
            placeholder="Descrição do serviço"
          />
        </Form.Item>

        <Form.Item
          name="duration"
          label="* Duração (minutos)"
          rules={[{ required: true, message: 'Duração é obrigatória' }]}
        >
          <InputNumber
            min={1}
            placeholder="30"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="price"
          label="* Preço (R$)"
          rules={[{ required: true, message: 'Preço é obrigatório' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            precision={2}
            placeholder="0.00"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="active"
          label="Ativo"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </ModalWithSidebar>
  )
}
