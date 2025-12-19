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
  DatePicker,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title } = Typography

interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  cpf: string | null
  address: string | null
  city: string | null
  birthDate: string | null
  notes: string | null
  active: boolean
  createdAt: string
}

// Mock data - será substituído por dados da API
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva Santos',
    email: 'maria@email.com',
    phone: '(11) 99999-1111',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    birthDate: '1990-05-15',
    notes: 'Cliente VIP',
    active: true,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'João Pedro Oliveira',
    email: 'joao@email.com',
    phone: '(11) 99999-2222',
    cpf: '987.654.321-00',
    address: 'Av. Brasil, 456',
    city: 'São Paulo',
    birthDate: '1985-08-20',
    notes: null,
    active: true,
    createdAt: '2024-02-10',
  },
  {
    id: '3',
    name: 'Ana Paula Costa',
    email: 'ana@email.com',
    phone: '(11) 99999-3333',
    cpf: null,
    address: null,
    city: 'Campinas',
    birthDate: '1995-12-01',
    notes: 'Prefere atendimento às quartas',
    active: true,
    createdAt: '2024-03-05',
  },
  {
    id: '4',
    name: 'Roberto Almeida',
    email: null,
    phone: '(11) 99999-4444',
    cpf: '111.222.333-44',
    address: 'Rua São João, 789',
    city: 'São Paulo',
    birthDate: null,
    notes: null,
    active: false,
    createdAt: '2024-01-20',
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form] = Form.useForm()

  // Filtrar clientes
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchText.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      client.phone.includes(searchText)
  )

  // Abrir modal para criar
  const handleCreate = () => {
    setEditingClient(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  // Abrir modal para editar
  const handleEdit = (client: Client) => {
    setEditingClient(client)
    form.setFieldsValue({
      ...client,
      birthDate: client.birthDate ? dayjs(client.birthDate) : null,
    })
    setIsModalOpen(true)
  }

  // Salvar cliente (criar ou atualizar)
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const clientData = {
        ...values,
        birthDate: values.birthDate?.format('YYYY-MM-DD') || null,
      }

      if (editingClient) {
        // Atualizar
        setClients((prev) =>
          prev.map((c) =>
            c.id === editingClient.id ? { ...c, ...clientData } : c
          )
        )
        message.success('Cliente atualizado com sucesso!')
      } else {
        // Criar
        const newClient: Client = {
          id: Date.now().toString(),
          ...clientData,
          active: true,
          createdAt: new Date().toISOString(),
        }
        setClients((prev) => [newClient, ...prev])
        message.success('Cliente criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  // Deletar cliente
  const handleDelete = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    message.success('Cliente excluído com sucesso!')
  }

  // Colunas da tabela
  const columns: ColumnsType<Client> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Client) => (
        <Space>
          <UserOutlined style={{ color: '#505afb' }} />
          <span style={{ fontWeight: 500 }}>{name}</span>
          {!record.active && <Tag color="red">Inativo</Tag>}
        </Space>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) =>
        email ? (
          <Space>
            <MailOutlined />
            {email}
          </Space>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        ),
    },
    {
      title: 'Cidade',
      dataIndex: 'city',
      key: 'city',
      render: (city: string | null) => city || '-',
    },
    {
      title: 'Cadastro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (_, record: Client) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir cliente"
            description="Tem certeza que deseja excluir este cliente?"
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
          Clientes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Cliente
        </Button>
      </div>

      <Card>
        {/* Filtros */}
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

        {/* Tabela */}
        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} clientes`,
          }}
        />
      </Card>

      {/* Modal de Criação/Edição */}
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
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
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
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
            <Col span={12}>
              <Form.Item name="cpf" label="CPF">
                <Input placeholder="000.000.000-00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" label="Data de Nascimento">
                <DatePicker
                  format="DD/MM/YYYY"
                  placeholder="Selecione"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="address" label="Endereço">
                <Input placeholder="Rua, número, complemento" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="Cidade">
                <Input placeholder="Cidade" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={3} placeholder="Observações sobre o cliente" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
