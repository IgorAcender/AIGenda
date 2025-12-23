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
  Tooltip,
  Select,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ScissorOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api } from '@/lib/api'

const { Title } = Typography

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  categoryId: string | null
  category?: {
    id: string
    name: string
    color: string
  }
  active: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
  color: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form] = Form.useForm()

  // Buscar serviços da API
  const fetchServices = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await api.get(`/services?${params}`)
      setServices(response.data.data || response.data)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar categorias
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }, [])

  // Carregar ao montar
  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [fetchServices, fetchCategories])

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices(searchText)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, fetchServices])

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingService(null)
    form.resetFields()
    form.setFieldsValue({
      duration: 30,
      price: 0,
      active: true,
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (service: Service) => {
    setEditingService(service)
    form.setFieldsValue({
      ...service,
      price: service.price / 100, // Converter centavos para reais
    })
    setIsModalOpen(true)
  }

  // Salvar serviço
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const serviceData = {
        name: values.name,
        description: values.description || null,
        duration: values.duration,
        price: Math.round(values.price * 100), // Converter reais para centavos
        categoryId: values.categoryId || null,
      }

      if (editingService) {
        await api.put(`/services/${editingService.id}`, serviceData)
        message.success('Serviço atualizado com sucesso!')
      } else {
        await api.post('/services', serviceData)
        message.success('Serviço criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
      fetchServices(searchText)
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error)
      } else if (error.errorFields) {
        // Erro de validação do form
      } else {
        message.error('Erro ao salvar serviço')
      }
    } finally {
      setSaving(false)
    }
  }

  // Alternar status ativo
  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await api.put(`/services/${id}`, { active })
      message.success(active ? 'Serviço ativado!' : 'Serviço desativado!')
      fetchServices(searchText)
    } catch (error: any) {
      message.error('Erro ao alterar status')
    }
  }

  // Deletar serviço
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/services/${id}`)
      message.success('Serviço removido!')
      fetchServices(searchText)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao remover serviço')
    }
  }

  // Formatar preço
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  // Formatar duração
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  // Colunas da tabela
  const columns: ColumnsType<Service> = [
    {
      title: 'Serviço',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Service) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            <ScissorOutlined style={{ marginRight: 8, color: record.category?.color || '#1890ff' }} />
            {name}
          </div>
          {record.description && (
            <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: Category | null) =>
        category ? (
          <Tag color={category.color}>{category.name}</Tag>
        ) : (
          <Tag>Sem categoria</Tag>
        ),
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
      render: (duration: number) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {formatDuration(duration)}
        </span>
      ),
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      width: 120,
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
      width: 100,
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
      render: (_: any, record: Service) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Remover serviço?"
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
          Serviços
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Serviço
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar por nome..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchServices(searchText)}
          >
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={services}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total) => `Total: ${total} serviços`,
          }}
        />
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Nome do Serviço"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input prefix={<ScissorOutlined />} placeholder="Ex: Corte masculino" />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descrição do serviço..." />
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
                  prefix={<ClockCircleOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Preço (R$)"
                rules={[{ required: true, message: 'Preço é obrigatório' }]}
              >
                <InputNumber
                  min={0}
                  step={5}
                  precision={2}
                  style={{ width: '100%' }}
                  prefix={<DollarOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="categoryId" label="Categoria">
            <Select placeholder="Selecione uma categoria" allowClear>
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 2,
                        backgroundColor: cat.color,
                      }}
                    />
                    {cat.name}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
