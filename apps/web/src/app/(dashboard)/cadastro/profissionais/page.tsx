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
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { api } from '@/lib/api'

const { Title } = Typography

interface Professional {
  id: string
  name: string
  phone: string | null
  email: string | null
  specialty: string | null
  avatar: string | null
  commissionRate: number
  color: string | null
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
        name: values.name,
        phone: values.phone || null,
        email: values.email || null,
        specialty: values.specialty || null,
        commissionRate: values.commissionRate || 0,
        color: values.color,
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
        title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nome Completo"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nome do profissional" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="Cor">
                <Select>
                  {COLORS.map((color) => (
                    <Select.Option key={color} value={color}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            backgroundColor: color,
                          }}
                        />
                        {color}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Telefone">
                <Input prefix={<PhoneOutlined />} placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="E-mail">
                <Input placeholder="email@exemplo.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="specialty" label="Especialidade">
                <Input placeholder="Ex: Barbeiro, Cabeleireiro, Manicure..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="commissionRate" label="Comissão (%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workStart" label="Horário Início">
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
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
      </Modal>
    </div>
  )
}
