```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AIGenda SaaS - Arquitetura                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐         ┌──────────────────────────┐
│     FRONTEND              │         │      BACKEND             │
│    (Next.js 14)           │         │   (Express + Node.js)    │
│    Port: 3000             │         │    Port: 3001            │
├──────────────────────────┤         ├──────────────────────────┤
│                          │         │                          │
│ Pages:                   │◄───────►│ API Routes:              │
│ • Login/Register         │  HTTP   │ • /api/auth              │
│ • Dashboard              │◄───────►│ • /api/clients           │
│ • Clientes               │         │ • /api/professionals     │
│ • Profissionais          │         │ • /api/services          │
│ • Serviços               │         │ • /api/appointments      │
│ • Agenda                 │         │ • /api/transactions      │
│ • Financeiro             │         │                          │
│ • Configurações          │         │ Middleware:              │
│                          │         │ • JWT Auth               │
│ UI Components:           │         │ • Multi-tenancy          │
│ • Ant Design             │         │ • CORS                   │
│ • FullCalendar           │         │                          │
│ • Recharts               │         │ Services:                │
│ • Tailwind CSS           │         │ • Clients                │
│                          │         │ • Professionals          │
│                          │         │ • Services               │
│                          │         │ • Appointments           │
│                          │         │ • Transactions           │
│                          │         │ • Subscriptions          │
│                          │         │                          │
└──────────────────────────┘         └──────────────────────────┘
         │                                      │
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                   ┌────────▼────────┐
                   │   PostgreSQL    │
                   │   Port: 5432    │
                   │                 │
                   │ Tables:         │
                   │ • tenants       │
                   │ • users         │
                   │ • clients       │
                   │ • professionals │
                   │ • services      │
                   │ • appointments  │
                   │ • transactions  │
                   │ • subscriptions │
                   │ • configurations│
                   └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO DE AUTENTICAÇÃO                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. Usuário acessa /login ou /register
2. Frontend envia credenciais para POST /api/auth/login
3. Backend valida e gera JWT token + refresh token
4. Frontend armazena tokens no localStorage
5. Todas as requisições incluem: Authorization: Bearer <token>
6. Backend valida token em cada requisição
7. Se expirado, usa refreshToken para obter novo token

┌─────────────────────────────────────────────────────────────────────────────┐
│                       ESTRUTURA DE PASTAS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

AIGenda-SaaS/
│
├── apps/
│   ├── web/                          (Frontend - Next.js)
│   │   ├── src/
│   │   │   ├── app/                  (Pages)
│   │   │   ├── components/           (React Components)
│   │   │   ├── lib/                  (API clients, services)
│   │   │   └── styles/               (CSS)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.js
│   │
│   └── api/                          (Backend - Express)
│       ├── src/
│       │   ├── index.ts              (Entrada)
│       │   ├── routes/               (Endpoints)
│       │   ├── middleware/           (Auth, validation)
│       │   └── controllers/          (Lógica)
│       ├── prisma/
│       │   └── schema.prisma         (Modelos BD)
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/
│   └── shared/                       (Tipos compartilhados)
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml                (PostgreSQL + Redis)
├── package.json                      (Root)
├── README.md                         (Documentação)
└── SETUP.md                          (Guia de instalação)

┌─────────────────────────────────────────────────────────────────────────────┐
│                      DADOS - MODELOS PRISMA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Tenant (Empresa)
  ├─ User[] (Usuários)
  │  ├─ Role: ADMIN | PROFESSIONAL | USER
  │  ├─ Professional? (relação 1:1)
  │  └─ Session[]
  │
  ├─ Client[] (Clientes)
  │  └─ Appointment[]
  │
  ├─ Professional[] (Profissionais)
  │  ├─ User? (relação 1:1)
  │  ├─ Appointment[]
  │  ├─ ServiceProfessional[]
  │  └─ Transaction[]
  │
  ├─ Service[] (Serviços)
  │  ├─ Appointment[]
  │  └─ ServiceProfessional[]
  │
  ├─ Appointment[] (Agendamentos)
  │  ├─ Client
  │  ├─ Professional
  │  ├─ Service
  │  └─ Transaction?
  │
  ├─ Transaction[] (Transações)
  │  ├─ Type: INCOME | COMMISSION | EXPENSE | REFUND
  │  ├─ Status: PENDING | CONFIRMED | FAILED | REFUNDED
  │  ├─ Client?
  │  ├─ Professional?
  │  └─ Appointment?
  │
  ├─ Subscription (Stripe)
  │  └─ Plan: STARTER | PRO | ENTERPRISE
  │
  └─ Configuration (Configurações)

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ROADMAP DE FEATURES                                 │
└─────────────────────────────────────────────────────────────────────────────┘

✅ CONCLUÍDO:
  ✓ Estrutura do projeto (monorepo)
  ✓ Banco de dados e modelos
  ✓ Autenticação básica (JWT)
  ✓ Multi-tenancy
  ✓ CRUD de clientes, profissionais, serviços
  ✓ Agendamentos com validação
  ✓ Transações financeiras
  ✓ Tipos TypeScript compartilhados

🚧 PRÓXIMAS FASES:
  ⬜ Fase 1: Frontend Login + Cadastros
     - Implementar páginas de autenticação
     - Criar tabelas de clientes/profissionais
     - Forms com Ant Design

  ⬜ Fase 2: Calendário e Agendamentos
     - FullCalendar integrado
     - Modal para criar agendamentos
     - Validação de conflitos

  ⬜ Fase 3: Dashboard Financeiro
     - Gráficos com Recharts
     - Relatórios de receita/despesa
     - Exportação em PDF

  ⬜ Fase 4: Notificações
     - Email com SendGrid
     - SMS com Twilio
     - Lembretes automáticos

  ⬜ Fase 5: Pagamentos
     - Integração com Stripe
     - Planos de assinatura
     - Cobrança recorrente

  ⬜ Fase 6: Integrações
     - Google Calendar
     - WhatsApp
     - Zapier

  ⬜ Fase 7: Mobile
     - App React Native
     - Sincronização em tempo real

┌─────────────────────────────────────────────────────────────────────────────┐
│                        TECNOLOGIAS USADAS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend:
  • Next.js 14 (React Framework)
  • React 18 (UI Library)
  • TypeScript (Type Safety)
  • Ant Design 5 (Components)
  • TailwindCSS (Utility Styling)
  • FullCalendar (Calendário)
  • Recharts (Gráficos)
  • Zustand (State Management)
  • Axios (HTTP Client)

Backend:
  • Node.js (Runtime)
  • Express (Framework)
  • TypeScript (Type Safety)
  • Prisma (ORM)
  • JWT (Autenticação)
  • PostgreSQL (Database)
  • Redis (Cache)
  • Socket.io (Real-time)

DevOps:
  • Docker & Docker Compose
  • npm Workspaces (Monorepo)
  • Git (Version Control)

┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRÓXIMOS PASSOS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. Leia o SETUP.md
2. Execute os comandos de instalação
3. Inicie o PostgreSQL com Docker
4. Execute as migrações do banco
5. Inicie Frontend e Backend
6. Teste a autenticação no Postman
7. Comece a implementar as páginas

PRONTO? Avise quando terminar o setup! 🚀
```
