'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Upload, message, Row, Col, Image, Space, Spin, Card, Switch, Divider, Tooltip } from 'antd'
import { useAuthStore } from '@/stores/auth'
import PhonePreview from './PhonePreview'
import type { UploadFile } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

const { TextArea } = Input

interface LandingPageContent {
  banner?: string
  aboutUs?: string
}

interface LandingBlock {
  id: string
  name: string
  label: string
  enabled: boolean
  order: number
}

export default function ConteudoDoSiteTab() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [previewImage, setPreviewImage] = useState<string>('')
  const { tenant } = useAuthStore()
  const [blocks, setBlocks] = useState<LandingBlock[]>([
    { id: 'sobre-nos', name: 'Sobre Nós', label: 'Sobre Nós', enabled: true, order: 1 },
    { id: 'equipe', name: 'Profissionais', label: 'Profissionais', enabled: true, order: 2 },
    { id: 'contato', name: 'Horário', label: 'Horário de Funcionamento', enabled: true, order: 3 },
  ])

  // Carregar dados ao montar
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      message.warning('Por favor, faça login para acessar esta área')
      setFetching(false)
      return
    }
    
    if (tenant?.id) {
      loadLandingPageContent()
      loadLandingBlocks()
    }
  }, [tenant?.id])

  const loadLandingBlocks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token não encontrado - usuário não autenticado')
        return
      }
      
      console.log('Carregando blocos com token:', token.substring(0, 20) + '...')
      
      const response = await fetch(`http://localhost:3001/api/tenants/landing-blocks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      console.log('Resposta do GET /landing-blocks:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Blocos carregados:', data.blocks)
        if (data.blocks && Array.isArray(data.blocks)) {
          setBlocks(data.blocks)
          message.success(`${data.blocks.length} blocos carregados!`)
        }
      } else if (response.status === 403) {
        console.error('Token inválido ou expirado')
        message.error('Sessão expirada. Por favor, faça login novamente.')
        localStorage.removeItem('token')
      } else {
        const error = await response.json()
        console.error('Erro ao carregar blocos:', error)
        message.error(error.error || 'Erro ao carregar blocos')
      }
    } catch (error) {
      console.error('Erro ao carregar blocos:', error)
      message.error('Erro ao conectar com o servidor')
    }
  }

  const loadLandingPageContent = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/tenants/branding`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        form.setFieldsValue({
          aboutUs: data.description || data.about || '',
        })
        if (data.heroImage) {
          setPreviewImage(data.heroImage)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
    } finally {
      setFetching(false)
    }
  }

  const toggleBlock = (blockId: string) => {
    setBlocks(blocks.map(b => b.id === blockId ? { ...b, enabled: !b.enabled } : b))
  }

  const getSortedBlocks = () => {
    return [...blocks].sort((a, b) => a.order - b.order)
  }

  const getBlockIndex = (blockId: string) => {
    return getSortedBlocks().findIndex(b => b.id === blockId)
  }

  const getTotalBlocks = () => {
    return getSortedBlocks().length
  }

  const moveBlockUp = (blockId: string) => {
    const sortedBlocks = getSortedBlocks()
    const index = sortedBlocks.findIndex(b => b.id === blockId)
    if (index > 0) {
      const newBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, order: sortedBlocks[index - 1].order }
        }
        if (b.id === sortedBlocks[index - 1].id) {
          return { ...b, order: sortedBlocks[index].order }
        }
        return b
      })
      setBlocks(newBlocks)
    }
  }

  const moveBlockDown = (blockId: string) => {
    const sortedBlocks = getSortedBlocks()
    const index = sortedBlocks.findIndex(b => b.id === blockId)
    if (index < sortedBlocks.length - 1) {
      const newBlocks = blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, order: sortedBlocks[index + 1].order }
        }
        if (b.id === sortedBlocks[index + 1].id) {
          return { ...b, order: sortedBlocks[index].order }
        }
        return b
      })
      setBlocks(newBlocks)
    }
  }

  const beforeUpload = async (file: File) => {
    // Validar tamanho (max 2MB para não sobrecarregar o banco)
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('A imagem deve ter no máximo 2MB!')
      return false
    }

    // Validar tipo
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error('Apenas imagens são permitidas!')
      return false
    }

    // Converter para Base64 e salvar no estado
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setPreviewImage(base64)
      message.success('Imagem carregada! Clique em Salvar para confirmar.')
    }
    reader.readAsDataURL(file)
    
    // Retorna false para não fazer upload automático (vamos salvar via API de branding)
    return false
  }

  const handleSave = async (values: any) => {
    if (!tenant?.id) {
      message.error('Erro: Estabelecimento não identificado')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      console.log('Salvando conteúdo e blocos...')
      console.log('Blocos a salvar:', blocks)
      
      // Salvar conteúdo (foto e descrição)
      const payload = {
        description: values.aboutUs,
        heroImage: previewImage,
      }

      const response = await fetch(`http://localhost:3001/api/tenants/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log('Resposta PUT /branding:', response.status)

      if (response.ok) {
        // Também salvar blocos
        const blocksPayload = { blocks }
        console.log('Enviando blocos:', blocksPayload)
        
        const blocksResponse = await fetch(`http://localhost:3001/api/tenants/landing-blocks`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(blocksPayload),
        })

        console.log('Resposta PUT /landing-blocks:', blocksResponse.status)

        if (blocksResponse.ok) {
          const blocksData = await blocksResponse.json()
          console.log('Blocos salvos com sucesso:', blocksData)
          message.success('Conteúdo e seções atualizadas com sucesso!')
        } else {
          const error = await blocksResponse.json()
          console.error('Erro ao salvar blocos:', error)
          message.success('Conteúdo atualizado! (Erro ao salvar seções: ' + error.error + ')')
        }
      } else {
        const error = await response.json()
        console.error('Erro ao salvar conteúdo:', error)
        message.error(error.message || 'Erro ao salvar conteúdo')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      message.error('Erro ao salvar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin />
      </div>
    )
  }

  const renderBlock = (blockId: string) => {
    if (blockId === 'sobre-nos') {
      return (
        <div key="sobre-nos" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>SOBRE NÓS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'sobre-nos')?.enabled ?? true}
                onChange={() => toggleBlock('sobre-nos')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('sobre-nos') === 0}
                  onClick={() => moveBlockUp('sobre-nos')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('sobre-nos') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('sobre-nos')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <Form.Item
            name="aboutUs"
            label={null}
            rules={[
              { max: 500, message: 'Máximo 500 caracteres' },
            ]}
          >
            <TextArea
              placeholder="Conte a história do seu negócio..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>
          <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0 0' }}>
            Texto que aparece na seção Sobre nós do site.
          </p>
        </div>
      )
    }

    if (blockId === 'equipe') {
      return (
        <div key="equipe" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>PROFISSIONAIS</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'equipe')?.enabled ?? true}
                onChange={() => toggleBlock('equipe')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('equipe') === 0}
                  onClick={() => moveBlockUp('equipe')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('equipe') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('equipe')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#666' }}>
              ℹ️ Exibe os membros da sua equipe no site.
            </p>
            <a href="#" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>
              ✏️ Gerenciar Profissionais
            </a>
          </div>
        </div>
      )
    }

    if (blockId === 'contato') {
      return (
        <div key="contato" style={{
          border: '2px solid #e8e8e8',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '16px',
          backgroundColor: '#fafafa',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>HORÁRIO DE FUNCIONAMENTO</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Switch
                checked={blocks.find(b => b.id === 'contato')?.enabled ?? true}
                onChange={() => toggleBlock('contato')}
                size="small"
              />
              <Tooltip title="Mover para cima">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined />}
                  disabled={getBlockIndex('contato') === 0}
                  onClick={() => moveBlockUp('contato')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
              <Tooltip title="Mover para baixo">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowDownOutlined />}
                  disabled={getBlockIndex('contato') === getTotalBlocks() - 1}
                  onClick={() => moveBlockDown('contato')}
                  style={{ padding: '4px' }}
                />
              </Tooltip>
            </div>
          </div>
          
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            borderRadius: '6px',
            border: '1px solid #f0f0f0',
            marginBottom: '12px',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#666' }}>
              ℹ️ Exibe os horários de funcionamento no site.
            </p>
            <a href="#" style={{ color: '#1890ff', textDecoration: 'none', fontWeight: 500, fontSize: 13 }}>
              ✏️ Configurar Horários
            </a>
          </div>
        </div>
      )
    }
  }

  return (
    <Row gutter={[32, 32]}>
      {/* Coluna Esquerda - Formulário */}
      <Col xs={24} lg={14}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          autoComplete="off"
          onValuesChange={() => {
            // Força re-render para atualizar preview
            setPreviewImage(previewImage)
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Foto da Landing Page */}
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Foto da Landing Page
              </label>
              <Upload
                beforeUpload={beforeUpload}
                maxCount={1}
                accept="image/*"
                listType="picture"
                showUploadList={false}
              >
                <Button style={{ width: '100%' }}>Selecionar Foto</Button>
              </Upload>
              <p style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                Recomendado: 1920x1080px (16:9) | Máximo: 2MB
              </p>
              
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="Prévia"
                  style={{
                    width: '100%',
                    maxWidth: 160,
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 8,
                    marginTop: 12,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    background: '#0b0b0b',
                    display: 'block',
                  }}
                />
              )}
            </div>

            {/* Renderizar blocos em ordem */}
            {getSortedBlocks().map((block) => renderBlock(block.id))}

            {/* Botão Salvar */}
            <Row justify="end">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{ minWidth: 120 }}
              >
                Salvar
              </Button>
            </Row>
          </Space>
        </Form>
      </Col>

      {/* Coluna Direita - Preview do Celular */}
      <Col xs={24} lg={10}>
        <div style={{ position: 'sticky', top: 24 }}>
          <h3 style={{ marginBottom: 16, textAlign: 'center' }}>
            📱 Preview em Tempo Real
          </h3>
          <PhonePreview
            tenantName={tenant?.name}
            description={form.getFieldValue('aboutUs')}
            banner={previewImage}
          />
        </div>
      </Col>
    </Row>
  )
}
