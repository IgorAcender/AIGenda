'use client'

import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Upload, message, Row, Col, Image, Space, Spin } from 'antd'
import { useAuthStore } from '@/stores/auth'
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
      const response = await fetch(`http://localhost:3001/api/tenants/${tenant?.id}/landing-content`)
      if (response.ok) {
        const data: LandingPageContent = await response.json()
        form.setFieldsValue({
          aboutUs: data.aboutUs || '',
        })
        if (data.banner) {
          setPreviewImage(data.banner)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdo:', error)
    } finally {
      setFetching(false)
    }
  }

  const handleUpload = ({ file }: any) => {
    if (file.status === 'done') {
      const response = file.response
      if (response?.url) {
        setPreviewImage(response.url)
        message.success('Foto carregada com sucesso!')
      }
    } else if (file.status === 'error') {
      message.error('Erro ao fazer upload da foto')
    }
  }

  const handleSave = async (values: any) => {
    if (!tenant?.id) {
      message.error('Erro: Estabelecimento não identificado')
      return
    }

    setLoading(true)
    try {
      const payload = {
        aboutUs: values.aboutUs,
        banner: previewImage,
      }

      const response = await fetch(`http://localhost:3001/api/tenants/${tenant.id}/landing-content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      autoComplete="off"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Foto da Landing Page */}
        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Foto da Landing Page</label>
          <Row gutter={24}>
            <Col xs={24} lg={12}>
              <Upload
                action="http://localhost:3001/api/tenants/upload"
                onChange={handleUpload}
                maxCount={1}
                accept="image/*"
                listType="picture"
              >
                <Button style={{ width: '100%' }}>Selecionar Foto</Button>
              </Upload>
              <p style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                Recomendado: 1920x1080px (16:9) | Máximo: 5MB
              </p>
            </Col>

            <Col xs={24} lg={12}>
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Prévia"
                  style={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'cover',
                    borderRadius: 4,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                  }}
                >
                  Nenhuma foto selecionada
                </div>
              )}
            </Col>
          </Row>
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
              rows={5}
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
            style={{ minWidth: 120 }}
          >
            Salvar
          </Button>
        </Row>
      </Space>
    </Form>
  )
}
