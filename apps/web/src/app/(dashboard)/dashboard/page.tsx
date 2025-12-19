'use client'

import React from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Typography, Space } from 'antd'
import {
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// Mock data - será substituído por dados da API
const stats = {
  appointmentsToday: 12,
  appointmentsMonth: 156,
  revenueMonth: 15680.0,
  totalClients: 342,
  totalProfessionals: 5,
}

const upcomingAppointments = [
  {
    id: '1',
    time: '09:00',
    client: 'Maria Silva',
    service: 'Corte Feminino',
    professional: 'Ana',
    status: 'CONFIRMED',
  },
  {
    id: '2',
    time: '10:00',
    client: 'João Santos',
    service: 'Corte Masculino',
    professional: 'Carlos',
    status: 'SCHEDULED',
  },
  {
    id: '3',
    time: '11:30',
    client: 'Paula Oliveira',
    service: 'Manicure + Pedicure',
    professional: 'Fernanda',
    status: 'CONFIRMED',
  },
  {
    id: '4',
    time: '14:00',
    client: 'Roberto Lima',
    service: 'Barba',
    professional: 'Carlos',
    status: 'SCHEDULED',
  },
  {
    id: '5',
    time: '15:30',
    client: 'Carla Mendes',
    service: 'Escova Progressiva',
    professional: 'Ana',
    status: 'CONFIRMED',
  },
]

const recentTransactions = [
  {
    id: '1',
    description: 'Corte Feminino - Maria Silva',
    amount: 80.0,
    type: 'INCOME',
    date: '2024-12-19 09:30',
  },
  {
    id: '2',
    description: 'Manicure - Paula Oliveira',
    amount: 45.0,
    type: 'INCOME',
    date: '2024-12-19 08:15',
  },
  {
    id: '3',
    description: 'Produtos de Limpeza',
    amount: -150.0,
    type: 'EXPENSE',
    date: '2024-12-18 17:00',
  },
]

const statusColors: Record<string, string> = {
  SCHEDULED: 'blue',
  CONFIRMED: 'green',
  COMPLETED: 'default',
  CANCELED: 'red',
  NO_SHOW: 'orange',
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

export default function DashboardPage() {
  const appointmentColumns = [
    {
      title: 'Horário',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text strong>{time}</Text>
        </Space>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Serviço',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Profissional',
      dataIndex: 'professional',
      key: 'professional',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
  ]

  const transactionColumns = [
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Valor',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text
          strong
          style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}
        >
          {amount >= 0 ? '+' : ''}
          {amount.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </Text>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM HH:mm'),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Painel
      </Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Agendamentos Hoje"
              value={stats.appointmentsToday}
              prefix={<CalendarOutlined style={{ color: '#505afb' }} />}
              valueStyle={{ color: '#505afb' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Agendamentos do Mês"
              value={stats.appointmentsMonth}
              prefix={<CalendarOutlined style={{ color: '#722ed1' }} />}
              suffix={
                <Text type="success" style={{ fontSize: 14 }}>
                  <ArrowUpOutlined /> 12%
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Receita do Mês"
              value={stats.revenueMonth}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              formatter={(value) =>
                `R$ ${Number(value).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}`
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title="Total de Clientes"
              value={stats.totalClients}
              prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <CalendarOutlined />
                Próximos Agendamentos
              </Space>
            }
            extra={<a href="/agenda">Ver todos</a>}
          >
            <Table
              dataSource={upcomingAppointments}
              columns={appointmentColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <DollarOutlined />
                Últimas Transações
              </Space>
            }
            extra={<a href="/financeiro/transacoes">Ver todas</a>}
          >
            <Table
              dataSource={recentTransactions}
              columns={transactionColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
