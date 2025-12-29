'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Switch, Button, Select, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { useApiPaginatedQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface Product {
  id?: string
  name: string
  description?: string
  categoryId?: string
  price: number
  quantity?: number
  active?: boolean
}

interface Category {
  id: string
  name: string
}

const modalStyle = `
  .product-modal .ant-modal {
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
  
  .product-modal .ant-modal-content {
    height: 100vh !important;
    padding: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .product-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0 !important;
    padding: 16px 24px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .product-modal .ant-modal-body {
    height: calc(100vh - 140px) !important;
    overflow-y: auto !important;
    padding: 24px !important;
    flex: 1 !important;
  }
  
  .product-modal .ant-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #f0f0f0 !important;
    flex-shrink: 0 !important;
  }
  
  @media (max-width: 768px) {
    .product-modal .ant-modal {
      width: 100% !important;
    }
  }
`

interface ProductFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (product: Product) => void
  editingProduct?: Product | null
}

export function ProductFormModal({
  open,
  onClose,
  onSuccess,
  editingProduct,
}: ProductFormModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const { data: categoriesData } = useApiPaginatedQuery(
    'categories',
    '/categories',
    1,
    100,
    { staleTime: 5 * 60 * 1000 }
  )

  const { mutate: saveProduct, isPending: isSaving } = useApiMutation(
    async (productData) => {
      if (editingProduct?.id) {
        return await api.put(`/products/${editingProduct.id}`, productData)
      } else {
        return await api.post('/products', productData)
      }
    },
    [['products']]
  )

  useEffect(() => {
    if (editingProduct) {
      form.setFieldsValue({
        name: editingProduct.name,
        description: editingProduct.description,
        categoryId: editingProduct.categoryId,
        price: editingProduct.price,
        quantity: editingProduct.quantity,
        active: editingProduct.active ?? true,
      })
    } else {
      form.resetFields()
    }
  }, [editingProduct, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      saveProduct(values, {
        onSuccess: (response: any) => {
          message.success(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!')
          onSuccess(response.data || response)
          onClose()
          form.resetFields()
          setSubmitting(false)
        },
        onError: (error: any) => {
          message.error(error.message || 'Erro ao salvar produto')
          setSubmitting(false)
        },
      })
    } catch (error) {
      console.error('Erro ao validar formulário:', error)
      setSubmitting(false)
    }
  }

  const categories = categoriesData?.data || []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <Modal
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
        open={open}
        onCancel={onClose}
        footer={null}
        width="60%"
        wrapClassName="product-modal"
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
            label="Nome do Produto"
            rules={[
              { required: true, message: 'Nome é obrigatório' },
              { min: 3, message: 'Mínimo 3 caracteres' },
            ]}
          >
            <Input placeholder="Ex: Shampoo" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Descrição"
          >
            <Input.TextArea
              rows={4}
              placeholder="Descrição do produto"
            />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoria"
          >
            <Select
              placeholder="Selecione uma categoria"
              allowClear
            >
              {categories.map((category: Category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
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
            name="quantity"
            label="Quantidade"
          >
            <InputNumber
              min={0}
              placeholder="0"
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
            {editingProduct ? 'Atualizar' : 'Criar'} Produto
          </Button>
        </div>
      </Modal>
    </>
  )
}
