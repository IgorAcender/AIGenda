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
  Switch,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title } = Typography

interface Supplier {
  id: string
  name: string
  tradeName: string | null
  cnpj: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  notes: string | null
  active: boolean
  createdAt: string
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Distribuidora Beauty LTDA',
    tradeName: 'Beauty Dist',
    cnpj: '12.345.678/0001-90',
    email: 'contato@beautydist.com',
    phone: '(11) 3333-4444',
    address: 'Av. Industrial, 1000',
    city: 'São Paulo - SP',
    notes: 'Fornecedor principal de cosméticos',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Cosméticos Premium SA',
    tradeName: 'Premium Cos',
    cnpj: '98.765.432/0001-10',
    email: 'vendas@premiumcos.com',
    phone: '(11) 5555-6666',
    address: 'Rua das Indústrias, 500',
    city: 'Guarulhos - SP',
    notes: null,
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: '3',
    name: 'Esmaltes e Cia ME',
    tradeName: null,
    cnpj: '11.222.333/0001-44',
    email: null,
    phone: '(11) 7777-8888',
    address: null,
    city: 'São Paulo - SP',
    notes: 'Entregas às quintas',
    active: true,
    createdAt: '2024-02-01',
  },
]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [form] = Form.useForm()

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.tradeName?.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.cnpj?.includes(searchText) ||
      supplier.email?.toLowerCase().includes(searchText.toLowerCase())
  )

  const handleCreate = () => {
    setEditingSupplier(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    form.setFieldsValue(supplier)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      if (editingSupplier) {
        setSuppliers((prev) =>
          prev.map((s) =>
            s.id === editingSupplier.id ? { ...s, ...values } : s
          )
        )
        message.success('Fornecedor atualizado!')
      } else {
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          ...values,
          active: true,
          createdAt: new Date().toISOString(),
        }
        setSuppliers((prev) => [newSupplier, ...prev])
        message.success('Fornecedor criado!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id))
    message.success('Fornecedor excluído!')
  }

  const handleToggleActive = (id: string, active: boolean) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active } : s))
    )
    message.success(active ? 'Fornecedor ativado!' : 'Fornecedor desativado!')
  }

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Fornecedor',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Supplier) => (
        <div>
          <Space>
            <ShopOutlined style={{ color: '#505afb' }} />
            <span style={{ fontWeight: 500 }}>{name}</span>
          </Space>
          {record.tradeName && (
            <div style={{ fontSize: 12, color: '#666' }}>
              {record.tradeName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'CNPJ',
      dataIndex: 'cnpj',
      key: 'cnpj',
      render: (cnpj: string | null) => cnpj || '-',
    },
    {
      title: 'Contato',
      key: 'contact',
      render: (_, record: Supplier) => (
        <div>
          {record.phone && (
            <div style={{ fontSize: 13 }}>
              <PhoneOutlined /> {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ fontSize: 13 }}>
              <MailOutlined /> {record.email}
            </div>
          )}
          {!record.phone && !record.email && '-'}
        </div>
      ),
    },
    {
      title: 'Cidade',
      dataIndex: 'city',
      key: 'city',
      render: (city: string | null) => city || '-',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: Supplier) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_, record: Supplier) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir fornecedor"
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
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
          Fornecedores
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Buscar por nome, CNPJ ou e-mail..."
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
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} fornecedores`,
          }}
        />
      </Card>

      <Modal
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
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
            <Col span={16}>
              <Form.Item
                name="name"
                label="Razão Social"
                rules={[{ required: true, message: 'Nome é obrigatório' }]}
              >
                <Input placeholder="Razão social da empresa" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tradeName" label="Nome Fantasia">
                <Input placeholder="Nome fantasia" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cnpj" label="CNPJ">
                <Input placeholder="00.000.000/0001-00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Telefone">
                <Input placeholder="(00) 0000-0000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="E-mail">
            <Input placeholder="contato@fornecedor.com" type="email" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="address" label="Endereço">
                <Input placeholder="Rua, número, bairro" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="Cidade">
                <Input placeholder="Cidade - UF" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={2} placeholder="Observações sobre o fornecedor" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
