# Backend - Node.js + Express

## Setup

```bash
cd apps/api
npm install
```

## Configuração

### 1. Crie o arquivo .env

```bash
cp .env.example .env
```

### 2. Configure o banco de dados

```bash
# Inicie o PostgreSQL com Docker
docker-compose up -d

# Execute as migrações
npm run migrate
```

### 3. Generate Prisma Client

```bash
npm run generate
```

## Desenvolvimento

```bash
npm run dev
```

API disponível em: http://localhost:3001

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `GET /api/clients/:id` - Obter cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente

### Profissionais
- `GET /api/professionals` - Listar
- `POST /api/professionals` - Criar

### Serviços
- `GET /api/services` - Listar
- `POST /api/services` - Criar

### Agendamentos
- `GET /api/appointments` - Listar com filtro de data
- `POST /api/appointments` - Criar agendamento
- `PATCH /api/appointments/:id/status` - Atualizar status
- `POST /api/appointments/:id/cancel` - Cancelar

### Transações (Financeiro)
- `GET /api/transactions` - Listar com filtros
- `POST /api/transactions` - Criar transação
- `GET /api/transactions/dashboard/summary` - Resumo financeiro

## Estrutura de Pastas

```
src/
├── index.ts            # Entrada da aplicação
├── middleware/
│   └── auth.ts        # JWT authentication
├── routes/
│   ├── auth.routes.ts
│   ├── clients.routes.ts
│   ├── professionals.routes.ts
│   ├── services.routes.ts
│   ├── appointments.routes.ts
│   └── transactions.routes.ts
├── controllers/        # Lógica de negócio
├── utils/              # Funções auxiliares
└── seeds/              # Scripts de seed de dados
```

## Database

Prisma ORM com PostgreSQL

### Modelos

- **Tenant** - Empresa (multi-tenancy)
- **User** - Usuários
- **Client** - Clientes
- **Professional** - Profissionais
- **Service** - Serviços
- **Appointment** - Agendamentos
- **Transaction** - Transações financeiras
- **Subscription** - Assinatura Stripe

## Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test
```

## Documentação da API

Veja [docs/API.md](./docs/API.md)
