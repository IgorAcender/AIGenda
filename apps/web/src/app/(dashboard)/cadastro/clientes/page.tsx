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
  DatePicker,
  Tooltip,
  Divider,
  Tabs,
  Switch,
  InputNumber,
  Upload,
  Avatar,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  UserOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
  ReloadOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { api } from '@/lib/api'

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

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form] = Form.useForm()

  // Buscar clientes da API
  const fetchClients = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      })
      if (search) params.append('search', search)

      const response = await api.get(`/clients?${params}`)
      setClients(response.data.data)
      setPagination(response.data.pagination)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar clientes ao montar
  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(1, searchText)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchText, fetchClients])

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
      setSaving(true)

      const clientData = {
        ...values,
        birthDate: values.birthDate?.format('YYYY-MM-DD') || null,
      }

      if (editingClient) {
        // Atualizar
        await api.put(`/clients/${editingClient.id}`, clientData)
        message.success('Cliente atualizado com sucesso!')
      } else {
        // Criar
        await api.post('/clients', clientData)
        message.success('Cliente criado com sucesso!')
      }

      setIsModalOpen(false)
      form.resetFields()
      fetchClients(pagination.page, searchText)
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error)
      } else if (error.errorFields) {
        // Erro de validação do form
      } else {
        message.error('Erro ao salvar cliente')
      }
    } finally {
      setSaving(false)
    }
  }

  // Deletar cliente
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/clients/${id}`)
      message.success('Cliente desativado com sucesso!')
      fetchClients(pagination.page, searchText)
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao desativar cliente')
    }
  }

  // Colunas da tabela
  const columns: ColumnsType<Client> = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Client) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.email && (
            <div style={{ fontSize: 12, color: '#888' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <span>
          <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {phone}
        </span>
      ),
    },
    {
      title: 'CPF',
      dataIndex: 'cpf',
      key: 'cpf',
      render: (cpf: string | null) => cpf || '-',
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
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_: any, record: Client) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Desativar cliente?"
            description="O cliente será desativado, não excluído."
            onConfirm={() => handleDelete(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Desativar">
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
          Clientes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Cliente
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
            onClick={() => fetchClients(pagination.page, searchText)}
          >
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={clients}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} clientes`,
            onChange: (page) => fetchClients(page, searchText),
          }}
        />
      </Card>

      {/* Modal de criação/edição */}
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={saving}
        width={1000}
        bodyStyle={{ maxHeight: '75vh', overflowY: 'auto', padding: 0 }}
      >
        <Row style={{ minHeight: '100%' }}>
          {/* Coluna Esquerda - Avatar e Info */}
          <Col span={8} style={{ borderRight: '1px solid #f0f0f0', padding: 24, textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{ marginBottom: 16, backgroundColor: '#505afb' }}
            />
            <Button type="primary" icon={<CameraOutlined />} style={{ marginBottom: 24 }}>
              Alterar
            </Button>
            
            <Divider />

            {/* Painéis na direita */}
            <div style={{ marginTop: 24 }}>
              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Endereço</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Visualizar endereço</Typography.Text>
              </div>

              <div style={{ marginBottom: 16, textAlign: 'left' }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Redes sociais</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Configurar redes</Typography.Text>
              </div>

              <div style={{ textAlign: 'left' }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>Configurações</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>Mais opções</Typography.Text>
              </div>
            </div>
          </Col>

          {/* Coluna Direita - Formulário com Abas */}
          <Col span={16} style={{ padding: 24 }}>
            <Form form={form} layout="vertical">
              <Tabs
                defaultActiveKey="cadastro"
                items={[
                  {
                    key: 'cadastro',
                    label: 'Cadastro',
                    children: (
                      <>
                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item
                              name="name"
                              label="* Nome"
                              rules={[{ required: true, message: 'Nome é obrigatório' }]}
                            >
                              <Input placeholder="Nome do cliente" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="apelido" label="Apelido">
                              <Input placeholder="Como chamá-lo" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="email" label="E-mail" rules={[{ type: 'email', message: 'E-mail inválido' }]}>
                              <Input placeholder="email@exemplo.com" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              name="phone"
                              label="Celular"
                              rules={[{ required: true, message: 'Telefone é obrigatório' }]}
                            >
                              <Input placeholder="(11) 99999-9999" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="phone2" label="Telefone">
                              <Input placeholder="(11) 3333-3333" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="birthDate" label="Aniversário">
                              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="DD/MM/YYYY" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="gender" label="Gênero">
                              <Input placeholder="M/F" />
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
                            <Form.Item name="cnpj" label="CNPJ">
                              <Input placeholder="00.000.000/0000-00" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="rg" label="RG">
                              <Input placeholder="0000000-0" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="referredBy" label="Indicado por">
                              <Input placeholder="Selecionar cliente" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item name="tags" label="Hashtags">
                              <Input placeholder="#tag1 #tag2 #tag3" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ),
                  },
                  {
                    key: 'endereco',
                    label: 'Endereço',
                    children: (
                      <>
                        <Row gutter={16}>
                          <Col span={18}>
                            <Form.Item name="address" label="Endereço">
                              <Input placeholder="Rua, número, bairro" />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item name="city" label="Cidade">
                              <Input placeholder="Cidade" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="state" label="Estado">
                              <Input placeholder="SP" />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="zipCode" label="CEP">
                              <Input placeholder="00000-000" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col span={24}>
                            <Form.Item name="notes" label="Observações">
                              <Input.TextArea rows={4} placeholder="Anotações sobre o cliente..." />
                            </Form.Item>
                          </Col>
                        </Row>
                      </>
                    ),
                  },
                  {
                    key: 'configuracoes',
                    label: 'Configurações',
                    children: (
                      <>
                        <div style={{ marginBottom: 24 }}>
                          <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
                            Desconto padrão
                          </Typography.Text>
                          <Row gutter={16}>
                            <Col span={12}>
                              <Form.Item name="defaultDiscount" label="Desconto (%)">
                                <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0.00" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item name="discountType" label="Tipo">
                                <Input placeholder="Na comanda" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: 24 }}>
                          <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
                            <Col span={20}>
                              <div>
                                <Typography.Text strong>Ativo</Typography.Text>
                                <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 0' }}>
                                  Desative um cliente para que ele não apareça mais em agendamentos, comandas etc.
                                </Typography.Paragraph>
                              </div>
                            </Col>
                            <Col span={4}>
                              <Form.Item name="active" valuePropName="checked">
                                <Switch />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                          <Row gutter={16} align="middle" style={{ marginBottom: 12 }}>
                            <Col span={20}>
                              <div>
                                <Typography.Text strong>Notificações</Typography.Text>
                                <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 0' }}>
                                  O cliente irá receber notificações (Whatsapp e SMS) sobre novos agendamentos, lembretes etc.
                                </Typography.Paragraph>
                              </div>
                            </Col>
                            <Col span={4}>
                              <Form.Item name="notifications" valuePropName="checked">
                                <Switch />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>

                        <div>
                          <Row gutter={16} align="middle">
                            <Col span={20}>
                              <div>
                                <Typography.Text strong>Bloquear acesso</Typography.Text>
                                <Typography.Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 0' }}>
                                  Ao bloquear o cliente não terá acesso ao Agendamento Online ou Aplicativo Personalizado.
                                </Typography.Paragraph>
                              </div>
                            </Col>
                            <Col span={4}>
                              <Form.Item name="blocked" valuePropName="checked">
                                <Switch />
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      </>
                    ),
                  },
                ]}
              />
            </Form>
          </Col>
        </Row>
      </Modal>
    </div>
  )
}
