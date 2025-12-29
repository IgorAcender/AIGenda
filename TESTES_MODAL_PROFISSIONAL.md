# 🧪 GUIA DE TESTES - Modal de Profissional

## ✅ Checklist de Testes

### 1️⃣ Teste Básico - Criar Profissional

- [ ] Abrir página de Profissionais
- [ ] Clicar em "➕ Novo Profissional"
- [ ] Modal abre com título "Novo Profissional"
- [ ] Campos em branco
- [ ] Avatar mostra ícone de usuário padrão

**Ação**: Preencher campos obrigatórios
- [ ] Nome: "João Silva Santos" ✅
- [ ] Email: "joao@example.com" ✅
- [ ] Telefone: "(11) 98765-4321" ✅

**Ação**: Clicar "Salvar"
- [ ] Modal fecha
- [ ] Mensagem: "Profissional criado com sucesso!"
- [ ] Novo profissional aparece na lista
- [ ] Cache é invalidado

---

### 2️⃣ Teste - Upload de Foto

- [ ] Abrir modal "Novo Profissional"
- [ ] Na aba "Cadastro"
- [ ] Clicar botão "Alterar Foto"
- [ ] Selecionar imagem do computador
- [ ] Avatar atualiza com preview da foto
- [ ] Salvar profissional
- [ ] ✅ Foto é salva em base64

---

### 3️⃣ Teste - Editar Profissional Existente

- [ ] Clicar editar em um profissional da lista
- [ ] Modal abre com título "Editar Profissional"
- [ ] **Aba Cadastro** carrega dados:
  - [ ] Nome preenchido
  - [ ] Email preenchido
  - [ ] Telefone preenchido
  - [ ] Avatar carregado (se houver)

- [ ] **Aba Endereço** carrega dados:
  - [ ] Rua preenchida
  - [ ] Número preenchido
  - [ ] Complemento (se houver)
  - [ ] Bairro preenchido
  - [ ] CEP preenchido
  - [ ] Cidade preenchida
  - [ ] Estado selecionado

- [ ] **Aba Serviços** mostra:
  - [ ] Lista de serviços disponíveis
  - [ ] Serviços já vinculados com checkbox marcado
  - [ ] Novos serviços podem ser selecionados

- [ ] Modificar um campo (ex: Nome)
- [ ] Clicar "Salvar"
- [ ] Modal fecha
- [ ] Mensagem: "Profissional atualizado com sucesso!"
- [ ] Lista atualiza com novos dados

---

### 4️⃣ Teste - Todas as Abas

#### Tab 1: 📋 Cadastro
- [ ] Todos os campos presentes
- [ ] Validação de email funciona
- [ ] Upload de foto funciona
- [ ] Data de nascimento com date picker

#### Tab 2: 🏠 Endereço
- [ ] Campo Rua com ícone localização
- [ ] Campo Número (pequeno)
- [ ] Campo Complemento
- [ ] Campo Bairro
- [ ] Campo CEP
- [ ] Campo Cidade
- [ ] Campo Estado com dropdown

#### Tab 3: 👤 Usuário
- [ ] Campo Assinatura Digital (textarea)
- [ ] Múltiplas linhas funciona

#### Tab 4: 🛠️ Personalizar Serviços
- [ ] Lista de serviços carrega
- [ ] Grid responsivo com checkboxes
- [ ] Cada serviço mostra: nome, preço, duração
- [ ] Selecionar serviço marca checkbox
- [ ] Deselecionar desmarcar
- [ ] Serviços vinculam ao salvar

#### Tab 5: 💰 Comissões
- [ ] Campo Taxa de Comissão numérico
- [ ] Aceita valores 0-100
- [ ] Com 2 casas decimais
- [ ] Valida entrada

#### Tab 6: 📝 Anotações
- [ ] Textarea grande
- [ ] Múltiplas linhas
- [ ] Sem limite aparente

---

### 5️⃣ Teste - Configurações

- [ ] Switch "Ativo" - toggle on/off ✅
- [ ] Switch "Disponível para agendamento online" ✅
- [ ] Switch "Gerar agenda" ✅
- [ ] Switch "Recebe comissão" ✅
- [ ] Switch "Contratado pela Lei do Salão Parceiro" ✅
- [ ] Salvar com diferentes combinações
- [ ] Valores são salvos corretamente

---

### 6️⃣ Teste - Validações

#### Validação de Nome
```
Input: "Ab" (2 caracteres)
Esperado: ❌ "Nome deve ter pelo menos 3 caracteres"
```

