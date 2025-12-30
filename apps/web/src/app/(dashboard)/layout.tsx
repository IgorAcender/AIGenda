'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, theme, Spin, Tag, message, ConfigProvider } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  ScissorOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  DollarOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  ShopOutlined,
  FileTextOutlined,
  GiftOutlined,
  WhatsAppOutlined,
  StarOutlined,
  GlobalOutlined,
  TagOutlined,
  TruckOutlined,
  LinkOutlined,
  CommentOutlined,
  CrownOutlined,
  WalletOutlined,
  BankOutlined,
  PercentageOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
  SafetyOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { MenuProps } from 'antd'
import { useAuthStore, UserRole } from '@/stores/auth'
import { useTheme } from '@/hooks/useTheme'

const { Header, Sider, Content } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: string,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem
}

// Função para gerar menu baseado na role do usuário
function getMenuItems(role: UserRole | null): MenuItem[] {
  const items: MenuItem[] = [
    // Principal - todos os roles veem
    getItem(<Link href="/dashboard">Painel</Link>, '/dashboard', <DashboardOutlined />),
    getItem(<Link href="/agenda">Agenda</Link>, '/agenda', <CalendarOutlined />),
    getItem(<Link href="/pacotes">Pacotes</Link>, '/pacotes', <GiftOutlined />),
  ]

  // PROFESSIONAL vê apenas itens básicos e seus próprios dados
  if (role === 'PROFESSIONAL') {
    items.push(
      getItem(<Link href="/meus-atendimentos">Meus Atendimentos</Link>, '/meus-atendimentos', <CalendarOutlined />),
      getItem(<Link href="/minhas-comissoes">Minhas Comissões</Link>, '/minhas-comissoes', <PercentageOutlined />),
    )
    return items
  }

  // OWNER e MASTER veem tudo
  items.push(
    // Cadastro
    getItem('Cadastro', 'cadastro', <AppstoreOutlined />, [
      getItem(<Link href="/cadastro/clientes">Clientes</Link>, '/cadastro/clientes', <UserOutlined />),
      getItem(<Link href="/cadastro/profissionais">Profissionais</Link>, '/cadastro/profissionais', <TeamOutlined />),
      getItem(<Link href="/cadastro/servicos">Serviços</Link>, '/cadastro/servicos', <ScissorOutlined />),
      getItem(<Link href="/cadastro/categorias">Categorias</Link>, '/cadastro/categorias', <TagOutlined />),
      getItem(<Link href="/cadastro/produtos">Produtos</Link>, '/cadastro/produtos', <ShoppingOutlined />),
      getItem(<Link href="/cadastro/fornecedores">Fornecedores</Link>, '/cadastro/fornecedores', <TruckOutlined />),
    ]),
    
    // Financeiro
    getItem('Financeiro', 'financeiro', <DollarOutlined />, [
      getItem(<Link href="/financeiro/painel">Painel Financeiro</Link>, '/financeiro/painel', <BarChartOutlined />),
      getItem(<Link href="/financeiro/transacoes">Transações</Link>, '/financeiro/transacoes', <WalletOutlined />),
      getItem(<Link href="/financeiro/caixa">Caixa</Link>, '/financeiro/caixa', <BankOutlined />),
      getItem(<Link href="/financeiro/comissoes">Comissões</Link>, '/financeiro/comissoes', <PercentageOutlined />),
    ]),
    
    // Controle
    getItem('Controle', 'controle', <ShopOutlined />, [
      getItem(<Link href="/controle/compras">Compras</Link>, '/controle/compras', <ShoppingCartOutlined />),
      getItem(<Link href="/controle/relatorios">Relatórios</Link>, '/controle/relatorios', <FileTextOutlined />),
    ]),
    
    // Marketing
    getItem('Marketing', 'marketing', <StarOutlined />, [
      getItem(<Link href="/marketing/link-agendamento">Link de Agendamento</Link>, '/marketing/link-agendamento', <LinkOutlined />),
      getItem(<Link href="/marketing/agendamento-online">Agendamento Online</Link>, '/marketing/agendamento-online', <CalendarOutlined />),
      getItem(<Link href="/marketing/whatsapp">WhatsApp Marketing</Link>, '/marketing/whatsapp', <WhatsAppOutlined />),
      getItem(<Link href="/marketing/promocoes">Promoções</Link>, '/marketing/promocoes', <TagOutlined />),
      getItem(<Link href="/marketing/vendas-assinatura">Vendas por Assinatura</Link>, '/marketing/vendas-assinatura', <CrownOutlined />),
      getItem(<Link href="/marketing/avaliacoes">Avaliações</Link>, '/marketing/avaliacoes', <StarOutlined />),
    ]),
    
    // Configurações
    getItem(<Link href="/configuracoes">Configurações</Link>, '/configuracoes', <SettingOutlined />),
  )

  // MASTER vê área administrativa extra
  if (role === 'MASTER') {
    items.push(
      getItem('Administração', 'admin', <SafetyOutlined />, [
        getItem(<Link href="/admin/tenants">Tenants</Link>, '/admin/tenants', <ShopOutlined />),
        getItem(<Link href="/admin/usuarios">Usuários</Link>, '/admin/usuarios', <TeamOutlined />),
        getItem(<Link href="/admin/assinaturas">Assinaturas</Link>, '/admin/assinaturas', <CrownOutlined />),
        getItem(<Link href="/admin/relatorios">Relatórios Gerais</Link>, '/admin/relatorios', <BarChartOutlined />),
      ]),
    )
  }

  return items
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentDateTime, setCurrentDateTime] = useState<{ date: string; time: string }>({
    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })
  const pathname = usePathname()
  const router = useRouter()
  const { token } = theme.useToken()
  const { themeType, toggleTheme, getThemeConfig, mounted } = useTheme()
  
  const { user, tenant, isAuthenticated, logout, checkAuth, isMaster, isOwner, isProfessional } = useAuthStore()

  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setCurrentDateTime({
        date: now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Verificar autenticação ao montar
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth()
      } catch (error) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }
    verifyAuth()
  }, [checkAuth, router])

  // Redirecionar se não autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    try {
      await logout()
      message.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      message.error('Erro ao fazer logout')
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{user?.email}</div>
          <Tag 
            color={isMaster() ? 'purple' : isOwner() ? 'blue' : 'green'} 
            style={{ marginTop: 4 }}
          >
            {isMaster() ? 'Master' : isOwner() ? 'Proprietário' : 'Profissional'}
          </Tag>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => router.push('/perfil'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => router.push('/configuracoes'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
      onClick: handleLogout,
    },
  ]

  // Determinar quais submenus abrir baseado na rota atual
  const getOpenKeys = () => {
    if (pathname?.startsWith('/cadastro')) return ['cadastro']
    if (pathname?.startsWith('/financeiro')) return ['financeiro']
    if (pathname?.startsWith('/controle')) return ['controle']
    if (pathname?.startsWith('/marketing')) return ['marketing']
    if (pathname?.startsWith('/admin')) return ['admin']
    return []
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    )
  }

  // Se não autenticado, não renderizar nada (vai redirecionar)
  if (!isAuthenticated || !user) {
    return null
  }

  const menuItems = getMenuItems(user.role)

  if (!mounted) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="Carregando..." />
      </div>
    )
  }

  // Cores dinâmicas baseadas no tema
  const siderBgColor = themeType === 'dark' ? '#141414' : '#fff'
  const siderBorderColor = themeType === 'dark' ? '#434343' : '#f0f0f0'
  const headerBgColor = themeType === 'dark' ? '#1f1f1f' : '#fff'
  const headerBorderColor = themeType === 'dark' ? '#434343' : '#f0f0f0'
  const textColor = themeType === 'dark' ? '#e6e6e6' : '#000000'
  const secondaryTextColor = themeType === 'dark' ? '#b3b3b3' : '#888'

  return (
    <ConfigProvider theme={getThemeConfig()}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={260}
          style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: siderBgColor,
          borderRight: `1px solid ${siderBorderColor}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${siderBorderColor}`,
            padding: collapsed ? '8px' : '8px 16px',
          }}
        >
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={collapsed ? "/favicon.png" : "/logo-agende-ai.png"}
              alt="Agende AI"
              style={{
                height: collapsed ? 40 : 45,
                width: 'auto',
                maxWidth: collapsed ? 40 : 160,
                objectFit: 'contain',
              }}
            />
          </Link>
        </div>

        {/* Tenant Info - apenas para OWNER e PROFESSIONAL */}
        {tenant && !collapsed && (
          <div
            style={{
              padding: '12px 16px',
              background: themeType === 'dark' ? '#1f1f1f' : '#fafafa',
              borderBottom: `1px solid ${siderBorderColor}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShopOutlined style={{ color: token.colorPrimary }} />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: textColor }}>
                  {tenant.name}
                </div>
                <div style={{ fontSize: 11, color: secondaryTextColor }}>
                  {tenant.slug}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MASTER badge */}
        {isMaster() && !collapsed && (
          <div
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #722ed1, #9254de)',
              color: '#fff',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CrownOutlined />
            <span>Modo Administrador</span>
          </div>
        )}

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname || '/dashboard']}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          className="sidebar-menu"
          style={{
            border: 'none',
            padding: '12px 0',
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: headerBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${headerBorderColor}`,
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40, color: textColor }}
          />

          {/* Data e Hora Centralizada */}
          <div style={{ textAlign: 'center', flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 15.6, color: token.colorPrimary, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9.6 }}>
              <span style={{ color: secondaryTextColor }}>{currentDateTime.date}</span>
              <span style={{ color: token.colorPrimary, fontWeight: 600 }}>{currentDateTime.time}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Botão de tema (claro/escuro) */}
            <Button
              type="text"
              icon={themeType === 'light' ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              style={{ fontSize: 18, color: textColor }}
              title={themeType === 'light' ? 'Modo escuro' : 'Modo claro'}
            />

            {/* Botão de notificações */}
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: 18, color: textColor }}
            />
            
            {/* Dropdown do usuário */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: 8,
                }}
              >
                <Avatar
                  style={{ 
                    background: isMaster() 
                      ? 'linear-gradient(135deg, #722ed1, #9254de)' 
                      : isOwner() 
                        ? token.colorPrimary 
                        : '#52c41a'
                  }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontWeight: 500, color: textColor }}>{user.name?.split(' ')[0]}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 24,
            minHeight: 280,
          }}
        >
          <div className="page-container">{children}</div>
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>
  )
}
