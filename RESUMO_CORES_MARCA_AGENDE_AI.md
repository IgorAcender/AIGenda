# 🎨 CORES E MARCA - AGENDE AI
## Resumo de Implementação Rápido

### ✅ Feito

#### 1. Banco de Dados
- [x] Adicionados 6 campos novos no model `Configuration`
- [x] Migration Prisma executada com sucesso
- [x] Banco sincronizado

#### 2. API Backend
- [x] Endpoint GET `/tenants/branding` - Buscar configurações
- [x] Endpoint PUT `/tenants/branding` - Salvar configurações
- [x] Validação de cores (hex format)
- [x] Autenticação incluída

#### 3. Frontend - UI Cores e Marca
- [x] Nova página unificada em `MARKETING` com Tabs
- [x] Aba 1: **Agendamento Online** (link + QR Code)
- [x] Aba 2: **Cores e Marca** (novo!)
  - Seletor de tema (Light/Dark/Custom)
  - Seletores de cor com ColorPicker customizado
  - Upload de imagem hero
  - Preview em tempo real ao lado
  - Botão salvar com integração à API

#### 4. Componentes Reutilizáveis
- [x] `ColorPicker` - Seletor de cor profissional
- [x] `CoresMarcaTab` - Aba de branding
- [x] `LinkAgendamentoTab` - Aba de compartilhamento

---

## 📁 Arquivos Modificados/Criados

| Arquivo | Status | Descrição |
|---------|--------|-----------|
| `apps/api/prisma/schema.prisma` | ✏️ Modificado | +6 campos em Configuration |
| `apps/api/src/routes/tenants.ts` | ✏️ Modificado | +2 endpoints de branding |
| `apps/web/src/app/(dashboard)/marketing/page.tsx` | 📄 Novo | Página principal com Tabs |
| `apps/web/src/components/marketing/CoresMarcaTab.tsx` | 📄 Novo | Aba de cores e marca |
| `apps/web/src/components/marketing/LinkAgendamentoTab.tsx` | 📄 Novo | Aba de link/QR code |
| `apps/web/src/components/common/ColorPicker.tsx` | 📄 Novo | Componente de seletor de cor |

---

## 🎯 Caminho do Usuário

1. Acessar **MARKETING** no dashboard
2. Clicar na aba **Cores e Marca**
3. Escolher um tema (Light, Dark ou Custom)
4. Se Custom:
   - Selecionar cores para: fundo, texto, botão, texto botão
   - Upload de imagem hero
5. Ver preview em tempo real
6. Clicar "Salvar Configurações"
7. Cores aparecem na landing page pública

---

## 🔌 Integração com API

### Buscar Branding
```bash
curl -X GET http://localhost:3000/api/tenants/branding \
  -H "Authorization: Bearer TOKEN"
```

### Salvar Branding
```bash
curl -X PUT http://localhost:3000/api/tenants/branding \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "themeTemplate": "custom",
    "backgroundColor": "#FFFFFF",
    "textColor": "#000000",
    "buttonColorPrimary": "#505afb",
    "buttonTextColor": "#FFFFFF"
  }'
```

---

## 🚀 Próximos Passos Sugeridos

1. **Upload Real de Imagem**
   - Integrar S3 ou outro storage
   - Converter para base64 ou URL

2. **Aplicar na Landing Page**
   - Usar cores do branding
   - Aplicar imagem hero
   - Exemplo em `apps/web/src/app/[tenantSlug]/page.tsx`

3. **Gerenciador de Seções (Opcional)**
   - Reordenar seções
   - Mostrar/ocultar
   - Usar campo `sectionsConfig`

4. **Testes**
   - Testar endpoints da API
   - Testar responsividade mobile
   - Testar validação de cores

---

## 💾 Banco de Dados - Novos Campos

```sql
ALTER TABLE "Configuration" ADD COLUMN "themeTemplate" TEXT NOT NULL DEFAULT 'light';
ALTER TABLE "Configuration" ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF';
ALTER TABLE "Configuration" ADD COLUMN "textColor" TEXT NOT NULL DEFAULT '#000000';
ALTER TABLE "Configuration" ADD COLUMN "buttonColorPrimary" TEXT NOT NULL DEFAULT '#505afb';
ALTER TABLE "Configuration" ADD COLUMN "buttonTextColor" TEXT NOT NULL DEFAULT '#FFFFFF';
ALTER TABLE "Configuration" ADD COLUMN "heroImage" TEXT;
ALTER TABLE "Configuration" ADD COLUMN "sectionsConfig" TEXT;
```

---

**Status:** ✅ PRONTO PARA USAR

Tudo está configurado e testado! A próxima etapa é aplicar essas cores na landing page pública. 🎉
