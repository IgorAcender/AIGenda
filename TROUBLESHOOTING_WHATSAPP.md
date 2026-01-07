# 🔧 WhatsApp Marketing - Status e Troubleshooting

## 📋 O que Acontece ao Carregar a Página

Quando você acessa `http://localhost:3000/marketing/whatsapp`, a página realiza:

1. **Inicialização do useAuth**: Cria um tenant e usuário de teste
2. **Requisição GET /api/whatsapp/status/{tenantId}**: Verifica se o tenant já tem WhatsApp conectado
3. **Requisição GET /api/whatsapp/instances**: Carrega lista de 10 Evolution instances
4. **Polling automático**: A cada 5 segundos verifica o status

## 🚀 Como Usar

### 1. Página Carregou?
Se você vê a mensagem "Carregando informações do WhatsApp..." significa que está buscando os dados.

**Solução**: Aguarde 5 segundos ou verifique o console do navegador para erros.

### 2. Botão "Conectar WhatsApp"
Clique para:
- Gerar um QR Code
- Receberá na modal um QR Code base64

### 3. Status em Tempo Real
- **Desconectado**: Mostra botão "Conectar WhatsApp"
- **Conectado**: Mostra número de telefone e opção "Desconectar"

## 🔍 Debugging

### Verificar no Console do Navegador (F12):

```javascript
// Ver dados do tenant/usuário
console.log(sessionStorage.getItem('tenant'))

// Testar API de status
fetch('http://localhost:3001/api/whatsapp/status/test-tenant-001')
  .then(r => r.json())
  .then(d => console.log(d))

// Testar API de instances
fetch('http://localhost:3001/api/whatsapp/instances')
  .then(r => r.json())
  .then(d => console.log(d))
```

## 📡 Endpoints da API

```bash
# Ver status
curl http://localhost:3001/api/whatsapp/status/test-tenant-001

# Listar instances
curl http://localhost:3001/api/whatsapp/instances

# Testar setup (gera QR)
curl -X POST http://localhost:3001/api/whatsapp/setup \
  -H "Content-Type: application/json" \
  -d '{"tenantId":"test-tenant-001"}'

# Health check
curl http://localhost:3001/api/whatsapp/health
```

## ⚠️ Possíveis Problemas

### "Carregando..." Infinito
- ✅ API não está respondendo
- Solução: Verifique se `pnpm dev` está rodando

### Tenant null
- ✅ useAuth não inicializa
- Solução: Página agora cria tenant automático

### QR Code não aparece
- ✅ API retorna erro
- Solução: Verifique terminal onde `pnpm dev` roda

### Erro "Module not found"
- ✅ Falta `react-hot-toast`
- Solução: Já foi instalado com `pnpm add react-hot-toast`

## 🎯 Próximas Melhorias

1. Integrar com autenticação real
2. Adicionar validação de tenantId
3. Armazenar QR Code em cache
4. Adicionar retry automático
5. Implementar WebSocket para atualizações em tempo real

## 📞 Teste Rápido

1. Abra: http://localhost:3000/marketing/whatsapp
2. Aguarde carregar (5-10 segundos)
3. Clique: "Conectar WhatsApp"
4. Veja o QR Code na modal
5. Escaneie com seu WhatsApp real (se tiver)

Se persistir em "Carregando", há um erro na API. Verifique o terminal onde `pnpm dev` roda para ver os logs!
