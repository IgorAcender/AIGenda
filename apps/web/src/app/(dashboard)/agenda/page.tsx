'use client'

import React, { useState, useEffect } from 'react'
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
  Input,
  Spin,
  Dropdown,
  Menu,
  Divider,
  Checkbox,
  Tabs,
  Switch,
  InputNumber,
  Upload,
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
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/pt-br'
import { appointmentService, Appointment as ApiAppointment } from '@/services/appointmentService'
import { ClientFormModal } from '@/components/ClientFormModal'
import { clientService, Client } from '@/services/clientService'
import { professionalService, Professional as ApiProfessional } from '@/services/professionalService'
import { serviceService, Service } from '@/services/serviceService'

dayjs.locale('pt-br')

const { Title, Text } = Typography

interface AppointmentView extends ApiAppointment {
  // Campos auxiliares para a visualização
  date: string
  startTimeFormatted: string
  endTimeFormatted: string
}

const statusConfig = {
  SCHEDULED: { color: 'blue', label: 'Agendado', icon: <CalendarOutlined /> },
  CONFIRMED: { color: 'cyan', label: 'Confirmado', icon: <CheckCircleOutlined /> },
  COMPLETED: { color: 'green', label: 'Concluído', icon: <CheckCircleOutlined /> },
  CANCELED: { color: 'red', label: 'Cancelado', icon: <CloseCircleOutlined /> },
  NO_SHOW: { color: 'orange', label: 'Não Compareceu', icon: <ExclamationCircleOutlined /> },
}

// Função para gerar cores para profissionais
const generateColor = (index: number) => {
  const colors = ['#505afb', '#52c41a', '#722ed1', '#f5222d', '#fa8c16', '#13c2c2', '#eb2f96']
  return colors[index % colors.length]
}

// Gera todos os slots de 30 em 30 minutos das 00:00 às 23:30
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return `${hour.toString().padStart(2, '0')}:${minute}`
})

