# 🧪 GUIA PRÁTICO - Testes de CRUD de Profissionais

## 🚀 Como Iniciar Testes

### Pré-requisitos
1. **Servidor web rodando**:
   ```bash
   cd /Users/user/Desktop/Programação/AIGenda
   pnpm run dev:web
   ```
   Acesse: `http://localhost:3000`

2. **Servidor API rodando**:
   ```bash
   cd /Users/user/Desktop/Programação/AIGenda
   pnpm run dev:api
   ```
   Acesse: `http://localhost:3001`

3. **Estar logado** no dashboard (com JWT válido)

---

## 📋 Teste 1: Criar Novo Profissional

### Cenário: Adicionar um novo profissional ao sistema

**Passos**:

1. Navegue até: `http://localhost:3000/cadastro/profissionais`

2. Clique no botão "➕ **Novo Profissional**" (canto superior direito)

3. Você será redirecionado para: `http://localhost:3000/cadastro/profissionais/novo`

4. Preencha o formulário com os seguintes dados:

   | Campo | Valor | Tipo |
   |-------|-------|------|
   | Nome Completo | João Silva | Obrigatório |
   | Email | joao.silva@example.com | Opcional (validado) |
   | Telefone | (11) 98765-4321 | Opcional |
   | Especialidade | Barbeiro | Opcional |
   | Status | Ativo | Opcional |

5. Clique no botão "💾 **Salvar**"

### Resultado Esperado

```
✅ Mensagem: "Profissional criado com sucesso!"
✅ Redireção automática: /cadastro/profissionais
✅ Novo profissional aparece na lista (topo geralmente)
```

### Se Falhar

**Erro: "404 Not Found"**
- Problema: Arquivo de rota não foi encontrado
- Solução:
  ```bash
  pnpm run build --workspace=web
  ```

**Erro: "Dados inválidos"**
- Problema: Um dos campos não passou na validação
- Solução: Verifique:
  - Nome tem pelo menos 3 caracteres
  - Email segue o formato válido (se preenchido)
  - Nenhum campo obrigatório está vazio

**Erro: "Erro ao salvar profissional"**
- Problema: API retornou erro
- Verificação:
  1. Abra F12 > Console
  2. Procure por mensagem de erro da API
  3. Verifique se JWT é válido
  4. Verifique logs da API (`pnpm run dev:api`)

---

## 📋 Teste 2: Editar Profissional Existente

### Cenário: Modificar dados de um profissional existente

**Pré-requisitos**:
- Pelo menos um profissional criado na base de dados
- Saber o UUID (obtém automaticamente ao criar)

**Passos**:

1. Navegue até: `http://localhost:3000/cadastro/profissionais`

2. Encontre um profissional na lista

3. Clique no botão "✏️ **Editar**"

4. A URL deve mudar para: `http://localhost:3000/cadastro/profissionais/[uuid-aqui]`

5. **Aguarde o carregamento** (deve aparecer um spinner de carregamento)

6. O formulário será preenchido automaticamente com os dados atuais

7. Modifique um ou mais campos, por exemplo:
   - Altere o nome de "João Silva" para "João Silva Junior"
   - Altere a especialidade de "Barbeiro" para "Barbeiro Premium"
   - Altere o email para "joao.junior@example.com"

8. Clique no botão "💾 **Salvar**"

### Resultado Esperado

```
✅ Spinner aparece durante o fetch dos dados
✅ Formulário é preenchido com dados atuais
✅ Mensagem: "Profissional atualizado com sucesso!"
✅ Redireção automática: /cadastro/profissionais
✅ Alterações aparecem refletidas na lista
```

### Validação Visual

Para confirmar que a atualização funcionou:

1. Verifique a coluna correspondente na tabela
2. Exemplo: Se alterou o nome, procure pelo novo nome na lista

---

## 📋 Teste 3: Validações de Formulário

### Teste 3.1: Campo Nome (Obrigatório)

**Cenário**: Nome é um campo obrigatório com validação de comprimento mínimo

```
Teste A: Campo vazio
├─ Ação: Deixe em branco
├─ Clique: "Salvar"
└─ Esperado: ❌ Erro "Nome é obrigatório"

Teste B: Nome muito curto
├─ Ação: Digite "Jo"
├─ Clique: "Salvar"
└─ Esperado: ❌ Erro "Nome deve ter pelo menos 3 caracteres"

Teste C: Nome válido
├─ Ação: Digite "João Silva"
├─ Clique: "Salvar"
└─ Esperado: ✅ Formulário aceita e envia
```

### Teste 3.2: Campo Email (Opcional, Validado)

**Cenário**: Email é opcional, mas se preenchido deve ser válido

```
Teste A: Deixar em branco
├─ Ação: Campo vazio
├─ Clique: "Salvar"
└─ Esperado: ✅ Aceita (é opcional)

Teste B: Email inválido
├─ Ação: Digite "invalido@.com"
├─ Clique: "Salvar"
└─ Esperado: ❌ Erro "Email inválido"

Teste C: Email válido
├─ Ação: Digite "joao@example.com"
├─ Clique: "Salvar"
└─ Esperado: ✅ Aceita e envia

Teste D: Email parcial
├─ Ação: Digite "joao@"
├─ Clique: "Salvar"
└─ Esperado: ❌ Erro "Email inválido"
```

### Teste 3.3: Campos Opcionais

**Telefone e Especialidade** não têm validação específica

