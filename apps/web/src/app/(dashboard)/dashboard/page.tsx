'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Avatar,
  Spin,
  message,
  Tabs,
} from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  AppstoreOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { api } from '@/lib/api'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface DashboardData {
  stats: {
    appointmentsToday: number
    appointmentsMonth: number
    revenueMonth: number
    totalClients: number
    totalProfessionals: number
    // Stats por status
    totalScheduled: number
    confirmedCount: number
    confirmedPercent: number
    scheduledCount: number
    scheduledPercent: number
    cancelledCount: number
    cancelledPercent: number
    noShowCount: number
    noShowPercent: number
  }
  upcomingAppointments: Array<{
    id: string
    startTime: string
    endTime: string
    status: string
    client: { name: string }
    professional: { name: string }
    service: { name: string; price: number }
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    createdAt: string
    client?: { name: string }
  }>
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard')
        setData(response.data)
      } catch (error: any) {
        message.error('Erro ao carregar dashboard')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  // Formatar preço
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  const stats = data?.stats || {
    appointmentsToday: 0,
    appointmentsMonth: 0,
    revenueMonth: 0,
    totalClients: 0,
    totalProfessionals: 0,
    totalScheduled: 0,
    confirmedCount: 0,
    confirmedPercent: 0,
    scheduledCount: 0,
    scheduledPercent: 0,
    cancelledCount: 0,
    cancelledPercent: 0,
    noShowCount: 0,
    noShowPercent: 0,
  }

  const appointmentColumns = [
    {
      title: 'Horário',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          {dayjs(time).format('HH:mm')}
        </span>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
      render: (client: { name: string }) => (
        <span>
          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
          {client?.name || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Profissional',
      dataIndex: 'professional',
      key: 'professional',
      render: (prof: { name: string }) => prof?.name || 'N/A',
    },
    {
      title: 'Serviço',
      dataIndex: 'service',
      key: 'service',
      render: (service: { name: string; price: number }) => (
        <div>
          <div>{service?.name || 'N/A'}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {service?.price ? formatPrice(service.price) : ''}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          SCHEDULED: 'blue',
          CONFIRMED: 'green',
          COMPLETED: 'cyan',
          CANCELLED: 'red',
          NO_SHOW: 'orange',
        }
        const labels: Record<string, string> = {
          SCHEDULED: 'Agendado',
          CONFIRMED: 'Confirmado',
          COMPLETED: 'Concluído',
          CANCELLED: 'Cancelado',
          NO_SHOW: 'Não compareceu',
        }
        return <Tag color={colors[status]}>{labels[status] || status}</Tag>
      },
    },
  ]

  const transactionColumns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string, record: any) => (
        <div>
          <div>{desc || 'Transação'}</div>
          {record.client && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.client.name}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => (
        <span style={{ color: record.type === 'INCOME' ? '#52c41a' : '#f5222d' }}>
          {record.type === 'INCOME' ? '+' : '-'} {formatPrice(amount)}
        </span>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM HH:mm'),
    },
  ]

  const tabItems = [
    {
      key: 'operational',
      label: (
        <span>
          <AppstoreOutlined />
          Módulo Operacional
        </span>
      ),
      children: (
        <>
          {/* Cards de status de agendamentos - Estilo Belasis */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={4}>
              <Card
                style={{
                  backgroundColor: '#7c3aed',
                  border: 'none',
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, opacity: 0.9 }}>
                    TOTAL AGENDADO
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
                    {stats.totalScheduled}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Dezembro 2025
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card
                style={{
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, opacity: 0.9 }}>
                    CONFIRMADOS
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
                    {stats.confirmedCount}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                    Prontos para execução
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {stats.confirmedPercent}%
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card
                style={{
                  backgroundColor: '#f59e0b',
                  border: 'none',
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, opacity: 0.9 }}>
                    PENDENTES
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
                    {stats.scheduledCount}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                    Aguardando confirmação
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {stats.scheduledPercent}%
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card
                style={{
                  backgroundColor: '#ef4444',
                  border: 'none',
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, opacity: 0.9 }}>
                    CANCELADOS
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
                    {stats.cancelledCount}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                    Não realizados
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {stats.cancelledPercent}%
                  </div>
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={4}>
              <Card
                style={{
                  backgroundColor: '#8b5cf6',
                  border: 'none',
                  borderRadius: 12,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, opacity: 0.9 }}>
                    NÃO COMPARECEU
                  </div>
                  <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 8 }}>
                    {stats.noShowCount}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                    Faltaram à consulta
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {stats.noShowPercent}%
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Cards de informações rápidas */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Agendamentos Hoje"
                  value={stats.appointmentsToday}
                  prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Clientes Ativos"
                  value={stats.totalClients}
                  prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Profissionais"
                  value={stats.totalProfessionals}
                  prefix={<TeamOutlined style={{ color: '#13c2c2' }} />}
                  valueStyle={{ color: '#13c2c2' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Próximos agendamentos */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Próximos Agendamentos
                  </span>
                }
              >
                <Table
                  columns={appointmentColumns}
                  dataSource={data?.upcomingAppointments || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Nenhum agendamento próximo' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'financial',
      label: (
        <span>
          <WalletOutlined />
          Módulo Financeiro
        </span>
      ),
      children: (
        <>
          {/* Cards de estatísticas financeiras */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Receita do Mês"
                  value={stats.revenueMonth / 100}
                  precision={2}
                  prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Despesas do Mês"
                  value={0}
                  precision={2}
                  prefix={<ArrowDownOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="Saldo"
                  value={stats.revenueMonth / 100}
                  precision={2}
                  prefix={<WalletOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
              </Card>
            </Col>
          </Row>

          {/* Últimas transações */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card
                title={
                  <span>
                    <DollarOutlined style={{ marginRight: 8 }} />
                    Últimas Transações
                  </span>
                }
              >
                <Table
                  columns={transactionColumns}
                  dataSource={data?.recentTransactions || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Nenhuma transação recente' }}
                />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        Painel
      </Title>

      <Tabs
        defaultActiveKey="operational"
        items={tabItems}
        size="large"
        style={{ marginTop: 24 }}
      />
    </div>
  )
}
