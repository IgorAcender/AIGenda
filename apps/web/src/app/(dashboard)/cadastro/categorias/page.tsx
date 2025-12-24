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
  Select,
  Tooltip,
  ColorPicker,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { api } from '@/lib/api'

const { Title } = Typography

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  active: boolean
  createdAt: string
  _count?: {
    services: number
  }
}

const PRESET_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911',
  '#ff7a45', '#597ef7', '#9254de', '#36cfc9', '#73d13d',
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  // Buscar categorias da API
  const fetchCategories = useCallback(async (search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)

      const response = await api.get(`/categories?${params}`)
      setCategories(response.data.data || response.data)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar ao montar
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(searchText)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, fetchCategories])

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingCategory(null)
    form.resetFields()
    form.setFieldsValue({
      color: PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)],
    })
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    form.setFieldsValue({
      ...category,
    })
    setIsModalOpen(true)
  }

  // Salvar categoria
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const categoryData = {
        name: values.name,
        description: values.description || null,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString() || '#1890ff',
      }

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryData)
        message.success('Categoria atualizada com sucesso!')
      } else {
        await api.post('/categories', categoryData)
        message.success('Categoria criada com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
      fetchCategories(searchText)
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error)
      } else if (error.errorFields) {
        // Erro de validação do form
      } else {
        message.error('Erro ao salvar categoria')
      }
    } finally {
      setSaving(false)
    }
  }

  // Deletar categoria
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`)
      message.success('Categoria removida!')
      fetchCategories(searchText)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao remover categoria')
    }
  }

  // Colunas da tabela
  const columns: ColumnsType<Category> = [
    {
      title: 'Categoria',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: record.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TagOutlined style={{ color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            {record.description && (
              <div style={{ fontSize: 12, color: '#888' }}>{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Cor',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <Tag color={color} style={{ minWidth: 60, textAlign: 'center' }}>
          {color}
        </Tag>
      ),
    },
    {
      title: 'Serviços',
      key: 'services',
      width: 100,
      render: (_: any, record: Category) => (
        <Tag>{record._count?.services || 0} serviços</Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: any, record: Category) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Remover categoria?"
            description="Serviços vinculados ficarão sem categoria."
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
          Categorias
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nova Categoria
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
            onClick={() => fetchCategories(searchText)}
          >
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            showTotal: (total) => `Total: ${total} categorias`,
          }}
        />
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={400}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Nome da Categoria"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input prefix={<TagOutlined />} placeholder="Ex: Cabelo, Barba, Unhas..." />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descrição opcional..." />
          </Form.Item>

          <Form.Item name="color" label="Cor">
            <Select>
              {PRESET_COLORS.map((color) => (
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
        </Form>
      </Modal>
    </div>
  )
}
