# Shared Types & Utils

Pacote compartilhado com tipos TypeScript e funções utilitárias usadas pelo Frontend e Backend.

## Estrutura

```
src/
└── index.ts          # Tipos compartilhados
```

## Tipos Disponíveis

### Usuário
- `User`
- `UserRole`
- `AuthResponse`

### Cadastro
- `Client`
- `Professional`
- `Service`

### Agendamentos
- `Appointment`
- `AppointmentStatus`
- `CreateAppointmentRequest`

### Financeiro
- `Transaction`
- `TransactionType`
- `TransactionStatus`

### Pagamentos
- `Subscription`
- `SubscriptionPlan`
- `SubscriptionStatus`

### API
- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `PaginationParams`

## Uso

No Frontend:
```typescript
import type { Appointment, Client } from '@aigenda/shared';
```

No Backend:
```typescript
import type { User, Transaction } from '@aigenda/shared';
```
