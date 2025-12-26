'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Switch,
  InputNumber,
  Avatar,
  Tooltip,
  Select,
  TimePicker,
  Checkbox,
  Tabs,
  DatePicker,
  Upload,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  UploadOutlined,
  IdcardOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { api } from '@/lib/api'

const { Title } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

interface Professional {
  id: string
  name: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  cpf: string | null
  rg: string | null
  birthDate: string | null
  profession: string | null
  specialty: string | null
  avatar: string | null
  
  // Endereço
  address: string | null
  addressNumber: string | null
  addressComplement: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  
  // Assinatura
  signature: string | null
  
  // Configurações
  availableOnline: boolean
  generateSchedule: boolean
  receivesCommission: boolean
  partnershipContract: boolean
  
  // Financeiro
  commissionRate: number
  color: string | null
  
  notes: string | null
  workingHours: any
  workingDays: number[]
  active: boolean
  createdAt: string
  _count?: {
    appointments: number
  }
}

const WEEKDAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
]

const COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911',
]

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [form] = Form.useForm()

  // Buscar profissionais da API
  const fetchProfessionals = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await api.get(`/professionals?${params}`)
      setProfessionals(response.data.data)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar ao montar
  useEffect(() => {
    fetchProfessionals()
  }, [fetchProfessionals])

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfessionals(searchText)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, fetchProfessionals])

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingProfessional(null)
    form.resetFields()
    form.setFieldsValue({
      workingDays: [1, 2, 3, 4, 5, 6],
      commissionRate: 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      workStart: dayjs('09:00', 'HH:mm'),
      workEnd: dayjs('18:00', 'HH:mm'),
      availableOnline: true,
      generateSchedule: true,
      receivesCommission: true,
      partnershipContract: false,
      active: true,
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    form.setFieldsValue({
      ...professional,
      workStart: professional.workingHours?.start 
        ? dayjs(professional.workingHours.start, 'HH:mm') 
        : dayjs('09:00', 'HH:mm'),
      workEnd: professional.workingHours?.end 
        ? dayjs(professional.workingHours.end, 'HH:mm') 
        : dayjs('18:00', 'HH:mm'),
    })
    setIsModalOpen(true)
  }

  // Salvar profissional
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const professionalData = {
        name: `${values.firstName || ''} ${values.lastName || ''}`.trim() || values.firstName || 'Profissional',
        firstName: values.firstName || null,
        lastName: values.lastName || null,
        phone: values.phone || null,
        email: values.email || null,
        cpf: values.cpf || null,
        rg: values.rg || null,
        birthDate: values.birthDate ? values.birthDate.toISOString() : null,
        profession: values.profession || null,
        specialty: values.specialty || null,
        
        // Endereço
        address: values.address || null,
        addressNumber: values.addressNumber || null,
        addressComplement: values.addressComplement || null,
        neighborhood: values.neighborhood || null,
        city: values.city || null,
        state: values.state || null,
        zipCode: values.zipCode || null,
        
        // Assinatura
        signature: values.signature || null,
        
        // Configurações
        availableOnline: values.availableOnline ?? true,
        generateSchedule: values.generateSchedule ?? true,
        receivesCommission: values.receivesCommission ?? true,
        partnershipContract: values.partnershipContract ?? false,
        
        // Financeiro
        commissionRate: values.commissionRate || 0,
        color: values.color,
        notes: values.notes || null,
        workingDays: values.workingDays || [],
        workingHours: {
          start: values.workStart?.format('HH:mm') || '09:00',
          end: values.workEnd?.format('HH:mm') || '18:00',
        },
      }

      if (editingProfessional) {
        await api.put(`/professionals/${editingProfessional.id}`, professionalData)
        message.success('Profissional atualizado com sucesso!')
      } else {
        await api.post('/professionals', professionalData)
        message.success('Profissional criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
      fetchProfessionals(searchText)
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error)
      } else if (error.errorFields) {
        // Erro de validação do form
      } else {
        message.error('Erro ao salvar profissional')
      }
    } finally {
      setSaving(false)
    }
  }

  // Alternar status ativo
  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await api.put(`/professionals/${id}`, { active })
      message.success(active ? 'Profissional ativado!' : 'Profissional desativado!')
      fetchProfessionals(searchText)
    } catch (error: any) {
      message.error('Erro ao alterar status')
    }
  }

  // Deletar profissional
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/professionals/${id}`)
      message.success('Profissional removido!')
      fetchProfessionals(searchText)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao remover profissional')
    }
  }

  // Colunas da tabela
  const columns: ColumnsType<Professional> = [
    {
      title: 'Profissional',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Professional) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar
            style={{ backgroundColor: record.color || '#1890ff' }}
            icon={<UserOutlined />}
            src={record.avatar}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            {record.phone && (
              <div style={{ fontSize: 12, color: '#888' }}>
                <PhoneOutlined style={{ marginRight: 4 }} />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Horário',
      key: 'workingHours',
      render: (_: any, record: Professional) => {
        const hours = record.workingHours || { start: '09:00', end: '18:00' }
        return (
          <span>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            {hours.start} - {hours.end}
          </span>
        )
      },
    },
    {
      title: 'Dias de Trabalho',
      key: 'workingDays',
      render: (_: any, record: Professional) => (
        <Space size={4}>
          {WEEKDAYS.map((day) => (
            <Tag
              key={day.value}
              color={record.workingDays?.includes(day.value) ? 'blue' : 'default'}
              style={{ margin: 0 }}
            >
              {day.label}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Comissão',
      dataIndex: 'commissionRate',
      key: 'commissionRate',
      width: 100,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active: boolean, record: Professional) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          checkedChildren="Ativo"
          unCheckedChildren="Inativo"
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: any, record: Professional) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Remover profissional?"
            description="Esta ação não pode ser desfeita."
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Remover">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Profissionais
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Profissional
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar por nome, e-mail ou telefone..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchProfessionals(searchText)}
          >
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={professionals}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total) => `Total: ${total} profissionais`,
          }}
        />
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        title={editingProfessional ? 'Editar Profissional' : 'Novo profissional'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={800}
        style={{ top: 20 }}
      >
        <Tabs defaultActiveKey="1">
          {/* ABA 1: CADASTRO */}
          <TabPane tab="Cadastro" key="1">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="firstName"
                    label="Nome"
                    rules={[{ required: true, message: 'Nome é obrigatório' }]}
                  >
                    <Input placeholder="Nome" prefix={<UserOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lastName" label="Sobrenome">
                    <Input placeholder="Sobrenome" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="profession" label="Profissão">
                    <Input placeholder="Ex: Barbeiro, Cabeleireiro" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="birthDate" label="Aniversário">
                    <DatePicker 
                      style={{ width: '100%' }} 
                      format="DD/MM/YYYY"
                      placeholder="Selecione a data"
                      prefix={<CalendarOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="cpf" label="CPF/CNPJ">
                    <Input placeholder="000.000.000-00" prefix={<IdcardOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="rg" label="RG">
                    <Input placeholder="00.000.000-0" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="phone" label="Celular">
                <Input placeholder="(00) 00000-0000" prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item name="notes" label="Anotações">
                <TextArea rows={4} placeholder="Observações sobre o profissional" />
              </Form.Item>

              <Divider orientation="left">Configurações</Divider>

              <Form.Item name="availableOnline" valuePropName="checked">
                <Checkbox>
                  <strong>Disponível para agendamento online</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Clientes podem escolher esse profissional para fazer agendamentos online.
                  </div>
                </Checkbox>
              </Form.Item>

              <Form.Item name="generateSchedule" valuePropName="checked">
                <Checkbox>
                  <strong>Gerar agenda</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Caso esteja desativado não será gerada agenda para este profissional.
                  </div>
                </Checkbox>
              </Form.Item>

              <Form.Item name="receivesCommission" valuePropName="checked">
                <Checkbox>
                  <strong>Recebe comissão</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Desmarque se o profissional não recebe comissão.
                  </div>
                </Checkbox>
              </Form.Item>

              <Form.Item name="partnershipContract" valuePropName="checked">
                <Checkbox>
                  <strong>Contratado pela Lei do Salão Parceiro</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    Marque caso esse profissional seja um parceiro contratado pela lei.
                  </div>
                </Checkbox>
              </Form.Item>
            </Form>
          </TabPane>

          {/* ABA 2: ENDEREÇO */}
          <TabPane tab="Endereço" key="2">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={18}>
                  <Form.Item name="address" label="Endereço">
                    <Input placeholder="Rua, Avenida..." prefix={<HomeOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="addressNumber" label="Número">
                    <Input placeholder="Nº" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="addressComplement" label="Complemento">
                <Input placeholder="Apto, Bloco, Sala..." />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="neighborhood" label="Bairro">
                    <Input placeholder="Bairro" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="city" label="Cidade">
                    <Input placeholder="Cidade" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="state" label="Estado">
                    <Select placeholder="Selecione o estado">
                      <Select.Option value="AC">Acre</Select.Option>
                      <Select.Option value="AL">Alagoas</Select.Option>
                      <Select.Option value="AP">Amapá</Select.Option>
                      <Select.Option value="AM">Amazonas</Select.Option>
                      <Select.Option value="BA">Bahia</Select.Option>
                      <Select.Option value="CE">Ceará</Select.Option>
                      <Select.Option value="DF">Distrito Federal</Select.Option>
                      <Select.Option value="ES">Espírito Santo</Select.Option>
                      <Select.Option value="GO">Goiás</Select.Option>
                      <Select.Option value="MA">Maranhão</Select.Option>
                      <Select.Option value="MT">Mato Grosso</Select.Option>
                      <Select.Option value="MS">Mato Grosso do Sul</Select.Option>
                      <Select.Option value="MG">Minas Gerais</Select.Option>
                      <Select.Option value="PA">Pará</Select.Option>
                      <Select.Option value="PB">Paraíba</Select.Option>
                      <Select.Option value="PR">Paraná</Select.Option>
                      <Select.Option value="PE">Pernambuco</Select.Option>
                      <Select.Option value="PI">Piauí</Select.Option>
                      <Select.Option value="RJ">Rio de Janeiro</Select.Option>
                      <Select.Option value="RN">Rio Grande do Norte</Select.Option>
                      <Select.Option value="RS">Rio Grande do Sul</Select.Option>
                      <Select.Option value="RO">Rondônia</Select.Option>
                      <Select.Option value="RR">Roraima</Select.Option>
                      <Select.Option value="SC">Santa Catarina</Select.Option>
                      <Select.Option value="SP">São Paulo</Select.Option>
                      <Select.Option value="SE">Sergipe</Select.Option>
                      <Select.Option value="TO">Tocantins</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="zipCode" label="CEP">
                    <Input placeholder="00000-000" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>

          {/* ABA 3: USUÁRIO */}
          <TabPane tab="Usuário" key="3">
            <Form form={form} layout="vertical">
              <Form.Item name="email" label="E-mail">
                <Input placeholder="email@exemplo.com" type="email" />
              </Form.Item>

              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#666' }}>
                  <strong>💡 Dica:</strong> Para criar um login de acesso para este profissional, 
                  preencha o e-mail acima e use a opção "Criar Login" após salvar o cadastro.
                </p>
              </div>
            </Form>
          </TabPane>

          {/* ABA 4: EXPEDIENTE */}
          <TabPane tab="Expediente" key="4">
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="workStart" label="Horário Início">
                    <TimePicker 
                      format="HH:mm" 
                      style={{ width: '100%' }} 
                      prefix={<ClockCircleOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="workEnd" label="Horário Fim">
                    <TimePicker format="HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="workingDays" label="Dias de Trabalho">
                <Checkbox.Group>
                  <Row>
                    {WEEKDAYS.map((day) => (
                      <Col span={6} key={day.value}>
                        <Checkbox value={day.value}>{day.label}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Form>
          </TabPane>

          {/* ABA 5: COMISSÃO */}
          <TabPane tab="Comissão" key="5">
            <Form form={form} layout="vertical">
              <Form.Item 
                name="commissionRate" 
                label="Taxa de Comissão (%)"
                extra="Porcentagem que o profissional recebe de cada serviço realizado"
              >
                <InputNumber 
                  min={0} 
                  max={100} 
                  style={{ width: '100%' }} 
                  formatter={(value: number | string | undefined) => `${value}%`}
                  parser={(value: string | undefined) => Number(value?.replace('%', '') || 0)}
                />
              </Form.Item>

              <Form.Item name="color" label="Cor (para agenda)">
                <Select>
                  {COLORS.map((color) => (
                    <Select.Option key={color} value={color}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 4,
                            backgroundColor: color,
                            border: '1px solid #ddd'
                          }}
                        />
                        {color}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  )
}
