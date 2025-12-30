# 🧪 Guia de Teste: Modo Escuro/Claro

## 📍 Localização do Botão

O botão está no **canto superior direito** do Dashboard, ao lado do sino de notificações.

```
HEADER DO DASHBOARD
┌────────────────────────────────────────────────────────┐
│ ☰ Menu │ Data e Hora │ [🌙/☀️] [🔔] [👤]            │
│                       ↑                                │
│                    NOVO BOTÃO                         │
└────────────────────────────────────────────────────────┘
```

## ✅ Checklist de Testes

### Teste 1: Alternância de Tema
- [ ] Abra o Dashboard
- [ ] Clique no ícone 🌙 (lua)
- [ ] Verifique se o tema muda para escuro
- [ ] Clique novamente no ícone ☀️ (sol)
- [ ] Verifique se o tema volta para claro

### Teste 2: Persistência
- [ ] Trocar o tema para escuro
- [ ] Recarregar a página (Cmd+R no Mac, Ctrl+R no Windows)
- [ ] Verifique se o tema escuro foi restaurado
- [ ] Trocar para claro
- [ ] Recarregar novamente
- [ ] Verifique se o tema claro foi restaurado

### Teste 3: Transição Suave
- [ ] Clique no botão de alternância
- [ ] Observe se a transição é suave (sem piscar)
- [ ] Verifique se a cor muda gradualmente

### Teste 4: Componentes Coloridos
Verifique se todos esses elementos mudam de cor:

#### Em Modo Claro
- [ ] Fundo: Branco ✓
- [ ] Texto: Preto ✓
- [ ] Cards: Cinza claro ✓
- [ ] Botões: Cores normais ✓
- [ ] Sidebar: Fundo branco ✓

#### Em Modo Escuro
- [ ] Fundo: Cinza muito escuro (#141414) ✓
- [ ] Texto: Cinza claro (#e6e6e6) ✓
- [ ] Cards: Cinza escuro ✓
- [ ] Botões: Legíveis no escuro ✓
- [ ] Sidebar: Fundo escuro ✓

### Teste 5: Tooltip
- [ ] Passe o mouse sobre o ícone 🌙/☀️
- [ ] Um tooltip deve aparecer com o texto:
  - "Modo escuro" (quando em modo claro)
  - "Modo claro" (quando em modo escuro)

### Teste 6: Diferentes Páginas
Teste a tema em diferentes páginas do dashboard:
- [ ] Dashboard home
- [ ] Agenda
- [ ] Cadastro de Clientes
- [ ] Painel Financeiro
- [ ] Configurações

### Teste 7: LocalStorage
Abra o DevTools do navegador:
1. Pressione `F12` ou `Cmd+Option+I`
2. Vá para aba "Application" ou "Storage"
3. Clique em "Local Storage"
4. Procure por `http://localhost:3000`
5. Deve ter uma chave `theme` com valor `'light'` ou `'dark'`

```
Key     | Value
--------|--------
theme   | dark
```

### Teste 8: Responsividade
- [ ] Teste em desktop (1920x1080)
- [ ] Teste em tablet (768px)
- [ ] Teste em mobile (375px)
- [ ] Botão deve estar acessível em todos os tamanhos

## 🎨 Verificação Visual

### Modo Claro Esperado
```
Fundo:    #ffffff (branco puro)
Texto:    #000000 (preto)
Card:     #fafafa (branco com toque de cinza)
Borda:    #f0f0f0 (cinza muito claro)
```

### Modo Escuro Esperado
```
Fundo:    #141414 (cinza muito escuro)
Texto:    #e6e6e6 (cinza claro)
Card:     #262626 (cinza escuro)
Borda:    #434343 (cinza médio)
```

## 🔧 Debugging

Se algo não funcionar:

### Problema: Botão não aparece
**Solução:**
```bash
# Verifique se o layout foi atualizado corretamente
grep -n "MoonOutlined\|SunOutlined" apps/web/src/app/\(dashboard\)/layout.tsx
```

### Problema: Tema não muda
**Solução:**
```bash
# Verifique o console do navegador (F12)
# Procure por erros de TypeScript
# Verifique se localStorage funciona
```

### Problema: Cores estranhas
**Solução:**
```bash
# Limpe o cache do navegador (Cmd+Shift+Delete)
# Limpe o localStorage manualmente:
localStorage.clear()
```

## 📊 Resultados Esperados

| Ação | Resultado Esperado |
|------|-------------------|
| Clique em 🌙 | Tema muda para escuro em 0.3s |
| Clique em ☀️ | Tema muda para claro em 0.3s |
| Recarregue página | Tema anterior é restaurado |
| Hover no ícone | Tooltip aparece |
| Abra DevTools | localStorage contém `theme: 'dark'` ou `'light'` |

## 🚀 Teste Automático (Opcional)

Se quiser testar via script:

```javascript
// Cole no console do navegador (F12)

// Teste 1: Verificar se hook existe
console.log('Verificando tema...')

// Teste 2: Alternar tema 5 vezes
for (let i = 0; i < 5; i++) {
  const btn = document.querySelector('[title*="Modo"]')
  if (btn) btn.click()
  console.log(`Click ${i + 1}`)
  await new Promise(r => setTimeout(r, 500))
}

// Teste 3: Verificar localStorage
console.log('Tema salvo:', localStorage.getItem('theme'))
```

## ✨ Checklist Final

- [ ] Botão visível no dashboard
- [ ] Ícone muda entre 🌙 e ☀️
- [ ] Tema muda ao clicar
- [ ] Cores aparecem corretamente
- [ ] Transição é suave
- [ ] Tema persiste após reload
- [ ] localStorage atualiza
- [ ] Funciona em mobile
- [ ] Sem erros no console
- [ ] Tooltip funciona

## 📞 Relatório de Teste

Após completar os testes, você pode documentar:

```markdown
## Teste de Modo Escuro - [DATA]

### Status: ✅ APROVADO / ❌ FALHOU

### Testes Realizados:
- [x] Alternância funciona
- [x] Persistência funciona
- [x] Cores corretas
- etc...

### Problemas Encontrados:
- Nenhum

### Observações:
Funciona perfeitamente em todos os navegadores testados.
```

---

**Última Atualização**: 30 de dezembro de 2025
**Versão**: 1.0

