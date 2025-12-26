'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'

interface Professional {
  id: string
  name: string
  email: string | null
  phone: string | null
  specialty: string | null
  active: boolean
}

/**
 * Componente otimizado para listar profissionais com cache automático
 * Usa TanStack Query para cache inteligente e refetch automático
 */
export function OptimizedProfessionalsList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')

  // Query otimizada com cache - dados serão reutilizados entre navegações
  const { data, isLoading, refetch } = useApiPaginatedQuery(
    'professionals',
    '/professionals',
    page,
    20,
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  const columns: ColumnsType<Professional> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Especialidade',
      dataIndex: 'specialty',
      key: 'specialty',
      render: (specialty) => specialty || '-',
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => router.push(`/cadastro/profissionais/${record.id}`)}
          >
            Editar
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ]

  const professionals = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Profissionais</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/cadastro/profissionais/novo')}
        >
          Novo Profissional
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
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={professionals}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} profissionais`,
            onChange: (newPage) => setPage(newPage),
          }}
        />
      </Card>
    </div>
  )
}
