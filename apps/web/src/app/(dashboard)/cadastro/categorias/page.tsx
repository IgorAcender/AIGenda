'use client'

import React, { useState } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Tooltip,
  ColorPicker,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TagOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface Category {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: string
}

// Mock data
const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Cabelo',
    description: 'Serviços de cabelo, corte, tintura, etc',
    color: '#505afb',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Unhas',
    description: 'Manicure e pedicure',
    color: '#eb2f96',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Estética',
    description: 'Tratamentos estéticos e faciais',
    color: '#52c41a',
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    name: 'Massagem',
    description: 'Massagens relaxantes e terapêuticas',
    color: '#faad14',
    createdAt: '2024-02-01',
  },
  {
    id: '5',
    name: 'Depilação',
    description: 'Serviços de depilação',
    color: '#722ed1',
    createdAt: '2024-02-05',
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedColor, setSelectedColor] = useState('#505afb')
  const [form] = Form.useForm()

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleCreate = () => {
    setEditingCategory(null)
    setSelectedColor('#505afb')
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setSelectedColor(category.color)
    form.setFieldsValue(category)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const categoryData = {
        ...values,
        color: selectedColor,
      }

      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...categoryData } : c
          )
        )
        message.success('Categoria atualizada com sucesso!')
      } else {
        const newCategory: Category = {
          id: Date.now().toString(),
          ...categoryData,
          createdAt: new Date().toISOString(),
        }
        setCategories((prev) => [newCategory, ...prev])
        message.success('Categoria criada com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    message.success('Categoria excluída com sucesso!')
  }

  const columns: ColumnsType<Category> = [
    {
      title: 'Categoria',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Category) => (
        <Space>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: record.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TagOutlined style={{ color: '#fff', fontSize: 12 }} />
          </div>
          <span style={{ fontWeight: 500 }}>{name}</span>
        </Space>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (description: string | null) => description || '-',
    },
    {
      title: 'Cor',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => (
        <div
          style={{
            width: 40,
            height: 24,
            borderRadius: 4,
            backgroundColor: color,
          }}
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_, record: Category) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir categoria"
            description="Tem certeza? Serviços vinculados ficarão sem categoria."
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
          Categorias
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Nova Categoria
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
            <Col>
              <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')}>
                Limpar
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} categorias`,
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Salvar"
        cancelText="Cancelar"
        width={400}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: Cabelo" />
          </Form.Item>

          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descrição da categoria" />
          </Form.Item>

          <Form.Item label="Cor">
            <ColorPicker
              value={selectedColor}
              onChange={(color) => setSelectedColor(color.toHexString())}
              showText
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
