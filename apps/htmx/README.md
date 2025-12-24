# 🚀 Frontend HTMX - Agende AI

Frontend ultra-rápido com **HTMX + Tailwind CSS + Fastify**.

## ⚡ Características

- **Velocidade**: ~50-100ms por troca de aba
- **Bundle mínimo**: ~2KB (vs 200KB React)
- **Zero compilação**: HTML + CSS + HTMX direto
- **SSR completo**: Server-side rendering nativo
- **Sem Virtual DOM**: Sem overhead de reconciliação

## 📋 Instalação

```bash
cd frontend-htmx
npm install
```

## 🏃 Como rodar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

O servidor está em `http://localhost:3000`

---

## 🏗️ Estrutura

```
frontend-htmx/
├── src/
│   └── server.js          # Servidor Fastify
├── views/
│   ├── login.ejs          # Página de login
│   └── dashboard.ejs      # Dashboard
├── public/
│   ├── css/
│   ├── js/
│   └── images/
└── package.json
```

---

## 🔌 Como funciona

1. **Página é renderizada no servidor** (SSR)
2. **HTMX captura cliques** nos links
3. **Requisição é feita via AJAX** ao servidor
4. **Servidor retorna HTML parcial**
5. **HTMX substitui conteúdo** (sem reload)

### Exemplo:

```html
<!-- Link que carrega clientes sem reload -->
<a hx-get="/partials/clients" hx-target="#content">
  👥 Clientes
</a>

<!-- O servidor retorna apenas o HTML dos clientes -->
<!-- HTMX substitui #content com esse HTML -->
```

---

## 📡 Conectando com API

O frontend faz proxy das requisições para o backend Fastify:

```javascript
// Cliente requisita: /api/clients
// Frontend faz proxy para: http://localhost:3001/api/clients
// Resposta volta para o cliente
```

---

## 🎯 Próximos passos

1. ✅ Criar páginas com HTMX
2. ✅ Adicionar CSS com Tailwind
3. ⏳ Integrar formulários (POST/PUT/DELETE)
4. ⏳ Adicionar notificações toast
5. ⏳ Melhorar UX com animações

---

## 📊 Performance vs React

| Métrica | HTMX | React |
|---------|------|-------|
| Bundle | 2KB | 200KB |
| Tempo 1ª carga | ~200ms | ~1s |
| Tempo troca aba | ~50ms | ~300ms |
| Requisições | Mínimas | Muitas |

---

## 🐛 Troubleshooting

### "Conexão recusada ao backend"
- Certifique-se que o backend Fastify está rodando em `http://localhost:3001`
- Verifique se as variáveis de ambiente estão corretas

### "HTMX não funciona"
- Verifique que HTMX está sendo carregado do CDN
- Cheque console do navegador por erros

---

## 📝 Notas

- Este é um frontend **stateless** - não armazena dados no cliente
- Autenticação é via JWT em cookies `httpOnly`
- Todos os dados vêm do backend Fastify
- HTMX garante compatibilidade com navegadores antigos

---

**Feliz Ágendamento! 🎉**
