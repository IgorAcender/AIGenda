# 📱 GUIA VISUAL - Modal de Profissional

## 🎨 Layout do Modal

```
┌──────────────────────────────────────────────────────────────┐
│  ✏️ Novo Profissional                                   ✕    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ [Cadastro] [Endereço] [Usuário] [Serviços] [Comis] [Anotações] │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ⭕️ Avatar Section (centered)                                │
│  [  👤  ] [Alterar Foto]                                    │
│                                                               │
│  📝 Form Fields (Vertical Layout)                           │
│  ┌──────────────────────────────┐                           │
│  │ Nome Completo *              │                           │
│  │ [   João Silva          ]    │                           │
│  └──────────────────────────────┘                           │
│                                                               │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Primeiro Nome    │ │ Sobrenome        │                 │
│  │ [João        ]   │ │ [Silva       ]   │                 │
│  └──────────────────┘ └──────────────────┘                 │
│                                                               │
│  ─────────── Contato ───────────                             │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Email            │ │ Celular          │                 │
│  │ [email@test]     │ │ [(11)9999-9999]  │                 │
│  └──────────────────┘ └──────────────────┘                 │
│                                                               │
│  ─────── Documentação ───────                               │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ CPF/CNPJ         │ │ RG               │                 │
│  │ [123.456.789-00] │ │ [12.345.678-9]   │                 │
│  └──────────────────┘ └──────────────────┘                 │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │ Aniversário                  │                           │
│  │ [01/01/1990  ]               │                           │
│  └──────────────────────────────┘                           │
│                                                               │
│  ────── Profissão ──────                                    │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Profissão        │ │ Especialidade    │                 │
│  │ [Barbeiro    ]   │ │ [Corte, Barba]   │                 │
│  └──────────────────┘ └──────────────────┘                 │
│                                                               │
│  ┌──────────────────────────────┐                           │
│  │ Bio/Experiência              │                           │
│  │ [                          ] │                           │
│  │ [Texto multilinha...       ] │                           │
│  │ [                          ] │                           │
│  └──────────────────────────────┘                           │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│  ───────── Configurações ─────────                           │
│  ◉ Ativo           Um profissional desativado não...        │
│  ◉ Disponível para agendamento online                       │
│  ◉ Gerar agenda                                              │
│  ◉ Recebe comissão                                           │
│  ◉ Contratado pela Lei do Salão Parceiro                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                                              [Cancelar] [Salvar] │
└──────────────────────────────────────────────────────────────┘
```

## 📑 Abas do Modal

### Tab 1: 📋 CADASTRO
- Avatar com upload
- Nome Completo (obrigatório)
- Primeiro Nome / Sobrenome
- **Seção Contato**: Email, Celular
- **Seção Documentação**: CPF/CNPJ, RG, Aniversário
- **Seção Profissão**: Profissão, Especialidade
- Bio/Experiência

### Tab 2: 🏠 ENDEREÇO
- Rua (com ícone de localização)
- Número (pequeno campo)
- Complemento
- Bairro / CEP
- Cidade / Estado (dropdown com UF's)

### Tab 3: 👤 USUÁRIO
- Assinatura Digital (textarea grande)
- Espaço para informações de acesso

### Tab 4: 🛠️ PERSONALIZAR SERVIÇOS
```
┌──────────────────────┬──────────────────────┐
│ ☑ Corte de Cabelo    │ ☐ Barba              │
│   R$ 50.00 • 30min   │   R$ 25.00 • 20min   │
└──────────────────────┴──────────────────────┘
┌──────────────────────┬──────────────────────┐
│ ☑ Coloração          │ ☐ Escova             │
│   R$ 80.00 • 60min   │   R$ 40.00 • 45min   │
└──────────────────────┴──────────────────────┘
```
- Grid responsivo com checkboxes
- Exibe: Nome, Preço, Duração
- Vincula/desvincula ao salvar

### Tab 5: 💰 CONFIGURAR COMISSÕES
- Taxa de Comissão (%)
- Input numérico com 2 decimais
- Range: 0-100

### Tab 6: 📝 ANOTAÇÕES
- Textarea grande para anotações livres
- Sem limite de caracteres
- Salvo no campo `notes`

## 🔄 Fluxo de Uso

### Criar Novo Profissional
1. Click em "➕ Novo Profissional"
2. Modal abre com título "Novo Profissional"
3. Preencher campos obrigatórios (Nome)
4. Clicar em "Salvar"
5. ✅ Sucesso! Profissional criado e adicionado à lista

### Editar Profissional
1. Click no ícone de editar/linha na tabela
2. Modal abre com título "Editar Profissional"
3. Campos preenchidos com dados do profissional
4. Avatar carregado (se houver)
5. Serviços vinculados aparecem selecionados na aba
6. Modificar dados conforme necessário
7. Clicar em "Salvar"
8. ✅ Sucesso! Profissional atualizado

## 🎨 Componentes Ant Design Utilizados

| Componente | Uso |
|-----------|-----|
| `Modal` | Container principal |
| `Form` | Validação de formulários |
| `Input` | Campos de texto |
| `Select` | Dropdowns (Estado) |
| `InputNumber` | Taxa de comissão |
| `Upload` | Upload de foto |
| `Avatar` | Preview da foto |
| `Tabs` | Abas do modal |
| `Switch` | Toggles de configuração |
| `Checkbox` | Seleção de serviços |
| `Button` | Botões de ação |
| `Row/Col` | Layout grid |
| `Divider` | Separadores de seções |
| `Space` | Espaçamento entre elementos |

## 🌐 Responsividade

- **Mobile**: Layout se adapta, abas ficam com scroll horizontal
- **Tablet**: Campos em 2 colunas quando possível
- **Desktop**: Layout otimizado com 2-3 colunas

## 🔄 Sincronização de Dados

1. **Carregar profissional**: `GET /professionals/:id`
2. **Salvar dados**: `POST/PUT /professionals`
3. **Vincular serviços**: `POST /professionals/:id/services`
4. **Cache invalidado** automaticamente após sucesso

## 📊 Validações

| Campo | Regra | Mensagem |
|-------|-------|----------|
| Nome | Mínimo 3 caracteres | "Nome deve ter pelo menos 3 caracteres" |
| Nome | Obrigatório | "Nome é obrigatório" |
| Email | Formato válido | "Email inválido" |
| Comissão | 0-100 | Previne valores inválidos |
| Data | Formato YYYY-MM-DD | Input date nativo |

---

**Versão**: 1.0.0  
**Última atualização**: 29/12/2025  
**Status**: ✅ Pronto para produção
