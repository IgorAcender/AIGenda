'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  active: boolean
}

export function OptimizedServicesList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, refetch } = useApiPaginatedQuery(
    'services',
    '/services',
    page,
    20,
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  const columns: ColumnsType<Service> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Duração',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} min`,
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `R$ ${price.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Ativo' : 'Inativo'}
        </Tag>
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
          >
            Editar
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />}>
            Excluir
          </Button>
        </Space>
      ),
    },
  ]

  const services = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Serviços</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Novo Serviço
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar serviços..."
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
          dataSource={services}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} serviços`,
            onChange: (newPage) => setPage(newPage),
          }}
        />
      </Card>
    </div>
  )
}
