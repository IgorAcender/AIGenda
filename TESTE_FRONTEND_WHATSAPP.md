# 🧪 Teste Frontend WhatsApp

## URL para Testar
```
http://localhost:3000/marketing/whatsapp
```

## O que foi criado:

### 📁 Arquivos Novos:
1. `/apps/web/src/app/(dashboard)/marketing/whatsapp/page.tsx`
   └─ Página principal do WhatsApp Marketing

2. `/apps/web/src/components/marketing/WhatsAppMarketingPage.tsx`
   └─ Componente principal com toda a interface

3. `/apps/web/src/services/whatsappService.ts`
   └─ Serviço para comunicar com API

4. `/apps/web/src/hooks/useAuth.ts`
   └─ Hook para autenticação

### ✨ Funcionalidades Implementadas:

- ✅ Status de Conexão (Conectado/Desconectado)
- ✅ Botão para Conectar WhatsApp
- ✅ Modal com QR Code
- ✅ Regenerar QR Code
- ✅ Desconectar WhatsApp
- ✅ Listar Evolution Instances (10 servidores)
- ✅ Mostrar ocupação dos servidores
- ✅ Polling automático a cada 5 segundos
- ✅ Guia "Como Funciona"
- ✅ Cards de benefícios

### 🎨 Design:
- Responsive (mobile, tablet, desktop)
- Tailwind CSS
- Ícones do Lucide
- Toast notifications

## Como Testar:

### 1. Preparar Backend
```bash
cd apps/api
pnpm db:push
pnpm db:seed
```

### 2. Iniciar Docker
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Iniciar Frontend
```bash
pnpm dev
```

### 4. Acessar
```
http://localhost:3000/marketing/whatsapp
```

### 5. Testar Funcionalidades
- Clique "Conectar WhatsApp"
- Verifique se QR Code aparece
- Veja status das Evolution instances
- Regenere QR Code
- Desconecte

## Endpoint Status

A página faz requisições para:
```
GET  http://localhost:3001/api/whatsapp/status/:tenantId
GET  http://localhost:3001/api/whatsapp/instances
POST http://localhost:3001/api/whatsapp/setup
POST http://localhost:3001/api/whatsapp/refresh-qr
POST http://localhost:3001/api/whatsapp/disconnect
```

## Variáveis de Ambiente

Verifique que `.env.local` tem:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Se não tiver, adicione no arquivo `/apps/web/.env.local`

## Troubleshooting

### "Tenant não encontrado"
- Verifique se useAuth está retornando tenant.id
- Simule um tenant no sessionStorage:
```javascript
sessionStorage.setItem('tenant', JSON.stringify({
  id: 'test-tenant-001',
  name: 'Meu Negócio',
  slug: 'meu-negocio'
}))
```

### QR Code não aparece
- Verifique se API está respondendo:
```bash
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test-001"}'
```

### Instances vazias
- Verifique se Evolution instances foram criadas:
```bash
curl http://localhost:3001/api/whatsapp/instances
```

## Próximas Melhorias

- [ ] Integrar com sistema de autenticação real
- [ ] Armazenar QR Code em cache
- [ ] Adicionar histórico de mensagens
- [ ] Dashboard de estatísticas
- [ ] Templates de mensagens
- [ ] Agendamento de mensagens
