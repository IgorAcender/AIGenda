# 🚀 Otimizações de Performance Implementadas

## ✅ O que foi feito:

### 1. **TanStack Query (React Query) instalado**
- Cache inteligente de dados
- Invalidação automática
- Refetch otimizado
- DevTools para debugging

### 2. **Hooks customizados criados**
- `useApiQuery` - Para queries simples
- `useApiPaginatedQuery` - Para dados paginados
- `useApiMutation` - Para POST/PUT/DELETE com invalidação automática
- `prefetchQuery` - Para carregar dados antes de precisar

### 3. **QueryProvider integrado**
- Configurações de cache padrão
- React Query DevTools em desenvolvimento
- Refetch inteligente

---

## 📊 Configurações de Cache

### Padrão Global:
```typescript
{
  staleTime: 5 * 60 * 1000,        // 5 minutos até dados ficarem "stale"
  gcTime: 10 * 60 * 1000,          // 10 minutos antes de descartar cache
  refetchOnWindowFocus: false,      // Não refetch ao voltar pra aba
  refetchOnMount: 'stale',         // Refetch só se dados forem stale
  retry: 2,                        // Tentar novamente 2x em erro
}
```

---

## 🎯 Como usar nos componentes:

### Exemplo: Listar dados com cache
```tsx
import { useApiPaginatedQuery } from '@/hooks/useApi'

export function MeuComponente() {
  const { data, isLoading, refetch } = useApiPaginatedQuery(
    'clientes',      // chave única do cache
    '/api/clients',  // endpoint
    1,               // página
    20               // itens por página
  )

  return (
    <>
      {data?.data.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </>
  )
}
```

### Exemplo: Criar/atualizar com invalidação
```tsx
import { useApiMutation } from '@/hooks/useApi'

export function MeuFormulario() {
  const { mutate: saveClient } = useApiMutation(
    async (data) => api.post('/api/clients', data),
    [['clientes', 'page', 1]] // Invalida este cache após sucesso
  )

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      saveClient(formData)
    }}>
      {/* form */}
    </form>
  )
}
```

---

## ⚡ Benefícios esperados:

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo 1ª carga | ~400ms | ~350ms |
| Tempo trocas de aba | ~350ms | ~50-100ms ⚡ |
| Requisições redundantes | Muitas | 0 (cache) |
| Requisições por navegação | ~5 | ~1 |

---

## 🔧 Como migrar componentes existentes:

### Antes (sem cache):
```tsx
useEffect(() => {
  setLoading(true)
  api.get('/api/clients')
    .then(res => setClients(res.data))
    .finally(() => setLoading(false))
}, [page])
```

### Depois (com cache):
```tsx
const { data, isLoading } = useApiPaginatedQuery(
  'clients',
  '/api/clients',
  page,
  20
)

// Substituir setClients(res.data) por data?.data
```

---

## 📍 Próximas etapas:

1. ✅ QueryProvider adicionado no layout.tsx
2. ✅ Hooks customizados criados
3. ⏳ Migrar componentes existentes (clientes, profissionais, serviços)
4. ⏳ Adicionar prefetch nos links de navegação
5. ⏳ Configurar cache por rota específica se necessário

---

## 🐛 Para debugging:

Em desenvolvimento, você verá as **React Query DevTools** (canto inferior direito):
- Veja quais queries estão em cache
- Monitor refetch automático
- Veja estado de cada query

---

## 📈 Próximas otimizações (depois):

- [ ] Lazy loading de componentes
- [ ] Image optimization
- [ ] Code splitting por rota
- [ ] Preload CSS crítico
- [ ] Migrate Ant Design para Tailwind (mais leve)
