# ⚡ IMPLEMENTAÇÃO RÁPIDA - Novo Modal Slide-Out

## 🎯 Copiar-Colar Rápido

### 1. Criar o arquivo do modal

**Arquivo:** `apps/web/src/components/Modals/YourNewModal.tsx`

```tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Spin,
  Select,
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { useApiQuery, useApiMutation } from '@/hooks/useApi'
import { api } from '@/lib/api'

interface Item {
  id: string
  name: string
  // Adicione outros campos
}

interface YourNewModalProps {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
  itemId?: string
}

export function YourNewModal({
  visible,
  onClose,
  onSuccess,
  itemId,
}: YourNewModalProps) {
  const [form] = Form.useForm()
  const isEditing = !!itemId

  // Buscar item se editando
  const { data: item, isLoading: loadingItem } = useApiQuery(
    ['item', itemId || ''],
    `/items/${itemId}`,
    { enabled: isEditing && !!itemId }
  )

  // Mutation para criar/atualizar
  const { mutate: saveItem, isPending: saving } = useApiMutation(
    async (payload: any) => {
      if (isEditing) {
        const { data } = await api.put(`/items/${itemId}`, payload)
        return data
      } else {
        const { data } = await api.post('/items', payload)
        return data
      }
    },
    [['items'], ['item', itemId || '']]
  )

  // Preencher form quando dados carregarem
  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        name: item.name,
        // Adicione outros campos
      })
    }
  }, [item, form])

  // Limpar form ao abrir/fechar modal
  useEffect(() => {
    if (!visible) {
      form.resetFields()
    }
  }, [visible, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()

      saveItem(values, {
        onSuccess: () => {
          message.success(
            isEditing ? 'Atualizado com sucesso!' : 'Criado com sucesso!'
          )
          form.resetFields()
          onSuccess()
          onClose()
        },
        onError: (error: any) => {
          message.error(error.response?.data?.error || 'Erro ao salvar')
        },
      })
    } catch (error) {
      console.error('Erro ao validar:', error)
    }
  }

  const modalTitle = isEditing ? 'Editar Item' : 'Novo Item'

  const modalStyle = `
    .your-new-modal .ant-modal {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      height: 100vh !important;
      border-radius: 0 !important;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15) !important;
    }
    
    .your-new-modal .ant-modal-content {
      height: 100vh !important;
      border-radius: 0 !important;
    }
    
    .your-new-modal .ant-modal-body {
      height: calc(100vh - 140px) !important;
      overflow-y: auto !important;
      padding: 24px !important;
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: modalStyle }} />
      <div className="your-new-modal">
        <form>
          {/* Formulário aqui */}
        </form>
      </div>
    </>
  )
}
```

---

## 📋 Passo a Passo

### 1️⃣ Criar o arquivo
```bash
touch apps/web/src/components/Modals/YourNewModal.tsx
```

### 2️⃣ Copiar template acima

### 3️⃣ Editar informações
```tsx
// Trocar:
// - 'Item' → seu tipo real
// - 'items' → seu endpoint
// - Campos do formulário
// - Validações
```

### 4️⃣ Importar no componente pai
```tsx
import { YourNewModal } from '@/components/Modals/YourNewModal'

export function YourFeature() {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedId, setSelectedId] = useState<string | undefined>()

  return (
    <>
      <button onClick={() => {
        setSelectedId(undefined)
        setModalVisible(true)
      }}>
        ➕ Novo
      </button>

      <YourNewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          // Refetch lista
        }}
        itemId={selectedId}
      />
    </>
  )
}
```

### 5️⃣ Adicionar campos ao formulário
```tsx
<Form form={form} layout="vertical">
  <Form.Item
    name="name"
    label="Nome"
    rules={[{ required: true, message: 'Nome é obrigatório' }]}
  >
    <Input placeholder="Digite o nome" />
  </Form.Item>

  {/* Adicione mais campos aqui */}
</Form>
```

### 6️⃣ Testar
```bash
npm run dev
# Abrir http://localhost:3000
# Testar novo modal
```

---

## 🔥 Erros Comuns

### ❌ Modal não abre
```
// Verificar:
✓ visible={true}
✓ onClose está vinculado
✓ estado do pai está correto
```

### ❌ Modal não salva
```
// Verificar:
✓ API endpoint correto
✓ Validações passando
✓ Headers de autenticação
```

### ❌ Scroll não funciona
```
// Verificar:
✓ height: calc(100vh - 140px)
✓ overflow-y: auto
✓ Conteúdo maior que altura
```

---

## ✨ Variações

### Modal Simples (3 campos)
```tsx
width="40%"
// Menos padding, menos altura
```

### Modal Médio (5-8 campos)
```tsx
width="50%"
// Width padrão
```

### Modal Complexo (muitos campos/abas)
```tsx
width="60%"
// Mais espaço
// Pode adicionar Tabs
```

---

## 🎨 Adicionar Abas (Como Profissionais)

```tsx
const tabItems = [
  {
    key: 'info',
    label: 'Informações',
    children: (
      <Form>
        {/* Campo 1 */}
        {/* Campo 2 */}
      </Form>
    ),
  },
  {
    key: 'config',
    label: 'Configurações',
    children: (
      <Form>
        {/* Switch 1 */}
        {/* Switch 2 */}
      </Form>
    ),
  },
]

return (
  <>
    <Tabs items={tabItems} />
  </>
)
```

---

## 📝 Checklist Rápido

- [ ] Arquivo criado
- [ ] Template copiado
- [ ] Endpoints atualizados
- [ ] Campos do formulário adicionados
- [ ] Validações configuradas
- [ ] Importado no componente pai
- [ ] Estado do pai configurado
- [ ] Testado localmente
- [ ] Sem erros no console
- [ ] Responsividade testada

---

## 🚀 Próximo Modal?

1. Copia este arquivo
2. Troca o nome
3. Troca os campos
4. Pronto!

**Tempo estimado: 15-30 minutos**

---

## 📞 Precisa de Ajuda?

1. Veja `PADRAO_MODAIS_SLIDEOUT.md` para detalhes
2. Consulte `ProfessionalFormModal.tsx` como exemplo
3. Revise `UPDATE_MODAL_SLIDEOUT.md` para CSS

---

**Versão**: 1.0.0  
**Data**: 29/12/2025  
**Pronto para usar!** ✅
