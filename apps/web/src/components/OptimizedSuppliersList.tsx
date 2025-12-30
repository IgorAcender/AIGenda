'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { SupplierFormModal } from './SupplierFormModal'
import { api } from '@/lib/api'

interface Supplier {
  id?: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string
  city?: string
  state?: string
  zipCode?: string
  description?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export function OptimizedSuppliersList() {
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  // Query otimizada com cache - carrega TODOS os fornecedores
  const { data: rawData = [], isLoading, isFetching, refetch, error } = useApiQuery(
    ['suppliers'],
    '/suppliers',
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  // Extrair array de fornecedores da resposta da API
  const suppliersData = Array.isArray(rawData) ? rawData : (rawData?.data || [])

  // Mutation para deletar fornecedor
  const deleteSupplierMutation = useApiMutation(
    async (supplierId: string) => {
      return await api.delete(`/suppliers/${supplierId}`)
    },
    [['suppliers']]
  )

  const handleDeleteSupplier = (supplierId: string) => {
    deleteSupplierMutation.mutate(supplierId, {
      onSuccess: () => {
        message.success('Fornecedor excluído com sucesso!')
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message || 'Erro ao excluir fornecedor'
        )
      },
    })
  }

  const columns: ColumnsType<Supplier> = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string | null) => email || '-',
    },
    {
      title: 'Telefone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
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
      render: (_: any, record: Supplier) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingSupplier(record)
              setIsModalOpen(true)
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="Excluir fornecedor"
            description="Tem certeza que deseja excluir este fornecedor?"
            onConfirm={() => {
              handleDeleteSupplier(record.id!)
            }}
            okText="Sim"
            cancelText="Não"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              loading={deleteSupplierMutation.isPending}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const suppliers = suppliersData

  const filteredSuppliers = suppliers.filter((supplier: Supplier) =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchText.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchText))
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Fornecedores</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingSupplier(null)
            setIsModalOpen(true)
          }}
        >
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Input
              placeholder="Buscar fornecedores..."
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
            <strong>Total:</strong> {filteredSuppliers.length} fornecedor{filteredSuppliers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            color: '#ff4d4f'
          }}>
            Erro ao carregar fornecedores. Verifique se o endpoint está disponível.
          </div>
        )}

        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={isLoading}
          virtual
          scroll={{ y: 500 }}
          pagination={false}
        />
      </Card>

      <SupplierFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSupplier(null)
        }}
        onSuccess={() => {
          refetch()
        }}
        editingSupplier={editingSupplier as any}
      />
    </div>
  )
}
