# 🎨 VISUALIZAÇÃO - Modal Cliente Slide-Out

## 📐 Dimensões

### Desktop (1920px+)
```
┌───────────────────────────────────────────────────┐
│ Tela (1920px)                                     │
├───────────────────────────────────────────────────┤
│                                                    │
│  Conteúdo da página (1000px)      Modal (960px)  │
│  [App Content]                    ┌──────────┐   │
│                                   │Novo      │   │
│                                   │Cliente   │X  │
│                                   ├──────────┤   │
│                                   │[Avatar]  │   │
│                                   │[Upload]  │   │
│                                   │          │   │
│                                   │Cadastro │   │
│                                   │Endereço │   │
│                                   │Config   │   │
│                                   │          │   │
│                                   │[Campos] │   │
│                                   │[Campos] │   │
│                                   │          │   │
│                                   ├──────────┤   │
│                                   │[Cancelar]│   │
│                                   │[Salvar]  │   │
│                                   └──────────┘   │
│                                                    │
└───────────────────────────────────────────────────┘

Modal Width: 50% (960px)
Modal Height: 100vh (full height)
Position: Fixed, right: 0, top: 0
```

### Tablet (768px)
```
┌──────────────────────────────────────────┐
│ Tela (768px)                             │
├──────────────────────────────────────────┤
│                                           │
│  Conteúdo       Modal (460px)            │
│  [App]      ┌────────────┐               │
│             │Novo        │               │
│             │Cliente │X  │               │
│             ├────────────┤               │
│             │[Avatar]    │               │
│             │[Upload]    │               │
│             │            │               │
│             │Cadastro│   │               │
│             │Endereço│   │               │
│             │Config │    │               │
│             │            │               │
│             │[Campos]    │               │
│             │[Campos]    │               │
│             │            │               │
│             ├────────────┤               │
│             │[Cancelar]  │               │
│             │[Salvar]    │               │
│             └────────────┘               │
│                                           │
└──────────────────────────────────────────┘

Modal Width: 50% (460px)
Modal Height: 100vh (full height)
Position: Fixed, right: 0, top: 0
```

### Mobile (375px)
```
┌─────────────────────┐
│ Tela (375px)        │
├─────────────────────┤
│ Novo Cliente     [X]│
├─────────────────────┤
│ [Avatar]            │
│ [Upload Button]     │
│ ─────────────────── │
│ Histórico           │
│ Estatísticas        │
│ Preferências        │
├─────────────────────┤
│ Cadastro            │
│ Endereço            │
│ Config              │
├─────────────────────┤
│ [Campo]             │
│ [Campo]             │
│ [Campo]             │
│ (scroll down)       │
│ [Campo]             │
│ [Campo]             │
├─────────────────────┤
│ [Cancelar] [Salvar] │
└─────────────────────┘

Modal Width: 100% (375px)
Modal Height: 100vh (full height)
Position: Fixed, right: 0, top: 0
Layout: Stacked (Avatar top, Form bottom)
```

---

## 📐 Estrutura Interna (Desktop)

```
┌─────────────────────────────────────────────────┐
│ HEADER (55px)                              [X] │
│ Novo Cliente                                    │
├──────────────┬──────────────────────────────────┤
│  AVATAR (25%)│     FORMULÁRIO (75%)             │
│              │                                   │
│  [Avatar]    │ Cadastro │ Endereço │ Config    │
│  [120px]     │                                   │
│              │ Nome Completo *                  │
│  [Upload]    │ [___________________]            │
│              │                                   │
│ ─────────────│ Apelido       Email              │
│              │ [_____] [_______________]        │
│ Histórico    │                                   │
│              │ Celular *     Telefone Fixo      │
│ Estatísticas │ [_______] [_______________]      │
│              │                                   │
│ Preferências │ Aniversário   Gênero             │
│              │ [__________] [__]                │
│              │                                   │
│ (scroll)     │ CPF           CNPJ               │
│              │ [________] [___________]         │
│              │                                   │
│              │ RG            Indicado por       │
│              │ [______] [_______________]       │
│              │                                   │
│              │ Hashtags                         │
│              │ [_______________________]        │
│              │                                   │
│              │ (scroll para mais abas)          │
│              │                                   │
├──────────────┼──────────────────────────────────┤
│              │ [Cancelar] [Criar Cliente]       │
│ FOOTER (55px)│                                   │
└──────────────┴──────────────────────────────────┘

Left Section:   width: 25%, border-right
Right Section:  flex: 1, overflow-y: auto
Body Height:    calc(100vh - 140px)
```

