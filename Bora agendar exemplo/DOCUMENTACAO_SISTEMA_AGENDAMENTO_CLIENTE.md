# 📋 DOCUMENTAÇÃO COMPLETA - SISTEMA DE AGENDAMENTO PARA CLIENTE

## 🎯 Visão Geral

Este documento descreve a **arquitetura e implementação do sistema de agendamento** (booking system) do seu aplicativo. Use este guia para replicar a mesma funcionalidade em outro app.

---

## 📁 ESTRUTURA DE ARQUIVOS

### Modelos (Models)
```
src/scheduling/models.py
├── Booking (agendamentos do cliente)
├── Service (serviços oferecidos)
├── Professional (profissionais)
├── BookingPolicy (regras de cancelamento/reagendamento)
└── AvailabilityRule (regras de disponibilidade)
```

### Views - Lado do Cliente (Public)
```
src/scheduling/views/public.py
├── tenant_landing() - Página inicial do tenant
├── booking_start() - Formulário de agendamento (PASSO 1)
├── booking_confirm() - Confirmação de agendamento (PASSO 2)
├── booking_success() - Sucesso do agendamento (PASSO 3)
├── my_bookings_login() - Login para ver agendamentos
├── my_bookings() - Lista de agendamentos do cliente
├── cancel_booking() - Cancelar agendamento
├── reschedule_booking() - Reagendar agendamento
└── [APIs JSON] get_service_professionals(), get_available_slots()
```

### Templates - Lado do Cliente
```
src/templates/scheduling/public/
├── booking.html - Formulário de agendamento
├── booking_confirm.html - Confirmação
├── booking_success.html - Sucesso
├── my_bookings.html - Listagem de agendamentos
├── my_bookings_login.html - Login
└── reschedule_booking.html - Reagendamento
```

### Serviços
```
src/scheduling/services/
├── availability.py - Cálculo de slots disponíveis
└── notification_dispatcher.py - Envio de confirmações
```

---

## 🔄 FLUXO DE AGENDAMENTO (Cliente)

### 1️⃣ PASSO 1: Seleção do Serviço e Profissional
**Arquivo:** `src/templates/scheduling/public/booking.html`
**View:** `booking_start(request, tenant_slug)`
**URL:** `/agendar/{tenant_slug}/`

**Funcionalidades:**
- Carrega lista de **Serviços** (Services)
- Ao selecionar serviço → carrega **Profissionais** que o atendem
- Select com dropdown de serviços
- Busca/filtro de profissionais

**API utilizada:**
```
GET /agendar/{tenant_slug}/api/profissionais/
```

### 2️⃣ PASSO 2: Seleção de Data e Horário
**Arquivo:** `src/templates/scheduling/public/booking_confirm.html`
**View:** `booking_confirm(request, tenant_slug)`
**URL:** `/agendar/{tenant_slug}/confirmar/`

**Funcionalidades:**
- Calendário interativo (pode usar FullCalendar ou similar)
- Lista de **horários disponíveis** para a data selecionada
- Mostra slots de 30 minutos (configurável)
- Respeita regras de disponibilidade

**API utilizada:**
```
GET /agendar/{tenant_slug}/api/horarios/?
  service_id=X
  professional_id=Y
  date=2025-12-22
```

### 3️⃣ PASSO 3: Dados do Cliente e Confirmação
**Arquivo:** `src/templates/scheduling/public/booking_confirm.html` (continuação)
**View:** `booking_confirm(request, tenant_slug)` (POST)

**Campos:**
- Nome do cliente (`customer_name`)
- Telefone (`customer_phone`)
- Email (`customer_email`)
- Observações (`notes`)

**Salva em:** Modelo `Booking`

### 4️⃣ PASSO 4: Sucesso
**Arquivo:** `src/templates/scheduling/public/booking_success.html`
**View:** `booking_success(request, tenant_slug)`
**URL:** `/agendar/{tenant_slug}/sucesso/`

**Mostra:**
- Confirmação de agendamento
- Links: "Meus Agendamentos" e "Agendar Outro Horário"

---

## 👤 ÁREA DE MEUS AGENDAMENTOS (Cliente Logado)

### Login do Cliente
**Arquivo:** `src/templates/scheduling/public/my_bookings_login.html`
**View:** `my_bookings_login(request, tenant_slug)`
**URL:** `/agendar/{tenant_slug}/meus-agendamentos/login/`

**Autenticação:**
- Por telefone (não há login de usuário)
- Salva `customer_phone` na sessão
- Valida se existem agendamentos com esse telefone

### Lista de Agendamentos
**Arquivo:** `src/templates/scheduling/public/my_bookings.html`
**View:** `my_bookings(request, tenant_slug)`
**URL:** `/agendar/{tenant_slug}/meus-agendamentos/`

**Exibe:**
- Agendamentos futuros (pending/confirmed)
- Histórico (passados/cancelados)
- Status de cada agendamento
- Botões de ação (cancelar, reagendar)

