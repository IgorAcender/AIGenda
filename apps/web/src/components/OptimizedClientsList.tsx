'use client'

import React, { useState, useCallback } from 'react'
import { Table, Card, Button, Input, Space, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'
import { ClientFormModal } from './ClientFormModal'

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
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Query otimizada com cache - carrega TODOS os clientes
  const { data: clientsData = [], isLoading, isFetching, refetch } = useApiQuery(
    ['clients'],
    '/clients',
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  // Mutation para deletar cliente
  const deleteClientMutation = useApiMutation(
    async (clientId: string) => {
      return await api.delete(`/clients/${clientId}`)
    },
    [['clients']]
  )

  const handleDeleteClient = (clientId: string) => {
    deleteClientMutation.mutate(clientId, {
      onSuccess: () => {
        message.success('Cliente excluído com sucesso!')
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message || 'Erro ao excluir cliente'
        )
      },
    })
  }

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
          >
            Editar
          </Button>
          <Popconfirm
            title="Excluir cliente"
            description="Tem certeza que deseja excluir este cliente?"
            onConfirm={() => {
              handleDeleteClient(record.id)
            }}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleteClientMutation.isPending}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const clients = clientsData
  const totalClients = clientsData.length

  const filteredClients = clients.filter((client: Client) =>
    client.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchText.toLowerCase())) ||
    (client.phone && client.phone.includes(searchText))
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Clientes</h2>
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
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar cliente..."
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
          dataSource={filteredClients}
          rowKey="id"
          loading={isLoading}
          virtual
          scroll={{ y: 500 }}
          pagination={{
            pageSize: 50,
            hideOnSinglePage: false,
            showTotal: (total) => `Total: ${total} cliente${total !== 1 ? 's' : ''}`,
          }}
        />
      </Card>

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
    </div>
  )
}
