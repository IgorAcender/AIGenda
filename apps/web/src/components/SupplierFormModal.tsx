'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Switch, message } from 'antd'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

interface Supplier {
  id?: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  description?: string
  active?: boolean
}

interface SupplierFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (supplier: Supplier) => void
  editingSupplier?: Supplier | null
}

export function SupplierFormModal({
  open,
  onClose,
  onSuccess,
  editingSupplier,
}: SupplierFormModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const { mutate: saveSupplier, isPending: isSaving } = useApiMutation(
    async (supplierData) => {
      if (editingSupplier?.id) {
        return await api.put(`/suppliers/${editingSupplier.id}`, supplierData)
      } else {
        return await api.post('/suppliers', supplierData)
      }
    },
    [['suppliers']]
  )

  useEffect(() => {
    if (editingSupplier) {
      form.setFieldsValue({
        name: editingSupplier.name,
        email: editingSupplier.email,
        phone: editingSupplier.phone,
        address: editingSupplier.address,
        city: editingSupplier.city,
        state: editingSupplier.state,
        zipCode: editingSupplier.zipCode,
        description: editingSupplier.description,
        active: editingSupplier.active ?? true,
      })
    } else {
      form.resetFields()
    }
  }, [editingSupplier, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      saveSupplier(values, {
        onSuccess: (response: any) => {
          message.success(editingSupplier ? 'Fornecedor atualizado com sucesso!' : 'Fornecedor criado com sucesso!')
          onSuccess(response)
          onClose()
          form.resetFields()
        },
        onError: (error: any) => {
          message.error(error?.response?.data?.message || error?.message || 'Erro ao salvar fornecedor')
          console.error('Erro ao salvar fornecedor:', error)
        },
      })
    } catch (error) {
      console.error('Erro ao validar formulário:', error)
      message.error('Erro ao validar formulário')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalWithSidebar
      title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
          label="* Nome do Fornecedor"
          rules={[
            { required: true, message: 'Nome é obrigatório' },
            { min: 3, message: 'Mínimo 3 caracteres' },
          ]}
        >
          <Input placeholder="Ex: Distribuidora XYZ" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: 'email', message: 'Email inválido' }]}
        >
          <Input placeholder="contato@fornecedor.com" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Telefone"
        >
          <Input placeholder="(11) 9999-9999" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Endereço"
        >
          <Input placeholder="Rua, número, complemento" />
        </Form.Item>

        <Form.Item
          name="city"
          label="Cidade"
        >
          <Input placeholder="São Paulo" />
        </Form.Item>

        <Form.Item
          name="state"
          label="Estado"
        >
          <Input placeholder="SP" maxLength={2} />
        </Form.Item>

        <Form.Item
          name="zipCode"
          label="CEP"
        >
          <Input placeholder="00000-000" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
        >
          <Input.TextArea
            rows={3}
            placeholder="Descrição do fornecedor"
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
