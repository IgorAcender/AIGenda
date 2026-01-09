'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Switch, Button, notification } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

interface Category {
  id?: string
  name: string
  description?: string
  active?: boolean
}

interface CategoryFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (category: Category) => void
  editingCategory?: Category | null
}

export function CategoryFormModal({
  open,
  onClose,
  onSuccess,
  editingCategory,
}: CategoryFormModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const { mutate: saveCategory, isPending: isSaving } = useApiMutation(
    async (categoryData) => {
      if (editingCategory?.id) {
        return await api.put(`/categories/${editingCategory.id}`, categoryData)
      } else {
        return await api.post('/categories', categoryData)
      }
    },
    [['categories']]
  )

  useEffect(() => {
    if (editingCategory) {
      form.setFieldsValue({
        name: editingCategory.name,
        description: editingCategory.description,
        active: editingCategory.active ?? true,
      })
    } else {
      form.resetFields()
    }
  }, [editingCategory, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      saveCategory(values, {
        onSuccess: (response: any) => {
          notification.success({
            message: 'Sucesso!',
            description: editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!',
            placement: 'topRight',
          })
          onSuccess(response)
          onClose()
          form.resetFields()
        },
        onError: (error: any) => {
          notification.error({
            message: 'Erro ao salvar',
            description: error?.response?.data?.message || error?.message || 'Erro ao salvar categoria',
            placement: 'topRight',
          })
          console.error('Erro ao salvar categoria:', error)
        },
      })
    } catch (error) {
      console.error('Erro ao validar formulário:', error)
      notification.error({
        message: 'Erro de validação',
        description: 'Por favor, verifique os dados do formulário',
        placement: 'topRight',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalWithSidebar
      title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
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
          label="* Nome da Categoria"
          rules={[
            { required: true, message: 'Nome é obrigatório' },
            { min: 3, message: 'Mínimo 3 caracteres' },
          ]}
        >
          <Input placeholder="Ex: Cuidados" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <Input.TextArea
            rows={4}
            placeholder="Descrição da categoria"
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
