'use client'

import React from 'react'
import { Card, Typography } from 'antd'
import { GlobalOutlined, FileTextOutlined } from '@ant-design/icons'
import ConteudoDoSiteTab from '@/components/marketing/ConteudoDoSiteTab'

const { Title, Paragraph } = Typography

export default function AgendamentoOnlinePage() {
  return (
    <div>
      <Title level={2}>
        <GlobalOutlined style={{ marginRight: 12 }} />
        Agendamento Online
      </Title>
      <Paragraph type="secondary">
        Personalize o conteúdo da sua página de agendamento online.
      </Paragraph>

      <Card style={{ marginTop: 24 }}>
        <ConteudoDoSiteTab />
      </Card>
    </div>
  )
}