### Cancelar Agendamento
**View:** `cancel_booking(request, tenant_slug, booking_id)` [POST]
**URL:** `/agendar/{tenant_slug}/agendamentos/{booking_id}/cancelar/`

**Validações:**
- Verificar `BookingPolicy.allow_cancellation`
- Verificar `BookingPolicy.min_cancellation_hours` (antecedência mínima)
- Verificar `BookingPolicy.max_cancellations` (limite de cancelamentos)

**Resposta:** JSON com sucesso/erro

### Reagendar Agendamento
**Arquivo:** `src/templates/scheduling/public/reschedule_booking.html`
**View:** `reschedule_booking(request, tenant_slug, booking_id)` [GET/POST]
**URL:** `/agendar/{tenant_slug}/agendamentos/{booking_id}/reagendar/`

**Fluxo:**
1. GET: Mostra formulário com calendário
2. POST: Processa novo agendamento
3. Valida `BookingPolicy.allow_rescheduling`
4. Verifica `BookingPolicy.min_reschedule_hours`

---

## 🏗️ MODELOS (DATABASE)

### Booking
```python
class Booking(models.Model):
    tenant = ForeignKey(Tenant)
    service = ForeignKey(Service)
    professional = ForeignKey(Professional, null=True)
    customer_name = CharField(max_length=150)
    customer_phone = CharField(max_length=32)
    customer_email = EmailField(blank=True)
    scheduled_for = DateTimeField()
    duration_minutes = PositiveIntegerField(default=30)
    price = DecimalField(max_digits=10, decimal_places=2)
    status = CharField(
        choices=['pending', 'confirmed', 'cancelled', 'no_show', 'completed'],
        default='pending'
    )
    notes = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### Service
```python
class Service(models.Model):
    tenant = ForeignKey(Tenant)
    name = CharField(max_length=200)
    description = TextField(blank=True)
    duration_minutes = PositiveIntegerField(default=30)
    price = DecimalField(max_digits=10, decimal_places=2)
    category = CharField(max_length=100, blank=True)
    is_active = BooleanField(default=True)
    professionals = ManyToManyField(Professional)
```

### Professional
```python
class Professional(models.Model):
    tenant = ForeignKey(Tenant)
    name = CharField(max_length=200)
    email = EmailField(blank=True)
    phone = CharField(max_length=32, blank=True)
    photo = ImageField(upload_to='professionals/', blank=True)
    bio = TextField(blank=True)
    is_active = BooleanField(default=True)
    allow_auto_assign = BooleanField(default=True)
```

### BookingPolicy
```python
class BookingPolicy(models.Model):
    tenant = OneToOneField(Tenant)
    
    # CANCELAMENTO
    allow_cancellation = BooleanField(default=True)
    min_cancellation_hours = PositiveIntegerField(default=4)
    max_cancellations = PositiveIntegerField(default=3)
    cancellation_period_days = PositiveIntegerField(default=30)
    require_cancellation_reason = BooleanField(default=False)
    
    # REAGENDAMENTO
    allow_rescheduling = BooleanField(default=True)
    min_reschedule_hours = PositiveIntegerField(default=2)
    max_reschedules_per_booking = PositiveIntegerField(default=2)
```

---

## 🔗 URLS (Rotas)

**Arquivo:** `src/scheduling/urls/public.py`

```python
urlpatterns = [
    # Landing & Booking
    path("<slug:tenant_slug>/", tenant_landing, name="tenant_landing"),
    path("agendar/<slug:tenant_slug>/", booking_start, name="booking_start"),
    path("agendar/<slug:tenant_slug>/confirmar/", booking_confirm, name="booking_confirm"),
    path("agendar/<slug:tenant_slug>/sucesso/", booking_success, name="booking_success"),
    
    # My Bookings
    path("agendar/<slug:tenant_slug>/meus-agendamentos/login/", my_bookings_login, name="my_bookings_login"),
    path("agendar/<slug:tenant_slug>/meus-agendamentos/", my_bookings, name="my_bookings"),
    path("agendar/<slug:tenant_slug>/meus-agendamentos/logout/", logout_bookings, name="logout_bookings"),
    
    # Actions
    path("agendar/<slug:tenant_slug>/agendamentos/<int:booking_id>/cancelar/", cancel_booking, name="cancel_booking"),
    path("agendar/<slug:tenant_slug>/agendamentos/<int:booking_id>/reagendar/", reschedule_booking, name="reschedule_booking"),
    
    # APIs
    path("agendar/<slug:tenant_slug>/api/profissionais/", get_service_professionals, name="get_service_professionals"),
    path("agendar/<slug:tenant_slug>/api/horarios/", get_available_slots, name="get_available_slots"),
    path("agendar/<slug:tenant_slug>/api/verificar-telefone/", check_phone, name="check_phone"),
]
```

---

## 🔌 APIs (JSON)

### 1. Obter Profissionais de um Serviço
```
GET /agendar/{tenant_slug}/api/profissionais/?service_id=1

