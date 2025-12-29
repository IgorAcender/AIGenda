'use client'

import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Avatar,
  Divider,
  Typography,
  Tabs,
  Switch,
  InputNumber,
  DatePicker,
} from 'antd'
import { UserOutlined, CameraOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

const { Title } = Typography

// Estilo para o Modal como slide-out panel
const modalStyle = `
  .client-modal .ant-modal {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    height: 100vh !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
  }
  
  .client-modal .ant-modal-content {
    height: 100vh !important;
    padding: 0 !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
  }
  
  .client-modal .ant-modal-header {
    border-bottom: 1px solid #f0f0f0 !important;
    padding: 16px 24px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }
  
  .client-modal .ant-modal-body {
    height: calc(100vh - 140px) !important;
    overflow-y: auto !important;
    padding: 0 !important;
    flex: 1 !important;
    display: flex !important;
  }
  
  .client-modal .ant-modal-footer {
    padding: 16px 24px !important;
    border-top: 1px solid #f0f0f0 !important;
    flex-shrink: 0 !important;
  }
  
  .client-modal-avatar-section {
    width: 25%;
    min-width: 25%;
    border-right: 1px solid #f0f0f0;
    padding: 24px;
    text-align: center;
    overflow-y: auto;
  }
  
  .client-modal-form-section {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
  
  @media (max-width: 768px) {
    .client-modal .ant-modal {
      width: 100% !important;
    }
    
    .client-modal-avatar-section {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #f0f0f0;
      padding: 16px;
    }
    
    .client-modal .ant-modal-body {
      flex-direction: column;
    }
  }
`

interface ClientFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: (client: any) => void
  editingClient?: any
}

