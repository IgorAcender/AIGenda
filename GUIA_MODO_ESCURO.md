# Guia: Modo Claro/Escuro (Dark Mode) - AIGenda

## 📋 Resumo da Implementação

Foi implementado um **sistema de tema claro/escuro** (light/dark mode) completo no Dashboard da aplicação AIGenda. O usuário pode alternar entre os temas clicando no ícone na barra de navegação superior direita.

## 🎯 Localização do Botão

O botão de alternância de tema está localizado no **canto superior direito** do dashboard, junto com:
- ☀️ **Sol** = Modo Claro (quando está em modo escuro)
- 🌙 **Lua** = Modo Escuro (quando está em modo claro)
- 🔔 **Sino** = Notificações
- 👤 **Avatar** = Menu do usuário

## 🔧 Estrutura Implementada

### 1. **Hook Custom: `useTheme.ts`**
📍 Localização: `apps/web/src/hooks/useTheme.ts`

Gerencia:
- Estado do tema (light/dark)
- Persistência no localStorage
- Aplicação de temas via Ant Design ConfigProvider
- Estilos CSS (background e cor do texto)

```typescript
const { themeType, toggleTheme, getThemeConfig, mounted } = useTheme()
```

### 2. **Layout Principal: `layout.tsx`**
📍 Localização: `apps/web/src/app/(dashboard)/layout.tsx`

Mudanças:
- ✅ Importou o hook `useTheme`
- ✅ Importou ícones `SunOutlined` e `MoonOutlined`
- ✅ Envolveu o layout com `ConfigProvider` para aplicar temas
- ✅ Adicionou botão de toggle no header
- ✅ Adicionou verificação de `mounted` para evitar hidratação incorreta

### 3. **Estilos CSS: `input.css`**
📍 Localização: `apps/web/src/input.css`

Adicionado:
- Variáveis CSS para modo escuro e claro
- Transições suaves (0.3s)
- Estilo de scrollbar customizado para modo escuro

## 🎨 Cores Implementadas

### Modo Claro (Light)
- Fundo: `#ffffff` (branco)
- Texto: `#000000` (preto)
- Border: `#f0f0f0` (cinza claro)

### Modo Escuro (Dark)
- Fundo: `#141414` (cinza muito escuro)
- Texto: `#e6e6e6` (cinza claro)
- Border: `#434343` (cinza médio)

## 💾 Persistência de Dados

- O tema escolhido é salvo em `localStorage` com chave `'theme'`
- Ao recarregar a página, o tema anterior é automaticamente restaurado
- Padrão: Começa com modo claro

## 🚀 Como Usar

### Para o Usuário
1. Clique no ícone ☀️ ou 🌙 no canto superior direito
2. O tema muda instantaneamente
3. A preferência é salva automaticamente

### Para Desenvolvedor

Se você quiser usar o hook `useTheme` em outros componentes:

```typescript
'use client'
import { useTheme } from '@/hooks/useTheme'

export function MeuComponente() {
  const { themeType, toggleTheme } = useTheme()
  
  return (
    <div>
      Tema atual: {themeType}
      <button onClick={toggleTheme}>Trocar tema</button>
    </div>
  )
}
```

## 📝 Arquivos Modificados

1. ✅ `apps/web/src/app/(dashboard)/layout.tsx`
   - Adicionar hook useTheme
   - Adicionar botão de toggle
   - Envolver com ConfigProvider

2. ✅ `apps/web/src/hooks/useTheme.ts` (novo)
   - Hook completo de gerenciamento de tema

3. ✅ `apps/web/src/input.css`
   - Estilos para transição de tema
   - Variáveis CSS
   - Estilo de scrollbar

## ⚙️ Configuração do Ant Design

O Ant Design é configurado dinamicamente usando:

```typescript
<ConfigProvider theme={getThemeConfig()}>
  {/* Componentes */}
</ConfigProvider>
```

Que retorna:
```typescript
{
  token: {
    colorBgBase: '#141414' ou '#ffffff',
    colorTextBase: '#e6e6e6' ou '#000000',
  },
  algorithm: theme.darkAlgorithm ou theme.defaultAlgorithm
}
```

## 🔄 Fluxo de Funcionamento

1. **Montagem do Componente**
   - Hook carrega tema do localStorage
   - Se não existir, usa 'light' como padrão

2. **Ao Clicar no Botão**
   - `toggleTheme()` é chamado
   - Novo tema é definido no estado
   - localStorage é atualizado
   - Estilos CSS são aplicados ao documento
   - ConfigProvider re-renderiza com novo tema

3. **Recarregamento de Página**
   - localStorage é lido
   - Tema anterior é restaurado automaticamente

## 🎯 Próximos Passos (Opcional)

Se quiser expandir essa funcionalidade:

- [ ] Sincronizar com preferência do sistema operacional (`prefers-color-scheme`)
- [ ] Adicionar mais temas (não apenas light/dark)
- [ ] Salvar preferência no banco de dados do usuário
- [ ] Adicionar animação na transição
- [ ] Permitir customização de cores por tenant

## ✅ Testes

Para testar a funcionalidade:

1. Abra o Dashboard
2. Clique no ícone de sol/lua no canto superior direito
3. Verifique se o tema muda
4. Recarregue a página (`Cmd+R` no Mac)
5. Verifique se o tema anterior foi restaurado

## 📞 Suporte

Qualquer dúvida sobre a implementação, consulte:
- Hook: `apps/web/src/hooks/useTheme.ts`
- Layout: `apps/web/src/app/(dashboard)/layout.tsx`
- Estilos: `apps/web/src/input.css`

