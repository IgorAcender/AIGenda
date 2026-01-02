'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Upload, message, Row, Col, Image, Space, Spin } from 'antd'
import { useAuthStore } from '@/stores/auth'
import PhonePreview from './PhonePreview'
import type { UploadFile } from 'antd'

const { TextArea } = Input

interface LandingPageContent {
  banner?: string
  aboutUs?: string
}

export default function ConteudoDoSiteTab() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [previewImage, setPreviewImage] = useState<string>('')
  const { tenant } = useAuthStore()

  // Carregar dados ao montar
  useEffect(() => {
    if (tenant?.id) {
      loadLandingPageContent()
    }
  }, [tenant?.id])

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

      if (response.ok) {
        message.success('Conteúdo atualizado com sucesso!')
      } else {
        const error = await response.json()
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
    return <Spin />
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

            {/* Sobre Nós */}
            <div>
              <Form.Item
                name="aboutUs"
                label="Sobre Nós"
                rules={[
                  { max: 500, message: 'Máximo 500 caracteres' },
                ]}
              >
                <TextArea
                  placeholder="Conte a história do seu negócio..."
                  rows={6}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </div>

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
