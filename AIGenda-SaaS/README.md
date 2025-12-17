# 🎯 AIGenda SaaS - Plataforma de Agendamento Profissional

Um SaaS moderno e escalável para gerenciar agendamentos, clientes, profissionais e serviços com suporte a pagamentos recorrentes.

## 🏗️ Arquitetura

```
AIGenda-SaaS/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router
│   │   │   ├── components/    # Componentes React
│   │   │   ├── pages/         # Páginas (dashboard, agenda, etc)
│   │   │   └── lib/           # Utilitários
│   │   └── package.json
│   │
│   └── api/                    # Express Backend
│       ├── src/
│       │   ├── routes/        # Rotas da API
│       │   ├── controllers/   # Lógica de negócio
│       │   ├── models/        # Modelos Prisma
│       │   ├── middleware/    # Auth, validação
│       │   └── utils/         # Utilitários
│       └── package.json
│
├── packages/
│   └── shared/                # Tipos e utilitários compartilhados
│       ├── src/
│       │   ├── types/         # TypeScript types
│       │   └── utils/         # Funções compartilhadas
│       └── package.json
│
├── docker-compose.yml         # PostgreSQL + Redis local
└── README.md
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL (ou usar Docker)

### Instalação

```bash
# Clone ou entre na pasta
cd AIGenda-SaaS

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Execute as migrações do banco de dados
npm run migrate --workspace=apps/api

# Inicie o desenvolvimento
npm run dev
```

### URLs Locais
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432

## 📋 Funcionalidades

### ✅ Módulos Implementados

#### 1. **Autenticação & Multi-tenancy**
- Login/Registro com JWT
- Isolamento de dados por empresa (tenant)
- Refresh tokens seguros

#### 2. **Principal - Agenda & Painel**
- Calendário interativo (FullCalendar)
- Visualização diária, semanal, mensal
- Criar agendamentos rápido
- Dashboard com KPIs

#### 3. **Cadastro**
- **Clientes**: Gerenciar clientes com contato
- **Profissionais**: Profissionais por serviço
- **Serviços**: Tipos de serviços com preços
- **Categorias**: Organização de serviços

#### 4. **Financeiro**
- **Caixa**: Entradas/Saídas diárias
- **Transações**: Histórico completo
- **Comissões**: Cálculo automático para profissionais
- **Relatórios**: Gráficos e exportação

#### 5. **Configurações**
- Configurações da empresa
- Templates de email
- Integrações (WhatsApp, SMS)
- Backup de dados

#### 6. **Pagamentos (Stripe)**
- Planos de assinatura
- Cobrança recorrente
- Faturas

## 🛠️ Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Ant Design, TailwindCSS |
| **Backend** | Node.js, Express, TypeScript |
| **Banco** | PostgreSQL, Prisma ORM |
| **Autenticação** | JWT, NextAuth.js |
| **Real-time** | Socket.io |
| **Pagamentos** | Stripe |
| **Email** | SendGrid |
| **Deploy** | Vercel (Frontend), Railway (Backend) |

## 📚 Documentação

- [Frontend Setup](./apps/web/README.md)
- [Backend Setup](./apps/api/README.md)
- [API Documentation](./apps/api/docs/API.md)

## 🔐 Segurança

- ✅ JWT com refresh tokens
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ Proteção CSRF
- ✅ Isolamento de dados multi-tenant

## 📈 Roadmap

- [ ] App mobile (React Native)
- [ ] Video conferência integrada
- [ ] IA para recomendações de agendamento
- [ ] Integração com Google Calendar
- [ ] Marketing automático (Email/SMS)
- [ ] Webhooks customizáveis

## 📝 Licença

MIT

## 👨‍💻 Autor

Igor Acender - [@IgorAcender](https://github.com/IgorAcender)

---

**Começar desenvolvimento:**
```bash
npm run dev
```

Bora codar! 🚀
