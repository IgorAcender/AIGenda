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
  Select,
  Tooltip,
  Switch,
  InputNumber,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ReloadOutlined,
  ScissorOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  categoryId: string
  categoryName: string
  active: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
}

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Cabelo' },
  { id: '2', name: 'Unhas' },
  { id: '3', name: 'Estética' },
  { id: '4', name: 'Massagem' },
]

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte Feminino',
    description: 'Corte com lavagem e secador',
    duration: 60,
    price: 80.0,
    categoryId: '1',
    categoryName: 'Cabelo',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Corte Masculino',
    description: 'Corte tradicional',
    duration: 30,
    price: 45.0,
    categoryId: '1',
    categoryName: 'Cabelo',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Manicure',
    description: 'Manicure completa com esmaltação',
    duration: 45,
    price: 35.0,
    categoryId: '2',
    categoryName: 'Unhas',
    active: true,
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    name: 'Pedicure',
    description: 'Pedicure completa com esmaltação',
    duration: 60,
    price: 45.0,
    categoryId: '2',
    categoryName: 'Unhas',
    active: true,
    createdAt: '2024-01-12',
  },
  {
    id: '5',
    name: 'Limpeza de Pele',
    description: 'Limpeza profunda com extração',
    duration: 90,
    price: 150.0,
    categoryId: '3',
    categoryName: 'Estética',
    active: true,
    createdAt: '2024-02-01',
  },
  {
    id: '6',
    name: 'Massagem Relaxante',
    description: 'Massagem corporal relaxante',
    duration: 60,
    price: 120.0,
    categoryId: '4',
    categoryName: 'Massagem',
    active: false,
    createdAt: '2024-02-05',
  },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [categories] = useState<Category[]>(mockCategories)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form] = Form.useForm()

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchText.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !filterCategory || service.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreate = () => {
    setEditingService(null)
    form.resetFields()
    form.setFieldsValue({ duration: 60, price: 0 })
    setIsModalOpen(true)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    form.setFieldsValue(service)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const category = categories.find((c) => c.id === values.categoryId)
      const serviceData = {
        ...values,
        categoryName: category?.name || '',
      }

      if (editingService) {
        setServices((prev) =>
          prev.map((s) =>
            s.id === editingService.id ? { ...s, ...serviceData } : s
          )
        )
        message.success('Serviço atualizado com sucesso!')
      } else {
        const newService: Service = {
          id: Date.now().toString(),
          ...serviceData,
          active: true,
          createdAt: new Date().toISOString(),
        }
        setServices((prev) => [newService, ...prev])
        message.success('Serviço criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id))
    message.success('Serviço excluído com sucesso!')
  }

  const handleToggleActive = (id: string, active: boolean) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active } : s))
    )
    message.success(active ? 'Serviço ativado!' : 'Serviço desativado!')
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`
    if (hours > 0) return `${hours}h`
    return `${mins}min`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const columns: ColumnsType<Service> = [
    {
      title: 'Serviço',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Service) => (
        <div>
          <Space>
            <ScissorOutlined style={{ color: '#505afb' }} />
            <span style={{ fontWeight: 500 }}>{name}</span>
          </Space>
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
      filters: categories.map((c) => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.categoryId === value,
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      sorter: (a, b) => a.duration - b.duration,
      render: (duration: number) => (
        <Space>
          <ClockCircleOutlined />
          {formatDuration(duration)}
        </Space>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>
          {formatPrice(price)}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: Service) => (
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
      render: (_, record: Service) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir serviço"
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
          Serviços
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Serviço
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar por nome ou descrição..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Select
                placeholder="Filtrar por categoria"
                style={{ width: '100%' }}
                value={filterCategory}
                onChange={setFilterCategory}
                allowClear
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText('')
                  setFilterCategory(null)
                }}
              >
                Limpar
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} serviços`,
          }}
        />
      </Card>

      <Modal
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Salvar"
        cancelText="Cancelar"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Nome do Serviço"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: Corte de Cabelo" />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descrição do serviço" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Categoria"
            rules={[{ required: true, message: 'Categoria é obrigatória' }]}
          >
            <Select placeholder="Selecione a categoria">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="Duração (minutos)"
                rules={[{ required: true, message: 'Duração é obrigatória' }]}
              >
                <InputNumber
                  min={5}
                  max={480}
                  step={5}
                  style={{ width: '100%' }}
                  addonAfter="min"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Preço"
                rules={[{ required: true, message: 'Preço é obrigatório' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  addonBefore="R$"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
