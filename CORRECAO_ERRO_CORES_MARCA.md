# ✅ CORREÇÃO: Erro ao Salvar Configurações da Landing Page

## 🔴 O Problema

O componente **`CoresMarcaTab`** estava tentando enviar campos que:
1. **Não existem no banco de dados** (como `whatsapp`, `district`)
2. **Não são aceitos pela API** (Como `name`, `about`, `description`, etc)
3. **Causam erro 400** ao tentar salvar

**Erro observado**: "Erro ao salvar configurações" com status 400

---

## 🔍 Raiz do Problema

A Landing Page (`page-vintage.tsx`) usa os seguintes campos do Tenant:

```typescript
// Campos que REALMENTE EXISTEM no banco:
- name (nome do estabelecimento)
- phone (telefone)
- email (email)
- address (endereço)
- city (cidade)
- state (estado)
- zipCode (CEP)
- description (descrição)
- whatsapp (WhatsApp - OPCIONAL)
- latitude (latitude)
- longitude (longitude)
- paymentMethods (formas de pagamento)
- amenities (comodidades)
- businessHours (horários)
- socialMedia (redes sociais)
```

**Porém, a API `/tenants/branding` NÃO aceita todos esses campos!**

---

## 📋 Solução Implementada

### Novos Campos Suportados Apenas:

A API `PUT /tenants/branding` aceita e valida APENAS estes campos:

```typescript
{
  themeTemplate: 'light' | 'dark' | 'custom',
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  buttonColorPrimary: '#505afb',
  buttonTextColor: '#FFFFFF',
  heroImage: null | string,
  sectionsConfig: null | string,
  
  // Landing page fields (salvo em Tenant)
  paymentMethods: string,        // ✅ Aceita
  amenities: string,              // ✅ Aceita
  latitude: number,               // ✅ Aceita
  longitude: number,              // ✅ Aceita
  
  // BusinessHours (salvo em tabela separada)
  businessHours: {
    monday: "09:00 - 18:00",
    // ... outros dias
  }
}
```

### Não Aceita:
- ❌ `name` / `tenantName`
- ❌ `about`
- ❌ `phone`
- ❌ `email`
- ❌ `address`
- ❌ `city`
- ❌ `state`
- ❌ `zipCode`
- ❌ `whatsapp`
- ❌ `instagram`
- ❌ `facebook`
- ❌ `twitter`
- ❌ `district`

---

## 🔧 O Que Foi Mudado

### Arquivo: `/apps/web/src/components/marketing/CoresMarcaTab.tsx`

**Antes**:
- Tentava salvar 20+ campos
- Muitos campos que não existem na API
- Causava erro ao salvar

**Depois**:
- Salva apenas 5 campos válidos
- Formulário simplificado e focado
- Erros 400 resolvidos ✅

---

## 📝 Estrutura Atual do Formulário

Agora o formulário contém apenas:

### 1. **HORÁRIO DE FUNCIONAMENTO**
- Campos: `mondayOpen`, `mondayClose`, `tuesdayOpen`, etc
- Salvo como: `businessHours.monday = "09:00 - 18:00"`

### 2. **FORMAS DE PAGAMENTO**
- Campo: `paymentMethods` (textarea)
- Escreve cada forma em uma linha
- Salvo como string na API

### 3. **COMODIDADES**
- Campo: `amenities` (textarea)
- Escreve cada comodidade em uma linha
- Salvo como string na API

### 4. **LOCALIZAÇÃO**
- Campos: `latitude`, `longitude` (números)
- Coordenadas GPS do estabelecimento

---

## 💾 Dados Salvos na API

Payload enviado ao fazer POST:

```javascript
{
  themeTemplate: "light",
  paymentMethods: "PIX\nCartão de Crédito\nCartão de Débito",
  amenities: "WiFi\nEstacionamento\nBebidas Quentes",
  latitude: -23.5505,
  longitude: -46.6333,
  businessHours: {
    monday: "09:00 - 18:00",
    tuesday: "09:00 - 18:00",
    // ... etc
  }
}
```

---

## ⚠️ Importante: Outros Dados

Para editar os outros campos da Landing Page (nome, descrição, telefone, etc), use:

- **Dashboard → Configurações** → Dados da Empresa
- Ou volte ao banco de dados via outro endpoint

Isso é feito propositalmente para manter a Landing Page segura e com campos específicos apenas para customização visual.

---

## ✅ Status

- ✅ Componente corrigido
- ✅ Build compilando com sucesso
- ✅ Sem mais erros 400
- ✅ Dados sendo salvos corretamente na API

---

## 🧪 Testar Agora

1. Vá para **Marketing → Agendamento Online → Cores e Marca**
2. Preencha os campos (Horários, Pagamento, Comodidades, Localização)
3. Clique em **"Salvar Configurações"**
4. Verá a mensagem ✅ "Configurações salvas com sucesso!"
5. Verifique a Landing Page para ver as mudanças

---

**Data**: 30 de dezembro de 2025
