'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Row,
  Col,
  Select,
  Spin,
  Upload,
  Avatar,
  Tabs,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

const { Title, Text } = Typography

interface Professional {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialty: string | null
  avatar: string | null
  isActive: boolean
  tenantId: string
  // Outros campos podem ser adicionados aqui
}

export default function EditProfessionalPage() {
  const router = useRouter()
  const params = useParams()
  const [form] = Form.useForm()
  const id = params?.id as string

  const isEditing = id && id !== 'novo'

  // Buscar profissional se editando
  const { data: professional, isLoading: loadingProfessional } = useApiQuery(
    ['professional', id],
    `/professionals/${id}`,
    { enabled: !!(isEditing && id) }
  )

  // Mutation para criar/atualizar
  const { mutate: saveProfessional, isPending: saving } = useApiMutation(
    async (payload: any) => {
      if (isEditing) {
        const { data } = await api.put(`/professionals/${id}`, payload)
        return data
      } else {
        const { data } = await api.post('/professionals', payload)
        return data
      }
    },
    [['professionals'], ['professional', id]]
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      saveProfessional(values, {
        onSuccess: (data) => {
          message.success(
            isEditing
              ? 'Profissional atualizado com sucesso!'
              : 'Profissional criado com sucesso!'
          )
          router.push('/cadastro/profissionais')
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

  if (isEditing && loadingProfessional) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400,
        }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          {isEditing ? 'Editar Profissional' : 'Novo Profissional'}
        </Title>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
          loading={saving}
        >
          Salvar
        </Button>
      </div>

      <Row gutter={24}>
        <Col xs={24} md={16}>
          <Card title="Informações do Profissional">
            <Form form={form} layout="vertical">
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
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Foto do Profissional">
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={professional?.avatar}
                style={{ backgroundColor: '#505afb', marginBottom: 16 }}
              />
              <div>
                <Upload showUploadList={false}>
                  <Button icon={<UploadOutlined />}>Alterar Foto</Button>
                </Upload>
              </div>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                PNG ou JPG, máximo 2MB
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
