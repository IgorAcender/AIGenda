# 🎯 Guia de Uso - ModalWithSidebar Wrapper

## O que é?

`ModalWithSidebar` é um componente wrapper reutilizável que fornece:
- ✅ Layout de modal com slide-out automático (lado direito)
- ✅ Sidebar com menu de abas à esquerda
- ✅ Styling consistente em todos os modais
- ✅ Redução de ~70% do código duplicado

## Como usar?

### Exemplo básico (modal sem abas)

```tsx
import { ModalWithSidebar } from './ModalWithSidebar'
import { Form, Input, Switch } from 'antd'

export function MinhaFormModal({ open, onClose, onSuccess }) {
  const [form] = Form.useForm()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      // Sua lógica de save aqui
      setIsSaving(true)
      // ... API call ...
      onSuccess()
      onClose()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ModalWithSidebar
      title="Novo Item"
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      tabs={[]}  // Vazio para modal simples
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item
          name="name"
          label="Nome"
          rules={[{ required: true, message: 'Nome é obrigatório' }]}
        >
          <Input placeholder="Ex: Novo item" />
        </Form.Item>

        <Form.Item
          name="active"
          label="Ativo"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>
      </Form>
    </ModalWithSidebar>
  )
}
```

### Exemplo com abas (como ClientFormModal)

```tsx
export function ClientFormModal({ open, onClose, onSuccess, editingClient }) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('cadastro')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    const values = await form.validateFields()
    // ... salvar ...
  }

  return (
    <ModalWithSidebar
      title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      open={open}
      onClose={onClose}
      onSave={handleSave}
      isSaving={isSaving}
      tabs={[
        { key: 'cadastro', label: 'Cadastro' },
        { key: 'endereco', label: 'Endereço' },
        { key: 'configuracoes', label: 'Configurações' },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sidebarContent={
        <div style={{ textAlign: 'center' }}>
          {/* Avatar ou outro conteúdo da sidebar */}
        </div>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        {/* Aba 1 */}
        {activeTab === 'cadastro' && (
          <Form.Item name="name" label="Nome">
            <Input />
          </Form.Item>
        )}

        {/* Aba 2 */}
        {activeTab === 'endereco' && (
          <Form.Item name="address" label="Endereço">
            <Input />
          </Form.Item>
        )}

        {/* Aba 3 */}
        {activeTab === 'configuracoes' && (
          <Form.Item name="active" label="Ativo" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
      </Form>
    </ModalWithSidebar>
  )
}
```

## Props Disponíveis

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| `title` | `string` | ✅ | Título do modal |
| `open` | `boolean` | ✅ | Controla se o modal está aberto |
| `onClose` | `() => void` | ✅ | Callback ao fechar |
| `onSave` | `() => void` | ❌ | Callback ao clicar em "Salvar" |
| `isSaving` | `boolean` | ❌ | Show loading state no botão |
| `tabs` | `SidebarTab[]` | ✅ | Array de abas `{ key, label }` |
| `activeTab` | `string` | ❌ | Aba ativa atual |
| `onTabChange` | `(key: string) => void` | ❌ | Callback ao mudar aba |
| `width` | `string \| number` | ❌ | Largura (padrão: 60%) |
| `children` | `ReactNode` | ✅ | Conteúdo do modal |
| `sidebarContent` | `ReactNode` | ❌ | Conteúdo da sidebar (acima das abas) |
| `footer` | `ReactNode` | ❌ | Footer customizado |
| `isLoading` | `boolean` | ❌ | Show loading spinner |

## Componentes que usam o wrapper

✅ **Implementados:**
- ClientFormModal.tsx
- ProfessionalFormModal.tsx
- ServiceFormModal.tsx
- CategoryFormModal.tsx
- ProductFormModal.tsx
- SupplierFormModal.tsx

## Padrões de Desenvolvimento

### 1. Estado do Modal

```tsx
const [open, setOpen] = useState(false)
const [activeTab, setActiveTab] = useState('tab1')
const [isSaving, setIsSaving] = useState(false)
```

### 2. Requisição de Dados

```tsx
const { mutate: saveItem, isPending: isSaving } = useApiMutation(
  async (data) => {
    if (editingItem?.id) {
      return await api.put(`/items/${editingItem.id}`, data)
    } else {
      return await api.post('/items', data)
    }
  },
  [['items']]
)
```

### 3. Handler Save

```tsx
const handleSave = async () => {
  try {
    const values = await form.validateFields()
    
    saveItem(values, {
      onSuccess: (response) => {
        message.success('Item salvo com sucesso!')
        onClose()
        form.resetFields()
      },
      onError: (error) => {
        message.error(error.message || 'Erro ao salvar')
      },
    })
  } catch (error) {
    console.error(error)
  }
}
```

### 4. Limpeza ao Fechar

```tsx
useEffect(() => {
  if (!open) {
    form.resetFields()
    setActiveTab('tab1')
    // Limpar outros estados
  }
}, [open, form])
```

## Dicas

💡 **Para modal simples:** Use `tabs={[]}` (sem sidebar menu)

💡 **Para adicionar conteúdo na sidebar:** Use prop `sidebarContent`

💡 **Para custom footer:** Use prop `footer={...}`

💡 **Para loading:** Use prop `isLoading={loadingProfessional}`

## Benefícios

| Antes | Depois |
|-------|--------|
| ~250 linhas por modal | ~50-100 linhas |
| CSS duplicado em cada modal | CSS centralizado no wrapper |
| Inconsistência visual | Estilo uniforme |
| Mudanças em 6 lugares | Mudanças em 1 lugar |

---

**Versão:** 1.0 | **Data:** 29/12/2025