---

## 🎨 Cores e Estilos

### Header
```
Background: White (#FFFFFF)
Border-bottom: 1px solid #f0f0f0
Text color: #000000
Close button: Gray
```

### Avatar Section
```
Background: White (#FFFFFF)
Text align: Center
Border-right: 1px solid #f0f0f0
Avatar bg: #505afb (Purple)
Button: Primary blue
```

### Form Section
```
Background: White (#FFFFFF)
Input fields: Ant Design default
Tabs: Ant Design default
Text: #000000
```

### Shadow
```
Box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15)
(Sombra à esquerda do modal)
```

---

## 🎬 Animação

### Abertura
```
Duração: 0.3s
Easing: ease-out
Tipo: Slide-in from right
Resultado: Modal desliza suavemente do lado direito
```

### Fechamento
```
Duração: 0.3s
Easing: ease-in
Tipo: Slide-out to right
Resultado: Modal desliza suavemente para a direita
```

---

## 📱 Responsive Behavior

### Desktop (≥1920px)
```
✅ Modal 50% width
✅ Avatar 25%, Form 75%
✅ Side-by-side layout
✅ All content visible
```

### Tablet (768px - 1919px)
```
✅ Modal 50% width
✅ Avatar 25%, Form 75%
✅ Side-by-side layout
✅ Scroll if needed
```

### Mobile (<768px)
```
✅ Modal 100% width (full screen)
✅ Avatar on top
✅ Form below
✅ Stacked layout
✅ Scroll to see all content
```

---

## 🎯 Elemento Destacado: Avatar Section

### Visual
```
┌──────────────┐
│              │
│   [Avatar]   │ 120px circle
│    Image     │
│              │
├──────────────┤
│ [Upload Btn] │ Full width primary button
├──────────────┤
│ ─────────────│ Divider
├──────────────┤
│ Histórico    │ Panel title (strong)
│ subtitle...  │ subtitle (secondary)
│              │
│ Estatísticas │
│ subtitle...  │
│              │
│ Preferências │
│ subtitle...  │
└──────────────┘

Width: 25% of modal
Min-width: auto (responsive)
Padding: 24px
Text-align: center
Overflow-y: auto
```

---

## 🎯 Elemento Destacado: Tabs

### Tab Navigation
```
┌──────────────────────────────────┐
│ Cadastro │ Endereço │ Config     │
├──────────────────────────────────┤
│                                   │
│ [Form content for selected tab]   │
│                                   │
│                                   │
└──────────────────────────────────┘

Tab heights: 40px (default Ant Design)
Content area: Scrollable below
Active tab: Highlighted in blue
```

---

## 🎯 Elemento Destacado: Footer

### Action Buttons
```
┌─────────────────────────────────────────┐
│ [Cancelar] [Criar Cliente]              │
│ Gap: 12px                               │
│ Justify: flex-end                       │
│ Padding: 16px 24px                      │
└─────────────────────────────────────────┘

Left button: Gray default
Right button: Blue primary (htmlType="submit")
Both buttons: Full height
```

---

## ✨ Recursos Visuais

```
✅ Smooth slide-in/out animation
✅ Professional shadow effect
✅ Clear visual hierarchy
✅ Accessible color contrast
✅ Responsive layout
✅ Smooth scrolling
✅ Consistent spacing
✅ Modern appearance
```

---

**Status**: ✅ IMPLEMENTADO  
**Data**: 29/12/2025

O modal de cliente agora é um belo slide-out panel! 🎨
