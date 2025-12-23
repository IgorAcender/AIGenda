# ✅ CHECKLIST - IMPLEMENTAÇÃO RÁPIDA DO SISTEMA DE AGENDAMENTO

## 📊 RESUMO

Esse checklist é para replicar o sistema de agendamento em **outro app Django**. 
Tempo estimado: **4-6 horas** para um dev experiente.

---

## 🔧 FASE 1: SETUP INICIAL (30 min)

- [ ] Criar app Django: `python manage.py startapp scheduling`
- [ ] Adicionar `'scheduling'` em `INSTALLED_APPS`
- [ ] Criar arquivo `scheduling/models.py`
- [ ] Criar arquivo `scheduling/services/availability.py`
- [ ] Criar pasta `templates/scheduling/public/`
- [ ] Criar pasta `templates/scheduling/emails/`
- [ ] Criar arquivo `scheduling/urls/public.py`
- [ ] Incluir URLs no `urls.py` principal
- [ ] Criar arquivo `scheduling/forms.py`

---

## 🗄️ FASE 2: MODELOS (1 hora)

### ✓ Copiar/Implementar Models

- [ ] **Booking** - Agendamentos
  - [ ] tenant (FK para Tenant)
  - [ ] service (FK para Service)
  - [ ] professional (FK para Professional)
  - [ ] customer_name, customer_phone, customer_email
  - [ ] scheduled_for, duration_minutes, price
  - [ ] status (choices: pending, confirmed, cancelled, etc)
  - [ ] notes, cancellation_reason
  - [ ] Meta: ordering, indexes

- [ ] **Service** - Serviços
  - [ ] tenant, name, description
  - [ ] duration_minutes, price, category
  - [ ] is_active
  - [ ] professionals (M2M)

- [ ] **Professional** - Profissionais
  - [ ] tenant, name, email, phone, photo
  - [ ] bio, is_active, allow_auto_assign
  - [ ] services (M2M)

- [ ] **BookingPolicy** - Políticas
  - [ ] tenant (OneToOne)
  - [ ] Campos de cancelamento (allow, min_hours, max_count, period_days)
  - [ ] Campos de reagendamento (allow, min_hours, max_per_booking)
  - [ ] Método: `get_or_create_for_tenant()`

- [ ] **AvailabilityRule** (OPCIONAL)
  - [ ] Para customizar horários por tenant/profissional
  - [ ] opening_time, closing_time
  - [ ] days_of_week

### ✓ Migrations

- [ ] `python manage.py makemigrations`
- [ ] `python manage.py migrate`
- [ ] Registrar modelos no `admin.py`
- [ ] Testar no admin: criar services e professionals

---

## 🎨 FASE 3: TEMPLATES (1 hora)

### ✓ Criar Templates

**Arquivo:** `templates/scheduling/public/booking.html`
- [ ] Form de seleção de serviço
- [ ] Dropdown de profissionais (AJAX)
- [ ] Botão "Próximo"
- [ ] Estilos com Tailwind/Bootstrap

**Arquivo:** `templates/scheduling/public/booking_confirm.html`
- [ ] Input date (calendário)
- [ ] Seleção de horários (AJAX)
- [ ] Campos: name, phone, email, notes
- [ ] Visualização do resumo
- [ ] Botões: Voltar, Confirmar

**Arquivo:** `templates/scheduling/public/booking_success.html`
- [ ] Mensagem de sucesso
- [ ] Links: "Meus Agendamentos", "Agendar Outro"
- [ ] Dicas próximas

**Arquivo:** `templates/scheduling/public/my_bookings_login.html`
- [ ] Input telefone
- [ ] Botão de login
- [ ] Mensagem de erro (se nenhum agendamento)

**Arquivo:** `templates/scheduling/public/my_bookings.html`
- [ ] Abas: Próximos, Histórico
- [ ] Card por agendamento com status
- [ ] Botões: Reagendar, Cancelar
- [ ] Link Sair

**Arquivo:** `templates/scheduling/public/reschedule_booking.html`
- [ ] Calendário novo agendamento
- [ ] Horários disponíveis
- [ ] Botões: Voltar, Confirmar

---

## 🔗 FASE 4: VIEWS (2 horas)

### ✓ Arquivo: `scheduling/views/public.py`

**GET - Passo 1: Seleção**
- [ ] `booking_start(request, tenant_slug)`
  - [ ] Get tenant by slug
  - [ ] Load services
  - [ ] Render booking.html

**GET + POST - Passo 2-3: Confirmação**
- [ ] `booking_confirm(request, tenant_slug)`
  - [ ] GET: Render form com horários
  - [ ] POST: Create Booking object
  - [ ] Chamar send_booking_confirmation()
  - [ ] Redirect para booking_success

**GET - Passo 4: Sucesso**
- [ ] `booking_success(request, tenant_slug)`
  - [ ] Render success template