// Horário de atendimento
const businessHoursStart = '08:00'
const businessHoursEnd = '20:00'

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [selectedProfessional, setSelectedProfessional] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<AppointmentView[]>([])
  const [professionals, setProfessionals] = useState<ApiProfessional[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentView | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null)
  const [form] = Form.useForm()
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs())

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  // Recarregar appointments quando mudar a data, profissional ou modo de visualização
  useEffect(() => {
    loadAppointments()
  }, [currentDate, selectedProfessional, viewMode])

  // Atualizar hora atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs())
    }, 60000) // Atualiza a cada 1 minuto

    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [professionalsData, clientsData, servicesData] = await Promise.all([
        professionalService.getProfessionals({ active: true }),
        clientService.getClients({ limit: 1000 }),
        serviceService.getServices({ active: true }),
      ])
      
      setProfessionals(professionalsData.data || [])
      setClients(clientsData.data || [])
      setServices(servicesData.data || [])
      
      await loadAppointments()
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      message.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadAppointments = async () => {
    try {
      // Calcular data de início e fim baseado no modo de visualização
      let startDate: Dayjs
      let endDate: Dayjs
      
      if (viewMode === 'week') {
        startDate = currentDate.startOf('week').add(1, 'day') // Começa na segunda
        endDate = startDate.add(6, 'days') // Até domingo (7 dias)
      } else {
        startDate = currentDate.startOf('day')
        endDate = currentDate.endOf('day')
      }
      
      const filters: any = { 
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
      if (selectedProfessional) {
        filters.professionalId = selectedProfessional
      }

      const data = await appointmentService.getAppointments(filters)
      
      // Transformar dados da API para o formato da view
      const transformedAppointments: AppointmentView[] = data.map((apt) => ({
        ...apt,
        date: dayjs(apt.startTime).format('YYYY-MM-DD'),
        startTimeFormatted: dayjs(apt.startTime).format('HH:mm'),
        endTimeFormatted: dayjs(apt.endTime).format('HH:mm'),
      }))
      
      setAppointments(transformedAppointments)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      message.error('Erro ao carregar agendamentos')
    }
  }

  const filteredAppointments = appointments

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
      
      const service = services.find((s) => s.id === values.serviceId)
      if (!service) return

      const startTime = values.date
        .hour(values.startTime.hour())
        .minute(values.startTime.minute())
        .toISOString()
      
      const endTime = dayjs(startTime).add(service.duration, 'minute').toISOString()

      await appointmentService.createAppointment({
        title: service.name,
        description: values.notes,
        startTime,
        endTime,
        clientId: values.clientId,
        professionalId: values.professionalId,
        serviceId: values.serviceId,
        notes: values.notes,
      })

      message.success('Agendamento criado com sucesso!')
      setIsModalOpen(false)
      form.resetFields()
      await loadAppointments()
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error)
      message.error(error.response?.data?.error || 'Erro ao criar agendamento')
    }
  }

  const handleStatusChange = async (appointmentId: string, newStatus: ApiAppointment['status']) => {
    try {
      await appointmentService.updateStatus(appointmentId, newStatus)
      message.success('Status atualizado!')
      await loadAppointments()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      message.error(error.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza que deseja excluir este agendamento?',
      okText: 'Sim, excluir',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        try {
          await appointmentService.deleteAppointment(appointmentId)
          message.success('Agendamento excluído!')
          await loadAppointments()
        } catch (error: any) {
          console.error('Erro ao excluir agendamento:', error)
          message.error(error.response?.data?.error || 'Erro ao excluir agendamento')
        }
      },
    })
  }

  const handleEditAppointment = (appointment: AppointmentView) => {
    setSelectedAppointment(appointment)
    setIsDetailsModalOpen(true)
  }

  const handleUpdateAppointment = async () => {
    try {
      const values = await form.validateFields()
      
      if (!selectedAppointment) return

      const service = services.find((s) => s.id === values.serviceId)
      if (!service) return

      const startTime = values.date
        .hour(values.startTime.hour())
        .minute(values.startTime.minute())
        .toISOString()
      
      const endTime = dayjs(startTime).add(service.duration, 'minute').toISOString()

      await appointmentService.updateAppointment(selectedAppointment.id, {
        title: service.name,
        description: values.notes,
        startTime,
        endTime,
        clientId: values.clientId,
        professionalId: values.professionalId,
        serviceId: values.serviceId,
        notes: values.notes,
      })

      message.success('Agendamento atualizado com sucesso!')
      setIsDetailsModalOpen(false)
      setSelectedAppointment(null)
      form.resetFields()
      await loadAppointments()
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error)
      message.error(error.response?.data?.error || 'Erro ao atualizar agendamento')
    }
  }

  const getAppointmentsForSlot = (time: string) => {
    return filteredAppointments.filter((apt) => {
      const slotStart = time
      const slotEnd = dayjs(`2000-01-01 ${time}`).add(30, 'minute').format('HH:mm')
      return apt.startTimeFormatted >= slotStart && apt.startTimeFormatted < slotEnd
    })
  }

  const getAppointmentHeight = (appointment: AppointmentView) => {
    const start = dayjs(appointment.startTime)
    const end = dayjs(appointment.endTime)
    const durationMinutes = end.diff(start, 'minute')
    // 60px por slot de 30 minutos = 2px por minuto
    return (durationMinutes / 30) * 60
  }
  
  const getProfessionalColor = (professionalId: string) => {
    const index = professionals.findIndex((p) => p.id === professionalId)
    return professionals[index]?.color || generateColor(index)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" tip="Carregando agenda..." />
      </div>
    )
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
              loading={loading}
            >
              {professionals.map((prof, index) => (
                <Select.Option key={prof.id} value={prof.id}>
                  <Space>
                    <Avatar size="small" style={{ backgroundColor: prof.color || generateColor(index) }}>
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
        {/* Header com dias */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ width: 80, padding: 12, borderRight: '1px solid #f0f0f0' }}>
            <Text type="secondary">Horário</Text>
          </div>
          {viewMode === 'day' ? (
            // Visualização de um dia
            <div style={{ flex: 1, padding: 12, textAlign: 'center' }}>
              <Text strong>{currentDate.format('ddd, DD/MM')}</Text>
            </div>
          ) : (
            // Visualização de semana
            Array.from({ length: 7 }).map((_, index) => {
              const date = currentDate.startOf('week').add(index, 'day')
              return (
                <div 
                  key={date.format('YYYY-MM-DD')} 
                  style={{ 
                    flex: 1, 
                    padding: 12, 
                    textAlign: 'center',
                    borderRight: index < 6 ? '1px solid #f0f0f0' : 'none'
                  }}
                >
                  <Text strong>{date.format('ddd')}</Text>
                  <div style={{ fontSize: 12, color: '#666' }}>{date.format('DD/MM')}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Time slots e appointments */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto', display: 'flex' }}>
          {/* Coluna de horários fixa */}
          <div style={{ width: 80, flexShrink: 0 }}>
            {timeSlots.map((time) => {
              const isBusinessHours = time >= businessHoursStart && time <= businessHoursEnd
              return (
                <div
                  key={`time-${time}`}
                  style={{
                    height: 60,
                    padding: '8px 12px',
                    borderRight: '1px solid #f0f0f0',
                    borderBottom: '1px solid #f0f0f0',
                    color: isBusinessHours ? '#333' : '#999',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'flex-start',
                    backgroundColor: isBusinessHours ? '#fff' : '#fafafa',
                    fontWeight: isBusinessHours ? 500 : 400,
                  }}
                >
                  {time}
                </div>
              )
            })}
          </div>

          {/* Grid de agendamentos */}
          {viewMode === 'day' ? (
            // Modo dia: uma coluna
            <div
              style={{
                flex: 1,
                position: 'relative',
              }}
            >
              {/* Linhas de horário */}
              {timeSlots.map((time, idx) => {
                const isBusinessHours = time >= businessHoursStart && time <= businessHoursEnd
                return (
                  <div
                    key={`line-${idx}`}
                    style={{
                      height: 60,
                      borderBottom: '1px solid #f0f0f0',
                      position: 'relative',
                      backgroundColor: isBusinessHours ? '#fff' : '#f5f5f5',
                    }}
                  />
                )
              })}
              
              {/* Agendamentos posicionados absolutamente */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                {/* Linha de hora atual */}
                {currentDate.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD') && (
                  <div
                    style={{
                      position: 'absolute',
                      top: `${(currentTime.hour() * 60 + currentTime.minute()) / 30 * 60}px`,
                      left: 0,
                      right: 0,
                      height: 2,
                      backgroundColor: '#ff4d4f',
                      zIndex: 100,
                      pointerEvents: 'none',
                    }}
                  />
                )}

                {appointments
                  .filter((apt) => apt.date === currentDate.format('YYYY-MM-DD') && (!selectedProfessional || apt.professionalId === selectedProfessional))
                  .map((apt) => {
                    const startTime = dayjs(apt.startTime)
                    const endTime = dayjs(apt.endTime)
                    const startMinutes = startTime.hour() * 60 + startTime.minute()
                    const durationMinutes = endTime.diff(startTime, 'minute')
                    // Agora não precisa subtrair offset, pois os slots começam às 00:00
                    const topPx = (startMinutes / 30) * 60
                    const heightPx = (durationMinutes / 30) * 60

                    return (
                      <Tooltip
                        key={apt.id}
                        title={
                          <div>
                            <div><strong>{apt.service?.name || apt.title}</strong></div>
                            <div>{apt.client?.name || 'Cliente não informado'}</div>
                            <div>{apt.startTimeFormatted} - {apt.endTimeFormatted}</div>
                            <div>R$ {apt.service?.price?.toFixed(2) || '0.00'}</div>
                          </div>
                        }
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: `${topPx}px`,
                            left: '4px',
                            right: '4px',
                            height: `${heightPx}px`,
                            backgroundColor: getProfessionalColor(apt.professionalId),
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: 6,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            zIndex: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                          }}
                          onClick={() => handleEditAppointment(apt)}
                        >
                          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {apt.service?.name || apt.title}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <UserOutlined /> {apt.client?.name || 'Cliente não informado'}
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>
                            <ClockCircleOutlined /> {apt.startTimeFormatted} - {apt.endTimeFormatted}
                          </div>
                          {heightPx > 70 && (
                            <div style={{ marginTop: 4 }}>
                              <Tag color={statusConfig[apt.status].color} style={{ fontSize: 10, padding: '0 4px' }}>
                                {statusConfig[apt.status].label}
                              </Tag>
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    )
                  })}
              </div>
            </div>
          ) : (
            // Modo semana: 7 colunas
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, position: 'relative' }}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayDate = currentDate.startOf('week').add(dayIndex, 'day')
                const dateStr = dayDate.format('YYYY-MM-DD')

                return (
                  <div
                    key={`day-${dateStr}`}
                    style={{
                      borderRight: dayIndex < 6 ? '1px solid #f0f0f0' : 'none',
                      position: 'relative',
                    }}
                  >
                    {/* Linhas de horário */}
                    {timeSlots.map((time, idx) => {
                      const isBusinessHours = time >= businessHoursStart && time <= businessHoursEnd
                      return (
                        <div
                          key={`line-${dateStr}-${idx}`}
                          style={{
                            height: 60,
                            borderBottom: '1px solid #f0f0f0',
                            position: 'relative',
                            backgroundColor: isBusinessHours ? '#fff' : '#f5f5f5',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleSlotClick(dateStr, timeSlots[idx])}
                        />
                      )
                    })}

                    {/* Agendamentos posicionados absolutamente */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                      {/* Linha de hora atual */}
                      {dateStr === dayjs().format('YYYY-MM-DD') && (
                        <div
                          style={{
                            position: 'absolute',
                            top: `${(currentTime.hour() * 60 + currentTime.minute()) / 30 * 60}px`,
                            left: 0,
                            right: 0,
                            height: 2,
                            backgroundColor: '#ff4d4f',
                            zIndex: 100,
                            pointerEvents: 'none',
                          }}
                        />
                      )}

                      {appointments
                        .filter(
                          (apt) =>
                            apt.date === dateStr &&
                            (!selectedProfessional || apt.professionalId === selectedProfessional)
                        )
                        .map((apt) => {
                          const startTime = dayjs(apt.startTime)
                          const endTime = dayjs(apt.endTime)
                          const startMinutes = startTime.hour() * 60 + startTime.minute()
                          const durationMinutes = endTime.diff(startTime, 'minute')
                          // Agora não precisa subtrair offset, pois os slots começam às 00:00
                          const topPx = (startMinutes / 30) * 60
                          const heightPx = (durationMinutes / 30) * 60

                          return (
                            <Tooltip
                              key={apt.id}
                              title={
                                <div>
                                  <div><strong>{apt.service?.name || apt.title}</strong></div>
                                  <div>{apt.client?.name || 'Cliente não informado'}</div>
                                  <div>{apt.startTimeFormatted} - {apt.endTimeFormatted}</div>
                                  <div>R$ {apt.service?.price?.toFixed(2) || '0.00'}</div>
                                </div>
                              }
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  top: `${topPx}px`,
                                  left: '2px',
                                  right: '2px',
                                  height: `${heightPx}px`,
                                  backgroundColor: getProfessionalColor(apt.professionalId),
                                  color: '#fff',
                                  padding: '4px 6px',
                                  borderRadius: 4,
                                  overflow: 'hidden',
                                  cursor: 'pointer',
                                  zIndex: 10,
                                  fontSize: 10,
                                }}
                                onClick={() => handleEditAppointment(apt)}
                              >
                                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {apt.service?.name || apt.title}
                                </div>
                                <div style={{ fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {apt.startTimeFormatted}
                                </div>
                              </div>
                            </Tooltip>
                          )
                        })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Novo Agendamento */}
      <Modal
        title="Novo agendamento"
        open={isModalOpen}
        onOk={handleCreateAppointment}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText="Salvar"
        cancelText="Cancelar"
        width="60%"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {/* Linha 1: Cliente, Data, Status, Cor */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clientId"
                label="Cliente"
                rules={[{ required: true, message: 'Selecione o cliente' }]}
              >
                <Select
                  placeholder="Busque por um cliente"
                  showSearch
                  loading={loading}
                  filterOption={(input, option) => {
                    const text = String(option?.children || '')
                    return text.toLowerCase().includes(input.toLowerCase())
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="text"
                        icon={<PlusOutlined />}
                        block
                        onClick={() => setIsCreateClientModalOpen(true)}
                        style={{ textAlign: 'left', color: '#505afb' }}
                      >
                        Criar cliente
                      </Button>
                    </>
                  )}
                >
                  {clients.map((client) => (
                    <Select.Option key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="date"
                label="Data"
                rules={[{ required: true, message: 'Selecione a data' }]}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="status" label="Status" initialValue="PENDING">
                <Select>
                  <Select.Option value="PENDING">Agendado</Select.Option>
                  <Select.Option value="PAID">Confirmado</Select.Option>
                  <Select.Option value="CANCELLED">Cancelado</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="color" label="Cor">
                <Input type="color" style={{ height: 32, cursor: 'pointer' }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Divider */}
          <Divider style={{ margin: '16px 0' }} />

          {/* Seção: Itens do agendamento */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 14 }}>
              Itens do agendamento
            </Text>
          </div>

          {/* Itens do agendamento */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="serviceId"
                label="Descrição"
                rules={[{ required: true, message: 'Selecione o serviço' }]}
              >
                <Select
                  placeholder="Selecionar serviço"
                  loading={loading}
                  onChange={(serviceId) => {
                    const service = services.find((s) => s.id === serviceId)
                    if (service) {
                      form.setFieldValue('duration', service.duration)
                    }
                  }}
                >
                  {services.map((service) => (
                    <Select.Option key={service.id} value={service.id}>
                      {service.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="professionalId"
                label="Profissional"
                rules={[{ required: true, message: 'Selecione o profissional' }]}
              >
                <Select placeholder="Selecione" loading={loading}>
                  {professionals.map((prof, index) => (
                    <Select.Option key={prof.id} value={prof.id}>
                      <Space>
                        <Avatar size="small" style={{ backgroundColor: prof.color || generateColor(index) }}>
                          {prof.name[0]}
                        </Avatar>
                        {prof.name}
                      </Space>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="startTime" label="Horário" rules={[{ required: true }]}>
                <TimePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="duration" label="Duração">
                <Input disabled value={form.getFieldValue('duration')} />
              </Form.Item>
            </Col>
          </Row>

          {/* Divider */}
          <Divider style={{ margin: '16px 0' }} />

          {/* Opções de envio */}
          <div style={{ marginBottom: 16 }}>
            <Checkbox defaultChecked style={{ marginRight: 24 }}>
              Enviar lembrete
            </Checkbox>
            <Checkbox>Encaixar agendamento</Checkbox>
          </div>

          {/* Repetição */}
          <div style={{ marginBottom: 16 }}>
            <Text strong>Além deste, repetir mais</Text>
            <Select defaultValue="nao-repete" style={{ marginTop: 8, width: '100%' }}>
              <Select.Option value="nao-repete">Agendamento não se repete</Select.Option>
              <Select.Option value="semanal">Semanalmente</Select.Option>
              <Select.Option value="quinzenal">A cada 15 dias</Select.Option>
              <Select.Option value="mensal">Mensalmente</Select.Option>
            </Select>
          </div>

          {/* Observações */}
          <Form.Item name="notes" label="Observações">
            <Input.TextArea rows={3} placeholder="Escreva aqui" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de Detalhes/Edição */}
      <Modal
        title="Detalhes do Agendamento"
        open={isDetailsModalOpen}
        onOk={handleUpdateAppointment}
        onCancel={() => {
          setIsDetailsModalOpen(false)
          setSelectedAppointment(null)
          form.resetFields()
        }}
        okText="Salvar Alterações"
        cancelText="Cancelar"
        width={700}
      >
        {selectedAppointment && (
          <div>
            <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Space>
                    <Tag color={statusConfig[selectedAppointment.status].color} icon={statusConfig[selectedAppointment.status].icon}>
                      {statusConfig[selectedAppointment.status].label}
                    </Tag>
                    <Text type="secondary">
                      Criado em {dayjs(selectedAppointment.createdAt).format('DD/MM/YYYY [às] HH:mm')}
                    </Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Text strong>Cliente:</Text>
                  <div>{selectedAppointment.client?.name || 'Não informado'}</div>
                  <Text type="secondary">{selectedAppointment.client?.phone || ''}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Profissional:</Text>
                  <div>
                    <Space>
                      <Avatar
                        size="small"
                        style={{ backgroundColor: getProfessionalColor(selectedAppointment.professionalId) }}
                      >
                        {selectedAppointment.professional?.name?.[0] || 'P'}
                      </Avatar>
                      {selectedAppointment.professional?.name || 'Não informado'}
                    </Space>
                  </div>
                </Col>
                <Col span={12}>
                  <Text strong>Serviço:</Text>
                  <div>{selectedAppointment.service?.name || selectedAppointment.title}</div>
                  <Text type="secondary">
                    {selectedAppointment.service?.duration || 0} min - R$ {selectedAppointment.service?.price?.toFixed(2) || '0.00'}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Horário:</Text>
                  <div>
                    {selectedAppointment.startTimeFormatted} - {selectedAppointment.endTimeFormatted}
                  </div>
                  <Text type="secondary">{dayjs(selectedAppointment.startTime).format('DD/MM/YYYY')}</Text>
                </Col>
              </Row>
            </div>

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                clientId: selectedAppointment.clientId,
                professionalId: selectedAppointment.professionalId,
                serviceId: selectedAppointment.serviceId,
                date: dayjs(selectedAppointment.startTime),
                startTime: dayjs(selectedAppointment.startTime),
                notes: selectedAppointment.notes,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="clientId"
                    label="Cliente"
                    rules={[{ required: true, message: 'Selecione o cliente' }]}
                  >
                    <Select 
                      placeholder="Selecione o cliente" 
                      showSearch
                      filterOption={(input, option) => {
                        const text = String(option?.children || '')
                        return text.toLowerCase().includes(input.toLowerCase())
                      }}
                    >
                      {clients.map((client) => (
                        <Select.Option key={client.id} value={client.id}>
                          {client.name} - {client.phone}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="professionalId"
                    label="Profissional"
                    rules={[{ required: true, message: 'Selecione o profissional' }]}
                  >
                    <Select placeholder="Selecione o profissional">
                      {professionals.map((prof, index) => (
                        <Select.Option key={prof.id} value={prof.id}>
                          <Space>
                            <Avatar size="small" style={{ backgroundColor: prof.color || generateColor(index) }}>
                              {prof.name[0]}
                            </Avatar>
                            {prof.name}
                          </Space>
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="serviceId"
                label="Serviço"
                rules={[{ required: true, message: 'Selecione o serviço' }]}
              >
                <Select placeholder="Selecione o serviço">
                  {services.map((service) => (
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
                <Input.TextArea rows={3} placeholder="Observações sobre o atendimento" />
              </Form.Item>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Space>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setIsDetailsModalOpen(false)
                      handleDeleteAppointment(selectedAppointment.id)
                    }}
                  >
                    Excluir Agendamento
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Select
                    value={selectedAppointment.status}
                    onChange={(status) => {
                      handleStatusChange(selectedAppointment.id, status)
                      setIsDetailsModalOpen(false)
                    }}
                    style={{ width: 160 }}
                    placeholder="Alterar Status"
                  >
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <Select.Option key={key} value={key}>
                        <Tag color={config.color} icon={config.icon} style={{ margin: 0 }}>
                          {config.label}
                        </Tag>
                      </Select.Option>
                    ))}
                  </Select>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Modal de Criar Cliente */}
      <ClientFormModal
        open={isCreateClientModalOpen}
        onClose={() => {
          setIsCreateClientModalOpen(false)
        }}
        onSuccess={(newClient) => {
          setClients((prev) => [...prev, newClient])
          form.setFieldsValue({ clientId: newClient.id })
          message.success('Cliente criado com sucesso!')
        }}
      />
    </div>
  )
}