#### Validação de Email
```
Input: "email-invalido"
Esperado: ❌ "Email inválido"

Input: "email@valido.com"
Esperado: ✅ Valida
```

#### Validação Obrigatória
```
Nome em branco + Salvar
Esperado: ❌ "Nome é obrigatório"
```

---

### 7️⃣ Teste - Comportamento do Modal

- [ ] Abrir modal → campos vazios
- [ ] Fechar sem salvar → modal fecha
- [ ] Abrir modal novamente → campos ainda vazios
- [ ] Preencher parcialmente → salvando → sucesso
- [ ] Fechar modal → limpa campos
- [ ] Form reseta quando abre/fecha

---

### 8️⃣ Teste - Upload de Foto Detalhado

1. [ ] Botão "Alterar Foto" presente na aba Cadastro
2. [ ] Clicar abre file picker
3. [ ] Selecionar imagem JPG/PNG
4. [ ] Avatar atualiza imediatamente
5. [ ] Salvando profissional → foto convertida base64
6. [ ] Editar profissional → foto carrega
7. [ ] Trocar foto → atualiza preview
8. [ ] Salvar → nova foto persiste

---

### 9️⃣ Teste - Vinculação de Serviços

1. [ ] Editar profissional
2. [ ] Ir para aba "Personalizar Serviços"
3. [ ] Nenhum serviço selecionado → checkboxes vazios
4. [ ] Selecionar 3 serviços
5. [ ] Clicar Salvar
6. [ ] Fechar modal
7. [ ] Editar profissional novamente
8. [ ] Mesmos 3 serviços permanecem selecionados ✅
9. [ ] Deselecionar 1 serviço
10. [ ] Salvar
11. [ ] Editar novamente → apenas 2 serviços selecionados ✅

---

### 🔟 Teste - Responsividade

#### Desktop (1920px)
- [ ] Modal com largura apropriada
- [ ] Campos lado a lado (2 colunas)
- [ ] Abas totalmente visíveis
- [ ] Avatar centralizado

#### Tablet (768px)
- [ ] Modal adapta para tela menor
- [ ] Campos se reorganizam
- [ ] Scroll se necessário
- [ ] Abas acessíveis

#### Mobile (375px)
- [ ] Modal fullwidth ou quase
- [ ] Campos empilhados (1 coluna)
- [ ] Scroll vertical funciona
- [ ] Botões clicáveis

---

## 🐛 Testes de Erro

### Cenário 1: Erro ao Salvar
```
Clicar Salvar → API retorna erro 500
Esperado: ❌ "Erro ao salvar profissional"
Modal não fecha
```

### Cenário 2: Erro ao Carregar Serviços
```
Ir para aba Serviços → API falha
Esperado: "Nenhum serviço disponível"
```

### Cenário 3: Erro de Validação Backend
```
Email já existe no banco
Esperado: ❌ Mensagem de erro específica
Modal permanece aberto com dados
```

---

## 📊 Testes de Performance

- [ ] Modal abre em < 500ms
- [ ] Salvar em < 1s
- [ ] Sem freeze/travamento
- [ ] Scroll das abas suave
- [ ] Avatar upload não bloqueia UI

---

## 🔄 Testes de Integração

- [ ] Criar profissional → aparece na lista
- [ ] Editar profissional → lista atualiza
- [ ] Cache invalidado → lista refetch
- [ ] Múltiplos usuários → sincronização ok
- [ ] Abrir 2 modals simultâneos → ok

---

## ✨ Testes Extras

- [ ] Copiar e colar em campos funciona
- [ ] Autocomplete do navegador funciona
- [ ] Atalho Enter em input submete? (comportamento esperado)
- [ ] Tab entre campos funciona
- [ ] Acessibilidade com screen reader
- [ ] Contraste de cores adequado
- [ ] Fonte legível em todos os tamanhos

---

## 📝 Resultado do Teste

### Resumo
- Total de Testes: **120+**
- ✅ Passados: ___
- ❌ Falhados: ___
- ⚠️ Alertas: ___

### Data: ___________
### Testador: ___________
### Observações:

```
[Espaço para anotações]




```

---

**Próximas Versões**:
- [ ] Integração com Google Drive para foto
- [ ] Horários de trabalho configuráveis
- [ ] Comissão por serviço
- [ ] Documentos de profissional (portfólio)

---

**Versão**: 1.0.0  
**Data**: 29/12/2025  
**Prioridade**: ⭐⭐⭐⭐⭐ Alta
