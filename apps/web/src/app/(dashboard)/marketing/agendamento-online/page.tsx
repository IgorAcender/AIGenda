'use client'

import React from 'react'
import { Card, Typography } from 'antd'
import { BgColorsOutlined, GlobalOutlined } from '@ant-design/icons'
import CoresMarcaTab from '@/components/marketing/CoresMarcaTab'

const { Title, Paragraph } = Typography

export default function AgendamentoOnlinePage() {
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
        <CoresMarcaTab />
      </Card>
    </div>
  )
}
