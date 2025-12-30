'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { CategoryFormModal } from './CategoryFormModal'
import { api } from '@/lib/api'

interface Category {
  id?: string
  name: string
  description?: string | null
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export function OptimizedCategoriesList() {
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { data: rawData = [], isLoading, refetch } = useApiQuery(
    ['categories'],
    '/categories',
    {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    }
  )

  const categoriesData = Array.isArray(rawData) ? rawData : (rawData?.data || [])

  const deleteCategoryMutation = useApiMutation(
    async (categoryId: string) => {
      return await api.delete(`/categories/${categoryId}`)
    },
    [['categories']]
  )

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategoryMutation.mutate(categoryId, {
      onSuccess: () => {
        message.success('Categoria excluída com sucesso!')
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message || 'Erro ao excluir categoria'
        )
      },
    })
  }

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
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCategory(record)
              setIsModalOpen(true)
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="Excluir categoria"
            description="Tem certeza que deseja excluir esta categoria?"
            onConfirm={() => {
              handleDeleteCategory(record.id!)
            }}
            okText="Sim"
            cancelText="Não"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              loading={deleteCategoryMutation.isPending}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const filteredCategories = categoriesData.filter((category: Category) =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Categorias</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null)
            setIsModalOpen(true)
          }}
        >
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
          dataSource={filteredCategories}
          rowKey="id"
          loading={isLoading}
          virtual
          scroll={{ y: 500 }}
          pagination={{
            pageSize: 50,
            hideOnSinglePage: false,
            showTotal: (total) => `Total: ${total} categor${total !== 1 ? 'ias' : 'ia'}`,
          }}
        />
      </Card>

      <CategoryFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingCategory(null)
        }}
        onSuccess={() => {
          refetch()
        }}
        editingCategory={editingCategory as any}
      />
    </div>
  )
}