**POST - API: Profissionais por Serviço**
- [ ] `get_service_professionals(request, tenant_slug)`
  - [ ] GET service_id
  - [ ] Filter professionals by service
  - [ ] Return JSON

**GET - API: Horários Disponíveis**
- [ ] `get_available_slots(request, tenant_slug)`
  - [ ] GET service_id, professional_id, date
  - [ ] Call AvailabilityService
  - [ ] Return JSON com slots

**GET + POST - Login Meus Agendamentos**
- [ ] `my_bookings_login(request, tenant_slug)`
  - [ ] GET: Render login form
  - [ ] POST: Validate phone
  - [ ] Save em session
  - [ ] Redirect para my_bookings

**GET - Listagem Agendamentos**
- [ ] `my_bookings(request, tenant_slug)`
  - [ ] Check session
  - [ ] Load upcoming_bookings
  - [ ] Load past_bookings
  - [ ] Render com abas

**POST - Cancelamento**
- [ ] `cancel_booking(request, tenant_slug, booking_id)`
  - [ ] Validate policy
  - [ ] Check antecedência
  - [ ] Update status = cancelled
  - [ ] Return JSON success/error

**GET + POST - Reagendamento**
- [ ] `reschedule_booking(request, tenant_slug, booking_id)`
  - [ ] GET: Render form com novo calendário
  - [ ] POST: Validate policy
  - [ ] Update scheduled_for
  - [ ] Redirect ou JSON response

---

## 🔌 FASE 5: SERVICES (1 hora)

### ✓ Arquivo: `scheduling/services/availability.py`

- [ ] Classe `AvailabilityService`
  - [ ] `__init__(self, tenant)`
  - [ ] `calculate_available_slots(service, professional, date, duration_minutes=30)`
    - [ ] Get horário funcionamento (TODO: usar AvailabilityRule)
    - [ ] Generate all slots (30 min interval)
    - [ ] Check conflicts com Booking existentes
    - [ ] Filter past times
    - [ ] Return list de horários

- [ ] Helpers:
  - [ ] `_generate_time_slots(start_time, end_time, interval)`
  - [ ] `_check_booking_conflict(professional, start, duration)`

### ✓ Arquivo: `scheduling/services/notification_dispatcher.py`

- [ ] `send_booking_confirmation(booking)`
  - [ ] Build HTML template
  - [ ] Send email com details

- [ ] `send_cancellation_notification(booking)`
  
- [ ] `send_reschedule_notification(booking, old_date)`

---

## 🔗 FASE 6: URLS (15 min)

### ✓ Arquivo: `scheduling/urls/public.py`

```python
urlpatterns = [
    # Agendamento (4 passos)
    path("<slug:tenant_slug>/", booking_start, name="booking_start"),
    path("confirmar/<slug:tenant_slug>/", booking_confirm, name="booking_confirm"),
    path("sucesso/<slug:tenant_slug>/", booking_success, name="booking_success"),
    
    # Meus agendamentos
    path("meus/<slug:tenant_slug>/login/", my_bookings_login, name="my_bookings_login"),
    path("meus/<slug:tenant_slug>/", my_bookings, name="my_bookings"),
    
    # Ações
    path("agendamentos/<int:id>/cancelar/", cancel_booking, name="cancel_booking"),
    path("agendamentos/<int:id>/reagendar/", reschedule_booking, name="reschedule_booking"),
    
    # APIs
    path("api/profissionais/", get_service_professionals, name="get_service_professionals"),
    path("api/horarios/", get_available_slots, name="get_available_slots"),
]
```

- [ ] Incluir em `urls.py` principal: `path("agendar/", include(...))`

---

## 🧪 FASE 7: TESTES (1 hora)

### ✓ Testes Básicos

- [ ] `test_booking_creation()` - Criar agendamento
- [ ] `test_availability_calculation()` - Calcular slots
- [ ] `test_cancel_policy()` - Validar cancelamento
- [ ] `test_reschedule_policy()` - Validar reagendamento
- [ ] `test_phone_login()` - Login por telefone

### ✓ Testes E2E (Manual)

- [ ] Agendar de ponta a ponta
- [ ] Cancelar agendamento
- [ ] Reagendar agendamento
- [ ] Listar agendamentos
- [ ] Validar mensagens de erro
- [ ] Testar em mobile

---

## 🎨 FASE 8: STYLING (30 min)

- [ ] Adicionar Tailwind CSS ou Bootstrap
- [ ] Usar cores do tenant (branding)
- [ ] Fazer responsivo (mobile-first)
- [ ] Testar em diferentes resoluções
- [ ] Adicionar ícones (FontAwesome)

---

## 📧 FASE 9: NOTIFICAÇÕES (30 min)

