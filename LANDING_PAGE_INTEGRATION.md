# 🎯 Landing Page da Barbearia - Integração do Sistema de Agendamento

## Estrutura de Rotas

```
/[tenantSlug]                  ← Landing Page (você está aqui)
  ├─ Apresentação da barbearia
  ├─ Serviços oferecidos
  ├─ Contato e endereço
  └─ CTAs para /agendar/[tenantSlug]

/agendar/[tenantSlug]          ← Sistema de Agendamento
  ├─ PASSO 1: Seleção de serviço
  ├─ PASSO 2: Seleção de data/hora
  ├─ PASSO 3: Dados do cliente
  └─ PASSO 4: Confirmação
```

## 🌐 URLs da Barbearia

**Landing Page** (porta de entrada):
```
http://localhost:3001/barbearia-exemplo
```

**Sistema de Agendamento** (fluxo completo):
```
http://localhost:3001/agendar/barbearia-exemplo
```

## 📱 O que tem na Landing Page

✅ **Hero Section** - Banner principal com CTA destacado
✅ **Features** - 3 motivos para escolher a barbearia
✅ **Serviços** - Lista de todos os serviços com preços
✅ **Contato** - Endereço, telefone, horário
✅ **CTA Buttons** - Múltiplos botões para agendar
✅ **Responsive Design** - Mobile-friendly
✅ **Dark Theme** - Design moderno e profissional

## 🎨 Personalizações

Para customizar a landing page, edite:

```typescript
// apps/web/src/app/[tenantSlug]/page.tsx

// 1. Nome da barbearia
<span className="text-xl font-bold">Barbearia Exemplo</span>

// 2. Descrição
<p className="text-lg text-gray-300 leading-relaxed">
  Somos uma barbearia moderna...
</p>

// 3. Endereço
Rua Principal, 123
São Paulo, SP
CEP 01234-567

// 4. Telefone
(11) 98765-4321

// 5. Serviços
{
  name: 'Corte Padrão',
  price: 'R$ 35'
}

// 6. Horário
Seg-Sex: 09:00 - 18:00
```

## 🔗 Fluxo do Cliente

```
1. Cliente entra na landing page
   ↓
2. Vê os serviços e benefits
   ↓
3. Clica em "Agendar Agora"
   ↓
4. Vai para /agendar/barbearia-exemplo
   ↓
5. Passa pelos 4 passos do agendamento
   ↓
6. Recebe confirmação por email
```

## 📊 SEO & Meta Tags

Para adicionar SEO, edite o arquivo de layout:

```typescript
// apps/web/src/app/layout.tsx ou criar no [tenantSlug]

export const metadata = {
  title: 'Barbearia Exemplo - Agendamento Online',
  description: 'Agende seu corte de barba online. Profissionais experientes e atendimento de qualidade.',
  keywords: 'barbearia, corte, agendamento online, São Paulo',
};
```

## 🎯 Próximas Melhorias

- [ ] Adicionar Google Maps com localização
- [ ] Integrar avaliações do Google/Maps
- [ ] Adicionar carrossel de fotos
- [ ] WhatsApp integrado no botão de contato
- [ ] Depoimentos de clientes
- [ ] Blog de dicas de barba

## 📈 Analytics

Recomendado adicionar:
- Google Analytics
- Tracking de cliques em "Agendar Agora"
- Conversão do agendamento

```typescript
// Exemplo simples
const handleScheduleClick = () => {
  // Google Analytics
  gtag('event', 'schedule_click', {
    event_category: 'booking',
    event_label: tenantSlug,
  });
  
  router.push(`/agendar/${tenantSlug}`);
};
```

---

**Status**: ✅ Landing page pronta para produção
**URL**: http://localhost:3001/[tenantSlug]
**Exemplo**: http://localhost:3001/barbearia-exemplo
