'use client'

import React, { useState } from 'react'
import { Table, Card, Button, Input, Space, Tag, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { ProfessionalFormModal } from './ProfessionalFormModal'
import { api } from '@/lib/api'

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
  const [searchText, setSearchText] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | undefined>()

  // Query otimizada com cache - carrega TODOS os profissionais
  const { data: rawData = [], isLoading, refetch } = useApiQuery(
    ['professionals'],
    '/professionals',
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    }
  )

  // Extrair array de profissionais da resposta da API
  const professionalsData = Array.isArray(rawData) ? rawData : (rawData?.data || [])

  // Mutation para deletar profissional
  const deleteProfessionalMutation = useApiMutation(
    async (professionalId: string) => {
      return await api.delete(`/professionals/${professionalId}`)
    },
    [['professionals']]
  )

  const handleDeleteProfessional = (professionalId: string) => {
    deleteProfessionalMutation.mutate(professionalId, {
      onSuccess: () => {
        message.success('Profissional excluído com sucesso!')
      },
      onError: (error: any) => {
        message.error(
          error?.response?.data?.message || 'Erro ao excluir profissional'
        )
      },
    })
  }

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
            onClick={() => {
              setSelectedProfessionalId(record.id)
              setModalVisible(true)
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="Excluir profissional"
            description="Tem certeza que deseja excluir este profissional?"
            onConfirm={() => {
              handleDeleteProfessional(record.id)
            }}
            okText="Sim"
            cancelText="Não"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleteProfessionalMutation.isPending}
            >
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const professionals = professionalsData

  const filteredProfessionals = professionals.filter((professional: Professional) =>
    professional.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (professional.email && professional.email.toLowerCase().includes(searchText.toLowerCase())) ||
    (professional.phone && professional.phone.includes(searchText))
  )

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Profissionais</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedProfessionalId(undefined)
            setModalVisible(true)
          }}
        >
          Novo Profissional
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16 }}>
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
          <div style={{ fontSize: 14, color: '#666' }}>
            <strong>Total:</strong> {filteredProfessionals.length} profissional{filteredProfessionals.length !== 1 ? 'is' : ''}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProfessionals}
          rowKey="id"
          loading={isLoading}
          virtual
          scroll={{ y: 500 }}
          pagination={false}
        />
      </Card>

      <ProfessionalFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedProfessionalId(undefined)
        }}
        onSuccess={() => refetch()}
        professionalId={selectedProfessionalId}
      />
    </div>
  )
}
