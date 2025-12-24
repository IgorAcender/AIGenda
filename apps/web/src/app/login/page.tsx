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
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true)
    clearError()
    try {
      await login(values.email, values.password)
      message.success('Login realizado com sucesso!')
      router.push('/dashboard')
    } catch (err: any) {
      message.error(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #505afb 0%, #7c3aed 100%)',
        padding: 16,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ color: '#505afb', margin: 0 }}>
            Agende AI
          </Title>
          <Text type="secondary">Faça login para continuar</Text>
        </div>

        <Form
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'E-mail é obrigatório' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="E-mail"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Senha é obrigatória' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Senha"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              style={{ backgroundColor: '#505afb' }}
            >
              Entrar
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link href="/forgot-password">
              <Text type="secondary">Esqueci minha senha</Text>
            </Link>
          </div>
        </Form>

        <Divider>ou</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">Não tem uma conta? </Text>
          <Link href="/register">
            <Text strong style={{ color: '#505afb' }}>
              Cadastre-se
            </Text>
          </Link>
        </div>
      </Card>
    </div>
  )
}
