'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Menu, Button, Drawer, Space } from 'antd';
import { MenuOutlined, LogoutOutlined, HomeOutlined, DashboardOutlined, CalendarOutlined, DollarOutlined, FileTextOutlined } from '@ant-design/icons';

const { Header } = Layout;

interface NavbarProps {
  isAuthenticated?: boolean;
}

export default function Navbar({ isAuthenticated = false }: NavbarProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link href="/">Home</Link>,
    },
    ...(isAuthenticated ? [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: 'agenda',
        icon: <CalendarOutlined />,
        label: <Link href="/agenda">Agenda</Link>,
      },
      {
        key: 'financeiro',
        icon: <DollarOutlined />,
        label: <Link href="/financeiro">Financeiro</Link>,
      },
      {
        key: 'reports',
        icon: <FileTextOutlined />,
        label: <Link href="/reports">Relatórios</Link>,
      },
    ] : []),
  ];

  return (
    <Header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          AIGenda
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <Menu mode="horizontal" items={menuItems} className="border-0" />
          {isAuthenticated && (
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Sair
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
          />
          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setDrawerOpen(false)}
            open={drawerOpen}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {menuItems.map((item) => (
                <Link key={item.key} href={item.key as string}>
                  <span>{item.label}</span>
                </Link>
              ))}
              {isAuthenticated && (
                <Button
                  type="primary"
                  danger
                  block
                  icon={<LogoutOutlined />}
                  onClick={() => {
                    handleLogout();
                    setDrawerOpen(false);
                  }}
                >
                  Sair
                </Button>
              )}
            </Space>
          </Drawer>
        </div>
      </div>
    </Header>
  );
}
