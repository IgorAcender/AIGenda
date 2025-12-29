'use client'

import React, { useState, useCallback } from 'react'
import { Table, Card, Button, Input, Space, Tag, message, Popconfirm, Typography, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ClientFormModal } from './ClientFormModal'

const { Title } = Typography

interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  active: boolean
}

/**
 * Componente otimizado para listar clientes com cache automático
 * Usa TanStack Query para cache inteligente e refetch automático
 */
export function OptimizedClientsList() {
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Query otimizada com cache - dados serão reutilizados entre navegações
  const { data, isLoading, isFetching, refetch } = useApiPaginatedQuery(
    'clients',
    '/clients',
    page,
    20,
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  // Mutation para deletar cliente
  const { mutate: deleteClient, isPending: isDeleting } = useApiMutation(
    async (clientId: string) => {
      return await api.delete(`/clients/${clientId}`)
    },
    [['clients', 'page', String(page)]]
  )

  const columns: ColumnsType<Client> = [
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
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
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
            onClick={() => {
              setEditingClient(record)
              setIsModalOpen(true)
            }}
          />
          <Popconfirm
            title="Deletar cliente"
            description="Tem certeza que deseja deletar este cliente?"
            onConfirm={() => deleteClient(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Button danger size="small" icon={<DeleteOutlined />} loading={isDeleting} />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card>
      <Row gutter={[16, 16]} align="middle">
        <Col flex="auto">
          <Title level={2}>Clientes</Title>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Buscar cliente..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingClient(null)
                setIsModalOpen(true)
              }}
            >
              Novo Cliente
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data?.data ?? []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: 20,
          total: data?.pagination?.total ?? 0,
          onChange: setPage,
        }}
        rowKey="id"
        style={{ marginTop: 24 }}
      />

      <ClientFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingClient(null)
        }}
        onSuccess={() => {
          message.success(editingClient ? 'Cliente atualizado!' : 'Cliente criado!')
          refetch()
        }}
        editingClient={editingClient}
      />
    </Card>
  )
}
