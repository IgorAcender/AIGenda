# 🧪 Guia de Testes - Modal de Cliente

## ✅ Testes de Funcionalidade

### Teste 1: Criar Novo Cliente em /cadastro/clientes

**Pré-requisitos**:
- Estar logado
- Estar na página `/cadastro/clientes`

**Passos**:
1. Clique no botão **"Novo Cliente"** (canto superior direito)
2. Verifique se o modal abre com **3 abas**: Cadastro, Endereço, Configurações
3. Verifique se há um **avatar no lado esquerdo**
4. Clique em **"Alterar Avatar"** e selecione uma imagem
5. Verifique se o preview da imagem aparece

**Preencher Cadastro**:
```
Nome Completo:  João Silva          (obrigatório)
Apelido:        João
Email:          joao@email.com      (validado)
Celular:        (11) 99999-9999     (obrigatório)
Telefone:       (11) 3333-3999
Aniversário:    01/01/1990
Gênero:         M
CPF:            123.456.789-00
CNPJ:           (deixar vazio)
RG:             12.345.678-9
Indicado por:   (deixar vazio)
Hashtags:       #regular
```

**Verificações**:
- ✅ Todos os campos devem ser preenchíveis
- ✅ Avatar deve mostrar preview
- ✅ Clique em aba "Endereço" deve funcionar

**Preencher Endereço**:
```
Endereço:       Rua XV de Novembro, 123
Cidade:         São Paulo
Estado:         SP
CEP:            01234-567
Observações:    Cliente VIP
```

**Preencher Configurações**:
- Desconto (%):  10
- Tipo:          Na comanda
- Ativo:         ON (azul)
- Notificações:  ON (azul)
- Bloquear:      OFF (cinza)

**Salvar**:
1. Clique em **"Criar Cliente"**
2. Verifique se aparece mensagem de sucesso
3. Verifique se modal fecha
4. Verifique se cliente aparece na lista

**Resultado Esperado**: ✅ Cliente criado com sucesso e aparece na lista

---

### Teste 2: Editar Cliente Existente

**Pré-requisitos**:
- Estar em `/cadastro/clientes`
- Há clientes na lista

**Passos**:
1. Clique no ícone **"edit"** (lápis) de um cliente
2. Verifique se o modal abre com dados do cliente preenchidos
3. Verifique se avatar está carregado (se houver)
4. Modifique alguns campos:
   - Nome: Adicione "Jr." no final
   - Email: Mude para outro email
   - Desconto: Mude para 15%

**Salvar**:
1. Clique em **"Atualizar Cliente"**
2. Verifique se aparece mensagem de sucesso
3. Verifique se modal fecha
4. Verifique se cliente na lista reflete as mudanças

**Resultado Esperado**: ✅ Cliente atualizado com as alterações

---

### Teste 3: Novo Cliente em /agenda > Novo Agendamento

**Pré-requisitos**:
- Estar em `/agenda`
- Clicou em "Novo Agendamento" ou "Agendar"

**Passos**:
1. Na seção de cliente, clique em **"Novo Cliente"**
2. Modal deve abrir com as 3 abas
3. Preencha com dados diferentes:
   ```
   Nome:       Maria Silva
   Email:      maria@email.com
   Telefone:   (11) 98888-8888
   CPF:        987.654.321-00
   ```
4. Clique em **"Criar Cliente"**

**Verificações**:
- ✅ Modal deve fechar
- ✅ Cliente deve aparecer selecionado no campo de cliente do agendamento
- ✅ Formulário de agendamento deve estar preenchido com: `clientId: maria@id`

**Resultado Esperado**: ✅ Cliente criado e selecionado automaticamente no agendamento

---

### Teste 4: Validações de Campo

**Teste 4a: Nome obrigatório**
```
Passos:
1. Abra novo cliente
2. Deixe campo "Nome" vazio
3. Clique em "Criar Cliente"
4. Deve aparecer: "Nome é obrigatório"
```
**Resultado**: ✅ Erro aparece

**Teste 4b: Telefone obrigatório**
```
Passos:
1. Abra novo cliente
2. Preencha Nome, Email
3. Deixe Telefone vazio
4. Clique em "Criar Cliente"
5. Deve aparecer: "Telefone é obrigatório"
```
**Resultado**: ✅ Erro aparece

**Teste 4c: Email inválido**
```
Passos:
1. Abra novo cliente
2. Preencha Nome, Telefone
3. Digite Email inválido: "nao_e_um_email"
4. Clique em "Criar Cliente"
5. Deve aparecer: "E-mail inválido"
```
**Resultado**: ✅ Erro aparece

---

### Teste 5: Avatar Upload

**Pré-requisitos**:
- Imagem PNG/JPG disponível (~2MB)

**Passos**:
1. Abra novo cliente
2. Clique em **"Alterar Avatar"**
3. Selecione uma imagem (PNG, JPG, GIF)
4. Verifique se preview aparece no círculo
5. Preencha dados e salve
6. Verifique se avatar foi salvo (editar cliente novamente)

**Verificações**:
- ✅ Preview deve aparecer imediatamente
- ✅ Avatar deve estar visível ao editar
- ✅ Avatar deve ser exibido na lista (se implementado)

**Resultado Esperado**: ✅ Avatar salvo com sucesso

---

### Teste 6: Deletar Cliente

