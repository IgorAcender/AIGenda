'use client'

import React, { useEffect, useState } from 'react'
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
  Tabs,
  Switch,
  Divider,
  Space,
  InputNumber,
  Tree,
  Checkbox,
} from 'antd'
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  DollarOutlined,
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
  firstName?: string
  lastName?: string
  cpf?: string
  rg?: string
  birthDate?: string
  profession?: string
  bio?: string
  address?: string
  addressNumber?: string
  addressComplement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  signature?: string
  availableOnline?: boolean
  generateSchedule?: boolean
  receivesCommission?: boolean
  partnershipContract?: boolean
  commissionRate?: number
  notes?: string
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const isEditing = !!professionalId

  // Buscar profissional se editando
  const { data: professional, isLoading: loadingProfessional } = useApiQuery(
    ['professional', professionalId || ''],
    `/professionals/${professionalId}`,
    { enabled: isEditing && !!professionalId }
  )

  // Buscar serviços disponíveis
  const { data: servicesData } = useApiQuery(
    ['services-all'],
    '/services?limit=1000'
  )

  const services = servicesData?.data || []

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

  // Mutation para vincular serviços
  const { mutate: linkServices, isPending: linkingServices } = useApiMutation(
    async (serviceIds: string[]) => {
      if (isEditing) {
        const { data } = await api.post(`/professionals/${professionalId}/services`, {
          serviceIds,
        })
        return data
      }
    },
    [['professional', professionalId || '']]
  )

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (professional) {
      form.setFieldsValue({
        name: professional.name,
        firstName: professional.firstName,
        lastName: professional.lastName,
        email: professional.email,
        phone: professional.phone,
        specialty: professional.specialty,
        profession: professional.profession,
        bio: professional.bio,
        cpf: professional.cpf,
        rg: professional.rg,
        birthDate: professional.birthDate,
        address: professional.address,
        addressNumber: professional.addressNumber,
        addressComplement: professional.addressComplement,
        neighborhood: professional.neighborhood,
        city: professional.city,
        state: professional.state,
        zipCode: professional.zipCode,
        signature: professional.signature,
        isActive: professional.isActive,
        availableOnline: professional.availableOnline,
        generateSchedule: professional.generateSchedule,
        receivesCommission: professional.receivesCommission,
        partnershipContract: professional.partnershipContract,
        commissionRate: professional.commissionRate,
        notes: professional.notes,
      })
      if (professional.avatar) {
        setAvatarUrl(professional.avatar)
      }
      // Carregar serviços já vinculados
      if (professional.services) {
        const serviceIds = professional.services.map((s: any) => s.serviceId)
        setSelectedServices(serviceIds)
      }
    }
  }, [professional, form])

  // Limpar form ao abrir/fechar modal
  useEffect(() => {
    if (!visible) {
      form.resetFields()
      setAvatarUrl(null)
    }
  }, [visible, form])

  const handleAvatarChange = async (info: any) => {
    const file = info.file
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string)
        form.setFieldValue('avatar', e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      // Adicionar avatar se houver
      if (avatarUrl) {
        values.avatar = avatarUrl
      }

      saveProfessional(values, {
        onSuccess: (professional) => {
          // Se editando e serviços foram selecionados, vincular
          if (isEditing && selectedServices.length > 0) {
            linkServices(selectedServices, {
              onSuccess: () => {
                message.success('Profissional atualizado com sucesso!')
                form.resetFields()
                setAvatarUrl(null)
                setSelectedServices([])
                onSuccess()
                onClose()
              },
              onError: () => {
                message.warning('Profissional atualizado, mas houve erro ao salvar serviços')
              },
            })
          } else {
            message.success(
              isEditing
                ? 'Profissional atualizado com sucesso!'
                : 'Profissional criado com sucesso!'
            )
            form.resetFields()
            setAvatarUrl(null)
            setSelectedServices([])
            onSuccess()
            onClose()
          }
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

  const tabItems = [
    {
      key: 'cadastro',
      label: 'Cadastro',
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          {/* Avatar Section */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={80}
              src={avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <div>
              <Upload
                maxCount={1}
                accept="image/*"
                beforeUpload={() => false}
                onChange={handleAvatarChange}
              >
                <Button icon={<UploadOutlined />}>Alterar Foto</Button>
              </Upload>
            </div>
          </div>

          {/* Nome Section */}
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
                name="firstName"
                label="Primeiro Nome"
              >
                <Input placeholder="João" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Sobrenome"
              >
                <Input placeholder="Silva" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Contato</Divider>

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
                  type="email"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Celular"
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="(11) 99999-9999"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Documentação</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="cpf"
                label="CPF/CNPJ"
              >
                <Input
                  placeholder="000.000.000-00"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="rg"
                label="RG"
              >
                <Input
                  placeholder="00.000.000-0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="birthDate"
            label="Aniversário"
          >
            <Input type="date" />
          </Form.Item>

          <Divider>Profissão</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="profession"
                label="Profissão"
              >
                <Input placeholder="Ex: Barbeiro" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialty"
                label="Especialidade"
              >
                <Input placeholder="Ex: Corte, Coloração" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bio"
            label="Bio/Experiência"
          >
            <Input.TextArea
              placeholder="Descreva sua experiência..."
              rows={3}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'endereco',
      label: 'Endereço',
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="address"
            label="Rua"
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Ex: Rua das Flores"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="addressNumber"
                label="Número"
              >
                <Input placeholder="123" />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                name="addressComplement"
                label="Complemento"
              >
                <Input placeholder="Apto 45, Bloco B" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="neighborhood"
                label="Bairro"
              >
                <Input placeholder="Vila Mariana" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="zipCode"
                label="CEP"
              >
                <Input placeholder="01234-567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="city"
                label="Cidade"
              >
                <Input placeholder="São Paulo" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="state"
                label="Estado"
              >
                <Select
                  placeholder="Selecione"
                  options={[
                    { label: 'São Paulo', value: 'SP' },
                    { label: 'Rio de Janeiro', value: 'RJ' },
                    { label: 'Minas Gerais', value: 'MG' },
                    { label: 'Bahia', value: 'BA' },
                    { label: 'Santa Catarina', value: 'SC' },
                    // Adicionar outros estados conforme necessário
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'usuario',
      label: 'Usuário',
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="signature"
            label="Assinatura Digital"
          >
            <Input.TextArea
              placeholder="Insira sua assinatura digital"
              rows={4}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'servicos',
      label: 'Personalizar Serviços',
      children: (
        <div style={{ marginTop: 16 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>
            Selecione os serviços disponibilizados por este profissional
          </p>
          {services.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center' }}>Nenhum serviço disponível</p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '12px'
            }}>
              {services.map((service: any) => (
                <Checkbox
                  key={service.id}
                  checked={selectedServices.includes(service.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedServices([...selectedServices, service.id])
                    } else {
                      setSelectedServices(selectedServices.filter(id => id !== service.id))
                    }
                  }}
                >
                  <div>
                    <strong>{service.name}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      R$ {service.price?.toFixed(2)} • {service.duration}min
                    </span>
                  </div>
                </Checkbox>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'comissoes',
      label: 'Configurar Comissões',
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="commissionRate"
            label="Taxa de Comissão (%)"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.01}
              placeholder="Ex: 30.00"
              precision={2}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'anotacoes',
      label: 'Anotações',
      children: (
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="notes"
            label="Anotações"
          >
            <Input.TextArea
              placeholder="Adicione observações sobre o profissional"
              rows={6}
            />
          </Form.Item>
        </Form>
      ),
    },
  ]

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={onClose}
      width={700}
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
        <>
          <Tabs items={tabItems} />

          <Divider>Configurações</Divider>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Form
              form={form}
              layout="vertical"
            >
              <Form.Item
                name="isActive"
                label="Ativo"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="availableOnline"
                label="Disponível para agendamento online"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="generateSchedule"
                label="Gerar agenda"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="receivesCommission"
                label="Recebe comissão"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="partnershipContract"
                label="Contratado pela Lei do Salão Parceiro"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Form>
          </Space>
        </>
      )}
    </Modal>
  )
}
