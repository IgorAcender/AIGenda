'use client'

import React, { useState } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Select,
  Switch,
  InputNumber,
  Image,
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ProductFormModal } from '@/components/ProductFormModal'

const { Title } = Typography

interface Product {
  id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  price: number
  costPrice: number
  stock: number
  minStock: number
  categoryId: string | null
  categoryName: string | null
  active: boolean
  createdAt: string
}

interface Category {
  id: string
  name: string
}

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Cabelo' },
  { id: '2', name: 'Unhas' },
  { id: '3', name: 'Cosméticos' },
  { id: '4', name: 'Acessórios' },
]

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Shampoo Profissional 500ml',
    description: 'Shampoo para todos os tipos de cabelo',
    sku: 'SHAMP-001',
    barcode: '7891234567890',
    price: 45.0,
    costPrice: 22.0,
    stock: 25,
    minStock: 5,
    categoryId: '1',
    categoryName: 'Cabelo',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    name: 'Condicionador Profissional 500ml',
    description: 'Condicionador hidratante',
    sku: 'COND-001',
    barcode: '7891234567891',
    price: 50.0,
    costPrice: 25.0,
    stock: 18,
    minStock: 5,
    categoryId: '1',
    categoryName: 'Cabelo',
    active: true,
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    name: 'Esmalte Vermelho',
    description: 'Esmalte cor vermelho intenso',
    sku: 'ESM-001',
    barcode: '7891234567892',
    price: 12.0,
    costPrice: 5.0,
    stock: 50,
    minStock: 10,
    categoryId: '2',
    categoryName: 'Unhas',
    active: true,
    createdAt: '2024-01-12',
  },
  {
    id: '4',
    name: 'Hidratante Facial',
    description: 'Hidratante para pele seca',
    sku: 'HID-001',
    barcode: null,
    price: 89.0,
    costPrice: 45.0,
    stock: 3,
    minStock: 5,
    categoryId: '3',
    categoryName: 'Cosméticos',
    active: true,
    createdAt: '2024-02-01',
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories] = useState<Category[]>(mockCategories)
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
      product.barcode?.includes(searchText)
    const matchesCategory = !filterCategory || product.categoryId === filterCategory
    return matchesSearch && matchesCategory
  })

  const handleCreate = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleSave = async (productData: any) => {
    const category = categories.find((c) => c.id === productData.categoryId)
    const newProductData = {
      ...productData,
      categoryName: category?.name || null,
    }

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id ? { ...p, ...newProductData } : p
        )
      )
      message.success('Produto atualizado!')
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...newProductData,
        active: true,
        createdAt: new Date().toISOString(),
      }
      setProducts((prev) => [newProduct, ...prev])
      message.success('Produto criado!')
    }

    setIsModalOpen(false)
  }

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    message.success('Produto excluído!')
  }

  const handleToggleActive = (id: string, active: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active } : p))
    )
    message.success(active ? 'Produto ativado!' : 'Produto desativado!')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const columns: ColumnsType<Product> = [
    {
      title: 'Produto',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: Product) => (
        <div>
          <Space>
            <ShoppingOutlined style={{ color: '#505afb' }} />
            <span style={{ fontWeight: 500 }}>{name}</span>
          </Space>
          {record.sku && (
            <div style={{ fontSize: 12, color: '#666' }}>
              SKU: {record.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (category: string | null) =>
        category ? <Tag color="blue">{category}</Tag> : '-',
    },
    {
      title: 'Preço',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
      render: (price: number) => (
        <span style={{ fontWeight: 500 }}>{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'Custo',
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (costPrice: number) => formatCurrency(costPrice),
    },
    {
      title: 'Estoque',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a, b) => a.stock - b.stock,
      render: (stock: number, record: Product) => (
        <Tag color={stock <= record.minStock ? 'red' : 'green'}>
          {stock} un
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: Product) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.id, checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record: Product) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Editar
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Excluir
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Produtos
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Novo Produto
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
          <Input
            placeholder="Buscar por nome, SKU ou código de barras..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Select
            placeholder="Categoria"
            style={{ width: 150 }}
            value={filterCategory}
            onChange={setFilterCategory}
            allowClear
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchText('')
              setFilterCategory(null)
            }}
          >
            Limpar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total: ${total} produtos`,
          }}
        />
      </Card>

      <ProductFormModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSuccess={(product) => {
          handleSave(product)
        }}
        editingProduct={editingProduct as any}
      />
    </div>
  )
}