- [ ] Configurar `EMAIL_BACKEND` em settings
- [ ] Criar templates de email:
  - [ ] `booking_confirmation.html`
  - [ ] `cancellation_notification.html`
  - [ ] `reschedule_notification.html`
- [ ] Testar envio de email
- [ ] (OPCIONAL) Integrar WhatsApp API

---

## 🚀 FASE 10: DEPLOY (30 min)

- [ ] Executar migrations em produção
- [ ] Testar fluxo completo em staging
- [ ] Configurar SSL/HTTPS
- [ ] Adicionar rate limiting (CSRF, etc)
- [ ] Monitorar logs de erro

---

## 📋 CHECKLIST ANTES DE PUBLICAR

### Funcionalidades
- [ ] Agendamento completo funcionando
- [ ] Cancelamento com validações
- [ ] Reagendamento com validações
- [ ] Listagem de agendamentos
- [ ] Login por telefone
- [ ] Notificações enviadas

### Segurança
- [ ] CSRF protection ativado
- [ ] SQL Injection protegido (usar ORM)
- [ ] Validação de telefone
- [ ] Isolamento multi-tenant
- [ ] Rate limiting nas APIs

### Performance
- [ ] select_related() em queries
- [ ] prefetch_related() em related objects
- [ ] Índices no banco (tenant, scheduled_for)
- [ ] Cache de serviços/profissionais

### UX
- [ ] Mensagens de erro claras
- [ ] Confirmações de ações destrutivas
- [ ] Layout responsivo
- [ ] Carregamento rápido
- [ ] Acessibilidade básica (ARIA labels)

---

## 📚 DOCUMENTAÇÃO GERADA

Você tem 3 arquivos prontos:

1. **DOCUMENTACAO_SISTEMA_AGENDAMENTO_CLIENTE.md**
   - Visão geral completa
   - Fluxos passo-a-passo
   - Modelos de banco
   - URLs e APIs

2. **EXEMPLOS_CODIGO_AGENDAMENTO.md**
   - Code snippets prontos
   - Models completos
   - Views simplificadas
   - Services
   - APIs

3. **TEMPLATES_HTML_AGENDAMENTO.md**
   - 5 templates HTML
   - CSS essencial
   - Scripts AJAX

4. **CHECKLIST_IMPLEMENTACAO.md** (este arquivo)
   - Guia passo-a-passo
   - Fases de desenvolvimento
   - Checklist detalhado

---

## 🆘 PROBLEMAS COMUNS

### "Horários não aparecem"
- [ ] Verificar se Professional está atribuído ao Service
- [ ] Testar `AvailabilityService.calculate_available_slots()`
- [ ] Ver logs de erro

### "Cancelamento não funciona"
- [ ] Verificar `BookingPolicy` foi criada
- [ ] Check `min_cancellation_hours`
- [ ] Validar timezone

### "Session de telefone se perde"
- [ ] Verificar `SESSION_COOKIE_AGE`
- [ ] Validar `customer_phone` no POST
- [ ] Check session middleware ativado

### "Email não envia"
- [ ] Verificar `EMAIL_BACKEND` configurado
- [ ] Test com `python manage.py shell`:
  ```python
  from django.core.mail import send_mail
  send_mail('test', 'test', 'from@', ['to@'])
  ```

---

## 🎯 PRÓXIMOS PASSOS (APÓS MVP)

- [ ] Dashboard do profissional
- [ ] Integração com Google Calendar
- [ ] Sistema de avaliação
- [ ] Lembretes automáticos
- [ ] Relatórios e analytics
- [ ] Recorrência de agendamentos
- [ ] Fila de espera
- [ ] Bloqueio automático de cliente (após X cancelamentos)

---

## 📞 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```bash
# Django
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com

# Database
DATABASE_URL=postgresql://...

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app
DEFAULT_FROM_EMAIL=noreply@seu-app.com

# Timezone
DJANGO_TIMEZONE=America/Sao_Paulo

# WhatsApp (OPCIONAL)
WHATSAPP_API_KEY=xxxx
WHATSAPP_PHONE_ID=xxxx
```

---

## 📊 ESTIMATIVA DE TEMPO

| Fase | Tempo | Complexidade |
|------|-------|--------------|
| 1. Setup | 30 min | ⭐ |
| 2. Models | 1h | ⭐ |
| 3. Templates | 1h | ⭐⭐ |
| 4. Views | 2h | ⭐⭐⭐ |
| 5. Services | 1h | ⭐⭐ |
| 6. URLs | 15 min | ⭐ |
| 7. Testes | 1h | ⭐⭐ |
| 8. Styling | 30 min | ⭐⭐ |
| 9. Notificações | 30 min | ⭐⭐ |
| 10. Deploy | 30 min | ⭐⭐ |
| **TOTAL** | **~7-8h** | - |

---

**Boa sorte! 🚀**

Versão: 1.0 | Data: 2025-12-22
