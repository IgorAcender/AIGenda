'use client'

import React, { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Divider,
  DatePicker,
} from 'antd'
import {
  PlusOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PrinterOutlined,
  HistoryOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface CashMovement {
  id: string
  type: 'income' | 'expense' | 'opening' | 'closing' | 'withdrawal' | 'deposit'
  description: string
  amount: number
  paymentMethod: string
  time: string
  user: string
}

interface CashSession {
  id: string
  date: string
  openingAmount: number
  closingAmount: number | null
  status: 'open' | 'closed'
  movements: CashMovement[]
}

// Mock data
const mockMovements: CashMovement[] = [
  {
    id: '1',
    type: 'opening',
    description: 'Abertura de caixa',
    amount: 200,
    paymentMethod: 'Dinheiro',
    time: '09:00',
    user: 'Admin',
  },
  {
    id: '2',
    type: 'income',
    description: 'Corte Feminino - Maria Silva',
    amount: 80,
    paymentMethod: 'Dinheiro',
    time: '09:45',
    user: 'Admin',
  },
  {
    id: '3',
    type: 'income',
    description: 'Manicure - Ana Paula',
    amount: 35,
    paymentMethod: 'Cartão Débito',
    time: '10:30',
    user: 'Admin',
  },
  {
    id: '4',
    type: 'expense',
    description: 'Compra de materiais',
    amount: 50,
    paymentMethod: 'Dinheiro',
    time: '11:15',
    user: 'Admin',
  },
  {
    id: '5',
    type: 'income',
    description: 'Corte Masculino - João Pedro',
    amount: 45,
    paymentMethod: 'PIX',
    time: '11:45',
    user: 'Admin',
  },
  {
    id: '6',
    type: 'withdrawal',
    description: 'Sangria de caixa',
    amount: 100,
    paymentMethod: 'Dinheiro',
    time: '14:00',
    user: 'Admin',
  },
]

export default function CashRegisterPage() {
  const [movements, setMovements] = useState<CashMovement[]>(mockMovements)
  const [isCashOpen, setIsCashOpen] = useState(true)
  const [openingAmount, setOpeningAmount] = useState(200)
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [movementType, setMovementType] = useState<'income' | 'expense' | 'withdrawal' | 'deposit'>('income')
  const [form] = Form.useForm()
  const [closeForm] = Form.useForm()

  // Calculate totals
  const totals = movements.reduce(
    (acc, m) => {
      if (m.type === 'opening') acc.opening = m.amount
      else if (m.type === 'income') acc.income += m.amount
      else if (m.type === 'expense') acc.expense += m.amount
      else if (m.type === 'withdrawal') acc.withdrawal += m.amount
      else if (m.type === 'deposit') acc.deposit += m.amount
      return acc
    },
    { opening: 0, income: 0, expense: 0, withdrawal: 0, deposit: 0 }
  )

  const expectedCash = totals.opening + totals.income - totals.expense - totals.withdrawal + totals.deposit
  const totalIncome = totals.income
  const totalExpense = totals.expense + totals.withdrawal

  const handleOpenCash = async () => {
    try {
      const values = await form.validateFields()
      const newMovement: CashMovement = {
        id: Date.now().toString(),
        type: 'opening',
        description: 'Abertura de caixa',
        amount: values.amount,
        paymentMethod: 'Dinheiro',
        time: dayjs().format('HH:mm'),
        user: 'Admin',
      }
      setMovements([newMovement])
      setOpeningAmount(values.amount)
      setIsCashOpen(true)
      setIsOpenModalOpen(false)
      form.resetFields()
      message.success('Caixa aberto com sucesso!')
    } catch (error) {
      console.error(error)
    }
  }

  const handleCloseCash = async () => {
    try {
      const values = await closeForm.validateFields()
      const difference = values.countedAmount - expectedCash
      
      if (difference !== 0) {
        Modal.confirm({
          title: 'Diferença de caixa',
          content: `Há uma diferença de ${formatCurrency(Math.abs(difference))} ${difference > 0 ? 'a mais' : 'a menos'} no caixa. Deseja fechar mesmo assim?`,
          onOk: () => {
            completeCashClose(values.countedAmount)
          },
        })
      } else {
        completeCashClose(values.countedAmount)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const completeCashClose = (countedAmount: number) => {
    const closingMovement: CashMovement = {
      id: Date.now().toString(),
      type: 'closing',
      description: `Fechamento de caixa - Contado: ${formatCurrency(countedAmount)}`,
      amount: countedAmount,
      paymentMethod: 'Dinheiro',
      time: dayjs().format('HH:mm'),
      user: 'Admin',
    }
    setMovements((prev) => [...prev, closingMovement])
    setIsCashOpen(false)
    setIsCloseModalOpen(false)
    closeForm.resetFields()
    message.success('Caixa fechado com sucesso!')
  }

  const handleAddMovement = async () => {
    try {
      const values = await form.validateFields()
      const newMovement: CashMovement = {
        id: Date.now().toString(),
        type: movementType,
        description: values.description,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        time: dayjs().format('HH:mm'),
        user: 'Admin',
      }
      setMovements((prev) => [...prev, newMovement])
      setIsMovementModalOpen(false)
      form.resetFields()
      message.success('Movimento adicionado!')
    } catch (error) {
      console.error(error)
    }
  }

  const openMovementModal = (type: 'income' | 'expense' | 'withdrawal' | 'deposit') => {
    setMovementType(type)
    form.resetFields()
    setIsMovementModalOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getMovementTypeConfig = (type: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      opening: { color: 'blue', label: 'Abertura' },
      closing: { color: 'purple', label: 'Fechamento' },
      income: { color: 'green', label: 'Entrada' },
      expense: { color: 'red', label: 'Saída' },
      withdrawal: { color: 'orange', label: 'Sangria' },
      deposit: { color: 'cyan', label: 'Suprimento' },
    }
    return configs[type] || { color: 'default', label: type }
  }

  const columns: ColumnsType<CashMovement> = [
    {
      title: 'Hora',
      dataIndex: 'time',
      key: 'time',
      width: 80,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const config = getMovementTypeConfig(type)
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Pagamento',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 140,
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 120,
      render: (amount: number, record: CashMovement) => {
        const isPositive = ['opening', 'income', 'deposit'].includes(record.type)
        return (
          <span
            style={{
              fontWeight: 600,
              color: isPositive ? '#52c41a' : '#f5222d',
            }}
          >
            {isPositive ? '+' : '-'} {formatCurrency(amount)}
          </span>
        )
      },
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
          Controle de Caixa
        </Title>
        <Space>
          {!isCashOpen ? (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setIsOpenModalOpen(true)}
            >
              Abrir Caixa
            </Button>
          ) : (
            <>
              <Button icon={<PrinterOutlined />}>Imprimir</Button>
              <Button
                type="primary"
                danger
                onClick={() => setIsCloseModalOpen(true)}
              >
                Fechar Caixa
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Status Card */}
      <Card style={{ marginBottom: 16 }}>
        <Row align="middle" gutter={16}>
          <Col>
            <Tag color={isCashOpen ? 'green' : 'red'} style={{ fontSize: 14, padding: '4px 12px' }}>
              {isCashOpen ? 'CAIXA ABERTO' : 'CAIXA FECHADO'}
            </Tag>
          </Col>
          <Col>
            <Text type="secondary">
              {dayjs().format('dddd, DD [de] MMMM [de] YYYY')}
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Abertura"
              value={totals.opening}
              precision={2}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Entradas"
              value={totalIncome}
              precision={2}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saídas"
              value={totalExpense}
              precision={2}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#f5222d' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saldo Esperado"
              value={expectedCash}
              precision={2}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#505afb', fontWeight: 'bold' }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      {isCashOpen && (
        <Card style={{ marginBottom: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<ArrowUpOutlined />}
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => openMovementModal('income')}
            >
              Entrada
            </Button>
            <Button
              type="primary"
              danger
              icon={<ArrowDownOutlined />}
              onClick={() => openMovementModal('expense')}
            >
              Saída
            </Button>
            <Divider type="vertical" />
            <Button onClick={() => openMovementModal('withdrawal')}>
              Sangria
            </Button>
            <Button onClick={() => openMovementModal('deposit')}>
              Suprimento
            </Button>
          </Space>
        </Card>
      )}

      {/* Movements Table */}
      <Card title="Movimentações do Dia">
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4}>
                  <Text strong>Saldo Atual em Caixa</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ color: '#505afb', fontSize: 16 }}>
                    {formatCurrency(expectedCash)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* Open Cash Modal */}
      <Modal
        title="Abrir Caixa"
        open={isOpenModalOpen}
        onOk={handleOpenCash}
        onCancel={() => setIsOpenModalOpen(false)}
        okText="Abrir"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="amount"
            label="Valor de Abertura"
            rules={[{ required: true, message: 'Informe o valor' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              addonBefore="R$"
              placeholder="0,00"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Close Cash Modal */}
      <Modal
        title="Fechar Caixa"
        open={isCloseModalOpen}
        onOk={handleCloseCash}
        onCancel={() => setIsCloseModalOpen(false)}
        okText="Fechar Caixa"
        cancelText="Cancelar"
      >
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Statistic
                title="Saldo Esperado"
                value={expectedCash}
                precision={2}
                formatter={(value) => formatCurrency(Number(value))}
              />
            </Col>
          </Row>
        </div>
        <Form form={closeForm} layout="vertical">
          <Form.Item
            name="countedAmount"
            label="Valor Contado em Caixa"
            rules={[{ required: true, message: 'Informe o valor contado' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              addonBefore="R$"
              placeholder="0,00"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Movement Modal */}
      <Modal
        title={
          movementType === 'income'
            ? 'Nova Entrada'
            : movementType === 'expense'
            ? 'Nova Saída'
            : movementType === 'withdrawal'
            ? 'Sangria de Caixa'
            : 'Suprimento de Caixa'
        }
        open={isMovementModalOpen}
        onOk={handleAddMovement}
        onCancel={() => setIsMovementModalOpen(false)}
        okText="Adicionar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="description"
            label="Descrição"
            rules={[{ required: true, message: 'Descrição é obrigatória' }]}
          >
            <Input placeholder="Descrição do movimento" />
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
                name="paymentMethod"
                label="Forma de Pagamento"
                rules={[{ required: true, message: 'Obrigatório' }]}
              >
                <Select placeholder="Selecione">
                  <Select.Option value="Dinheiro">Dinheiro</Select.Option>
                  <Select.Option value="Cartão Débito">Cartão Débito</Select.Option>
                  <Select.Option value="Cartão Crédito">Cartão Crédito</Select.Option>
                  <Select.Option value="PIX">PIX</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
