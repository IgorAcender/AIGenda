'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, notification } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { Popconfirm } from 'antd'
import { ServiceFormModal } from './ServiceFormModal'
import { api } from '@/lib/api'
import { Service } from '@/services/serviceService'

export function OptimizedServicesList() {
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const { data: rawData = [], isLoading, refetch } = useApiQuery(
    ['services'],
    '/services',
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  // Extrair array de serviços da resposta da API
  const servicesData = Array.isArray(rawData) ? rawData : (rawData?.data || [])

  // Mutation para deletar serviço
  const deleteServiceMutation = useApiMutation(
    async (serviceId: string) => {
      return await api.delete(`/services/${serviceId}`)
    },
    [['services']]
  )

  const handleDeleteService = (serviceId: string) => {
    deleteServiceMutation.mutate(serviceId, {
      onSuccess: () => {
        notification.success({
          message: 'Sucesso!',
          description: 'Serviço excluído com sucesso!',
          placement: 'topRight',
        })
      },
      onError: (error: any) => {
        notification.error({
          message: 'Erro ao excluir',
          description: error?.response?.data?.message || 'Erro ao excluir serviço',
          placement: 'topRight',
        })
      },
    })
  }

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
          <Popconfirm
            title="Excluir serviço"
            description="Tem certeza que deseja excluir este serviço?"
            onConfirm={() => {
              handleDeleteService(record.id!)
            }}
            okText="Sim"
            cancelText="Não"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              loading={deleteServiceMutation.isPending}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filteredServices = servicesData.filter((service: Service) =>
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
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
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
          <div style={{ fontSize: 14, color: '#666' }}>
            <strong>Total:</strong> {filteredServices.length} serviço{filteredServices.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredServices}
          rowKey="id"
          loading={isLoading}
          virtual
          scroll={{ y: 500 }}
          pagination={false}
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
