'use client'

import React from 'react'
import { Card, Typography, Tabs } from 'antd'
import { BgColorsOutlined, GlobalOutlined, FileTextOutlined } from '@ant-design/icons'
import CoresMarcaTab from '@/components/marketing/CoresMarcaTab'
import ConteudoDoSiteTab from '@/components/marketing/ConteudoDoSiteTab'

const { Title, Paragraph } = Typography

export default function AgendamentoOnlinePage() {
  const tabs = [
    {
      key: 'cores',
      label: (
        <>
          <BgColorsOutlined />
          Cores e Marca
        </>
      ),
      children: <CoresMarcaTab />,
    },
    {
      key: 'conteudo',
      label: (
        <>
          <FileTextOutlined />
          Conteúdo do Site
        </>
      ),
      children: <ConteudoDoSiteTab />,
    },
  ]

  return (
    <div>
      <Title level={2}>
        <GlobalOutlined style={{ marginRight: 12 }} />
        Agendamento Online
      </Title>
      <Paragraph type="secondary">
        Personalize a aparência da sua página de agendamento online.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <Tabs items={tabs} />
      </Card>
    </div>
  )
}
