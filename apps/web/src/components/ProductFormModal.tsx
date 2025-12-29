'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Select, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { useApiPaginatedQuery } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

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
    <ModalWithSidebar
      title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
          label="* Nome do Produto"
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
    </ModalWithSidebar>
  )
}
