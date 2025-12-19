'use client'

import React, { useState } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
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
  WalletOutlined,
  BankOutlined,
  PercentageOutlined,
  BarChartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MenuProps } from 'antd'

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

const menuItems: MenuItem[] = [
  // Principal
  getItem('Painel', '/dashboard', <DashboardOutlined />),
  getItem('Agenda', '/agenda', <CalendarOutlined />),
  getItem('Pacotes', '/pacotes', <GiftOutlined />),
  
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
    getItem(<Link href="/marketing/agendamento-online">Agendamento Online</Link>, '/marketing/agendamento-online', <GlobalOutlined />),
    getItem(<Link href="/marketing/avaliacoes">Avaliações</Link>, '/marketing/avaliacoes', <StarOutlined />),
    getItem(<Link href="/marketing/whatsapp">WhatsApp Marketing</Link>, '/marketing/whatsapp', <WhatsAppOutlined />),
  ]),
  
  // Configurações
  getItem('Configurações', '/configuracoes', <SettingOutlined />),
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { token } = theme.useToken()

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
    },
  ]

  // Find the open keys based on current path
  const getOpenKeys = () => {
    if (pathname?.startsWith('/cadastro')) return ['cadastro']
    if (pathname?.startsWith('/financeiro')) return ['financeiro']
    if (pathname?.startsWith('/controle')) return ['controle']
    if (pathname?.startsWith('/marketing')) return ['marketing']
    return []
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
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #505afb 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            A
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 20,
                fontWeight: 700,
                color: '#1a1a2e',
              }}
            >
              AIGenda
            </span>
          )}
        </div>

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
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 40, height: 40 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: 18 }}
            />
            
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
                  style={{ background: token.colorPrimary }}
                  icon={<UserOutlined />}
                />
                <span style={{ fontWeight: 500 }}>Admin</span>
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
  )
}
