// User types
export type UserRole = 'ADMIN' | 'PROFESSIONAL' | 'USER';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Client types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  cpf?: string;
  address?: string;
  city?: string;
  birthDate?: Date;
  notes?: string;
  active: boolean;
  tenantId: string;
  createdAt: Date;
}

// Professional types
export interface Professional {
  id: string;
  name: string;
  specialties: string[];
  bio?: string;
  avatar?: string;
  rating: number;
  commissionRate: number;
  active: boolean;
  tenantId: string;
  createdAt: Date;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // minutes
  category?: string;
  active: boolean;
  tenantId: string;
  createdAt: Date;
}

// Appointment types
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  tenantId: string;
  createdAt: Date;
}

export interface CreateAppointmentRequest {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  clientId: string;
  professionalId: string;
  serviceId: string;
}

// Transaction types
export type TransactionType = 'INCOME' | 'COMMISSION' | 'EXPENSE' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod?: string;
  appointmentId?: string;
  clientId?: string;
  professionalId?: string;
  tenantId: string;
  createdAt: Date;
  paidAt?: Date;
}

// Subscription types
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';

export interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  tenantId: string;
  createdAt: Date;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  email: string;
  logo?: string;
  phone?: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Pagination
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
