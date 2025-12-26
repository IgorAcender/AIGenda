# 🚀 GUIA RÁPIDO - Novo Cadastro de Profissionais

## Como Usar em 3 Passos

### 1️⃣ Acesse a Tela de Profissionais
```
http://localhost:3000/cadastro/profissionais
```

### 2️⃣ Clique em "Novo Profissional"
Você verá um modal com 5 abas:

---

## 📋 ABA 1: CADASTRO
*Os campos mais importantes*

```
┌─────────────────────────────────────┐
│ Nome *          │ Sobrenome         │
│ [Carlos       ] │ [Silva          ] │
├─────────────────┼───────────────────┤
│ Profissão       │ Aniversário       │
│ [Barbeiro     ] │ [📅 15/05/1990  ] │
├─────────────────┼───────────────────┤
│ CPF/CNPJ        │ RG                │
│ [123.456.789-00]│ [12.345.678-9   ] │
└─────────────────┴───────────────────┘

📱 Celular: (11) 98888-7777

📝 Anotações:
┌───────────────────────────────────────┐
│ Especialista em cortes modernos      │
│ Atende de segunda a sábado           │
└───────────────────────────────────────┘

CONFIGURAÇÕES:
☑ Disponível para agendamento online
   └─ Clientes podem escolher online
   
☑ Gerar agenda
   └─ Sistema gera horários automáticos
   
☑ Recebe comissão
   └─ Profissional recebe %

☐ Contratado pela Lei do Salão Parceiro
   └─ Regime de parceria
```

---

## 🏠 ABA 2: ENDEREÇO
*Endereço completo do profissional*

```
┌────────────────────────┬──────┐
│ Endereço               │ Nº   │
│ [Rua das Flores      ] │ [123]│
└────────────────────────┴──────┘

Complemento:
[Apto 45, Bloco B]

┌──────────────┬──────────────┐
│ Bairro       │ Cidade       │
│ [Centro    ] │ [São Paulo ] │
└──────────────┴──────────────┘

┌──────────────┬──────────────┐
│ Estado       │ CEP          │
│ [SP ▼      ] │ [01234-567 ] │
└──────────────┴──────────────┘
```

---

## 👤 ABA 3: USUÁRIO
*Credenciais de acesso*

```
📧 E-mail:
[carlos.silva@exemplo.com]

┌─────────────────────────────────────┐
│ 💡 DICA:                            │
│                                     │
│ Para criar login de acesso,         │
│ preencha o e-mail e depois use      │
│ a opção "Criar Login" após salvar.  │
└─────────────────────────────────────┘
```

---

## ⏰ ABA 4: EXPEDIENTE
*Horários de trabalho*

```
┌──────────────┬──────────────┐
│ Início       │ Fim          │
│ [🕐 09:00  ] │ [🕐 18:00  ] │
└──────────────┴──────────────┘

Dias de Trabalho:
☐ Dom  ☑ Seg  ☑ Ter  ☑ Qua
☑ Qui  ☑ Sex  ☑ Sáb
```

---

## 💰 ABA 5: COMISSÃO
*Configurações financeiras*

```
Taxa de Comissão:
[40] %
└─ % que o profissional recebe

Cor (para agenda):
┌──────────────────────────────┐
│ 🔵 #1890ff  ▼                │
│ 🟢 #52c41a                   │
│ 🟡 #faad14                   │
│ 🔴 #f5222d                   │
│ 🟣 #722ed1                   │
└──────────────────────────────┘
```

---

## 3️⃣ Clique em "Salvar"

✅ Profissional criado com sucesso!

---

## 🎯 DICAS IMPORTANTES

### ✨ Campos Obrigatórios
- **Nome** (mínimo 2 caracteres)
- Todos os outros campos são opcionais

### 🔄 Navegação entre Abas
- Use as abas no topo para navegar
- Você pode pular abas vazias
- Não perde dados ao trocar de aba

### 💾 Salvando
- Clique em "Salvar" (canto inferior direito)
- Ou pressione Enter no último campo
- O modal fecha automaticamente após salvar

### ✏️ Editando
1. Clique no ícone ✏️ na lista
2. O modal abre com dados preenchidos
3. Modifique e salve

### 🗑️ Deletando
1. Clique no ícone 🗑️
2. Confirme a exclusão
3. Profissional é desativado (não excluído)

---

## 🎨 EXEMPLOS DE USO

### Exemplo 1: Barbeiro Simples
```
Aba Cadastro:
- Nome: João
- Sobrenome: Santos
- Profissão: Barbeiro
- Celular: (11) 98888-7777
- ✓ Disponível online
- ✓ Gerar agenda

Aba Expediente:
- 09:00 - 18:00
- Seg a Sáb

Aba Comissão:
- 40%
```

### Exemplo 2: Cabeleireira Completa
```
Aba Cadastro:
- Nome: Maria
- Sobrenome: Oliveira
- Profissão: Cabeleireira
- CPF: 123.456.789-00
- Data Nasc: 15/08/1985
- Celular: (11) 97777-6666
- ✓ Todas as configurações

Aba Endereço:
- Rua: Av. Paulista, 1000
- Bairro: Bela Vista
- Cidade: São Paulo
- Estado: SP

Aba Usuário:
- email: maria@salao.com

Aba Expediente:
- 10:00 - 20:00
- Ter a Sáb

Aba Comissão:
- 50%
- Cor: Rosa (#eb2f96)
```

---

## ⚡ ATALHOS

- **Tab**: Próximo campo
- **Shift + Tab**: Campo anterior
- **Enter**: Salvar (se no último campo)
- **Esc**: Cancelar/Fechar

---

## 🔧 RESOLUÇÃO DE PROBLEMAS

### "Erro ao salvar"
- ✓ Verifique se preencheu o Nome
- ✓ Confira formato do e-mail
- ✓ Verifique conexão com a API

### "Campo obrigatório"
- ✓ Preencha o Nome
- ✓ Outros campos são opcionais

### Não vejo as abas
- ✓ Atualize a página (F5)
- ✓ Limpe cache do navegador
- ✓ Verifique se a API está rodando

---

## 📱 ACESSANDO

**Desenvolvimento:**
```
http://localhost:3000/cadastro/profissionais
```

**Produção (quando deployar):**
```
https://seu-dominio.com/cadastro/profissionais
```

---

## 🎊 PRONTO!

Agora você tem um sistema completo de cadastro de profissionais, igual ao Belasis! 🚀

**Dúvidas?** Consulte: `/NOVO_CADASTRO_PROFISSIONAIS.md`
