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
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  Statistic,
  Segmented,
  InputNumber,
  Tooltip,
  Popconfirm,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  WalletOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface Transaction {
  id: string
  description: string
  type: 'income' | 'expense'
  category: string
  amount: number
  date: string
  paymentMethod: string
  status: 'pending' | 'paid' | 'cancelled'
  notes: string | null
}

const categories = {
  income: [
    'Serviços',
    'Produtos',
    'Pacotes',
    'Outros recebimentos',
  ],
  expense: [
    'Salários',
    'Comissões',
    'Aluguel',
    'Fornecedores',
    'Energia',
    'Água',
    'Internet',
    'Marketing',
    'Materiais',
    'Outros gastos',
  ],
}

const paymentMethods = [
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'PIX',
  'Transferência',
  'Boleto',
]

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Corte Feminino - Maria Silva',
    type: 'income',
    category: 'Serviços',
    amount: 80,
    date: dayjs().format('YYYY-MM-DD'),
    paymentMethod: 'PIX',
    status: 'paid',
    notes: null,
  },
  {
    id: '2',
    description: 'Manicure - Ana Paula',
    type: 'income',
    category: 'Serviços',
    amount: 35,
    date: dayjs().format('YYYY-MM-DD'),
    paymentMethod: 'Cartão de Crédito',
    status: 'paid',
    notes: null,
  },
  {
    id: '3',
    description: 'Pagamento de aluguel',
    type: 'expense',
    category: 'Aluguel',
    amount: 2500,
    date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    paymentMethod: 'Transferência',
    status: 'paid',
    notes: null,
  },
  {
    id: '4',
    description: 'Comissão - Dra. Carla',
    type: 'expense',
    category: 'Comissões',
    amount: 350,
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    paymentMethod: 'PIX',
    status: 'pending',
    notes: 'Pagamento semanal',
  },
  {
    id: '5',
    description: 'Venda de shampoo',
    type: 'income',
    category: 'Produtos',
    amount: 45,
    date: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    paymentMethod: 'Dinheiro',
    status: 'paid',
    notes: null,
  },
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income')
  const [form] = Form.useForm()

  // Calculate totals
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.status !== 'cancelled') {
        if (t.type === 'income') acc.income += t.amount
        else acc.expense += t.amount
      }
      return acc
    },
    { income: 0, expense: 0 }
  )
  const balance = totals.income - totals.expense

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesStatus = !filterStatus || t.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const handleCreate = (type: 'income' | 'expense') => {
    setEditingTransaction(null)
    setTransactionType(type)
    form.resetFields()
    form.setFieldsValue({
      type,
      date: dayjs(),
      status: 'paid',
    })
    setIsModalOpen(true)
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setTransactionType(transaction.type)
    form.setFieldsValue({
      ...transaction,
      date: dayjs(transaction.date),
    })
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      const transactionData = {
        ...values,
        type: transactionType,
        date: values.date.format('YYYY-MM-DD'),
      }

      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.id === editingTransaction.id ? { ...t, ...transactionData } : t
          )
        )
        message.success('Transação atualizada!')
      } else {
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          ...transactionData,
        }
        setTransactions((prev) => [newTransaction, ...prev])
        message.success('Transação criada!')
      }

      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    message.success('Transação excluída!')
  }

  const handleStatusChange = (id: string, status: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: status as Transaction['status'] } : t))
    )
    message.success('Status atualizado!')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      width: 100,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, record: Transaction) => (
        <div>
          <Space>
            {record.type === 'income' ? (
              <ArrowUpOutlined style={{ color: '#52c41a' }} />
            ) : (
              <ArrowDownOutlined style={{ color: '#f5222d' }} />
            )}
            <span style={{ fontWeight: 500 }}>{description}</span>
          </Space>
          <div style={{ fontSize: 12, color: '#666' }}>
            <Tag>{record.category}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Forma de Pagamento',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Transaction) => {
        const statusConfig = {
          pending: { color: 'orange', label: 'Pendente' },
          paid: { color: 'green', label: 'Pago' },
          cancelled: { color: 'red', label: 'Cancelado' },
        }
        const config = statusConfig[status as keyof typeof statusConfig]
        return (
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record.id, value)}
            style={{ width: 120 }}
            size="small"
          >
            <Select.Option value="pending">
              <Tag color="orange">Pendente</Tag>
            </Select.Option>
            <Select.Option value="paid">
              <Tag color="green">Pago</Tag>
            </Select.Option>
            <Select.Option value="cancelled">
              <Tag color="red">Cancelado</Tag>
            </Select.Option>
          </Select>
        )
      },
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount: number, record: Transaction) => (
        <span
          style={{
            fontWeight: 600,
            color: record.type === 'income' ? '#52c41a' : '#f5222d',
          }}
        >
          {record.type === 'expense' && '-'}
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 100,
      render: (_, record: Transaction) => (
        <Space>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Excluir transação"
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
          Transações
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<ArrowUpOutlined />}
            style={{ backgroundColor: '#52c41a' }}
            onClick={() => handleCreate('income')}
          >
            Nova Receita
          </Button>
          <Button
            type="primary"
            danger
            icon={<ArrowDownOutlined />}
            onClick={() => handleCreate('expense')}
          >
            Nova Despesa
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Receitas"
              value={totals.income}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Despesas"
              value={totals.expense}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Saldo"
              value={balance}
              precision={2}
              prefix={<WalletOutlined />}
              valueStyle={{ color: balance >= 0 ? '#52c41a' : '#f5222d' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Input
                placeholder="Buscar..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Segmented
                options={[
                  { label: 'Todas', value: 'all' },
                  { label: 'Receitas', value: 'income' },
                  { label: 'Despesas', value: 'expense' },
                ]}
                value={filterType}
                onChange={(value) => setFilterType(value as typeof filterType)}
              />
            </Col>
            <Col>
              <Select
                placeholder="Status"
                style={{ width: 120 }}
                allowClear
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Select.Option value="pending">Pendente</Select.Option>
                <Select.Option value="paid">Pago</Select.Option>
                <Select.Option value="cancelled">Cancelado</Select.Option>
              </Select>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} transações`,
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          editingTransaction
            ? 'Editar Transação'
            : transactionType === 'income'
            ? 'Nova Receita'
            : 'Nova Despesa'
        }
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
            name="description"
            label="Descrição"
            rules={[{ required: true, message: 'Descrição é obrigatória' }]}
          >
            <Input placeholder="Ex: Corte de cabelo - Cliente X" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="Valor"
                rules={[{ required: true, message: 'Valor é obrigatório' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  addonBefore="R$"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Data"
                rules={[{ required: true, message: 'Data é obrigatória' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Categoria"
                rules={[{ required: true, message: 'Categoria é obrigatória' }]}
              >
                <Select placeholder="Selecione">
                  {categories[transactionType].map((cat) => (
                    <Select.Option key={cat} value={cat}>
                      {cat}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentMethod"
                label="Forma de Pagamento"
                rules={[{ required: true, message: 'Obrigatório' }]}
              >
                <Select placeholder="Selecione">
                  {paymentMethods.map((method) => (
                    <Select.Option key={method} value={method}>
                      {method}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="pending">Pendente</Select.Option>
              <Select.Option value="paid">Pago</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={2} placeholder="Observações" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
