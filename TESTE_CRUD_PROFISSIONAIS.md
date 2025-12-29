# 🧪 Teste de CRUD de Profissionais

## Status: ✅ IMPLEMENTADO E COMPILADO

A rota dinâmica `/cadastro/profissionais/[id]` foi criada e compilada com sucesso!

### O que foi feito:

1. **Criada página dinâmica**: `/apps/web/src/app/(dashboard)/cadastro/profissionais/[id]/page.tsx`
2. **Integrada com API**: 
   - GET `/professionals/{id}` para buscar profissional (edit)
   - POST `/professionals` para criar novo
   - PUT `/professionals/{id}` para atualizar
3. **Validações**: Nome obrigatório, email válido, telefone opcional
4. **Otimizações**:
   - useApiQuery com cache de 5 minutos
   - useApiMutation com invalidação automática
   - Loading spinner durante fetch

---

## 🧪 Como Testar

### Teste 1: Criar Novo Profissional

**Pré-requisito**: Estar logado no dashboard

**Passos**:
1. Vá para `http://localhost:3000/cadastro/profissionais`
2. Clique no botão "➕ Novo Profissional"
3. Preencha:
   - Nome: "João Silva" (mínimo 3 caracteres)
   - Email: "joao@example.com" (opcional, mas validado se preenchido)
   - Telefone: "(11) 99999-9999" (opcional)
   - Especialidade: "Barbeiro" (opcional)
4. Clique em "💾 Salvar"

**Resultado esperado**:
- ✅ Mensagem: "Profissional criado com sucesso!"
- ✅ Redireciona para lista de profissionais
- ✅ Novo profissional aparece na tabela

**Se falhar**:
```bash
# Verifique os logs:
# 1. Console do navegador (F12 > Console)
# 2. Terminal da API: procure por erros de autenticação ou validação
# 3. Verifique se a API está rodando na porta 3001
```

---

### Teste 2: Editar Profissional Existente

**Pré-requisito**: Haver pelo menos um profissional criado

**Passos**:
1. Vá para `http://localhost:3000/cadastro/profissionais`
2. Clique no botão "✏️ Editar" de qualquer profissional
3. A URL deve ser: `http://localhost:3000/cadastro/profissionais/[uuid-do-profissional]`
4. Modifique algum campo (ex: nome, email, especialidade)
5. Clique em "💾 Salvar"

**Resultado esperado**:
- ✅ Spinner de carregamento aparece enquanto busca os dados
- ✅ Formulário é preenchido com os dados atuais
- ✅ Mensagem: "Profissional atualizado com sucesso!"
- ✅ Redireciona para lista
- ✅ Alterações aparecem na tabela

**Se falhar**:
```bash
# Verifique se:
# 1. O ID do profissional é válido (UUID)
# 2. O profissional pertence ao seu tenant
# 3. A API retorna 200 OK para GET /professionals/{id}
```

---

### Teste 3: Validações

**Campo Nome** (Obrigatório, min 3 caracteres):
```
❌ "" (vazio) → "Nome é obrigatório"
❌ "Jo" → "Nome deve ter pelo menos 3 caracteres"
✅ "João Silva"
```

**Campo Email** (Opcional, mas validado se preenchido):
```
❌ "invalido" → "Email inválido"
❌ "joao@" → "Email inválido"
✅ "joao@example.com"
✅ "" (vazio, permitido)
```

**Campo Telefone**:
```
✅ Aceita qualquer valor (opcional)
✅ "(11) 99999-9999"
✅ "11 999999999"
```

---

## 🔍 Verificações Técnicas

### 1. Verificar se a rota foi criada

```bash
ls -la /Users/user/Desktop/Programação/AIGenda/apps/web/src/app/\(dashboard\)/cadastro/profissionais/
```

Deve mostrar:
```
[id]/
├── page.tsx (✅ CRIADO)
├── layout.tsx (se existir)
page.tsx (lista de profissionais)
```

### 2. Verificar compilação

```bash
cd /Users/user/Desktop/Programação/AIGenda/apps/web
pnpm run build
```

Deve mostrar:
```
✓ Compiled successfully
├ ƒ /cadastro/profissionais/[id]         4.07 kB         338 kB
```

### 3. Verificar API endpoints

```bash
# Teste GET
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/professionals

# Teste POST
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}' \
  http://localhost:3001/professionals

# Teste GET por ID
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/professionals/[uuid-aqui]

# Teste PUT
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Updated"}' \
  http://localhost:3001/professionals/[uuid-aqui]
```

---

## 📊 Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| Frontend | Next.js 14 + TypeScript |
| UI | Ant Design 5.x |
| State | TanStack Query v5 |
| API | Axios (via `@/lib/api`) |
| Validação | Ant Design Form |
| Roteamento | Next.js App Router |

---

## 🐛 Troubleshooting

### Erro: "404 Not Found"
- ❌ Rota não encontrada
- ✅ Solução: Execute `pnpm run build` para regenerar

### Erro: "Profissional não encontrado"
- ❌ ID inválido ou profissional não pertence ao tenant
- ✅ Solução: Verifique se o UUID está correto

### Erro: "Email inválido"
- ❌ Validação do form está falhando
- ✅ Solução: Preencha com um email válido (ex: test@example.com)

### Erro: "Não foi possível salvar"
- ❌ API retornou erro
- ✅ Solução: 
  1. Verifique console (F12)
  2. Verifique logs da API
  3. Verifique token JWT

### Erro: "Módulo 'api' não encontrado"
- ❌ Import inválido
- ✅ Solução: Execute `pnpm install` na raiz do projeto

---

## ✨ Próximos Passos

- [ ] Testar criação de profissional
- [ ] Testar edição de profissional
- [ ] Testar validações de form
- [ ] Testar upload de avatar (feature futura)
- [ ] Testar soft delete
- [ ] Adicionar teste unitário
- [ ] Adicionar teste e2e com Playwright

---

## 📝 Notas

- A página usa `useApiQuery` para fetch com cache automático (5min)
- A página usa `useApiMutation` para POST/PUT com invalidação automática
- Ao criar novo profissional, usa `id === 'novo'`
- Ao editar, usa o UUID real como ID
- Form é auto-preenchido em modo edição
- Mensagens de sucesso/erro são exibidas via `message.success()` e `message.error()`

---

**Data de Criação**: 29 de dezembro, 2025  
**Status**: ✅ Pronto para Teste  
**Compilação**: ✅ Sucesso (sem erros)
