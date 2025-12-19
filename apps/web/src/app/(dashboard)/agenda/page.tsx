'use client'

import React, { useState } from 'react'
import {
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Typography,
  Row,
  Col,
  Select,
  DatePicker,
  TimePicker,
  Avatar,
  Badge,
  Segmented,
  Tooltip,
} from 'antd'
import {
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

const { Title, Text } = Typography

interface Professional {
  id: string
  name: string
  color: string
}

interface Client {
  id: string
  name: string
  phone: string
}

interface Service {
  id: string
  name: string
  duration: number
  price: number
}

interface Appointment {
  id: string
  clientId: string
  clientName: string
  professionalId: string
  professionalName: string
  professionalColor: string
  serviceId: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'noshow'
  price: number
  notes: string | null
}

// Mock data
const mockProfessionals: Professional[] = [
  { id: '1', name: 'Dra. Carla Mendes', color: '#505afb' },
  { id: '2', name: 'Dr. Paulo Silva', color: '#52c41a' },
  { id: '3', name: 'Ana Beatriz', color: '#722ed1' },
]

const mockClients: Client[] = [
  { id: '1', name: 'Maria Silva Santos', phone: '(11) 99999-1111' },
  { id: '2', name: 'João Pedro Oliveira', phone: '(11) 99999-2222' },
  { id: '3', name: 'Ana Paula Costa', phone: '(11) 99999-3333' },
]

const mockServices: Service[] = [
  { id: '1', name: 'Corte Feminino', duration: 60, price: 80 },
  { id: '2', name: 'Corte Masculino', duration: 30, price: 45 },
  { id: '3', name: 'Manicure', duration: 45, price: 35 },
  { id: '4', name: 'Pedicure', duration: 60, price: 45 },
  { id: '5', name: 'Limpeza de Pele', duration: 90, price: 150 },
]

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Maria Silva Santos',
    professionalId: '1',
    professionalName: 'Dra. Carla Mendes',
    professionalColor: '#505afb',
    serviceId: '1',
    serviceName: 'Corte Feminino',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '09:00',
    endTime: '10:00',
    status: 'confirmed',
    price: 80,
    notes: null,
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'João Pedro Oliveira',
    professionalId: '2',
    professionalName: 'Dr. Paulo Silva',
    professionalColor: '#52c41a',
    serviceId: '2',
    serviceName: 'Corte Masculino',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '10:00',
    endTime: '10:30',
    status: 'scheduled',
    price: 45,
    notes: null,
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Ana Paula Costa',
    professionalId: '1',
    professionalName: 'Dra. Carla Mendes',
    professionalColor: '#505afb',
    serviceId: '3',
    serviceName: 'Manicure',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '11:00',
    endTime: '11:45',
    status: 'completed',
    price: 35,
    notes: 'Cliente VIP',
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Maria Silva Santos',
    professionalId: '3',
    professionalName: 'Ana Beatriz',
    professionalColor: '#722ed1',
    serviceId: '5',
    serviceName: 'Limpeza de Pele',
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '14:00',
    endTime: '15:30',
    status: 'scheduled',
    price: 150,
    notes: null,
  },
]

