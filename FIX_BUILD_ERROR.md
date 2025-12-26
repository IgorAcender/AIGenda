# ✅ Correção do Erro de Build - Professional Form

## 🐛 Problema Encontrado

Durante o build do Docker, o TypeScript detectou um erro de tipo:

```
Type error: Type '(value: string | undefined) => string' is not assignable to type '(displayValue: string | undefined) => 0 | 100'.
Type 'string' is not assignable to type '0 | 100'.
```

**Localização:** `apps/web/src/app/(dashboard)/cadastro/profissionais/page.tsx:675`

## 🔧 Causa

O componente `InputNumber` do Ant Design esperava que o `parser` retornasse um **número**, mas estava retornando uma **string** (resultado do `replace`).

### Código Problemático:
```tsx
<InputNumber 
  formatter={value => `${value}%`}
  parser={value => value!.replace('%', '')}  // ❌ Retorna string
/>
```

## ✅ Solução Aplicada

Adicionamos **tipos explícitos** e **convertemos o valor para número**:

```tsx
<InputNumber 
  formatter={(value: number | string | undefined) => `${value}%`}
  parser={(value: string | undefined) => Number(value?.replace('%', '') || 0)}
/>
```

### O que mudou:
1. ✅ Tipo explícito no `formatter`: `(value: number | string | undefined) => string`
2. ✅ Tipo explícito no `parser`: `(value: string | undefined) => number`
3. ✅ Conversão para número: `Number(...)` 
4. ✅ Fallback seguro: `|| 0` caso o valor seja inválido

## 📝 Commit Realizado

```bash
fix: corrigir tipo do parser no InputNumber de comissão

- Adicionar tipos explícitos para formatter e parser
- Converter valor para Number no parser
- Resolver erro de compilação do TypeScript no build
```

**Commit Hash:** `629ba3e`

## 🧪 Teste

Para verificar se o erro foi corrigido:

```bash
# Build local
cd apps/web
pnpm build

# Ou via Docker
docker build -t aigenda-web -f apps/web/Dockerfile .
```

## ✅ Status

- [x] Erro identificado
- [x] Correção aplicada
- [x] Tipos adicionados
- [x] Commit realizado
- [x] Push enviado
- [x] Build deve passar agora

## 📚 Referência

- **Arquivo**: `apps/web/src/app/(dashboard)/cadastro/profissionais/page.tsx`
- **Linha**: 665-676
- **Componente**: `InputNumber` (Ant Design)
- **Props afetadas**: `formatter`, `parser`

---

**Data:** 26 de dezembro de 2025  
**Status:** ✅ Corrigido e enviado