```
Teste A: Deixar vazios
├─ Ação: Deixe ambos em branco
├─ Clique: "Salvar"
└─ Esperado: ✅ Aceita

Teste B: Valores aleatórios
├─ Ação: Telefone "abc123", Especialidade "xyz"
├─ Clique: "Salvar"
└─ Esperado: ✅ Aceita (sem validação)

Teste C: Valores com caracteres especiais
├─ Ação: Telefone "(11) 98765-4321", Especialidade "Corte & Barba"
├─ Clique: "Salvar"
└─ Esperado: ✅ Aceita
```

---

## 📋 Teste 4: Estados de Carregamento

### Teste 4.1: Criar (Sem Fetch Prévio)

```
Timeline esperada:
├─ Usuário navega para /novo
├─ Página abre instantaneamente (sem spinner)
└─ Formulário vazio aparece
```

### Teste 4.2: Editar (Com Fetch)

```
Timeline esperada:
├─ Usuário clica em "Editar"
├─ Spinner aparece (3-5 segundos)
├─ GET /professionals/{id} é executado
├─ Formulário é preenchido com dados
└─ Spinner desaparece
```

**Verificação**: F12 > Network > Procure por `GET /professionals/[uuid]`

---

## 📋 Teste 5: Redirecionamento e Cache

### Teste 5.1: Voltar para Lista

```
Teste A: Salvar com sucesso
├─ Ação: Preencha form + clique "Salvar"
├─ Esperado: Redireção automática para /cadastro/profissionais
└─ Verificação: URL muda e lista é exibida

Teste B: Verificar dados na lista
├─ Ação: Depois de criar/editar, procure pelo profissional
├─ Esperado: Novo profissional ou dados atualizados aparecem
└─ Verificação: Refresh (F5) não deveria ser necessário (cache invalidado)
```

### Teste 5.2: Cache Invalidation

```
Verificação técnica:
├─ Network > Procure por requisições POST/PUT
├─ Após POST/PUT com sucesso
├─ Lista é automaticamente refetchada (invalidação)
├─ Dados novos aparecem sem F5
└─ Próxima navegação usa cache (5min)
```

---

## 🔍 Teste 6: Verificações Técnicas

### Browser Console (F12 > Console)

Procure por:
- ❌ Erros vermelhos (não devem haver)
- ✅ Logs normais de requisição
- ⚠️ Warnings (não devem haver relacionados ao form)

### Network Tab (F12 > Network)

Verifique:
```
GET /professionals/{id}
├─ Status: 200 ✅
├─ Headers: Authorization: Bearer [token]
└─ Response: Dados do profissional (JSON)

POST /professionals
├─ Status: 201 (Created) ✅
├─ Headers: Authorization: Bearer [token]
└─ Response: Profissional criado com ID

PUT /professionals/{id}
├─ Status: 200 ✅
├─ Headers: Authorization: Bearer [token]
└─ Response: Profissional atualizado
```

### Terminal API

Procure por logs:
```
[AUTH] ✅ Token validado
[PROFESSIONALS] GET /professionals/{id}
[PROFESSIONALS] POST /professionals
[PROFESSIONALS] PUT /professionals/{id}
```

---

## 📝 Checklist de Testes Completo

### Criação
- [ ] Acessar `/novo` carrega página corretamente
- [ ] Formulário vazio aparece
- [ ] Todos os campos são visíveis
- [ ] Validação de nome funciona
- [ ] Validação de email funciona
- [ ] Salvar com sucesso redireciona
- [ ] Novo profissional aparece na lista

### Edição
- [ ] Clicar em Editar navega para página correta
- [ ] Spinner aparece durante fetch
- [ ] Dados são carregados no formulário
- [ ] Campos podem ser editados
- [ ] Salvar com sucesso redireciona
- [ ] Alterações aparecem na lista

### Validações
- [ ] Nome obrigatório funciona
- [ ] Email validado corretamente
- [ ] Campos opcionais aceitam qualquer valor
- [ ] Mensagens de erro aparecem

### Performance
- [ ] Primeiro carregamento é rápido (< 1s)
- [ ] Edição aguarda dados (< 3s)
- [ ] Spinner é exibido durante fetch
- [ ] Cache funciona (próximo acesso é rápido)

### Fluxo Completo
- [ ] Criar novo profissional
- [ ] Editar profissional criado
- [ ] Verificar dados na lista
- [ ] Tudo funciona sem erros

---

## 🛠️ Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| 404 Not Found | `pnpm run build --workspace=web` |
| Form vazio em edição | Verifique se GET /professionals/{id} retorna dados |
| Validação não funciona | F12 > Console procure por erros de validação |
| Não redireciona após salvar | Verifique se POST/PUT retornou sucesso |
| Dados antigos na lista | Execute F5 (ou aguarde 5min para cache expirar) |
| Erro de autenticação | Verifique se JWT é válido e não expirou |

---

## 📞 Contato & Escalação

Se os testes falharem:

1. **Coleta de logs**:
   ```bash
   # Terminal Web
   echo "=== Web Logs ==="
   tail -100 /tmp/web.log
   
   # Terminal API
   echo "=== API Logs ==="
   tail -100 /tmp/api.log
   ```

2. **Verifique a compilação**:
   ```bash
   pnpm run build --workspace=web
   ```

3. **Resetar cache**:
   ```bash
   # Limpar node_modules e reinstalar
   pnpm clean
   pnpm install
   pnpm run build --workspace=web
   ```

---

**Última atualização**: 29 de dezembro, 2025  
**Status**: ✅ Pronto para teste manual
