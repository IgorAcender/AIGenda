# ✅ ATUALIZAÇÃO: Campos da Landing Page em Cores e Marca

## 📋 Resumo das Mudanças

O componente **`CoresMarcaTab.tsx`** foi completamente reorganizado para exibir os mesmos campos que aparecem na Landing Page, em 8 seções principais, conforme imagens do design.

---

## 🎨 Estrutura Implementada

### 1. **SOBRE NÓS**
- Campo: `about` (textarea)
- Toggle para ativar/desativar
- Descrição: "Texto que aparece na seção Sobre nós do site"

### 2. **PROFISSIONAIS**
- Botão: "Gerenciar Profissionais"
- Link para página de gerenciamento
- Descrição: "Exibe os membros da sua equipe no site"

### 3. **HORÁRIO DE FUNCIONAMENTO**
- Botão: "Configurar Horários"
- Link para página de configuração
- Descrição: "Exibe os horários de funcionamento no site"

### 4. **CONTATO**
- Campo: `phone` (telefone)
- Campo: `whatsapp` (número WhatsApp)
- Descrição para cada campo

### 5. **ENDEREÇO**
- Campo: `address` (endereço completo)
- Campo: `zipCode` (CEP)
- Campo: `district` (bairro)
- Campo: `city` (cidade)
- Campo: `state` (estado)
- Campo: `latitude` (coordenada)
- Campo: `longitude` (coordenada)
- Layout 3 colunas para bairro/cidade/estado
- Layout 2 colunas para lat/long

### 6. **REDES SOCIAIS**
- Campo: `instagram` (link completo com ícone 📸)
- Campo: `facebook` (link completo com ícone 👥)
- Descrição: "Link exibido na seção de redes sociais"

### 7. **FORMAS DE PAGAMENTO**
- Campo: `paymentMethods` (textarea com múltiplas linhas)
- Placeholder com exemplo: "PIX, Cartão de Crédito, Cartão de Débito, Dinheiro"
- Descrição: "Separe por vírgula ou uma por linha"

### 8. **COMODIDADES**
- Campo: `amenities` (textarea)
- Descrição: "Comodidades disponíveis no estabelecimento"

---

## 🔄 Dados Persistidos

Todos os campos são salvos no banco de dados via API:

**Endpoint**: `PUT /tenants/branding`

**Campos atualizados no payload**:
```typescript
{
  about: string
  address: string
  district: string (NEW)
  city: string
  state: string
  zipCode: string
  phone: string
  whatsapp: string (NEW)
  instagram: string
  facebook: string
  paymentMethods: string
  amenities: string
  latitude: number
  longitude: number
}
```

---

## 🎯 Novos Campos Adicionados

1. **`whatsapp`** - Número para botão de contato WhatsApp
2. **`district`** - Bairro da empresa

Ambos precisam ser adicionados à **migration Prisma** se ainda não existirem.

---

## 💾 Próximos Passos

1. ✅ Componente Frontend - CONCLUÍDO
2. ⏳ Adicionar campos ao Prisma (Migration):
   ```prisma
   whatsapp    String?
   district    String?
   ```

3. ⏳ Atualizar API para retornar esses campos

4. ⏳ Testar salvar e carregar dados

5. ⏳ Implementar botões de ação:
   - "Gerenciar Profissionais" → link para `/dashboard/professionals`
   - "Configurar Horários" → modal de edição

---

## 📱 Preview em Tempo Real

O preview do telefone continua mostrando a Landing Page ao vivo via iframe, atualizado com os dados preenchidos.

---

## 🎨 Design

- ✅ Cards individuais para cada seção (375px de altura variável)
- ✅ Toggle switches no topo de cada card
- ✅ Ícones descritivos (📸, 👥, 💳, etc)
- ✅ Descrições em cinza claro
- ✅ Botão "Salvar Configurações" no final
- ✅ Responsive (melhor em desktop + telefone)

---

## 🔗 Arquivo Alterado

`/apps/web/src/components/marketing/CoresMarcaTab.tsx`

**Tamanho**: ~467 linhas (reorganização completa)

---

**Data**: 30 de dezembro de 2025
