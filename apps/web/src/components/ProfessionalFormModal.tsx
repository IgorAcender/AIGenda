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
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'
import dayjs from 'dayjs'

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
      try {
        console.log('📤 Enviando dados para API:', { isEditing, professionalId, payload })
        if (isEditing && professionalId) {
          const { data } = await api.put(`/professionals/${professionalId}`, payload)
          console.log('✅ PUT sucesso:', data)
          return data
        } else {
          const { data } = await api.post('/professionals', payload)
          console.log('✅ POST sucesso:', data)
          return data
        }
      } catch (error: any) {
        console.error('❌ Erro na requisição:', error.response?.data || error.message)
        throw error
      }
    },
    isEditing && professionalId ? [['professionals'], ['professional', professionalId]] : [['professionals']]
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

  // Normalizar dados antes de enviar (converter isActive para active)
  const normalizeFormData = (data: any) => {
    const normalized = { ...data }
    // Converter isActive para active se existir
    if ('isActive' in normalized) {
      normalized.active = normalized.isActive
      delete normalized.isActive
    }
    return normalized
  }

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
      console.log('✅ Formulário válido:', values)
      
      // Normalizar dados
      let normalizedValues = normalizeFormData(values)
      
      // Adicionar avatar se houver
      if (avatarUrl) {
        normalizedValues.avatar = avatarUrl
      }

      console.log('📤 Enviando dados normalizados:', normalizedValues)
      saveProfessional(normalizedValues, {
        onSuccess: (professional: any) => {
          console.log('✅ Profissional salvo com sucesso:', professional)
          console.log('📞 Chamando onSuccess callback (refetch)...')
          // Se editando e serviços foram selecionados, vincular
          if (isEditing && selectedServices.length > 0) {
            linkServices(selectedServices, {
              onSuccess: () => {
                message.success('Profissional atualizado com sucesso!')
                form.resetFields()
                setAvatarUrl(null)
                setSelectedServices([])
                setActiveTab('cadastro')
                console.log('📞 Refetch chamado após linkServices')
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
            console.log('📞 Refetch chamado após sucesso')
            onSuccess()
            onClose()
          }
        },
        onError: (error: any) => {
          console.error('❌ Erro ao salvar profissional:', error)
          message.error(
            error.response?.data?.error || 'Erro ao salvar profissional'
          )
        },
      })
    } catch (error) {
      console.error('❌ Erro ao validar:', error)
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

            {isEditing && (
              <p style={{ 
                background: '#fff7e6', 
                padding: '12px', 
                borderRadius: '6px', 
                fontSize: '13px',
                color: '#d46b08',
                borderLeft: '4px solid #faad14',
                marginBottom: '16px'
              }}>
                ⚠️ <strong>Atenção:</strong> Alterar o email mudará o login de acesso do profissional no sistema.
              </p>
            )}

            <Form.Item
              name="email"
              label="E-mail *"
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

            <Form.Item
              name="password"
              label={isEditing ? "Senha (deixe em branco para manter)" : "Senha *"}
              rules={isEditing ? [] : [{ required: true, message: 'Senha é obrigatória' }]}
            >
              <Input.Password
                placeholder={isEditing ? "Deixe em branco para não alterar" : "Digite uma senha forte"}
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
              💡 <strong>Dica:</strong> O e-mail e senha serão usados pelo profissional para fazer login no sistema.
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
          <ExpedienteTab professionalId={professional?.id} />
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

// Componente da Aba Expediente
function ExpedienteTab({ professionalId }: { professionalId?: string }) {
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState<any>(null)
  const [usePersonalized, setUsePersonalized] = useState<Record<number, boolean>>({})

  const daysOfWeek = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado']

  useEffect(() => {
    if (!professionalId) return
    
    const fetchSchedule = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/professionals/${professionalId}/schedule`)
        setSchedule(response.data.schedule)
        
        // Inicializar personalizações
        const personalized: Record<number, boolean> = {}
        response.data.schedule.forEach((day: any) => {
          if (day.professional) {
            personalized[day.dayOfWeek] = true
          }
        })
        setUsePersonalized(personalized)
      } catch (error) {
        console.error('Erro ao buscar expediente:', error)
        message.error('Erro ao buscar expediente')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [professionalId])

  const handleSaveSchedule = async () => {
    try {
      setLoading(true)
      const scheduleToSave = schedule.map((day: any) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: usePersonalized[day.dayOfWeek] ? day.professional?.startTime : null,
        endTime: usePersonalized[day.dayOfWeek] ? day.professional?.endTime : null,
        breakStartTime: usePersonalized[day.dayOfWeek] ? day.professional?.breakStartTime : null,
        breakEndTime: usePersonalized[day.dayOfWeek] ? day.professional?.breakEndTime : null,
        isActive: usePersonalized[day.dayOfWeek] ? (day.professional?.isActive ?? day.business?.isActive) : day.business?.isActive,
      }))

      await api.put(`/professionals/${professionalId}/schedule`, { schedule: scheduleToSave })
      message.success('Expediente atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar expediente:', error)
      message.error('Erro ao salvar expediente')
    } finally {
      setLoading(false)
    }
  }

  if (!professionalId) {
    return <p style={{ color: '#999', textAlign: 'center' }}>Salve o profissional primeiro para configurar o expediente</p>
  }

  if (loading) return <Spin />

  if (!schedule) return <p>Carregando expediente...</p>

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <Divider>Horário de Atendimento</Divider>
      <p style={{ color: '#666', marginBottom: 16 }}>
        Use o horário padrão da barbearia ou crie um expediente personalizado para este profissional
      </p>

      {schedule.map((day: any, index: number) => (
        <div
          key={day.dayOfWeek}
          style={{
            padding: '12px',
            marginBottom: '12px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            backgroundColor: '#fafafa',
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={6}>
              <strong style={{ fontSize: '14px' }}>
                {day.dayOfWeek === 0 ? '✓ ' : ''}{daysOfWeek[day.dayOfWeek]}
              </strong>
            </Col>

            <Col span={12}>
              {usePersonalized[day.dayOfWeek] ? (
                // Horário Personalizado
                <Row gutter={8} align="middle">
                  <Col flex="auto">
                    <Input
                      type="time"
                      value={day.professional?.startTime || ''}
                      onChange={(e) => {
                        const newSchedule = [...schedule]
                        if (!newSchedule[index].professional) {
                          newSchedule[index].professional = { isActive: true }
                        }
                        newSchedule[index].professional.startTime = e.target.value
                        setSchedule(newSchedule)
                      }}
                      placeholder="Início"
                      size="small"
                    />
                  </Col>
                  <Col style={{ textAlign: 'center' }}>–</Col>
                  <Col flex="auto">
                    <Input
                      type="time"
                      value={day.professional?.endTime || ''}
                      onChange={(e) => {
                        const newSchedule = [...schedule]
                        if (!newSchedule[index].professional) {
                          newSchedule[index].professional = { isActive: true }
                        }
                        newSchedule[index].professional.endTime = e.target.value
                        setSchedule(newSchedule)
                      }}
                      placeholder="Fim"
                      size="small"
                    />
                  </Col>
                </Row>
              ) : (
                // Horário Padrão (apenas visualização)
                <div style={{ color: '#666' }}>
                  {day.business?.isActive ? (
                    <>
                      <ClockCircleOutlined style={{ marginRight: '6px' }} />
                      {day.business?.startTime} – {day.business?.endTime}
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>Fechado</span>
                  )}
                </div>
              )}
            </Col>

            <Col span={6} style={{ textAlign: 'right' }}>
              <Button
                type={usePersonalized[day.dayOfWeek] ? 'primary' : 'default'}
                size="small"
                onClick={() => {
                  const newPersonalized = { ...usePersonalized }
                  newPersonalized[day.dayOfWeek] = !newPersonalized[day.dayOfWeek]
                  setUsePersonalized(newPersonalized)

                  if (newPersonalized[day.dayOfWeek]) {
                    const newSchedule = [...schedule]
                    newSchedule[index].professional = {
                      startTime: day.business?.startTime || '08:00',
                      endTime: day.business?.endTime || '18:00',
                      breakStartTime: day.business?.breakStartTime || '12:00',
                      breakEndTime: day.business?.breakEndTime || '13:00',
                      isActive: day.business?.isActive ?? true,
                    }
                    setSchedule(newSchedule)
                  }
                }}
              >
                {usePersonalized[day.dayOfWeek] ? 'Personalizado' : 'Padrão'}
              </Button>
            </Col>
          </Row>
        </div>
      ))}

      <Space style={{ marginTop: '16px', width: '100%' }}>
        <Button type="primary" loading={loading} onClick={handleSaveSchedule} style={{ marginTop: '16px' }}>
          Salvar Expediente
        </Button>
      </Space>
    </div>
  )
}

