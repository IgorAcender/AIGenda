import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agende AI - Sistema de Agendamento',
  description: 'Sistema completo de agendamento e gestão para seu negócio',
}

const theme = {
  token: {
    colorPrimary: '#505afb',
    borderRadius: 8,
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AntdRegistry>
          <ConfigProvider locale={ptBR} theme={theme}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
