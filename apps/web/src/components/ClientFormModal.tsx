'use client'

import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Row,
  Col,
  Avatar,
  Divider,
  Typography,
  Switch,
  InputNumber,
  DatePicker,
  Button,
  Select,
  Card,
  Statistic,
  Table,
  Empty,
} from 'antd'
import { UserOutlined, CameraOutlined, CalendarOutlined, StarOutlined, DollarOutlined, ShoppingCartOutlined, PercentageOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ModalWithSidebar } from './ModalWithSidebar'

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (client: any) => void
  editingClient?: any
}

export function ClientFormModal({ open, onClose, onSuccess, editingClient }: ClientFormModalProps) {
  const [form] = Form.useForm()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('cadastro')

  // Mutation para salvar cliente
  const { mutate: saveClient, isPending: isSaving } = useApiMutation(
    async (clientData) => {
      if (editingClient?.id) {
        return await api.put(`/clients/${editingClient.id}`, clientData)
      } else {
        return await api.post('/clients', clientData)
      }
    },
    [['clients']]
  )

  // Carregar dados do cliente ao editar
  useEffect(() => {
    if (editingClient) {
      form.setFieldsValue({
        name: editingClient.name,
        apelido: editingClient.apelido,
        email: editingClient.email,
        phone: editingClient.phone,
        phone2: editingClient.phone2,
        birthDate: editingClient.birthDate ? dayjs(editingClient.birthDate) : null,
        gender: editingClient.gender,
        cpf: editingClient.cpf,
        cnpj: editingClient.cnpj,
        rg: editingClient.rg,
        referredBy: editingClient.referredBy,
        tags: editingClient.tags,
        address: editingClient.address,
        city: editingClient.city,
        state: editingClient.state,
        zipCode: editingClient.zipCode,
        notes: editingClient.notes,
        defaultDiscount: editingClient.defaultDiscount,
        discountType: editingClient.discountType,
        active: editingClient.active !== false,
        notifications: editingClient.notifications !== false,
        blocked: editingClient.blocked === true,
      })
      if (editingClient.avatar) {
        setAvatarPreview(editingClient.avatar)
      }
    } else {
      form.resetFields()
      setAvatarPreview(null)
    }
  }, [editingClient, form, open])

  const handleSave = (values: any) => {
    const clientData = {
      ...values,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      avatar: avatarPreview,
    }

    saveClient(clientData, {
      onSuccess: (response) => {
        onSuccess?.(response)
        onClose()
        form.resetFields()
        setAvatarPreview(null)
      },
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <ModalWithSidebar
      title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      open={open}
      onClose={onClose}
      onSave={() => form.submit()}
      isSaving={isSaving}
      tabs={[
        { key: 'cadastro', label: 'Cadastro' },
        { key: 'painel', label: 'Painel' },
        { key: 'debitos', label: 'Débitos' },
        { key: 'creditos', label: 'Créditos' },
        { key: 'cashback', label: 'Cashback' },
        { key: 'agendamentos', label: 'Agendamentos' },
        { key: 'vendas', label: 'Vendas' },
        { key: 'pacotes', label: 'Pacotes' },
        { key: 'mensagens', label: 'Mensagens' },
        { key: 'anotacoes', label: 'Anotações' },
        { key: 'imagens', label: 'Imagens e Arquivos' },
        { key: 'anamneses', label: 'Anamneses' },
        { key: 'vendas-assinatura', label: 'Vendas por Assinatura' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={
        <div style={{ textAlign: 'center' }}>
          <Avatar
            size={80}
            src={avatarPreview}
            icon={!avatarPreview ? <UserOutlined /> : undefined}
            style={{ marginBottom: 16, backgroundColor: '#505afb' }}
          />
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
          <Button
            type="primary"
            size="small"
            icon={<CameraOutlined />}
            style={{ width: '100%' }}
            onClick={() => document.getElementById('avatar-upload')?.click()}
          >
            Avatar
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Aba Cadastro */}
        {activeTab === 'cadastro' && (
          <>
            {/* Nome */}
            <Form.Item
              name="name"
              label="* Nome"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input placeholder="Nome" />
            </Form.Item>

            {/* Apelido */}
            <Form.Item name="apelido" label="Apelido">
              <Input placeholder="Apelido" />
            </Form.Item>

            {/* Celular e Telefone */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="phone" label="Celular">
                  <Input placeholder="+55" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone2" label="Telefone">
                  <Input placeholder="+55" />
                </Form.Item>
              </Col>
            </Row>

            {/* E-mail */}
            <Form.Item name="email" label="E-mail">
              <Input placeholder="E-mail" />
            </Form.Item>

            {/* Aniversário e CNPJ */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="birthDate" label="Aniversário">
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    placeholder="01/01/2000"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="cnpj" label="CNPJ">
                  <Input placeholder="CNPJ" />
                </Form.Item>
              </Col>
            </Row>

            {/* CPF e RG */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="cpf" label="CPF">
                  <Input placeholder="CPF" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="rg" label="RG">
                  <Input placeholder="RG" />
                </Form.Item>
              </Col>
            </Row>

            {/* Indicado por */}
            <Form.Item name="referredBy" label="Indicado por">
              <Select placeholder="Selecionar cliente" />
            </Form.Item>

            {/* Hashtags */}
            <Form.Item name="tags" label="Hashtags">
              <Input placeholder="Hashtags" />
            </Form.Item>

            {/* Observações */}
            <Form.Item name="notes" label="Observações">
              <Input.TextArea placeholder="Observações" rows={6} />
            </Form.Item>

            {/* Endereço - Seção colapsável */}
            <Divider orientation="left" style={{ marginTop: 24, marginBottom: 16 }}>
              Endereço
            </Divider>

            {/* CEP, Logradouro, Número */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="cep" label="CEP">
                  <Input placeholder="CEP" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="street" label="Logradouro">
                  <Input placeholder="Rua, Avenida, Travessa..." />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="number" label="Número">
                  <Input placeholder="Número" />
                </Form.Item>
              </Col>
            </Row>

            {/* Complemento e Bairro */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="complement" label="Complemento">
                  <Input placeholder="Complemento" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="neighborhood" label="Bairro">
                  <Input placeholder="Bairro" />
                </Form.Item>
              </Col>
            </Row>

            {/* Estado e Cidade */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="state" label="Estado">
                  <Select placeholder="Estado" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="city" label="Cidade">
                  <Select placeholder="Cidade" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Aba Painel */}
        {activeTab === 'painel' && (
          <>
            {/* Cards principais - 3 colunas */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <CalendarOutlined style={{ fontSize: 32 }} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{editingClient?.daysSinceLastVisit || 0}</div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>Dias sem vir</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <StarOutlined style={{ fontSize: 32 }} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        {editingClient?.rating ? editingClient.rating.toFixed(1) : 'Sem avaliação'}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>Última avaliação</div>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card style={{ background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', color: 'white', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <DollarOutlined style={{ fontSize: 32 }} />
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        R$ {(editingClient?.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>Faturamento</div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Grid de informações - 2x3 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Débitos</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#d97706' }}>
                        R$ {(editingClient?.totalDebt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <ShoppingCartOutlined style={{ fontSize: 24, color: '#d97706' }} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Pacotes em aberto</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>{editingClient?.openPackages || 0}</div>
                    </div>
                    <ShoppingCartOutlined style={{ fontSize: 24, color: '#999' }} />
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Crédito</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#22c55e' }}>
                        R$ {(editingClient?.creditBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <DollarOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Cashback</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#8b5cf6' }}>
                        R$ {(editingClient?.cashbackBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <DollarOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
                  </div>
                </Card>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Taxa de cancelamento</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        {(editingClient?.cancellationRate || 0).toFixed(1)}%
                      </div>
                    </div>
                    <PercentageOutlined style={{ fontSize: 24, color: '#999' }} />
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card style={{ height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ color: '#999', fontSize: 12 }}>Tempo como cliente</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        {editingClient?.daysSinceCreation || 0} {editingClient?.daysSinceCreation === 1 ? 'Dia' : 'Dias'}
                      </div>
                    </div>
                    <ClockCircleOutlined style={{ fontSize: 24, color: '#22c55e' }} />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Últimos serviços */}
            <Divider style={{ margin: '24px 0 16px' }}>Últimos serviços</Divider>
            <Card>
              <Table
                columns={[
                  {
                    title: 'Descrição',
                    dataIndex: 'description',
                    key: 'description',
                  },
                  {
                    title: 'Profissional',
                    dataIndex: 'professional',
                    key: 'professional',
                  },
                  {
                    title: 'Data',
                    dataIndex: 'date',
                    key: 'date',
                  },
                ]}
                dataSource={editingClient?.recentServices || []}
                pagination={false}
                locale={{ emptyText: <Empty description="Não há dados" /> }}
              />
            </Card>
          </>
        )}

        {/* Aba Débitos */}
        {activeTab === 'debitos' && (
          <>
            {/* Header com Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Débitos</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600 }}>
                <DollarOutlined style={{ color: '#d97706' }} />
                Total R$ {(editingClient?.totalDebt || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Seção Débitos */}
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ marginBottom: 16, fontSize: 14, fontWeight: 600 }}>Débitos</h4>
              <Table
                columns={[
                  {
                    title: 'Descrição',
                    dataIndex: 'description',
                    key: 'description',
                    width: '30%',
                  },
                  {
                    title: 'Vencimento',
                    dataIndex: 'dueDate',
                    key: 'dueDate',
                    width: '20%',
                  },
                  {
                    title: 'Valor',
                    dataIndex: 'amount',
                    key: 'amount',
                    width: '15%',
                    render: (amount) => `R$ ${(amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: '15%',
                    render: (status) => {
                      const statusColors: Record<string, string> = {
                        PENDING: 'orange',
                        OVERDUE: 'red',
                        PAID: 'green',
                        CANCELLED: 'default',
                      }
                      return <span style={{ color: statusColors[status as string] || '#999' }}>{status || 'Pendente'}</span>
                    },
                  },
                  {
                    title: 'Pagar',
                    key: 'pay',
                    width: '10%',
                    render: () => <Button type="primary" size="small">Pagar</Button>,
                  },
                  {
                    title: 'Ações',
                    key: 'actions',
                    width: '10%',
                    render: () => <a href="#" style={{ color: '#3b82f6' }}>Editar</a>,
                  },
                ]}
                dataSource={editingClient?.debts || []}
                pagination={false}
                locale={{ emptyText: <Empty description="Nenhum item encontrado" /> }}
              />
            </div>

            {/* Seção Comandas em aberto */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Comandas em aberto</h4>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  <DollarOutlined style={{ marginRight: 4, color: '#d97706' }} />
                  Total R$ {(editingClient?.openOrdersTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <Table
                columns={[
                  {
                    title: 'Comanda',
                    dataIndex: 'orderId',
                    key: 'orderId',
                    width: '25%',
                  },
                  {
                    title: 'Data',
                    dataIndex: 'date',
                    key: 'date',
                    width: '25%',
                  },
                  {
                    title: 'Valor',
                    dataIndex: 'amount',
                    key: 'amount',
                    width: '20%',
                    render: (amount) => `R$ ${(amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  },
                  {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: '20%',
                    render: (status) => {
                      const statusColors: Record<string, string> = {
                        OPEN: 'orange',
                        PENDING: 'blue',
                        CLOSED: 'green',
                        CANCELLED: 'default',
                      }
                      return <span style={{ color: statusColors[status as string] || '#999' }}>{status || 'Aberto'}</span>
                    },
                  },
                  {
                    title: 'Ações',
                    key: 'actions',
                    width: '10%',
                    render: () => <a href="#" style={{ color: '#3b82f6' }}>Editar</a>,
                  },
                ]}
                dataSource={editingClient?.openOrders || []}
                pagination={false}
                locale={{ emptyText: <Empty description="Nenhum item encontrado" /> }}
              />
            </div>
          </>
        )}

        {/* Aba Créditos */}
        {activeTab === 'creditos' && (
          <>
            {/* Header com Saldo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Histórico de crédito</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  <DollarOutlined style={{ marginRight: 4, color: '#22c55e' }} />
                  Saldo R$ {(editingClient?.creditBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <Button type="text" icon={<EditOutlined />} />
              </div>
            </div>

            {/* Tabela de Histórico */}
            <Table
              columns={[
                {
                  title: 'Data',
                  dataIndex: 'date',
                  key: 'date',
                  width: '25%',
                },
                {
                  title: 'Valor',
                  dataIndex: 'amount',
                  key: 'amount',
                  width: '20%',
                  render: (amount) => (
                    <span style={{ color: amount > 0 ? '#22c55e' : '#d97706' }}>
                      {amount > 0 ? '+' : ''} R$ {Math.abs(amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  title: 'Movimentação',
                  dataIndex: 'type',
                  key: 'type',
                  width: '25%',
                  render: (type) => {
                    const typeColors: Record<string, string> = {
                      'Acréscimo': '#22c55e',
                      'Desconto': '#d97706',
                      'Uso': '#ef4444',
                      'Ajuste': '#3b82f6',
                    }
                    return <span style={{ color: typeColors[type as string] || '#999' }}>{type || 'Movimentação'}</span>
                  },
                },
                {
                  title: 'Motivo',
                  dataIndex: 'reason',
                  key: 'reason',
                  width: '30%',
                },
              ]}
              dataSource={editingClient?.creditHistory || []}
              pagination={false}
              locale={{ emptyText: <Empty description="Não há dados" /> }}
            />
          </>
        )}

        {/* Aba Cashback */}
        {activeTab === 'cashback' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Programa de cashback</p>
          </>
        )}

        {/* Aba Agendamentos */}
        {activeTab === 'agendamentos' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Histórico de agendamentos</p>
          </>
        )}

        {/* Aba Vendas */}
        {activeTab === 'vendas' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Histórico de vendas</p>
          </>
        )}

        {/* Aba Pacotes */}
        {activeTab === 'pacotes' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Pacotes adquiridos</p>
          </>
        )}

        {/* Aba Mensagens */}
        {activeTab === 'mensagens' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Mensagens com o cliente</p>
          </>
        )}

        {/* Aba Anotações */}
        {activeTab === 'anotacoes' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Anotações sobre o cliente</p>
          </>
        )}

        {/* Aba Imagens e Arquivos */}
        {activeTab === 'imagens' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Imagens e arquivos do cliente</p>
          </>
        )}

        {/* Aba Anamneses */}
        {activeTab === 'anamneses' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Fichas de anamnese</p>
          </>
        )}

        {/* Aba Vendas por Assinatura */}
        {activeTab === 'vendas-assinatura' && (
          <>
            <p style={{ color: '#999', marginBottom: 16 }}>Assinaturas ativas</p>
          </>
        )}
      </Form>
    </ModalWithSidebar>
  )
}
