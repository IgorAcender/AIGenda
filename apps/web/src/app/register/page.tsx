'use client'

import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Divider,
  Steps,
  Row,
  Col,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  PhoneOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    tenantName: '',
    tenantSlug: '',
  })
  const router = useRouter()
  const register = useAuthStore((state) => state.register)
  const [form] = Form.useForm()

  const handleNext = async () => {
    try {
      const values = await form.validateFields()
      setFormData((prev) => ({ ...prev, ...values }))
      setCurrentStep(1)
    } catch (error) {
      // Validation failed
    }
  }

  const handlePrev = () => {
    setCurrentStep(0)
  }

  const handleSubmit = async (values: { tenantName: string; tenantSlug: string }) => {
    setLoading(true)
    try {
      const data = {
        ...formData,
        ...values,
      }
      await register(data)
      message.success('Conta criada com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      message.error(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #003d82 0%, #004a99 100%)',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img 
            src="/logo-agende-ai.png" 
            alt="Agende AI" 
            style={{ 
              width: 200, 
              height: 'auto', 
              marginBottom: 24,
              display: 'block',
              margin: '0 auto 24px'
            }} 
          />
          <Text type="secondary">Crie sua conta</Text>
        </div>

        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: 'Seus dados' },
            { title: 'Sua empresa' },
          ]}
        />

        {currentStep === 0 && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleNext}
            initialValues={formData}
          >
            <Form.Item
              name="name"
              label="Nome completo"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Seu nome"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: 'E-mail é obrigatório' },
                { type: 'email', message: 'E-mail inválido' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="seu@email.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              rules={[
                { required: true, message: 'Senha é obrigatória' },
                { min: 6, message: 'Mínimo 6 caracteres' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Sua senha"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar senha"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirme sua senha' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('As senhas não conferem'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirme sua senha"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Telefone / WhatsApp"
              rules={[{ required: true, message: 'Telefone é obrigatório' }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="(11) 99999-9999"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                icon={<ArrowRightOutlined />}
                style={{ backgroundColor: '#505afb' }}
              >
                Continuar
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 1 && (
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
            onFinish={handleSubmit}
            onValuesChange={(changed) => {
              if (changed.tenantName) {
                form.setFieldsValue({
                  tenantSlug: generateSlug(changed.tenantName),
                })
              }
            }}
          >
            <Form.Item
              name="tenantName"
              label="Nome do estabelecimento"
              rules={[{ required: true, message: 'Nome é obrigatório' }]}
            >
              <Input
                prefix={<ShopOutlined />}
                placeholder="Ex: Salão da Maria"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="tenantSlug"
              label="URL do agendamento online"
              rules={[
                { required: true, message: 'URL é obrigatória' },
                {
                  pattern: /^[a-z0-9-]+$/,
                  message: 'Use apenas letras minúsculas, números e hífens',
                },
              ]}
              extra="Esta será a URL para seus clientes agendarem: agendeai.net/seu-estabelecimento"
            >
              <Input
                placeholder="salao-da-maria"
                size="large"
                addonBefore="agendeai.net/"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Button
                  size="large"
                  block
                  icon={<ArrowLeftOutlined />}
                  onClick={handlePrev}
                >
                  Voltar
                </Button>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={loading}
                  icon={<CheckOutlined />}
                  style={{ backgroundColor: '#505afb' }}
                >
                  Criar Conta
                </Button>
              </Col>
            </Row>
          </Form>
        )}

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Já tem uma conta? </Text>
          <Link href="/login">
            <Text strong style={{ color: '#505afb' }}>
              Faça login
            </Text>
          </Link>
        </div>
      </Card>
    </div>
  )
}
