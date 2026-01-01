'use client'

import React, { useEffect, useState } from 'react'
import {
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
  Switch,
  Divider,
  Space,
  InputNumber,
  Checkbox,
} from 'antd'
import {
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

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
  // Novos campos
  scheduleStart?: string
  scheduleEnd?: string
  scheduleBreakStart?: string
  scheduleBreakEnd?: string
  auxiliaryName?: string
  auxiliaryPhone?: string
  commissionName?: string
  commissionValue?: number
  salaryValue?: number
  valeValue?: number
  permissions?: string[]
}

interface ProfessionalFormModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  professionalId?: string
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
  const [activeTab, setActiveTab] = useState<string>('cadastro')
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
  const { mutate: linkServices } = useApiMutation(
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
        scheduleStart: professional.scheduleStart,
        scheduleEnd: professional.scheduleEnd,
        scheduleBreakStart: professional.scheduleBreakStart,
        scheduleBreakEnd: professional.scheduleBreakEnd,
        auxiliaryName: professional.auxiliaryName,
        auxiliaryPhone: professional.auxiliaryPhone,
        commissionName: professional.commissionName,
        commissionValue: professional.commissionValue,
        salaryValue: professional.salaryValue,
        valeValue: professional.valeValue,
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
      setActiveTab('cadastro')
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
                setActiveTab('cadastro')
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
            setActiveTab('cadastro')
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

  if (loadingProfessional && isEditing) {
    return (
      <ModalWithSidebar
        title={isEditing ? 'Editar Profissional' : 'Novo Profissional'}
        open={visible}
        onClose={onClose}
        tabs={[
          { key: 'cadastro', label: 'Cadastro' },
          { key: 'endereco', label: 'Endereço' },
          { key: 'usuario', label: 'Usuário' },
          { key: 'assinatura', label: 'Assinatura digital' },
          { key: 'expediente', label: 'Expediente' },
          { key: 'servicos', label: 'Personalizar serviços' },
          { key: 'comissoes', label: 'Configurar comissões' },
          { key: 'auxiliares', label: 'Comissões e Auxiliares' },
          { key: 'salario', label: 'Pagar salário/comissão' },
          { key: 'vales', label: 'Vales' },
          { key: 'permissoes', label: 'Permissões' },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </ModalWithSidebar>
    )
  }

  return (
    <ModalWithSidebar
      title={isEditing ? 'Editar Profissional' : 'Novo Profissional'}
      open={visible}
      onClose={onClose}
      onSave={handleSave}
      isSaving={saving}
      tabs={[
        { key: 'cadastro', label: 'Cadastro' },
        { key: 'endereco', label: 'Endereço' },
        { key: 'usuario', label: 'Usuário' },
        { key: 'assinatura', label: 'Assinatura digital' },
        { key: 'expediente', label: 'Expediente' },
        { key: 'servicos', label: 'Personalizar serviços' },
        { key: 'comissoes', label: 'Configurar comissões' },
        { key: 'auxiliares', label: 'Comissões e Auxiliares' },
        { key: 'salario', label: 'Pagar salário/comissão' },
        { key: 'vales', label: 'Vales' },
        { key: 'permissoes', label: 'Permissões' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={80}
            src={avatarUrl}
            icon={<UserOutlined />}
            style={{ marginBottom: 16, backgroundColor: '#505afb' }}
          />
          <div>
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <Button type="primary" size="small" icon={<UploadOutlined />} style={{ width: '100%' }}>
                Alterar Foto
              </Button>
            </Upload>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Aba Cadastro */}
        {activeTab === 'cadastro' && (
          <>
            <Form.Item
              name="name"
              label="* Nome Completo"
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
                <Form.Item name="firstName" label="Primeiro Nome">
                  <Input placeholder="João" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastName" label="Sobrenome">
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
                  rules={[{ type: 'email', message: 'Email inválido' }]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="joao@example.com"
                    type="email"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="Celular">
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
                <Form.Item name="cpf" label="CPF/CNPJ">
                  <Input placeholder="000.000.000-00" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="rg" label="RG">
                  <Input placeholder="00.000.000-0" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="birthDate" label="Aniversário">
              <Input type="date" />
            </Form.Item>

            <Divider>Profissão</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="profession" label="Profissão">
                  <Input placeholder="Ex: Barbeiro" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="specialty" label="Especialidade">
                  <Input placeholder="Ex: Corte, Coloração" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="bio" label="Bio/Experiência">
              <Input.TextArea
                placeholder="Descreva sua experiência..."
                rows={3}
              />
            </Form.Item>
          </>
        )}

        {/* Aba Endereço */}
        {activeTab === 'endereco' && (
          <>
            <Form.Item name="address" label="Rua">
              <Input
                prefix={<EnvironmentOutlined />}
                placeholder="Ex: Rua das Flores"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="addressNumber" label="Número">
                  <Input placeholder="123" />
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item name="addressComplement" label="Complemento">
                  <Input placeholder="Apto 45, Bloco B" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="neighborhood" label="Bairro">
                  <Input placeholder="Vila Mariana" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="zipCode" label="CEP">
                  <Input placeholder="01234-567" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="city" label="Cidade">
                  <Input placeholder="São Paulo" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="state" label="Estado">
                  <Select
                    placeholder="Selecione"
                    options={[
                      { label: 'São Paulo', value: 'SP' },
                      { label: 'Rio de Janeiro', value: 'RJ' },
                      { label: 'Minas Gerais', value: 'MG' },
                      { label: 'Bahia', value: 'BA' },
                      { label: 'Santa Catarina', value: 'SC' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Aba Usuário */}
        {activeTab === 'usuario' && (
          <>
            <Divider>Dados de Acesso</Divider>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[{ type: 'email', message: 'Email inválido' }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="joao@example.com"
                type="email"
              />
            </Form.Item>

            <p style={{ 
              background: '#f5f7fa', 
              padding: '12px', 
              borderRadius: '6px', 
              fontSize: '13px',
              color: '#666',
              borderLeft: '4px solid #505afb'
            }}>
              💡 <strong>Dica:</strong> Use este e-mail para criar um login de acesso ao sistema para o profissional. O e-mail será usado para autenticação.
            </p>

            <Divider>Configurações</Divider>

            <Form.Item name="isActive" label="Ativo" valuePropName="checked">
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
          </>
        )}

        {/* Aba Assinatura Digital */}
        {activeTab === 'assinatura' && (
          <>
            <Form.Item name="signature" label="Assinatura Digital">
              <Input.TextArea
                placeholder="Insira sua assinatura digital"
                rows={6}
              />
            </Form.Item>
          </>
        )}

        {/* Aba Expediente */}
        {activeTab === 'expediente' && (
          <>
            <Divider>Horário de Funcionamento</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="scheduleStart" label="Início do Expediente">
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="scheduleEnd" label="Fim do Expediente">
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Intervalo de Descanso</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="scheduleBreakStart" label="Início do Intervalo">
                  <Input type="time" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="scheduleBreakEnd" label="Fim do Intervalo">
                  <Input type="time" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Aba Personalizar Serviços */}
        {activeTab === 'servicos' && (
          <>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Selecione os serviços disponibilizados por este profissional
            </p>
            {services.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>Nenhum serviço disponível</p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '12px',
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
          </>
        )}

        {/* Aba Configurar Comissões */}
        {activeTab === 'comissoes' && (
          <>
            <Form.Item name="commissionRate" label="Taxa de Comissão (%)">
              <InputNumber
                min={0}
                max={100}
                step={0.01}
                placeholder="Ex: 30.00"
                precision={2}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item name="commissionName" label="Tipo de Comissão">
              <Input placeholder="Ex: Comissão por Serviço" />
            </Form.Item>

            <Form.Item name="commissionValue" label="Valor da Comissão (R$)">
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="Ex: 50.00"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </>
        )}

        {/* Aba Comissões e Auxiliares */}
        {activeTab === 'auxiliares' && (
          <>
            <Divider>Dados do Auxiliar</Divider>

            <Form.Item name="auxiliaryName" label="Nome do Auxiliar">
              <Input placeholder="Ex: Maria Silva" />
            </Form.Item>

            <Form.Item name="auxiliaryPhone" label="Telefone do Auxiliar">
              <Input
                prefix={<PhoneOutlined />}
                placeholder="(11) 99999-9999"
              />
            </Form.Item>

            <Divider>Observações</Divider>

            <Form.Item name="notes" label="Anotações sobre o auxiliar">
              <Input.TextArea
                placeholder="Adicione observações sobre o auxiliar"
                rows={4}
              />
            </Form.Item>
          </>
        )}

        {/* Aba Pagar Salário/Comissão */}
        {activeTab === 'salario' && (
          <>
            <Form.Item name="salaryValue" label="Valor do Salário (R$)">
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="Ex: 2000.00"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Divider>Histórico de Pagamentos</Divider>

            <p style={{ color: '#666', textAlign: 'center', margin: '40px 0' }}>
              Nenhum pagamento registrado
            </p>
          </>
        )}

        {/* Aba Vales */}
        {activeTab === 'vales' && (
          <>
            <Form.Item name="valeValue" label="Valor Total de Vales (R$)">
              <InputNumber
                min={0}
                step={0.01}
                precision={2}
                placeholder="Ex: 500.00"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Divider>Histórico de Vales</Divider>

            <p style={{ color: '#666', textAlign: 'center', margin: '40px 0' }}>
              Nenhum vale registrado
            </p>
          </>
        )}

        {/* Aba Permissões */}
        {activeTab === 'permissoes' && (
          <>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Configure as permissões de acesso para este profissional
            </p>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="canViewDashboard" label="Visualizar Dashboard" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="canManageSchedule" label="Gerenciar Agenda" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="canViewFinancial" label="Visualizar Dados Financeiros" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="canEditProfile" label="Editar Perfil Próprio" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="canViewClients" label="Visualizar Clientes" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Form.Item name="canEditServices" label="Editar Serviços" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Space>
          </>
        )}
      </Form>
    </ModalWithSidebar>
  )
}
