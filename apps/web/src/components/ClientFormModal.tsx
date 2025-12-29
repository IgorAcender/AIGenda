'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Divider,
  Typography,
  Switch,
  InputNumber,
  DatePicker,
  Button,
} from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (client: any) => void
  editingClient?: any
}

export function ClientFormModal({ open, onClose, onSuccess, editingClient }: ClientFormModalProps) {
  const [form] = Form.useForm()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('cadastro')

  // Mutation para salvar cliente
  const { mutate: saveClient, isPending: isSaving } = useApiMutation(
    async (clientData) => {
      if (editingClient?.id) {
        return await api.put(`/clients/${editingClient.id}`, clientData)
      } else {
        return await api.post('/clients', clientData)
      }
    },
    [['clients']]
  )

  // Carregar dados do cliente ao editar
  useEffect(() => {
    if (editingClient) {
      form.setFieldsValue({
        name: editingClient.name,
        apelido: editingClient.apelido,
        email: editingClient.email,
        phone: editingClient.phone,
        phone2: editingClient.phone2,
        birthDate: editingClient.birthDate ? dayjs(editingClient.birthDate) : null,
        gender: editingClient.gender,
        cpf: editingClient.cpf,
        cnpj: editingClient.cnpj,
        rg: editingClient.rg,
        referredBy: editingClient.referredBy,
        tags: editingClient.tags,
        address: editingClient.address,
        city: editingClient.city,
        state: editingClient.state,
        zipCode: editingClient.zipCode,
        notes: editingClient.notes,
        defaultDiscount: editingClient.defaultDiscount,
        discountType: editingClient.discountType,
        active: editingClient.active !== false,
        notifications: editingClient.notifications !== false,
        blocked: editingClient.blocked === true,
      })
      if (editingClient.avatar) {
        setAvatarPreview(editingClient.avatar)
      }
    } else {
      form.resetFields()
      setAvatarPreview(null)
    }
  }, [editingClient, form, open])

  const handleSave = (values: any) => {
    const clientData = {
      ...values,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      avatar: avatarPreview,
    }

    saveClient(clientData, {
      onSuccess: (response) => {
        onSuccess?.(response)
        onClose()
        form.resetFields()
        setAvatarPreview(null)
      },
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <ModalWithSidebar
      title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      open={open}
      onClose={onClose}
      onSave={() => form.submit()}
      isSaving={isSaving}
      tabs={[
        { key: 'cadastro', label: 'Cadastro' },
        { key: 'painel', label: 'Painel' },
        { key: 'debitos', label: 'Débitos' },
        { key: 'creditos', label: 'Créditos' },
        { key: 'cashback', label: 'Cashback' },
        { key: 'agendamentos', label: 'Agendamentos' },
        { key: 'vendas', label: 'Vendas' },
        { key: 'pacotes', label: 'Pacotes' },
        { key: 'mensagens', label: 'Mensagens' },
        { key: 'anotacoes', label: 'Anotações' },
        { key: 'imagens', label: 'Imagens e Arquivos' },
        { key: 'anamneses', label: 'Anamneses' },
        { key: 'vendas-assinatura', label: 'Vendas por Assinatura' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={80}
            src={avatarPreview}
            icon={!avatarPreview ? <UserOutlined /> : undefined}
            style={{ marginBottom: 16, backgroundColor: '#505afb' }}
          />
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <Button
            type="primary"
            size="small"
            icon={<CameraOutlined />}
            style={{ width: '100%' }}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            Avatar
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Aba Cadastro */}
        {activeTab === 'cadastro' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Base de dados do cliente</p>
          </>
        )}

        {/* Aba Painel */}
        {activeTab === 'painel' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Painel de controle do cliente</p>
          </>
        )}

        {/* Aba Débitos */}
        {activeTab === 'debitos' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Débitos em aberto</p>
          </>
        )}

        {/* Aba Créditos */}
        {activeTab === 'creditos' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Créditos disponíveis</p>
          </>
        )}

        {/* Aba Cashback */}
        {activeTab === 'cashback' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Programa de cashback</p>
          </>
        )}

        {/* Aba Agendamentos */}
        {activeTab === 'agendamentos' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Histórico de agendamentos</p>
          </>
        )}

        {/* Aba Vendas */}
        {activeTab === 'vendas' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Histórico de vendas</p>
          </>
        )}

        {/* Aba Pacotes */}
        {activeTab === 'pacotes' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Pacotes adquiridos</p>
          </>
        )}

        {/* Aba Mensagens */}
        {activeTab === 'mensagens' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Mensagens com o cliente</p>
          </>
        )}

        {/* Aba Anotações */}
        {activeTab === 'anotacoes' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Anotações sobre o cliente</p>
          </>
        )}

        {/* Aba Imagens e Arquivos */}
        {activeTab === 'imagens' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Imagens e arquivos do cliente</p>
          </>
        )}

        {/* Aba Anamneses */}
        {activeTab === 'anamneses' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Fichas de anamnese</p>
          </>
        )}

        {/* Aba Vendas por Assinatura */}
        {activeTab === 'vendas-assinatura' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Assinaturas ativas</p>
          </>
        )}
      </Form>
    </ModalWithSidebar>
  )
}
