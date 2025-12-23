'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, theme } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  UserOutlined,
  TeamOutlined,
  ScissorOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  ShopOutlined,
  DollarOutlined,
  WalletOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CrownOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/auth'
import { usePermissions } from '@/components/AuthGuard'

const { Sider, Content, Header } = Layout
const { Text } = Typography

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { token: themeToken } = theme.useToken()
  
  const { user, tenant, logout } = useAuthStore()
  const { canViewFinancials, canManageSettings, isMaster } = usePermissions()

  // Menu items baseado nas permissões
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/agenda',
      icon: <CalendarOutlined />,
      label: 'Agenda',
    },
    {
      key: 'cadastro',
      icon: <AppstoreOutlined />,
      label: 'Cadastros',
      children: [
        {
          key: '/cadastro/clientes',
          icon: <UserOutlined />,
          label: 'Clientes',
        },
        {
          key: '/cadastro/profissionais',
          icon: <TeamOutlined />,
          label: 'Profissionais',
        },
        {
          key: '/cadastro/servicos',
          icon: <ScissorOutlined />,
          label: 'Serviços',
        },
        {
          key: '/cadastro/categorias',
          icon: <AppstoreOutlined />,
          label: 'Categorias',
        },
        {
          key: '/cadastro/produtos',
          icon: <ShoppingOutlined />,
          label: 'Produtos',
        },
        {
          key: '/cadastro/fornecedores',
          icon: <ShopOutlined />,
          label: 'Fornecedores',
        },
      ],
    },
    // Financeiro - apenas para OWNER e MASTER
    ...(canViewFinancials ? [{
      key: 'financeiro',
      icon: <DollarOutlined />,
      label: 'Financeiro',
      children: [
        {
          key: '/financeiro/transacoes',
          icon: <DollarOutlined />,
          label: 'Transações',
        },
        {
          key: '/financeiro/caixa',
          icon: <WalletOutlined />,
          label: 'Caixa',
        },
      ],
    }] : []),
    // Configurações - apenas para OWNER e MASTER
    ...(canManageSettings ? [{
      key: '/configuracoes',
      icon: <SettingOutlined />,
      label: 'Configurações',
    }] : []),
    // Master - área exclusiva
    ...(isMaster ? [{
      key: '/master',
      icon: <CrownOutlined />,
      label: 'Master',
      children: [
        {
          key: '/master/tenants',
          label: 'Todos os Salões',
        },
        {
          key: '/master/usuarios',
          label: 'Usuários',
        },
        {
          key: '/master/assinaturas',
          label: 'Assinaturas',
        },
      ],
    }] : []),
  ]

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => router.push('/configuracoes'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
      onClick: logout,
    },
  ]

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'MASTER': return '👑 Master'
      case 'OWNER': return '🏪 Proprietário'
      case 'PROFESSIONAL': return '💈 Profissional'
      default: return role
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        {/* Logo */}
        <div style={{ 
          padding: collapsed ? '16px 8px' : '16px 24px',
          borderBottom: '1px solid #f0f0f0',
          textAlign: collapsed ? 'center' : 'left',
        }}>
          <Text strong style={{ fontSize: collapsed ? 16 : 24, color: themeToken.colorPrimary }}>
            {collapsed ? 'AI' : 'AIGenda'}
          </Text>
        </div>

        {/* Tenant Info */}
        {!collapsed && tenant && (
          <div style={{ 
            padding: '12px 24px',
            background: '#fafafa',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Empresa</Text>
            <br />
            <Text strong>{tenant.name}</Text>
          </div>
        )}

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={['cadastro', 'financeiro']}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ border: 'none', marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          <Space>
            <div style={{ textAlign: 'right', marginRight: 12 }}>
              <Text strong>{user?.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {getRoleLabel(user?.role)}
              </Text>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar 
                size={40} 
                icon={<UserOutlined />}
                src={user?.avatar}
                style={{ cursor: 'pointer', background: themeToken.colorPrimary }}
              />
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: 8,
          minHeight: 280,
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
