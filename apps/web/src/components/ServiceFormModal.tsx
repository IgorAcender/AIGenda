'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Button, message, Select, Checkbox } from 'antd'
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
  const [activeTab, setActiveTab] = useState('cadastro')

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
    setActiveTab('cadastro')
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

  const tabs = [
    { key: 'cadastro', label: 'Cadastro' },
    { key: 'configuracoes', label: 'Configurações' },
    { key: 'cashback', label: 'Cashback' },
    { key: 'cuidados', label: 'Cuidados' },
    { key: 'retorno', label: 'Retorno' },
    { key: 'comissoes', label: 'Comissões e Auxiliares' },
    { key: 'personalizar', label: 'Personalizar' },
    { key: 'produtos', label: 'Produtos consumidos' },
    { key: 'notafiscal', label: 'Configurar nota fiscal' },
  ]

  return (
    <ModalWithSidebar
      title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving || submitting}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      defaultActiveKey="cadastro"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* ABA: CADASTRO */}
        {activeTab === 'cadastro' && (
          <>
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
          </>
        )}

        {/* ABA: CONFIGURAÇÕES */}
        {activeTab === 'configuracoes' && (
          <>
            <Form.Item
              name="active"
              label="Status"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="serviceColor"
              label="Cor do Serviço"
            >
              <Input 
                type="color"
                placeholder="#505afb"
                style={{ height: '40px', cursor: 'pointer' }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Categoria"
            >
              <Select
                placeholder="Selecione uma categoria"
                options={[
                  { label: 'Cortes', value: 'cortes' },
                  { label: 'Barba', value: 'barba' },
                  { label: 'Tratamentos', value: 'tratamentos' },
                  { label: 'Alisamento', value: 'alisamento' },
                  { label: 'Coloração', value: 'coloracao' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="requiresConfirmation"
              label="Requer Confirmação?"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          </>
        )}

        {/* ABA: CASHBACK */}
        {activeTab === 'cashback' && (
          <>
            <Form.Item
              name="cashbackEnabled"
              label="Habilitar Cashback"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="cashbackPercentage"
              label="Percentual de Cashback (%)"
            >
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                precision={2}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="cashbackMinValue"
              label="Valor Mínimo para Cashback (R$)"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        {/* ABA: CUIDADOS */}
        {activeTab === 'cuidados' && (
          <>
            <Form.Item
              name="careInstructions"
              label="Instruções de Cuidado"
            >
              <Input.TextArea
                rows={5}
                placeholder="Descreva os cuidados necessários após o serviço..."
              />
            </Form.Item>

            <Form.Item
              name="careFrequency"
              label="Frequência de Cuidado Recomendada"
            >
              <Input placeholder="Ex: A cada 2 semanas" />
            </Form.Item>

            <Form.Item
              name="productsNeeded"
              label="Produtos Recomendados"
            >
              <Input.TextArea
                rows={3}
                placeholder="Liste os produtos recomendados..."
              />
            </Form.Item>
          </>
        )}

        {/* ABA: RETORNO */}
        {activeTab === 'retorno' && (
          <>
            <Form.Item
              name="returnPeriod"
              label="Período de Retorno (dias)"
            >
              <InputNumber
                min={1}
                placeholder="30"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="returnPolicy"
              label="Política de Retorno"
            >
              <Input.TextArea
                rows={4}
                placeholder="Descreva a política de retorno..."
              />
            </Form.Item>

            <Form.Item
              name="allowRefund"
              label="Permitir Reembolso"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </>
        )}

        {/* ABA: COMISSÕES E AUXILIARES */}
        {activeTab === 'comissoes' && (
          <>
            <Form.Item
              name="commissionType"
              label="Tipo de Comissão"
            >
              <Select
                placeholder="Selecione o tipo"
                options={[
                  { label: 'Percentual', value: 'percentage' },
                  { label: 'Valor Fixo', value: 'fixed' },
                  { label: 'Sem Comissão', value: 'none' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="commissionValue"
              label="Valor/Percentual de Comissão"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="auxiliarNeeded"
              label="Precisa de Auxiliar"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="auxiliarCommission"
              label="Comissão do Auxiliar"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        {/* ABA: PERSONALIZAR */}
        {activeTab === 'personalizar' && (
          <>
            <Form.Item
              name="allowCustomization"
              label="Permitir Personalização"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="customizationOptions"
              label="Opções de Personalização"
            >
              <Input.TextArea
                rows={4}
                placeholder="Liste as opções de personalização disponíveis..."
              />
            </Form.Item>

            <Form.Item
              name="customizationPrice"
              label="Preço Adicional por Personalização (R$)"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        {/* ABA: PRODUTOS CONSUMIDOS */}
        {activeTab === 'produtos' && (
          <>
            <Form.Item
              name="productsUsed"
              label="Produtos Utilizados no Serviço"
            >
              <Input.TextArea
                rows={5}
                placeholder="Liste os produtos consumidos neste serviço (um por linha)..."
              />
            </Form.Item>

            <Form.Item
              name="averageProductCost"
              label="Custo Médio de Produtos (R$)"
            >
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        {/* ABA: CONFIGURAR NOTA FISCAL */}
        {activeTab === 'notafiscal' && (
          <>
            <Form.Item
              name="nfseRequired"
              label="Requer NFS-e"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="itemService"
              label="Código do Item de Serviço (LC 116)"
            >
              <Input placeholder="Ex: 0501" />
            </Form.Item>

            <Form.Item
              name="serviceDescription"
              label="Descrição para Nota Fiscal"
            >
              <Input.TextArea
                rows={3}
                placeholder="Descrição do serviço para fins fiscais..."
              />
            </Form.Item>

            <Form.Item
              name="nfsePercentage"
              label="Percentual de ISS (%)"
            >
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                precision={4}
                placeholder="0.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}
      </Form>
    </ModalWithSidebar>
  )
}
