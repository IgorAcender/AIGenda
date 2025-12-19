'use client'

import React, { useState } from 'react'
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
  TimePicker,
  Tooltip,
  Switch,
  Avatar,
  Checkbox,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title } = Typography

interface Professional {
  id: string
  name: string
  email: string | null
  phone: string
  commission: number
  workDays: number[]
  workStart: string
  workEnd: string
  color: string
  active: boolean
  createdAt: string
}

const weekDays = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sáb', value: 6 },
]

const colors = [
  '#505afb',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#eb2f96',
  '#13c2c2',
  '#fa541c',
]

// Mock data
const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Carla Mendes',
    email: 'carla@clinica.com',
    phone: '(11) 99999-1111',
    commission: 50,
    workDays: [1, 2, 3, 4, 5],
    workStart: '09:00',
    workEnd: '18:00',
    color: '#505afb',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Dr. Paulo Silva',
    email: 'paulo@clinica.com',
    phone: '(11) 99999-2222',
    commission: 45,
    workDays: [1, 2, 4, 5, 6],
    workStart: '10:00',
    workEnd: '19:00',
    color: '#52c41a',
    active: true,
    createdAt: '2024-02-05',
  },
  {
    id: '3',
    name: 'Ana Beatriz Costa',
    email: 'ana@clinica.com',
    phone: '(11) 99999-3333',
    commission: 40,
    workDays: [2, 3, 4, 5, 6],
    workStart: '08:00',
    workEnd: '17:00',
    color: '#722ed1',
    active: true,
    createdAt: '2024-03-01',
  },
  {
    id: '4',
    name: 'Roberto Gomes',
    email: null,
    phone: '(11) 99999-4444',
    commission: 35,
    workDays: [1, 3, 5],
    workStart: '14:00',
    workEnd: '20:00',
    color: '#faad14',
    active: false,
    createdAt: '2024-01-20',
  },
]

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [form] = Form.useForm()

  const filteredProfessionals = professionals.filter(
    (prof) =>
      prof.name.toLowerCase().includes(searchText.toLowerCase()) ||
      prof.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      prof.phone.includes(searchText)
  )

  const handleCreate = () => {
    setEditingProfessional(null)
    setSelectedColor(colors[0])
    form.resetFields()
    form.setFieldsValue({
      workDays: [1, 2, 3, 4, 5],
      commission: 50,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (professional: Professional) => {
    setEditingProfessional(professional)
    setSelectedColor(professional.color)
    form.setFieldsValue({
      ...professional,
      workStart: dayjs(professional.workStart, 'HH:mm'),
      workEnd: dayjs(professional.workEnd, 'HH:mm'),
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const professionalData = {
        ...values,
        workStart: values.workStart?.format('HH:mm') || '09:00',
        workEnd: values.workEnd?.format('HH:mm') || '18:00',
        color: selectedColor,
      }

      if (editingProfessional) {
        setProfessionals((prev) =>
          prev.map((p) =>
            p.id === editingProfessional.id ? { ...p, ...professionalData } : p
          )
        )
        message.success('Profissional atualizado com sucesso!')
      } else {
        const newProfessional: Professional = {
          id: Date.now().toString(),
          ...professionalData,
          active: true,
          createdAt: new Date().toISOString(),
        }
        setProfessionals((prev) => [newProfessional, ...prev])
        message.success('Profissional criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = (id: string) => {
    setProfessionals((prev) => prev.filter((p) => p.id !== id))
    message.success('Profissional excluído com sucesso!')
  }

  const handleToggleActive = (id: string, active: boolean) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active } : p))
    )
    message.success(active ? 'Profissional ativado!' : 'Profissional desativado!')
  }

  const columns: ColumnsType<Professional> = [
    {
      title: 'Profissional',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Professional) => (
        <Space>
          <Avatar
            style={{ backgroundColor: record.color }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            {record.phone && (
              <div style={{ fontSize: 12, color: '#666' }}>
                <PhoneOutlined /> {record.phone}
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Horário',
      key: 'schedule',
      render: (_, record: Professional) => (
        <Space>
          <ClockCircleOutlined />
          {record.workStart} - {record.workEnd}
        </Space>
      ),
    },
    {
      title: 'Dias de Trabalho',
      key: 'workDays',
      render: (_, record: Professional) => (
        <Space size={4}>
          {weekDays.map((day) => (
            <Tag
              key={day.value}
              color={record.workDays.includes(day.value) ? 'blue' : 'default'}
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
      dataIndex: 'commission',
      key: 'commission',
      render: (commission: number) => `${commission}%`,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
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
      render: (_, record: Professional) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir profissional"
            description="Tem certeza que deseja excluir?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Excluir">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

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
          Profissionais
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Profissional
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')}>
                Limpar
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProfessionals}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} profissionais`,
          }}
        />
      </Card>

      <Modal
        title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Salvar"
        cancelText="Cancelar"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input placeholder="Nome completo" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Telefone"
                rules={[{ required: true, message: 'Telefone é obrigatório' }]}
              >
                <Input placeholder="(00) 00000-0000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="E-mail">
                <Input placeholder="email@exemplo.com" type="email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="commission"
                label="Comissão (%)"
                rules={[{ required: true, message: 'Obrigatório' }]}
              >
                <Input type="number" min={0} max={100} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="workStart"
                label="Início Expediente"
                rules={[{ required: true, message: 'Obrigatório' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="workEnd"
                label="Fim Expediente"
                rules={[{ required: true, message: 'Obrigatório' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="workDays"
            label="Dias de Trabalho"
            rules={[{ required: true, message: 'Selecione ao menos um dia' }]}
          >
            <Checkbox.Group options={weekDays} />
          </Form.Item>

          <Form.Item label="Cor na Agenda">
            <Space>
              {colors.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: color,
                    cursor: 'pointer',
                    border: selectedColor === color ? '3px solid #333' : '2px solid transparent',
                  }}
                />
              ))}
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
