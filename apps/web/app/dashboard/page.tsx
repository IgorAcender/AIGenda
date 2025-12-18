'use client';

import { useState, useEffect } from 'react';
import { Tabs, Button, Modal, Form, Input, Table, Space, message, Spin, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, TeamOutlined, ShoppingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: string;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('clients');
  const [loading, setLoading] = useState(false);
  
  // Clients state
  const [clients, setClients] = useState<Client[]>([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm] = Form.useForm();
  
  // Professionals state
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [professionalModalOpen, setProfessionalModalOpen] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [professionalForm] = Form.useForm();
  
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm] = Form.useForm();

  // Load data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    loadClients();
    loadProfessionals();
    loadServices();
  }, [router]);

  // ==================== CLIENTS ====================
  const loadClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      message.error('Erro ao carregar clientes');
    }
  };

  const handleAddClient = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingClient) {
        await axios.put(
          `${API_URL}/api/clients/${editingClient.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Cliente atualizado com sucesso');
      } else {
        await axios.post(
          `${API_URL}/api/clients`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Cliente criado com sucesso');
      }
      
      clientForm.resetFields();
      setClientModalOpen(false);
      setEditingClient(null);
      await loadClients();
    } catch (error) {
      message.error('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Cliente deletado com sucesso');
      await loadClients();
    } catch (error) {
      message.error('Erro ao deletar cliente');
    }
  };

  // ==================== PROFESSIONALS ====================
  const loadProfessionals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/professionals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfessionals(response.data || []);
    } catch (error) {
      console.error('Error loading professionals:', error);
    }
  };

  const handleAddProfessional = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingProfessional) {
        await axios.put(
          `${API_URL}/api/professionals/${editingProfessional.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Profissional atualizado com sucesso');
      } else {
        await axios.post(
          `${API_URL}/api/professionals`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Profissional criado com sucesso');
      }
      
      professionalForm.resetFields();
      setProfessionalModalOpen(false);
      setEditingProfessional(null);
      await loadProfessionals();
    } catch (error) {
      message.error('Erro ao salvar profissional');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/professionals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Profissional deletado com sucesso');
      await loadProfessionals();
    } catch (error) {
      message.error('Erro ao deletar profissional');
    }
  };

  // ==================== SERVICES ====================
  const loadServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/services`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const handleAddService = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (editingService) {
        await axios.put(
          `${API_URL}/api/services/${editingService.id}`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Serviço atualizado com sucesso');
      } else {
        await axios.post(
          `${API_URL}/api/services`,
          values,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success('Serviço criado com sucesso');
      }
      
      serviceForm.resetFields();
      setServiceModalOpen(false);
      setEditingService(null);
      await loadServices();
    } catch (error) {
      message.error('Erro ao salvar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Serviço deletado com sucesso');
      await loadServices();
    } catch (error) {
      message.error('Erro ao deletar serviço');
    }
  };

  // ==================== COLUMNS ====================
  const clientColumns = [
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Telefone', dataIndex: 'phone', key: 'phone' },
    { title: 'Empresa', dataIndex: 'company', key: 'company' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Client) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingClient(record);
              clientForm.setFieldsValue(record);
              setClientModalOpen(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Confirmar exclusão',
                content: 'Tem certeza que deseja deletar este cliente?',
                okText: 'Deletar',
                cancelText: 'Cancelar',
                onOk: () => handleDeleteClient(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const professionalColumns = [
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Telefone', dataIndex: 'phone', key: 'phone' },
    { title: 'Especialização', dataIndex: 'specialization', key: 'specialization' },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Professional) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingProfessional(record);
              professionalForm.setFieldsValue(record);
              setProfessionalModalOpen(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Confirmar exclusão',
                content: 'Tem certeza que deseja deletar este profissional?',
                okText: 'Deletar',
                cancelText: 'Cancelar',
                onOk: () => handleDeleteProfessional(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  const serviceColumns = [
    { title: 'Nome', dataIndex: 'name', key: 'name' },
    { title: 'Descrição', dataIndex: 'description', key: 'description' },
    { title: 'Duração (min)', dataIndex: 'duration', key: 'duration' },
    { title: 'Preço', dataIndex: 'price', key: 'price', render: (price: number) => `R$ ${price.toFixed(2)}` },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: Service) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingService(record);
              serviceForm.setFieldsValue(record);
              setServiceModalOpen(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => {
              Modal.confirm({
                title: 'Confirmar exclusão',
                content: 'Tem certeza que deseja deletar este serviço?',
                okText: 'Deletar',
                cancelText: 'Cancelar',
                onOk: () => handleDeleteService(record.id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Stats */}
        <Row gutter={16} className="mb-8">
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Clientes"
                value={clients.length}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Profissionais"
                value={professionals.length}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Serviços"
                value={services.length}
                prefix={<ShoppingOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'clients',
                label: `Clientes (${clients.length})`,
                children: (
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="mb-4"
                      onClick={() => {
                        setEditingClient(null);
                        clientForm.resetFields();
                        setClientModalOpen(true);
                      }}
                    >
                      Novo Cliente
                    </Button>
                    <Table
                      columns={clientColumns}
                      dataSource={clients.map(c => ({ ...c, key: c.id }))}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                ),
              },
              {
                key: 'professionals',
                label: `Profissionais (${professionals.length})`,
                children: (
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="mb-4"
                      onClick={() => {
                        setEditingProfessional(null);
                        professionalForm.resetFields();
                        setProfessionalModalOpen(true);
                      }}
                    >
                      Novo Profissional
                    </Button>
                    <Table
                      columns={professionalColumns}
                      dataSource={professionals.map(p => ({ ...p, key: p.id }))}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                ),
              },
              {
                key: 'services',
                label: `Serviços (${services.length})`,
                children: (
                  <div>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="mb-4"
                      onClick={() => {
                        setEditingService(null);
                        serviceForm.resetFields();
                        setServiceModalOpen(true);
                      }}
                    >
                      Novo Serviço
                    </Button>
                    <Table
                      columns={serviceColumns}
                      dataSource={services.map(s => ({ ...s, key: s.id }))}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>

      {/* CLIENT MODAL */}
      <Modal
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        open={clientModalOpen}
        onCancel={() => {
          setClientModalOpen(false);
          setEditingClient(null);
          clientForm.resetFields();
        }}
        footer={null}
      >
        <Form form={clientForm} onFinish={handleAddClient} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="company" label="Empresa">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {editingClient ? 'Atualizar' : 'Criar'} Cliente
          </Button>
        </Form>
      </Modal>

      {/* PROFESSIONAL MODAL */}
      <Modal
        title={editingProfessional ? 'Editar Profissional' : 'Novo Profissional'}
        open={professionalModalOpen}
        onCancel={() => {
          setProfessionalModalOpen(false);
          setEditingProfessional(null);
          professionalForm.resetFields();
        }}
        footer={null}
      >
        <Form form={professionalForm} onFinish={handleAddProfessional} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="specialization" label="Especialização">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {editingProfessional ? 'Atualizar' : 'Criar'} Profissional
          </Button>
        </Form>
      </Modal>

      {/* SERVICE MODAL */}
      <Modal
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        open={serviceModalOpen}
        onCancel={() => {
          setServiceModalOpen(false);
          setEditingService(null);
          serviceForm.resetFields();
        }}
        footer={null}
      >
        <Form form={serviceForm} onFinish={handleAddService} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="duration" label="Duração (minutos)" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="price" label="Preço" rules={[{ required: true }]}>
            <Input type="number" step="0.01" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {editingService ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
