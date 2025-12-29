# 📘 PADRÃO DE MODAIS - Slide-Out Panel

## 🎯 Objetivo

Estabelecer um padrão consistente para **todos os modais do painel de dono** utilizando o layout **slide-out panel** (abre do lado direito, ocupa 100% da altura).

---

## 📐 Especificação do Padrão

### Dimensões e Posicionamento

| Propriedade | Valor | Descrição |
|------------|-------|-----------|
| **Width** | 50% | Metade da largura da tela |
| **Height** | 100vh | Altura total da viewport |
| **Position** | fixed | Posicionamento fixo na tela |
| **Top** | 0 | Alinhado ao topo |
| **Right** | 0 | Alinhado à direita |
| **Bottom** | 0 | Alinhado à base |
| **Margin** | 0 | Sem margem |
| **Border Radius** | 0 | Sem bordas arredondadas |
| **Box Shadow** | -2px 0 8px rgba(0,0,0,0.15) | Sombra à esquerda |

### Estrutura Interna

```
Modal (100vh)
├─ Header (~55px)
│  ├─ Título
│  └─ Fechar (X)
├─ Body (calc(100vh - 140px))
│  └─ Conteúdo com scroll
└─ Footer (~55px)
   ├─ Cancelar
   └─ Salvar/Ação
```

---

## 💻 Implementação Base

### CSS Global (src/styles/modal-slideout.css)

```css
/* Padrão para todos os modais slide-out */
.modal-slideout {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  margin: 0 !important;
  height: 100vh !important;
  border-radius: 0 !important;
}

.modal-slideout .ant-modal {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  height: 100vh !important;
  border-radius: 0 !important;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
}

.modal-slideout .ant-modal-content {
  height: 100vh !important;
  padding: 0 !important;
  border-radius: 0 !important;
  display: flex;
  flex-direction: column;
}

.modal-slideout .ant-modal-header {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 16px 24px !important;
  margin-bottom: 0 !important;
  flex-shrink: 0;
}

.modal-slideout .ant-modal-body {
  flex: 1;
  height: auto;
  overflow-y: auto !important;
  padding: 24px !important;
}

.modal-slideout .ant-modal-footer {
  padding: 16px 24px !important;
  border-top: 1px solid #f0f0f0 !important;
  flex-shrink: 0;
  text-align: right;
}

/* Responsividade */
@media (max-width: 1024px) {
  .modal-slideout .ant-modal {
    width: 60% !important;
  }
}

@media (max-width: 768px) {
  .modal-slideout .ant-modal {
    width: 100% !important;
  }
  
  .modal-slideout .ant-modal-header {
    padding: 12px 16px !important;
  }
  
  .modal-slideout .ant-modal-body {
    padding: 16px !important;
  }
  
  .modal-slideout .ant-modal-footer {
    padding: 12px 16px !important;
  }
}
```

---

## 🔧 Template React/TypeScript

### Hook Customizado (src/hooks/useSlideOutModal.ts)

```typescript
import { useState } from 'react'

interface UseSlideOutModalProps {
  onClose?: () => void
  onSuccess?: () => void
}

export function useSlideOutModal({
  onClose,
  onSuccess,
}: UseSlideOutModalProps = {}) {
  const [visible, setVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const open = () => setVisible(true)
  const close = () => {
    setVisible(false)
    onClose?.()
  }

  const success = () => {
    setVisible(false)
    onSuccess?.()
  }

  return {
    visible,
    isLoading,
    open,
    close,
    success,
    setIsLoading,
  }
}
```

### Componente Template (src/components/SlideOutModal.tsx)

```tsx
'use client'

import React from 'react'
import { Modal, Button, message } from 'antd'
import { SaveOutlined } from '@ant-design/icons'

interface SlideOutModalProps {
  title: string
  visible: boolean
  onClose: () => void
  onSave?: () => Promise<void> | void
  isLoading?: boolean
  width?: string
  children: React.ReactNode
}

export function SlideOutModal({
  title,
  visible,
  onClose,
  onSave,
  isLoading = false,
  width = '50%',
  children,
}: SlideOutModalProps) {
  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave()
        message.success('Salvo com sucesso!')
      }
    } catch (error) {
      message.error('Erro ao salvar')
      console.error(error)
    }
  }

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      width={width}
      wrapClassName="modal-slideout"
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        onSave && (
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isLoading}
          >
            Salvar
          </Button>
        ),
      ]}
      bodyStyle={{
        height: 'calc(100vh - 140px)',
        overflowY: 'auto',
        padding: '24px',
      }}
    >
      {children}
    </Modal>
  )
}
```

---

## 📋 Modais a Implementar com Este Padrão

### Painel de Dono - Módulos