**Pré-requisitos**:
- Estar em `/cadastro/clientes`
- Cliente na lista para deletar

**Passos**:
1. Clique no ícone **"delete"** (lixeira) de um cliente
2. Deve aparecer popup: "Tem certeza que deseja deletar este cliente?"
3. Clique em **"Sim"**
4. Verifique se cliente desaparece da lista

**Resultado Esperado**: ✅ Cliente deletado com sucesso

---

## ✅ Testes de UI/UX

### Teste 7: Layout Responsivo - Desktop

**Tamanho**: 1920x1080

**Verificações**:
- ✅ Modal ocupa ~50% da tela (lado direito)
- ✅ Avatar section (25%) bem proporcionada
- ✅ Form section (75%) com espaço suficiente
- ✅ Tabs são legíveis
- ✅ Inputs têm tamanho apropriado
- ✅ Botões na base alinhados à direita

**Resultado Esperado**: ✅ Layout perfeito em desktop

---

### Teste 8: Layout Responsivo - Tablet

**Tamanho**: 768x1024

**Verificações**:
- ✅ Modal ocupa ~60% da tela
- ✅ Avatar section ainda visível
- ✅ Form section tem scroll se necessário
- ✅ Tabs são clicáveis
- ✅ Inputs são acessíveis

**Resultado Esperado**: ✅ Layout adequado em tablet

---

### Teste 9: Layout Responsivo - Mobile

**Tamanho**: 375x667

**Verificações**:
- ✅ Modal ocupa 100% da tela (full screen)
- ✅ Conteúdo é scrollável
- ✅ Avatar em topo
- ✅ Tabs são clicáveis
- ✅ Botões são alcançáveis
- ✅ Sem necessidade de scroll horizontal

**Resultado Esperado**: ✅ Layout otimizado para mobile

---

### Teste 10: Navegação entre Abas

**Passos**:
1. Abra novo cliente
2. Clique em aba **"Endereço"**
   - Deve mostrar campos de endereço
   - Dados da aba "Cadastro" são mantidos
3. Clique em aba **"Configurações"**
   - Deve mostrar switches e desconto
4. Volte para **"Cadastro"**
   - Dados ainda estão lá

**Resultado Esperado**: ✅ Navegação entre abas funciona

---

## ✅ Testes de Performance

### Teste 11: Tempo de Abertura

**Passos**:
1. Abra DevTools (F12)
2. Vá para aba "Performance"
3. Clique em "Novo Cliente"
4. Verifique tempo de abertura no console

**Métricas Esperadas**:
- Abertura: < 100ms ✅
- Interatividade: < 50ms ✅

**Resultado Esperado**: ✅ Modal abre rapidamente

---

### Teste 12: Tempo de Salvamento

**Passos**:
1. Preencha todos os campos
2. Clique em "Criar Cliente"
3. Verifique tempo no DevTools Network

**Métricas Esperadas**:
- POST /clients: < 1000ms ✅
- Response: < 500ms ✅

**Resultado Esperado**: ✅ Salvamento rápido

---

### Teste 13: Sem Memory Leaks

**Passos**:
1. Abra DevTools > Memory
2. Tire uma snapshot
3. Abra modal 10 vezes
4. Feche modal 10 vezes
5. Tire outra snapshot
6. Compare memória usada

**Resultado Esperado**: ✅ Memória mantém estável

---

## ✅ Testes de Integração

### Teste 14: Sincronização com Lista

**Passos**:
1. Abra `/cadastro/clientes` em 2 abas do navegador
2. Na aba 1: Crie um novo cliente
3. Na aba 2: Clique "Atualizar"
4. Novo cliente deve aparecer na aba 2

**Resultado Esperado**: ✅ Dados sincronizados

---

### Teste 15: Integração com Agendamento

**Passos**:
1. Crie cliente em `/cadastro/clientes`
2. Vá para `/agenda`
3. Novo agendamento
4. Cliente deve estar disponível na lista
5. Selecione o cliente
6. Dados devem ser preenchidos

**Resultado Esperado**: ✅ Cliente aparece e é selecionável

---

## 📋 Checklist Final de Testes

- [ ] Teste 1: Criar novo cliente em /cadastro/clientes
- [ ] Teste 2: Editar cliente existente
- [ ] Teste 3: Novo cliente em /agenda
- [ ] Teste 4a: Validação Nome obrigatório
- [ ] Teste 4b: Validação Telefone obrigatório
- [ ] Teste 4c: Validação Email inválido
- [ ] Teste 5: Avatar upload e preview
- [ ] Teste 6: Deletar cliente
- [ ] Teste 7: Layout desktop (50%)
- [ ] Teste 8: Layout tablet (60%)
- [ ] Teste 9: Layout mobile (100%)
- [ ] Teste 10: Navegação entre abas
- [ ] Teste 11: Tempo abertura < 100ms
- [ ] Teste 12: Tempo salvamento < 1s
- [ ] Teste 13: Sem memory leaks
- [ ] Teste 14: Sincronização lista
- [ ] Teste 15: Integração agendamento

---

## 🎯 Resultado

Se todos os testes passarem com ✅:

**O modal de cliente está 100% funcional e pronto para produção!** 🚀

---

**Data**: 29/12/2025  
**Versão**: 1.0.0  
**Status**: Pronto para QA
