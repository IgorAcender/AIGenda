# Frontend - Next.js

Veja: [apps/web/README.md](./apps/web/README.md)

## Setup

```bash
cd apps/web
npm install
```

## Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Estrutura de Pastas

```
src/
├── app/                 # Next.js App Router
├── components/          # Componentes React
│   ├── layout/
│   ├── dashboard/
│   ├── forms/
│   └── common/
├── pages/              # Páginas principais
│   ├── auth/
│   ├── dashboard/
│   ├── appointments/
│   ├── clients/
│   ├── professionals/
│   ├── services/
│   ├── transactions/
│   └── settings/
├── lib/                # Utilitários
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
└── styles/             # CSS Global
```

## Componentes Principais

- **Layout**: Header, Sidebar, Footer
- **Dashboard**: Cards com métricas, Gráficos
- **Agenda**: FullCalendar integrado
- **Cadastros**: Tabelas, Forms com Ant Design
- **Financeiro**: Dashboard financeiro com gráficos
