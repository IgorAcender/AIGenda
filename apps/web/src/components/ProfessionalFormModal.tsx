'use client'

import React, { useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Spin,
  Upload,
  Avatar,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface Professional {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialty: string | null
  isActive: boolean
  avatar: string | null
}

interface ProfessionalFormModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  professionalId?: string // Se não fornecido, é modo criar
}

export function ProfessionalFormModal({
  visible,
  onClose,
  onSuccess,
  professionalId,
}: ProfessionalFormModalProps) {
  const [form] = Form.useForm()
  const isEditing = !!professionalId

  // Buscar profissional se editando
  const { data: professional, isLoading: loadingProfessional } = useApiQuery(
    ['professional', professionalId || ''],
    `/professionals/${professionalId}`,
    { enabled: isEditing && !!professionalId }
  )

  // Mutation para criar/atualizar
  const { mutate: saveProfessional, isPending: saving } = useApiMutation(
    async (payload: any) => {
      if (isEditing) {
        const { data } = await api.put(`/professionals/${professionalId}`, payload)
        return data
      } else {
        const { data } = await api.post('/professionals', payload)
        return data
      }
    },
    [['professionals'], ['professional', professionalId || '']]
  )

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (professional) {
      form.setFieldsValue({
        name: professional.name,
        email: professional.email,
        phone: professional.phone,
        specialty: professional.specialty,
        isActive: professional.isActive,
      })
    }
  }, [professional, form])

  // Limpar form ao abrir/fechar modal
  useEffect(() => {
    if (!visible) {
      form.resetFields()
    }
  }, [visible, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      saveProfessional(values, {
        onSuccess: () => {
          message.success(
            isEditing
              ? 'Profissional atualizado com sucesso!'
              : 'Profissional criado com sucesso!'
          )
          form.resetFields()
          onSuccess()
          onClose()
        },
        onError: (error: any) => {
          message.error(
            error.response?.data?.error || 'Erro ao salvar profissional'
          )
        },
      })
    } catch (error) {
      console.error('Erro ao validar:', error)
    }
  }

  const modalTitle = isEditing ? 'Editar Profissional' : 'Novo Profissional'

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar
        </Button>,
      ]}
    >
      {loadingProfessional && isEditing ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="name"
            label="Nome Completo"
            rules={[
              { required: true, message: 'Nome é obrigatório' },
              { min: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ex: João Silva"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'Email inválido' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="joao@example.com"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefone"
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="(11) 99999-9999"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="specialty"
            label="Especialidade"
          >
            <Input placeholder="Ex: Barbeiro, Cabeleireiro" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Select
              options={[
                { label: 'Ativo', value: true },
                { label: 'Inativo', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
