# 🎨 CORES E MARCA - VISUALIZAÇÃO DA INTERFACE

## Estrutura de Tabs

```
┌─────────────────────────────────────────────────────────────┐
│  MARKETING                                                   │
├─────────────────────────────────────────────────────────────┤
│ │ 🔗 Agendamento Online │ 🎨 Cores e Marca │                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Aba 1: AGENDAMENTO ONLINE                                  │
│  ────────────────────────────────────────                   │
│  - Link da página pública (com botão copiar)                │
│  - Botão de compartilhar                                    │
│  - QR Code (com botão baixar)                               │
│  - Dicas de uso                                             │
│                                                              │
│  Aba 2: CORES E MARCA (NOVA) ⭐                             │
│  ──────────────────────────────                             │
│  [Sua Landing Page Pública]                                 │
│  └─ Personalize as cores...                                 │
│                                                              │
│  ┌──────────────────────────┬──────────────────────┐       │
│  │    FORMULÁRIO            │     PREVIEW STICKY   │       │
│  │                          │                      │       │
│  │ Modelo de Tema: [▼]      │  ┌──────────────┐    │       │
│  │  ☀️  Claro               │  │ Seu Site     │    │       │
│  │  🌙  Escuro              │  │              │    │       │
│  │  🎨  Personalizado       │  │ Confira sua  │    │       │
│  │                          │  │ página...    │    │       │
│  │ Se Personalizado:        │  │              │    │       │
│  │ ─────────────────        │  │ [Ag Agora]   │    │       │
│  │ Cor de Fundo:            │  │              │    │       │
│  │ [■ #FFFFFF] [#FFFFFF]    │  │ Fundo: #FFFFFF    │       │
│  │                          │  │ Texto: #000000    │       │
│  │ Cor do Texto:            │  │ Botão: #505afb    │       │
│  │ [■ #000000] [#000000]    │  │              │    │       │
│  │                          │  │              │    │       │
│  │ Cor do Botão:            │  └──────────────┘    │       │
│  │ [■ #505afb] [#505afb]    │                      │       │
│  │                          │                      │       │
│  │ Cor Texto Botão:         │                      │       │
│  │ [■ #FFFFFF] [#FFFFFF]    │                      │       │
│  │                          │                      │       │
│  │ Imagem de Capa:          │                      │       │
│  │ [📎 Selecionar Imagem]   │                      │       │
│  │                          │                      │       │
│  │ [💾 Salvar] [👁️ Ver]    │                      │       │
│  │                          │                      │       │
│  └──────────────────────────┴──────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Detalhes dos Componentes

### ColorPicker (Seletor de Cor)
```
┌────────────────────────────────────────┐
│ Cor do Fundo:                          │
│ [■ color picker] [#FFFFFF text input]  │
│                                        │
│ Descrição: Clique no quadrado para    │
│ abrir o seletor nativo do navegador   │
│ ou digite o valor hex manualmente     │
└────────────────────────────────────────┘
```

### Temas Pré-configurados
```
Claro (Light)              Escuro (Dark)           Personalizado
┌─────────────┐           ┌─────────────┐        ┌──────────────┐
│ ☀️  Claro    │    ou    │ 🌙  Escuro   │   ou  │ 🎨 Personali │
│             │           │             │       │              │
│ Fundo: #FFF │           │ Fundo: #1f2 │       │ Você escolhe │
│ Texto: #000 │           │ Texto: #FFF │       │ cada cor!    │
│ Botão: #50a │           │ Botão: #7c3 │       │              │
└─────────────┘           └─────────────┘       └──────────────┘

Ao clicar em Light ou Dark, 
todas as cores são preenchidas automaticamente
```

### Preview em Tempo Real
```
Esquerda (Formulário) ← → Direita (Preview Sticky)

Conforme você muda as cores,
o preview atualiza em tempo real

Exemplo:
- Muda Cor de Fundo → Fundo do preview muda
- Muda Cor do Botão → Botão "Agendar Agora" muda
- Mostra valores hex das cores ativas
```

---

## Fluxo de Uso

### Cenário 1: Usar Tema Pré-configurado
```
1. Usuário acessa MARKETING > Cores e Marca
2. Escolhe "Claro" ou "Escuro"
3. Vê preview atualizado
4. Clica "Salvar Configurações"
5. API salva as cores no banco
6. Landing page atualiza automaticamente
```

### Cenário 2: Personalizar Cores
```
1. Usuário acessa MARKETING > Cores e Marca
2. Escolhe "Personalizado"
3. Formulário expande com 4 seletores de cor
4. Clica em cada cor para abrir seletor nativo
5. Ou digita o valor hex manualmente
6. Preview mostra em tempo real
7. Salva configurações
8. Landing page usa as cores personalizadas
```

### Cenário 3: Upload de Imagem
```
1. Na seção "Imagem de Capa"
2. Clica em "Selecionar Imagem"
3. Choose file dialog abre
4. Seleciona PNG ou JPG
5. Preview mostra a imagem (próximo passo)
6. Salva (image é armazenada no banco)
7. Landing page exibe a imagem hero
```

---

## Estados da Interface

### Estados do Seletor de Tema
```
Light Theme (Padrão)
├─ Cor de Fundo: #FFFFFF
├─ Cor do Texto: #000000
├─ Cor do Botão: #505afb
└─ Cor Texto Botão: #FFFFFF

Dark Theme
├─ Cor de Fundo: #1f2937
├─ Cor do Texto: #FFFFFF
├─ Cor do Botão: #7c3aed
└─ Cor Texto Botão: #FFFFFF

Custom Theme
└─ Cada campo é editável manualmente
```

### Estados do ColorPicker
```
Normal (foco no input de cor):
┌────────────────┐
│ [■ #505afb]    │
│ [#505afb     ] │
└────────────────┘

Digitando manualmente:
┌────────────────┐
│ [■ #505afb]    │
│ [#FF0000     ] ← usuário está digitando
└────────────────┘

Valor inválido (será rejeitado):
┌────────────────┐
│ [■ #505afb]    │
│ [ABCXYZ      ] ← não é hex válido
└────────────────┘
```

---

## Responsividade

### Desktop (>1024px)
```
┌─────────────────────────────────────┐
│         MARKETING HEADER            │
├─────────────────────────────────────┤
│ ┌──────────────────┬──────────────┐ │
│ │   FORMULÁRIO     │    PREVIEW   │ │
│ │   (2/3 width)    │  (1/3 width) │ │
│ │                  │   STICKY     │ │
│ │                  │              │ │
│ └──────────────────┴──────────────┘ │
└─────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────┐
│   MARKETING HEADER      │
├─────────────────────────┤
│                         │
│     FORMULÁRIO          │
│     (full width)        │
│                         │
├─────────────────────────┤
│                         │
│     PREVIEW             │
│     (full width)        │
│                         │
└─────────────────────────┘
```

---

## Cores Padrão do AGENDE AI

```
Light Theme (Default):
├─ Background: #FFFFFF (branco)
├─ Text: #000000 (preto)
├─ Button: #505afb (roxo/azul)
└─ Button Text: #FFFFFF (branco)

Dark Theme:
├─ Background: #1f2937 (cinza escuro)
├─ Text: #FFFFFF (branco)
├─ Button: #7c3aed (roxo mais vibrante)
└─ Button Text: #FFFFFF (branco)
```

---

## Validações

```
Cor de Fundo:
✓ #FFFFFF (6 dígitos)
✓ #FFF (3 dígitos)
✗ #GGGGGG (inválido)
✗ FFFFFF (sem #)

Tema:
✓ light
✓ dark
✓ custom
✗ other_value (rejeitado)

Imagem:
✓ PNG, JPG
✗ GIF, SVG, WEBP (futura expansão)
✗ > 5MB (limite sugerido)
```

---

## Mensagens de Feedback

```
Sucesso:
✓ "Configurações de branding salvas com sucesso!"

Erro:
✗ "Erro ao salvar configurações de branding"
✗ "Cor inválida: #GGGGGG"
✗ "Arquivo deve ser imagem"

Loading:
⟳ "Salvando..." (botão com spinner)
```

---

## Integração com Landing Page

Após salvar, a página pública reflete as mudanças:

```html
<!-- Landing Page Pública -->
<div style="background-color: #FFFFFF; color: #000000">
  <h1>Bem-vindo!</h1>
  <button style="background-color: #505afb; color: #FFFFFF">
    Agendar Agora
  </button>
  <img src="/hero-image.jpg" alt="Capa" />
</div>
```

---

**Diagrama Visual Completo da Interface pronto para development!** 🎨✨
