'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery, useApiMutation } from '@/hooks/useApi'
import { useRouter } from 'next/navigation'
import { ServiceFormModal } from './ServiceFormModal'
import { api } from '@/lib/api'
import { Service } from '@/services/serviceService'

export function OptimizedServicesList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

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

  const { mutate: deleteService } = useApiMutation(
    async (serviceId: string) => {
      return await api.delete(`/services/${serviceId}`)
    },
    [['services']]
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
            onClick={() => {
              setEditingService(record)
              setIsModalOpen(true)
            }}
          >
            Editar
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => {
              deleteService(record.id, {
                onSuccess: () => {
                  message.success('Serviço deletado com sucesso!')
                  refetch()
                },
                onError: (error: any) => {
                  message.error(error.message || 'Erro ao deletar serviço')
                },
              })
            }}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ]

  const services = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 }

  const filteredServices = services.filter((service: Service) =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Serviços</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingService(null)
            setIsModalOpen(true)
          }}
        >
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
          dataSource={filteredServices}
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

      <ServiceFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingService(null)
        }}
        onSuccess={() => {
          refetch()
        }}
        editingService={editingService}
      />
    </div>
  )
}