| Módulo | Modal | Status |
|--------|-------|--------|
| **Profissionais** | Novo/Editar Profissional | ✅ Pronto |
| **Serviços** | Novo/Editar Serviço | ⏳ Próximo |
| **Clientes** | Novo/Editar Cliente | ⏳ Próximo |
| **Produtos** | Novo/Editar Produto | ⏳ Próximo |
| **Categorias** | Novo/Editar Categoria | ⏳ Próximo |
| **Agendamentos** | Novo/Editar Agendamento | ⏳ Próximo |
| **Fornecedores** | Novo/Editar Fornecedor | ⏳ Próximo |
| **Pacotes** | Novo/Editar Pacote | ⏳ Próximo |
| **Comissões** | Configurar Comissão | ⏳ Próximo |
| **Relatórios** | Filtro/Config Relatório | ⏳ Próximo |

---

## 🛠️ Como Usar o Padrão

### 1. Importar CSS

```tsx
import '@/styles/modal-slideout.css'
```

### 2. Usar o Componente Base

```tsx
import { SlideOutModal } from '@/components/SlideOutModal'
import { useSlideOutModal } from '@/hooks/useSlideOutModal'

export function MyFeature() {
  const modal = useSlideOutModal({
    onClose: () => console.log('Fechou'),
    onSuccess: () => console.log('Sucesso'),
  })

  const handleSave = async () => {
    // Salvar lógica
    modal.success()
  }

  return (
    <>
      <button onClick={modal.open}>Abrir Modal</button>
      <SlideOutModal
        title="Novo Item"
        visible={modal.visible}
        onClose={modal.close}
        onSave={handleSave}
        isLoading={modal.isLoading}
      >
        {/* Conteúdo aqui */}
      </SlideOutModal>
    </>
  )
}
```

### 3. Ou Estender o Componente Base

```tsx
import { SlideOutModal } from '@/components/SlideOutModal'
import { Form, Input } from 'antd'

export function NewServiceModal({ visible, onClose }) {
  const [form] = Form.useForm()

  const handleSave = async () => {
    const values = await form.validateFields()
    // Salvar serviço
  }

  return (
    <SlideOutModal
      title="Novo Serviço"
      visible={visible}
      onClose={onClose}
      onSave={handleSave}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nome" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        {/* Mais campos */}
      </Form>
    </SlideOutModal>
  )
}
```

---

## 🎨 Customizações por Módulo

### Profissionais
```tsx
<SlideOutModal
  title={isEditing ? 'Editar Profissional' : 'Novo Profissional'}
  width="50%"
  // ... resto
/>
```

### Serviços
```tsx
<SlideOutModal
  title={isEditing ? 'Editar Serviço' : 'Novo Serviço'}
  width="45%"  // Um pouco menor
  // ... resto
/>
```

### Clientes
```tsx
<SlideOutModal
  title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
  width="50%"
  // ... resto
/>
```

---

## 📏 Variantes de Largura

| Contexto | Largura | Campos |
|----------|---------|--------|
| **Simples** | 40% | 1-3 campos |
| **Normal** | 50% | 4-8 campos |
| **Complexo** | 60% | 8+ campos / abas |
| **Full** | 80% | Tabelas / muitos dados |

---

## ✨ Características Padrão

Todos os modais **slide-out** incluem:

✅ **Posicionamento fixo** à direita  
✅ **Altura total** (100vh)  
✅ **Scroll interno** para conteúdo longo  
✅ **Header fixo** com título  
✅ **Footer fixo** com botões de ação  
✅ **Sombra suave** à esquerda  
✅ **Responsivo** (adapta em tablet/mobile)  
✅ **Animação suave** de entrada  
✅ **Botões padrão** (Cancelar, Salvar)  
✅ **Mensagens** de sucesso/erro  

---

## 🎬 Animação e Transição

### Entrada
O modal entra deslizando suavemente do lado direito (animação padrão do Ant Design).

### Saída
O modal sai deslizando para o lado direito quando fechado.

Para customizar:
```tsx
<Modal
  wrapClassName="modal-slideout"
  transitionName="slide-up"  // Mudar animação
  // ...
/>
```

---

## 📱 Responsividade Detalhada

### Desktop (1920px+)
```
[50% Página] | [50% Modal]
Modal width: 50%
Padding: 24px
```

### Tablet (768px - 1024px)
```
[40% Página] | [60% Modal]
Modal width: 60%
Padding: 20px
```

### Mobile (< 768px)
```
[Modal 100% width]
Modal width: 100%
Padding: 16px
Header padding: 12px 16px
```

---

## 🔒 Padrão de Permissões

Cada modal deve respeitar as permissões do usuário:

```tsx
const canEdit = user.role === 'OWNER' || user.role === 'ADMIN'

return (
  <SlideOutModal
    // ...
    onSave={canEdit ? handleSave : undefined}
    footer={[
      <Button key="cancel" onClick={onClose}>
        Cancelar
      </Button>,
      canEdit && (
        <Button key="submit" type="primary" onClick={handleSave}>
          Salvar
        </Button>
      ),
    ]}
  />
)
```

---

## 🧪 Testes Padrão

Todo modal slide-out deve passar por:

```typescript
// 1. Teste de abertura
✓ Modal abre ao clicar no botão
✓ Modal posiciona à direita
✓ Modal ocupa altura total

// 2. Teste de conteúdo
✓ Título aparece no header
✓ Conteúdo tem scroll interno
✓ Footer permanece visível

// 3. Teste de interação
✓ Fechar com X funciona
✓ Fechar com "Cancelar" funciona
✓ Salvar com "Salvar" funciona
✓ Validações funcionam

// 4. Teste de responsividade
✓ Mobile: 100% width
✓ Tablet: 60% width
✓ Desktop: 50% width

// 5. Teste de UX
✓ Sem travamentos
✓ Mensagens aparece
✓ Scroll suave
✓ Sem bugs visuais
```

---

## 📚 Checklist de Implementação

Para cada novo modal, verificar:

- [ ] Usando CSS `.modal-slideout`
- [ ] Width configurado (40%, 50%, 60%, 80%)
- [ ] Title definido corretamente
- [ ] onClose implementado
- [ ] onSave implementado
- [ ] Form com validações
- [ ] Mensagens de sucesso/erro
- [ ] isLoading durante salvar
- [ ] Responsividade testada
- [ ] Botões de ação corretos
- [ ] Header e footer fixos
- [ ] Scroll interno funciona
- [ ] Sem bugs de overflow
- [ ] Acessibilidade ok

---

## 🔗 Estrutura de Pastas

```
apps/web/src/
├── components/
│   ├── SlideOutModal.tsx          ← Componente base
│   ├── Modals/
│   │   ├── ProfessionalModal.tsx   ✅
│   │   ├── ServiceModal.tsx        ⏳
│   │   ├── ClientModal.tsx         ⏳
│   │   ├── ProductModal.tsx        ⏳
│   │   ├── CategoryModal.tsx       ⏳
│   │   └── ... mais modais
│   └── ...
├── hooks/
│   └── useSlideOutModal.ts         ← Hook customizado
├── styles/
│   └── modal-slideout.css          ← CSS global
└── ...
```

---

## 💡 Boas Práticas

### ✅ Fazer
```tsx
// Bom: Usar o padrão
<SlideOutModal
  title="Novo Item"
  visible={visible}
  onClose={onClose}
  onSave={handleSave}
  width="50%"
>
  {/* Conteúdo */}
</SlideOutModal>
```

### ❌ Evitar
```tsx
// Ruim: Não usar o padrão
<Modal
  centered
  width={700}
  // ...
>
  {/* Conteúdo inconsistente */}
</Modal>
```

---

## 🚀 Próximas Implementações

**Ordem recomendada:**

1. ✅ **Profissionais** - Pronto
2. ⏳ **Serviços** - Próximo (6-8 campos)
3. ⏳ **Clientes** - Depois (5-7 campos)
4. ⏳ **Categorias** - Depois (3-4 campos)
5. ⏳ **Produtos** - Depois (7-10 campos)
6. ⏳ **Agendamentos** - Depois (complex)
7. ⏳ **Fornecedores** - Depois (6-8 campos)
8. ⏳ **Pacotes** - Depois (complex)
9. ⏳ **Comissões** - Depois (2-3 campos)
10. ⏳ **Relatórios** - Por último (filters)

---

## 📖 Documentação de Referência

- [Ant Design Modal](https://ant.design/components/modal/)
- [CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [React Hooks](https://react.dev/reference/react)

---

## 📞 Suporte

Para dúvidas sobre o padrão:
1. Verificar este documento
2. Consultar `UPDATE_MODAL_SLIDEOUT.md`
3. Analisar `ProfessionalFormModal.tsx` como exemplo
4. Revisar o CSS em `modal-slideout.css`

---

**Versão**: 1.0.0  
**Status**: ✅ Documentação Completa  
**Data**: 29/12/2025  
**Aplicável a**: Todos os modais do painel de dono

---

## 🎉 Conclusão

Com este padrão documentado, **todos os modais do painel de dono** seguirão o mesmo:
- ✅ Layout visual
- ✅ Comportamento
- ✅ Responsividade
- ✅ Acessibilidade
- ✅ Experiência do usuário

**Consistência garantida!** 🚀