const statusConfig = {
  scheduled: { color: 'blue', label: 'Agendado', icon: <CalendarOutlined /> },
  confirmed: { color: 'cyan', label: 'Confirmado', icon: <CheckCircleOutlined /> },
  completed: { color: 'green', label: 'Concluído', icon: <CheckCircleOutlined /> },
  cancelled: { color: 'red', label: 'Cancelado', icon: <CloseCircleOutlined /> },
  noshow: { color: 'orange', label: 'Não Compareceu', icon: <ExclamationCircleOutlined /> },
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
}).filter((t) => t >= '08:00' && t <= '20:00')

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [form] = Form.useForm()

  const filteredAppointments = appointments.filter((apt) => {
    const matchesDate = apt.date === currentDate.format('YYYY-MM-DD')
    const matchesProfessional = !selectedProfessional || apt.professionalId === selectedProfessional
    return matchesDate && matchesProfessional
  })

  const handlePrevDay = () => {
    setCurrentDate((prev) => prev.subtract(1, viewMode === 'week' ? 'week' : 'day'))
  }

  const handleNextDay = () => {
    setCurrentDate((prev) => prev.add(1, viewMode === 'week' ? 'week' : 'day'))
  }

  const handleToday = () => {
    setCurrentDate(dayjs())
  }

  const handleSlotClick = (date: string, time: string) => {
    setSelectedSlot({ date, time })
    form.resetFields()
    form.setFieldsValue({
      date: dayjs(date),
      startTime: dayjs(time, 'HH:mm'),
    })
    setIsModalOpen(true)
  }

  const handleCreateAppointment = async () => {
    try {
      const values = await form.validateFields()
      
      const professional = mockProfessionals.find((p) => p.id === values.professionalId)
      const client = mockClients.find((c) => c.id === values.clientId)
      const service = mockServices.find((s) => s.id === values.serviceId)
      
      if (!professional || !client || !service) return

      const startTime = values.startTime.format('HH:mm')
      const endTime = values.startTime.add(service.duration, 'minute').format('HH:mm')

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        clientId: client.id,
        clientName: client.name,
        professionalId: professional.id,
        professionalName: professional.name,
        professionalColor: professional.color,
        serviceId: service.id,
        serviceName: service.name,
        date: values.date.format('YYYY-MM-DD'),
        startTime,
        endTime,
        status: 'scheduled',
        price: service.price,
        notes: values.notes || null,
      }

      setAppointments((prev) => [...prev, newAppointment])
      message.success('Agendamento criado com sucesso!')
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
    }
  }

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: newStatus } : apt))
    )
    message.success('Status atualizado!')
  }

  const getAppointmentsForSlot = (time: string) => {
    return filteredAppointments.filter((apt) => {
      const slotStart = time
      const slotEnd = dayjs(`2000-01-01 ${time}`).add(30, 'minute').format('HH:mm')
      return apt.startTime >= slotStart && apt.startTime < slotEnd
    })
  }

  const getAppointmentHeight = (appointment: Appointment) => {
    const start = dayjs(`2000-01-01 ${appointment.startTime}`)
    const end = dayjs(`2000-01-01 ${appointment.endTime}`)
    const durationMinutes = end.diff(start, 'minute')
    return (durationMinutes / 30) * 60 // 60px per 30min slot
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Agenda
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Novo Agendamento
        </Button>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Space>
              <Button icon={<LeftOutlined />} onClick={handlePrevDay} />
              <Button onClick={handleToday}>Hoje</Button>
              <Button icon={<RightOutlined />} onClick={handleNextDay} />
            </Space>
          </Col>
          <Col>
            <Text strong style={{ fontSize: 18 }}>
              {currentDate.format('dddd, D [de] MMMM [de] YYYY')}
            </Text>
          </Col>
          <Col flex="auto" />
          <Col>
            <Segmented
              options={[
                { label: 'Dia', value: 'day' },
                { label: 'Semana', value: 'week' },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'day' | 'week')}
            />
          </Col>
          <Col>
            <Select
              placeholder="Todos os profissionais"
              style={{ width: 200 }}
              allowClear
              value={selectedProfessional}
              onChange={setSelectedProfessional}
            >
              {mockProfessionals.map((prof) => (
                <Select.Option key={prof.id} value={prof.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: prof.color }}>
                      {prof.name[0]}
                    </Avatar>
                    {prof.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Calendar Grid */}
      <Card bodyStyle={{ padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 80, padding: 12, borderRight: '1px solid #f0f0f0' }}>
            <Text type="secondary">Horário</Text>
          </div>
          <div style={{ flex: 1, padding: 12, textAlign: 'center' }}>
            <Text strong>{currentDate.format('ddd, DD/MM')}</Text>
          </div>
        </div>

        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {timeSlots.map((time) => {
            const slotAppointments = getAppointmentsForSlot(time)
            
            return (
              <div
                key={time}
                style={{
                  display: 'flex',
                  minHeight: 60,
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <div
                  style={{
                    width: 80,
                    padding: '8px 12px',
                    borderRight: '1px solid #f0f0f0',
                    color: '#666',
                    fontSize: 13,
                  }}
                >
                  {time}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 4,
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundColor: slotAppointments.length > 0 ? 'transparent' : '#fafafa',
                  }}
                  onClick={() => slotAppointments.length === 0 && handleSlotClick(currentDate.format('YYYY-MM-DD'), time)}
                >
                  {slotAppointments.map((apt) => (
                    <Tooltip
                      key={apt.id}
                      title={
                        <div>
                          <div><strong>{apt.serviceName}</strong></div>
                          <div>{apt.clientName}</div>
                          <div>{apt.startTime} - {apt.endTime}</div>
                          <div>R$ {apt.price.toFixed(2)}</div>
                        </div>
                      }
                    >
                      <div
                        style={{
                          backgroundColor: apt.professionalColor,
                          color: '#fff',
                          padding: '8px 12px',
                          borderRadius: 6,
                          marginBottom: 4,
                          height: getAppointmentHeight(apt) - 8,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{apt.serviceName}</div>
                            <div style={{ fontSize: 12, opacity: 0.9 }}>
                              <UserOutlined /> {apt.clientName}
                            </div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>
                              <ClockCircleOutlined /> {apt.startTime} - {apt.endTime}
                            </div>
                          </div>
                          <Select
                            size="small"
                            value={apt.status}
                            onChange={(status) => handleStatusChange(apt.id, status)}
                            style={{ width: 110 }}
                            onClick={(e) => e.stopPropagation()}
                            dropdownStyle={{ minWidth: 130 }}
                          >
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <Select.Option key={key} value={key}>
                                <Tag color={config.color} style={{ margin: 0 }}>
                                  {config.label}
                                </Tag>
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Modal de Novo Agendamento */}
      <Modal
        title="Novo Agendamento"
        open={isModalOpen}
        onOk={handleCreateAppointment}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Agendar"
        cancelText="Cancelar"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="clientId"
            label="Cliente"
            rules={[{ required: true, message: 'Selecione o cliente' }]}
          >
            <Select
              placeholder="Selecione o cliente"
              showSearch
              optionFilterProp="children"
            >
              {mockClients.map((client) => (
                <Select.Option key={client.id} value={client.id}>
                  {client.name} - {client.phone}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="professionalId"
            label="Profissional"
            rules={[{ required: true, message: 'Selecione o profissional' }]}
          >
            <Select placeholder="Selecione o profissional">
              {mockProfessionals.map((prof) => (
                <Select.Option key={prof.id} value={prof.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: prof.color }}>
                      {prof.name[0]}
                    </Avatar>
                    {prof.name}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="serviceId"
            label="Serviço"
            rules={[{ required: true, message: 'Selecione o serviço' }]}
          >
            <Select placeholder="Selecione o serviço">
              {mockServices.map((service) => (
                <Select.Option key={service.id} value={service.id}>
                  {service.name} ({service.duration}min) - R$ {service.price.toFixed(2)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Data"
                rules={[{ required: true, message: 'Selecione a data' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Horário"
                rules={[{ required: true, message: 'Selecione o horário' }]}
              >
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={2} placeholder="Observações sobre o atendimento" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
