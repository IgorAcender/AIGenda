'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd'
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserDeleteOutlined,
  SyncOutlined,
  RiseOutlined,
  TeamOutlined,
  PercentageOutlined,
} from '@ant-design/icons'
import { useApiQuery } from '@/hooks/useApi'

const { Title } = Typography

export function OptimizedDashboard() {
  const { data, isLoading } = useApiQuery(
    ['dashboard'],
    '/dashboard',
    {
      staleTime: 2 * 60 * 1000, // 2 minutos (dashboard precisa ser mais atualizado)
      gcTime: 5 * 60 * 1000,
    }
  )

  if (isLoading || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    )
  }

  const { stats } = data

  // Cards grandes no topo
  const topCards = [
    {
      title: 'TOTAL AGENDADO',
      value: stats.totalScheduled,
      subtitle: 'Dezembro 2025',
      color: '#6366f1',
      icon: <CalendarOutlined />,
    },
    {
      title: 'CONFIRMADOS',
      value: stats.confirmedCount,
      subtitle: 'Prontos para execução',
      percent: `${stats.confirmedPercent}%`,
      color: '#10b981',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'PENDENTES',
      value: stats.scheduledCount,
      subtitle: 'Aguardando confirmação',
      percent: `${stats.scheduledPercent}%`,
      color: '#f59e0b',
      icon: <ClockCircleOutlined />,
    },
    {
      title: 'CANCELADOS',
      value: stats.cancelledCount,
      subtitle: 'Não realizados',
      percent: `${stats.cancelledPercent}%`,
      color: '#ef4444',
      icon: <CloseCircleOutlined />,
    },
    {
      title: 'NÃO COMPARECEU',
      value: stats.noShowCount,
      subtitle: 'Faltaram à consulta',
      percent: `${stats.noShowPercent}%`,
      color: '#8b5cf6',
      icon: <UserDeleteOutlined />,
    },
  ]

  // Cards pequenos com métricas
  const metricsCards = [
    {
      title: 'TAXA DE CONVERSÃO',
      value: `${stats.conversionRate}%`,
      subtitle: 'Agendamentos confirmados',
      icon: <RiseOutlined />,
    },
    {
      title: 'REMARCAÇÕES',
      value: stats.rescheduledCount,
      subtitle: 'Reagendados',
      icon: <SyncOutlined />,
    },
    {
      title: 'HOJE',
      value: stats.todayConfirmed,
      subtitle: 'Agendamentos',
      icon: <CalendarOutlined />,
    },
    {
      title: 'HOJE CONFIRMADO',
      value: stats.todayConfirmed,
      subtitle: 'Confirmados',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'TAXA CANCELAMENTO',
      value: `${stats.cancellationRate}%`,
      subtitle: 'Cancelamentos',
      icon: <PercentageOutlined />,
    },
    {
      title: 'TAXA DE OCUPAÇÃO',
      value: `${stats.occupationRate}%`,
      subtitle: 'Horários ocupados',
      icon: <ClockCircleOutlined />,
    },
  ]

  // Cards de média
  const averageCards = [
    {
      title: 'MÉDIA POR DIA',
      value: stats.averagePerDay,
      subtitle: 'Agendamentos diários',
      icon: <CalendarOutlined />,
    },
    {
      title: 'MÉDIA POR PROFISSIONAL',
      value: stats.averagePerProfessional,
      subtitle: 'Por profissional',
      icon: <TeamOutlined />,
    },
  ]

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard</Title>

      {/* Cards Grandes - Status dos Agendamentos */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {topCards.map((card, index) => (
          <Col span={24 / 5} key={index}>
            <Card
              style={{
                background: card.color,
                borderRadius: 12,
                border: 'none',
                height: '100%',
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ 
                  fontSize: 11, 
                  fontWeight: 600, 
                  marginBottom: 10,
                  opacity: 0.9,
                  letterSpacing: '0.5px'
                }}>
                  {card.title}
                </div>
                <div style={{ 
                  fontSize: 40, 
                  fontWeight: 700, 
                  marginBottom: 6,
                  lineHeight: 1,
                }}>
                  {card.value}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  opacity: 0.9,
                  marginBottom: 4 
                }}>
                  {card.subtitle}
                </div>
                {card.percent && (
                  <div style={{ 
                    fontSize: 18, 
                    fontWeight: 600,
                    marginTop: 6 
                  }}>
                    {card.percent}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Cards Pequenos - Métricas */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {metricsCards.map((card, index) => (
          <Col xs={24} sm={12} lg={4} key={index}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.icon}
                valueStyle={{ fontSize: 28, fontWeight: 600, color: '#1890ff' }}
              />
              <div style={{ 
                fontSize: 12, 
                color: '#8c8c8c', 
                marginTop: 8 
              }}>
                {card.subtitle}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Cards de Média */}
      <Row gutter={[16, 16]}>
        {averageCards.map((card, index) => (
          <Col xs={24} sm={12} key={index}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.icon}
                valueStyle={{ fontSize: 32, fontWeight: 600, color: '#52c41a' }}
              />
              <div style={{ 
                fontSize: 13, 
                color: '#8c8c8c', 
                marginTop: 8 
              }}>
                {card.subtitle}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  )
}
