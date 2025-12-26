'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery } from '@/hooks/useApi'

interface Category {
  id: string
  name: string
  description: string | null
  active: boolean
}

export function OptimizedCategoriesList() {
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')

  const { data, isLoading, refetch } = useApiPaginatedQuery(
    'categories',
    '/categories',
    page,
    20,
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  const columns: ColumnsType<Category> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string | null) => desc || '-',
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
      render: (_: any, record: Category) => (
        <Space>
          <Button type="primary" size="small" icon={<EditOutlined />}>
            Editar
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />}>
            Excluir
          </Button>
        </Space>
      ),
    },
  ]

  const categories = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Categorias</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Nova Categoria
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar categorias..."
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
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Total: ${total} categorias`,
            onChange: (newPage) => setPage(newPage),
          }}
        />
      </Card>
    </div>
  )
}
