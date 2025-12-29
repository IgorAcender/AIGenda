# 🚀 Auto Commit & Push - Guia de Uso

## 📌 O que é?

Um script que automatiza o processo de **commit e push** dos arquivos alterados no repositório.

---

## 🎯 Como usar?

### Opção 1: Executar o script diretamente

```bash
cd /Users/user/Desktop/Programação/AIGenda
./auto-commit-push.sh
```

### Opção 2: Criar um alias (RECOMENDADO)

Adicione esta linha ao seu arquivo `~/.zshrc`:

```bash
alias acp='cd /Users/user/Desktop/Programação/AIGenda && ./auto-commit-push.sh'
```

Depois execute:
```bash
source ~/.zshrc
```

Pronto! Agora você pode usar apenas:
```bash
acp
```

### Opção 3: Adicionar ao seu ~/.zshrc de forma automática

```bash
echo "alias acp='cd /Users/user/Desktop/Programação/AIGenda && ./auto-commit-push.sh'" >> ~/.zshrc
source ~/.zshrc
```

---

## 📊 O que o script faz?

✅ Verifica se há mudanças  
✅ Mostra as mudanças detectadas  
✅ Adiciona todos os arquivos (`git add -A`)  
✅ Cria um commit com timestamp automático  
✅ Faz push para a branch atual  
✅ Mostra um resumo final  
✅ Exibe o último commit realizado  

---

## 📝 Exemplos

### Quando você tem mudanças

```
═══════════════════════════════════════════
  AUTO COMMIT & PUSH
═══════════════════════════════════════════

📝 Mudanças detectadas:
 M apps/web/src/components/ClientFormModal.tsx
 M VISUAL_MODAL_CLIENTE_SLIDEOUT.md

➕ Adicionando arquivos...
✓ Arquivos adicionados

📊 Estatísticas:
   • Branch: main
   • Arquivos: 2
   • Mensagem: 🤖 Auto-sync: 29/12/2025 às 14:30:45

💾 Fazendo commit...
✓ Commit realizado

🚀 Enviando para o repositório remoto...
✓ Push realizado com sucesso

═══════════════════════════════════════════
✓ Sincronização concluída!
═══════════════════════════════════════════

📋 Último commit:
abc1234 🤖 Auto-sync: 29/12/2025 às 14:30:45
```

### Quando não há mudanças

```
═══════════════════════════════════════════
  AUTO COMMIT & PUSH
═══════════════════════════════════════════
✓ Nenhuma mudança para sincronizar
```

---

## ⚙️ Configuração adicional

### Adicionar git credentials (se necessário)

Se o git pedir senha toda vez, configure assim:

```bash
# Opção 1: SSH (Recomendado)
ssh-keygen -t ed25519 -C "seu@email.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Opção 2: Token pessoal (GitHub)
git remote set-url origin https://seu-usuario:seu-token@github.com/IgorAcender/AIGenda.git
```

### Verificar configuração

```bash
git config --global user.name
git config --global user.email
git config --list | grep user
```

---

## 🔄 Fluxo de Trabalho Recomendado

1. **Faça suas alterações** no código
2. **Execute o script**:
   ```bash
   acp
   ```
3. **Pronto!** Suas mudanças já estão no repositório remoto

---

## 🛠️ Troubleshooting

### Erro: "Permission denied"

```bash
chmod +x /Users/user/Desktop/Programação/AIGenda/auto-commit-push.sh
```

### Erro: "fatal: not a git repository"

```bash
cd /Users/user/Desktop/Programação/AIGenda
git init
```

### Erro: "fatal: could not read Username"

Configure SSH ou use token:
```bash
# SSH
git remote set-url origin git@github.com:IgorAcender/AIGenda.git

# Ou HTTP com token
git config credential.helper store
git push origin main
# Cole seu token quando pedir
```

---

## 📋 Mensagem de Commit

O script usa:
```
🤖 Auto-sync: [DATA] às [HORA]
Sincronização automática dos arquivos alterados
```

Se quiser customizar, edite a linha no script:
```bash
COMMIT_MESSAGE="🤖 Auto-sync: $TIMESTAMP"
```

---

## ✨ Dicas

- Use `acp` após cada grande alteração no código
- O script verifica automaticamente se há mudanças antes de fazer commit
- Se não houver mudanças, o script finaliza sem fazer nada
- Sempre mostra um resumo das operações realizadas

---

**Script criado**: 29/12/2025  
**Versão**: 1.0  
**Status**: ✅ Pronto para usar
