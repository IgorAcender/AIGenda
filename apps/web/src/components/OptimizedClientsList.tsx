'use client'

import React, { useState, useCallback } from 'react'
import { Table, Card, Button, Input, Space, Tag, Modal, Form, message, Popconfirm, Typography, Row, Col } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useApiPaginatedQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

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
  const [form] = Form.useForm()

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

  // Mutation para criar/atualizar cliente
  const { mutate: saveClient, isPending: isSaving } = useApiMutation(
    async (clientData) => {
      if (editingClient) {
        return await api.put(`/clients/${editingClient.id}`, clientData)
      } else {
        return await api.post('/clients', clientData)
      }
    },
    [['clients', 'page', String(page)]] // Invalidar este query após salvar
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
              form.setFieldsValue(record)
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

  const handleSave = async (values: any) => {
    saveClient(values, {
      onSuccess: () => {
        message.success(editingClient ? 'Cliente atualizado!' : 'Cliente criado!')
        setIsModalOpen(false)
        setEditingClient(null)
        form.resetFields()
      },
      onError: (error: any) => {
        message.error(error.message || 'Erro ao salvar cliente')
      },
    })
  }

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
                form.resetFields()
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

      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSaving}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input type="email" />
          </Form.Item>
          <Form.Item name="phone" label="Telefone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
