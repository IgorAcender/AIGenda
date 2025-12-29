# 🔗 Integração dos Modais - Planejamento

## Objetivo
Integrar os modais criados nas páginas de cadastro correspondentes.

## Status de Integração

### ✅ Serviços - COMPLETO
**Arquivo**: `/apps/web/src/components/OptimizedServicesList.tsx`
- ✅ Import do ServiceFormModal
- ✅ Estados isModalOpen e editingService
- ✅ Mutation para delete
- ✅ Botão "Novo Serviço" abre modal
- ✅ Botão "Editar" abre modal com dados
- ✅ Botão "Excluir" funcional
- ✅ onSuccess refetch da lista

### ✅ Categorias - COMPLETO
**Arquivo**: `/apps/web/src/components/OptimizedCategoriesList.tsx`
- ✅ Import CategoryFormModal
- ✅ Adicionar estados
- ✅ Adicionar mutation delete
- ✅ Conectar botões

### ⏳ Produtos - PRÓXIMO
**Arquivo**: `/apps/web/src/app/(dashboard)/cadastro/produtos/page.tsx`
**Tarefas**:
- [ ] Import ProductFormModal
- [ ] Adicionar estados
- [ ] Adicionar mutation delete
- [ ] Conectar botões

### ✅ Fornecedores - COMPLETO
**Arquivo**: `/apps/web/src/components/OptimizedSuppliersList.tsx`
- ✅ Import SupplierFormModal
- ✅ Adicionar estados
- ✅ Adicionar mutation delete
- ✅ Conectar botões

## Template de Integração

```tsx
// 1. Imports
import { [NomeFormModal] } from './[NomeFormModal]'
import { api } from '@/lib/api'

// 2. Estados
const [isModalOpen, setIsModalOpen] = useState(false)
const [editing[Nome], setEditing[Nome]] = useState<[Nome] | null>(null)

// 3. Mutation Delete
const { mutate: delete[Nome] } = useApiMutation(
  async ([nome]Id: string) => {
    return await api.delete(`/[endpoint]/${[nome]Id}`)
  },
  [['[endpoint]']]
)

// 4. Botão Novo
onClick={() => {
  setEditing[Nome](null)
  setIsModalOpen(true)
}}

// 5. Botão Editar
onClick={() => {
  setEditing[Nome](record)
  setIsModalOpen(true)
}}

// 6. Botão Excluir
onClick={() => {
  delete[Nome](record.id, {
    onSuccess: () => {
      message.success('[Nome] deletado com sucesso!')
      refetch()
    },
    onError: (error: any) => {
      message.error(error.message || 'Erro ao deletar [nome]')
    },
  })
}}

// 7. Modal
<[NomeFormModal]
  open={isModalOpen}
  onClose={() => {
    setIsModalOpen(false)
    setEditing[Nome](null)
  }}
  onSuccess={() => {
    refetch()
  }}
  editing[Nome]={editing[Nome]}
/>
```

## Próximas Etapas

1. ✅ Integrar Serviços
2. ✅ Integrar Categorias
3. ⏳ Integrar Fornecedores
4. ⏳ Integrar Produtos (página inline - maior complexidade)
5. Testar todas as funcionalidades
6. Deploy em produção

---

**Data**: 29/12/2025  
**Status**: 75% Completo ✅
