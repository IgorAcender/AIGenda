'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Switch, Button, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface Category {
  id?: string
  name: string
  description?: string
  active?: boolean
}

const modalStyle = `
  .category-modal .ant-modal {
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
  
  .category-modal .ant-modal-content {
    height: 100vh !important;
    padding: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .category-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0 !important;
    padding: 16px 24px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .category-modal .ant-modal-body {
    height: calc(100vh - 140px) !important;
    overflow-y: auto !important;
    padding: 24px !important;
    flex: 1 !important;
  }
  
  .category-modal .ant-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #f0f0f0 !important;
    flex-shrink: 0 !important;
  }
  
  @media (max-width: 768px) {
    .category-modal .ant-modal {
      width: 100% !important;
    }
  }
`

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
          message.success(editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!')
          onSuccess(response.data || response)
          onClose()
          form.resetFields()
          setSubmitting(false)
        },
        onError: (error: any) => {
          message.error(error.message || 'Erro ao salvar categoria')
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
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={open}
        onCancel={onClose}
        footer={null}
        width="60%"
        wrapClassName="category-modal"
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
            label="Nome da Categoria"
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
            {editingCategory ? 'Atualizar' : 'Criar'} Categoria
          </Button>
        </div>
      </Modal>
    </>
  )
}