export function ClientFormModal({ open, onClose, onSuccess, editingClient }: ClientFormModalProps) {
  const [form] = Form.useForm()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Mutation para salvar cliente
  const { mutate: saveClient, isPending: isSaving } = useApiMutation(
    async (clientData) => {
      if (editingClient?.id) {
        return await api.put(`/clients/${editingClient.id}`, clientData)
      } else {
        return await api.post('/clients', clientData)
      }
    },
    [['clients']]
  )

  // Carregar dados do cliente ao editar
  useEffect(() => {
    if (editingClient) {
      form.setFieldsValue({
        name: editingClient.name,
        apelido: editingClient.apelido,
        email: editingClient.email,
        phone: editingClient.phone,
        phone2: editingClient.phone2,
        birthDate: editingClient.birthDate ? dayjs(editingClient.birthDate) : null,
        gender: editingClient.gender,
        cpf: editingClient.cpf,
        cnpj: editingClient.cnpj,
        rg: editingClient.rg,
        referredBy: editingClient.referredBy,
        tags: editingClient.tags,
        address: editingClient.address,
        city: editingClient.city,
        state: editingClient.state,
        zipCode: editingClient.zipCode,
        notes: editingClient.notes,
        defaultDiscount: editingClient.defaultDiscount,
        discountType: editingClient.discountType,
        active: editingClient.active !== false,
        notifications: editingClient.notifications !== false,
        blocked: editingClient.blocked === true,
      })
      if (editingClient.avatar) {
        setAvatarPreview(editingClient.avatar)
      }
    } else {
      form.resetFields()
      setAvatarPreview(null)
    }
  }, [editingClient, form, open])

  const handleSave = (values: any) => {
    const clientData = {
      ...values,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      avatar: avatarPreview,
    }

    saveClient(clientData, {
      onSuccess: (response) => {
        onSuccess?.(response)
        onClose()
        form.resetFields()
        setAvatarPreview(null)
      },
    })
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        open={open}
        onCancel={onClose}
        footer={null}
        width="60%"
        bodyStyle={{ padding: 0, height: 'calc(100vh - 140px)' }}
        wrapClassName="client-modal"
        styles={{ 
          content: { padding: 0, borderRadius: 0 }
        }}
      >
        <div style={{ display: 'flex', height: '100%' }}>
          {/* Coluna Esquerda - Avatar */}
          <div className="client-modal-avatar-section">
            <Avatar
              size={120}
              src={avatarPreview}
              icon={!avatarPreview ? <UserOutlined /> : undefined}
              style={{ marginBottom: 16, backgroundColor: '#505afb' }}
            />
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <Button
              type="primary"
              icon={<CameraOutlined />}
              style={{ marginBottom: 24, width: '100%' }}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              Alterar Avatar
            </Button>

            <Divider />

            {/* Painéis informativos */}
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Histórico
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Ver agendamentos anteriores
                </Typography.Text>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Estatísticas
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Frequência de atendimento
                </Typography.Text>
              </div>

              <div>
                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                  Preferências
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Serviços e horários favoritos
                </Typography.Text>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formulário com Abas */}
          <div className="client-modal-form-section">
            <Form form={form} layout="vertical" onFinish={handleSave}>
            <Tabs
              defaultActiveKey="cadastro"
              items={[
                {
                  key: 'cadastro',
                  label: 'Cadastro',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="name"
                            label="* Nome Completo"
                            rules={[{ required: true, message: 'Nome é obrigatório' }]}
                          >
                            <Input placeholder="Nome completo do cliente" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="apelido" label="Apelido">
                            <Input placeholder="Como chamá-lo" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="email"
                            label="E-mail"
                            rules={[{ type: 'email', message: 'E-mail inválido' }]}
                          >
                            <Input placeholder="email@exemplo.com" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="phone"
                            label="* Celular"
                            rules={[{ required: true, message: 'Telefone é obrigatório' }]}
                          >
                            <Input placeholder="(11) 99999-9999" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="phone2" label="Telefone Fixo">
                            <Input placeholder="(11) 3333-3333" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="birthDate" label="Aniversário">
                            <DatePicker
                              style={{ width: '100%' }}
                              format="DD/MM/YYYY"
                              placeholder="DD/MM/YYYY"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="gender" label="Gênero">
                            <Input placeholder="M / F" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="cpf" label="CPF">
                            <Input placeholder="000.000.000-00" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="cnpj" label="CNPJ">
                            <Input placeholder="00.000.000/0000-00" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="rg" label="RG">
                            <Input placeholder="0000000-0" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="referredBy" label="Indicado por">
                            <Input placeholder="Nome de um cliente" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="tags" label="Hashtags / Tags">
                            <Input placeholder="#tag1 #tag2 #tag3" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'endereco',
                  label: 'Endereço',
                  children: (
                    <>
                      <Row gutter={16}>
                        <Col span={18}>
                          <Form.Item name="address" label="Endereço">
                            <Input placeholder="Rua, número, bairro" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item name="city" label="Cidade">
                            <Input placeholder="São Paulo" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="state" label="Estado">
                            <Input placeholder="SP" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="zipCode" label="CEP">
                            <Input placeholder="00000-000" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="notes" label="Observações">
                            <Input.TextArea rows={6} placeholder="Anotações sobre o cliente..." />
                          </Form.Item>
                        </Col>
                      </Row>
                    </>
                  ),
                },
                {
                  key: 'configuracoes',
                  label: 'Configurações',
                  children: (
                    <>
                      <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Desconto Padrão</Title>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item name="defaultDiscount" label="Desconto (%)">
                              <InputNumber
                                min={0}
                                max={100}
                                style={{ width: '100%' }}
                                placeholder="0.00"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item name="discountType" label="Tipo">
                              <Input placeholder="Na comanda / Cupom" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <Divider />

                      <div style={{ marginBottom: 24 }}>
                        <Row gutter={16} align="middle">
                          <Col span={20}>
                            <div>
                              <Typography.Text strong>Ativo</Typography.Text>
                              <Typography.Paragraph
                                type="secondary"
                                style={{ fontSize: 12, margin: '4px 0 0 0' }}
                              >
                                Desative um cliente para que ele não apareça em agendamentos, comandas etc.
                              </Typography.Paragraph>
                            </div>
                          </Col>
                          <Col span={4}>
                            <Form.Item name="active" valuePropName="checked" initialValue={true}>
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <Row gutter={16} align="middle">
                          <Col span={20}>
                            <div>
                              <Typography.Text strong>Notificações</Typography.Text>
                              <Typography.Paragraph
                                type="secondary"
                                style={{ fontSize: 12, margin: '4px 0 0 0' }}
                              >
                                O cliente irá receber notificações (WhatsApp e SMS) sobre agendamentos e lembretes.
                              </Typography.Paragraph>
                            </div>
                          </Col>
                          <Col span={4}>
                            <Form.Item name="notifications" valuePropName="checked" initialValue={true}>
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>

                      <div>
                        <Row gutter={16} align="middle">
                          <Col span={20}>
                            <div>
                              <Typography.Text strong>Bloquear Acesso</Typography.Text>
                              <Typography.Paragraph
                                type="secondary"
                                style={{ fontSize: 12, margin: '4px 0 0 0' }}
                              >
                                Ao bloquear, o cliente não terá acesso ao Agendamento Online ou Aplicativo Personalizado.
                              </Typography.Paragraph>
                            </div>
                          </Col>
                          <Col span={4}>
                            <Form.Item name="blocked" valuePropName="checked" initialValue={false}>
                              <Switch />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    </>
                  ),
                },
              ]}
            />

            {/* Botões de Ação */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0',
              }}
            >
              <Button onClick={onClose}>Cancelar</Button>
              <Button type="primary" htmlType="submit" loading={isSaving}>
                {editingClient ? 'Atualizar' : 'Criar'} Cliente
              </Button>
            </div>
            </Form>
          </div>
        </div>
      </Modal>
    </>
  )
}
