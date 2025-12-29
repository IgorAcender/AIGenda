'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Button, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { Service, serviceService } from '@/services/serviceService'
import { api } from '@/lib/api'

const modalStyle = `
  .service-modal .ant-modal {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100vh !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
  }
  
  .service-modal .ant-modal-content {
    height: 100vh !important;
    padding: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .service-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0 !important;
    padding: 16px 24px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .service-modal .ant-modal-body {
    height: calc(100vh - 140px) !important;
    overflow-y: auto !important;
    padding: 24px !important;
    flex: 1 !important;
  }
  
  .service-modal .ant-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #f0f0f0 !important;
    flex-shrink: 0 !important;
  }
  
  @media (max-width: 768px) {
    .service-modal .ant-modal {
      width: 100% !important;
    }
  }
`

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
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <Modal
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        open={open}
        onCancel={onClose}
        footer={null}
        width="60%"
        wrapClassName="service-modal"
        styles={{
          content: { padding: 0, borderRadius: 0 }
        }}
        bodyStyle={{ padding: 0, height: 'calc(100vh - 140px)' }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ padding: 0 }}
        >
          <Form.Item
            name="name"
            label="Nome do Serviço"
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
            label="Duração (minutos)"
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
            label="Preço (R$)"
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

        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '60%',
          padding: '16px 24px',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          zIndex: 999,
        }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="primary"
            loading={isSaving || submitting}
            onClick={handleSave}
          >
            {editingService ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </div>
      </Modal>
    </>
  )
}