Response:
{
  "professionals": [
    {
      "id": 1,
      "name": "Maria Silva",
      "photo": "url_foto",
      "allow_auto_assign": true
    }
  ]
}
```

### 2. Obter Horários Disponíveis
```
GET /agendar/{tenant_slug}/api/horarios/?
  service_id=1
  professional_id=1
  date=2025-12-22

Response:
{
  "available_slots": [
    "09:00",
    "09:30",
    "10:00",
    ...
  ],
  "professional_name": "Maria Silva"
}
```

### 3. Verificar Telefone
```
GET /agendar/{tenant_slug}/api/verificar-telefone/?phone=11999999999

Response:
{
  "exists": true,
  "bookings_count": 3
}
```

---

## 🎨 BRANDING & CUSTOMIZAÇÃO

### Cores do Tenant
**Modelo:** `BrandingSettings` (tenants/models.py)

Cada tenant pode ter cores personalizadas:
- `background_color`
- `text_color`
- `button_color_primary`
- `button_color_secondary`
- `button_text_color`

**Uso no template:**
```html
<style>
  :root {
    --bg-color: {{ tenant.branding_settings.background_color }};
    --text-color: {{ tenant.branding_settings.text_color }};
    --btn-primary: {{ tenant.branding_settings.button_color_primary }};
  }
</style>
```

---

## ⏰ DISPONIBILIDADE (CORE LOGIC)

**Arquivo:** `src/scheduling/services/availability.py`

**Classe:** `AvailabilityService`

**Método Principal:**
```python
def calculate_available_slots(
    service: Service,
    professional: Professional,
    date: date,
    duration_minutes: int = 30
) -> list[str]:
    """
    Retorna lista de horários disponíveis para um serviço/profissional em uma data
    
    Validações:
    1. Regras de disponibilidade (dias/horários de funcionamento)
    2. Agendamentos já existentes
    3. Buffer entre agendamentos
    """
```

**Regras Aplicadas:**
- Horário de funcionamento (ex: 09:00 - 18:00)
- Dias da semana abertos
- Agendamentos conflitantes
- Buffer (intervalo mínimo entre agendamentos)

---

## 📧 NOTIFICAÇÕES

**Arquivo:** `src/scheduling/services/notification_dispatcher.py`

**Funções:**
```python
def send_booking_confirmation(booking: Booking):
    # Envia email/whatsapp de confirmação

def send_reschedule_notification(booking: Booking, old_date: datetime):
    # Envia notificação de reagendamento

def send_cancellation_notification(booking: Booking):
    # Envia notificação de cancelamento
```

---

## 🔐 SEGURANÇA & ISOLAMENTO

### Multi-Tenant
Cada operação filtra por `tenant`:
```python
Booking.objects.filter(tenant=request.tenant)
```

### Autenticação Cliente
- Sem login de usuário
- Baseado em telefone (sessão)
- Validar `customer_phone` em operações sensíveis

---

## 📱 RESPONSIVIDADE

**Framework:** Tailwind CSS

**Breakpoints principais:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Arquivos CSS:**
```
src/static/css/tailwind.css
src/static/css/booking.css
```

---

## 🚀 CHECKLIST PARA IMPLEMENTAÇÃO EM OUTRO APP

- [ ] Criar modelos (Booking, Service, Professional, BookingPolicy)
- [ ] Criar views públicas (booking_start, booking_confirm, booking_success)
- [ ] Criar APIs JSON (get_available_slots, get_service_professionals)
- [ ] Criar service AvailabilityService
- [ ] Criar templates HTML/CSS
- [ ] Implementar sistema de notificações
- [ ] Adicionar regras de cancelamento/reagendamento
- [ ] Implementar autenticação por telefone
- [ ] Testes E2E do fluxo completo
- [ ] Personalização de branding

---

## 📞 CAMPOS OBRIGATÓRIOS POR ETAPA

### No Agendamento:
- `customer_name` ✓
- `customer_phone` ✓
- `service_id` ✓
- `professional_id` (se aplicável)
- `scheduled_for` ✓
- `duration_minutes` (padrão: 30)
- `price` (da service)

### Para Reagendamento:
- `scheduled_for` (nova data/hora)
- Validar se: permite reagendamento, tem antecedência, não excedeu limite

### Para Cancelamento:
- Validar se: permite cancelamento, tem antecedência, não excedeu limite
- Opcional: `cancellation_reason`

---

## 🛠️ VARIÁVEIS DE AMBIENTE

```
# Timezone (afeta cálculo de horários)
DJANGO_TIMEZONE=America/Sao_Paulo

# Email (para notificações)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha

# WhatsApp (se implementado)
WHATSAPP_API_KEY=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
```

---

## 📚 REFERÊNCIAS

- **Django Docs:** https://docs.djangoproject.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Timezone Handling:** https://docs.djangoproject.com/en/stable/topics/i18n/timezones/

---

Versão: 1.0 | Data: 2025-12-22 | App: BoraAgendar
