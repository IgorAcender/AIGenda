# 💻 EXEMPLOS DE CÓDIGO - SISTEMA DE AGENDAMENTO

## 1️⃣ MODELOS (Models)

### models.py - Estrutura básica

```python
from django.db import models
from django.utils import timezone
from tenants.models import Tenant

class Service(models.Model):
    """Serviços oferecidos"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Serviço"
        verbose_name_plural = "Serviços"
    
    def __str__(self):
        return f"{self.name} ({self.duration_minutes}min - R${self.price})"

class Professional(models.Model):
    """Profissionais que executam os serviços"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="professionals")
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=32, blank=True)
    photo = models.ImageField(upload_to='professionals/', blank=True, null=True)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    allow_auto_assign = models.BooleanField(default=True)
    services = models.ManyToManyField(Service, related_name="professionals", blank=True)
    
    class Meta:
        verbose_name = "Profissional"
        verbose_name_plural = "Profissionais"
    
    def __str__(self):
        return self.name

class Booking(models.Model):
    """Agendamentos do cliente"""
    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        CONFIRMED = "confirmed", "Confirmado"
        CANCELLED = "cancelled", "Cancelado"
        NO_SHOW = "no_show", "Não compareceu"
        COMPLETED = "completed", "Concluído"
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="bookings")
    service = models.ForeignKey(Service, on_delete=models.PROTECT, related_name="bookings")
    professional = models.ForeignKey(Professional, on_delete=models.PROTECT, related_name="bookings", null=True, blank=True)
    
    # Dados do cliente
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=32)
    customer_email = models.EmailField(blank=True)
    
    # Agendamento
    scheduled_for = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status e observações
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Agendamento"
        verbose_name_plural = "Agendamentos"
        ordering = ("-scheduled_for",)
        indexes = [
            models.Index(fields=("tenant", "scheduled_for")),
            models.Index(fields=("customer_phone", "tenant")),
        ]
    
    def __str__(self):
        return f"{self.customer_name} - {self.service.name} ({self.scheduled_for:%d/%m %H:%M})"
    
    def can_cancel(self, policy) -> bool:
        """Verifica se pode cancelar baseado na política"""
        if self.status == 'cancelled':
            return False
        
        time_until_booking = self.scheduled_for - timezone.now()
        hours_until = time_until_booking.total_seconds() / 3600
        
        return hours_until >= policy.min_cancellation_hours
    
    def can_reschedule(self, policy) -> bool:
        """Verifica se pode reagendar"""
        if self.status == 'cancelled':
            return False
        
        time_until_booking = self.scheduled_for - timezone.now()
        hours_until = time_until_booking.total_seconds() / 3600
        
        return hours_until >= policy.min_reschedule_hours

class BookingPolicy(models.Model):
    """Políticas de cancelamento e reagendamento"""
    tenant = models.OneToOneField(Tenant, on_delete=models.CASCADE, related_name='booking_policy')
    
    # Cancelamento
    allow_cancellation = models.BooleanField(default=True)
    min_cancellation_hours = models.PositiveIntegerField(default=4)
    max_cancellations = models.PositiveIntegerField(default=3)
    cancellation_period_days = models.PositiveIntegerField(default=30)
    require_cancellation_reason = models.BooleanField(default=False)
    
    # Reagendamento
    allow_rescheduling = models.BooleanField(default=True)
    min_reschedule_hours = models.PositiveIntegerField(default=2)
    max_reschedules_per_booking = models.PositiveIntegerField(default=2)
    
    class Meta:
        verbose_name = "Política de Agendamento"
    
    @classmethod
    def get_or_create_for_tenant(cls, tenant):
        """Obtém ou cria política padrão para tenant"""
        policy, created = cls.objects.get_or_create(tenant=tenant)
        return policy
```

---

## 2️⃣ VIEWS - PASSO A PASSO DO AGENDAMENTO

### views/public.py - Exemplo simplificado

```python
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from zoneinfo import ZoneInfo
import json

from tenants.models import Tenant
from scheduling.models import Booking, Service, Professional, BookingPolicy
from scheduling.services.availability import AvailabilityService

@require_http_methods(["GET"])
def booking_start(request, tenant_slug):
    """
    PASSO 1: Seleção de serviço e profissional
    GET /agendar/{tenant_slug}/
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
    request.tenant = tenant
    
    # Obter serviços ativos
    services = Service.objects.filter(
        tenant=tenant,
        is_active=True
    ).prefetch_related('professionals')
    
    # Branding do tenant
    branding = getattr(tenant, 'branding_settings', None)
    
    return render(request, 'scheduling/public/booking.html', {
        'tenant': tenant,
        'services': services,
        'branding': branding,
    })

@require_http_methods(["GET", "POST"])
def booking_confirm(request, tenant_slug):
    """
    PASSO 2 & 3: Seleção de data/hora + dados do cliente
    GET /agendar/{tenant_slug}/confirmar/
    POST /agendar/{tenant_slug}/confirmar/
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
    request.tenant = tenant
    
    if request.method == "GET":
        # Obter parâmetros
        service_id = request.GET.get("service")
        professional_id = request.GET.get("professional")
        date_str = request.GET.get("date")
        time_str = request.GET.get("time")
        
        if not all([service_id, professional_id]):
            return redirect('public:booking_start', tenant_slug=tenant.slug)
        
        service = get_object_or_404(Service, id=service_id, tenant=tenant)
        professional = get_object_or_404(Professional, id=professional_id, tenant=tenant)
        
        # Obter horários disponíveis
        availability_service = AvailabilityService(tenant)
        available_slots = availability_service.calculate_available_slots(
            service=service,
            professional=professional,
            date=timezone.now().date()
        )
        
        return render(request, 'scheduling/public/booking_confirm.html', {
            'tenant': tenant,
            'service': service,
            'professional': professional,
            'available_slots': available_slots,
        })
    
    else:  # POST
        # Processar agendamento
        service_id = request.POST.get('service')
        professional_id = request.POST.get('professional')
        scheduled_for_str = request.POST.get('scheduled_for')
        customer_name = request.POST.get('customer_name')
        customer_phone = request.POST.get('customer_phone')
        customer_email = request.POST.get('customer_email', '')
        notes = request.POST.get('notes', '')
        
        try:
            service = Service.objects.get(id=service_id, tenant=tenant)
            professional = Professional.objects.get(id=professional_id, tenant=tenant)
            
            # Parse datetime
            tz = ZoneInfo(tenant.timezone)
            scheduled_for = timezone.datetime.fromisoformat(scheduled_for_str).replace(tzinfo=tz)
            
            # Criar agendamento
            booking = Booking.objects.create(
                tenant=tenant,
                service=service,
                professional=professional,
                customer_name=customer_name,
                customer_phone=customer_phone,
                customer_email=customer_email,
                scheduled_for=scheduled_for,
                duration_minutes=service.duration_minutes,
                price=service.price,
                notes=notes,
                status=Booking.Status.PENDING
            )
            
            # Enviar notificação (implementar)
            # send_booking_confirmation(booking)
            
            return redirect('public:booking_success', tenant_slug=tenant.slug)
        
        except Exception as e:
            print(f"Erro ao criar booking: {e}")
            return redirect('public:booking_start', tenant_slug=tenant.slug)

@require_http_methods(["GET"])
def booking_success(request, tenant_slug):
    """
    PASSO 4: Sucesso do agendamento
    GET /agendar/{tenant_slug}/sucesso/
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug, is_active=True)
    
    return render(request, 'scheduling/public/booking_success.html', {
        'tenant': tenant,
    })

@require_http_methods(["POST"])
def cancel_booking(request, tenant_slug, booking_id):
    """
    Cancelar agendamento
    POST /agendar/{tenant_slug}/agendamentos/{booking_id}/cancelar/
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug)
    customer_phone = request.session.get('customer_phone')
    
    if not customer_phone:
        return JsonResponse({'success': False, 'error': 'Não autenticado'}, status=401)
    
    booking = get_object_or_404(
        Booking,
        id=booking_id,
        tenant=tenant,
        customer_phone__icontains=customer_phone[-8:]
    )
    
    # Verificar política
    policy = BookingPolicy.get_or_create_for_tenant(tenant)
    
    if not policy.allow_cancellation:
        return JsonResponse({
            'success': False,
            'error': 'Cancelamento não permitido'
        }, status=400)
    
    if not booking.can_cancel(policy):
        hours_needed = policy.min_cancellation_hours
        return JsonResponse({
            'success': False,
            'error': f'Cancelamento deve ser feito com {hours_needed} horas de antecedência'
        }, status=400)
    
    # Cancelar
    booking.status = Booking.Status.CANCELLED
    booking.cancellation_reason = request.POST.get('reason', '')
    booking.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Agendamento cancelado com sucesso'
    })

@require_http_methods(["POST"])
def reschedule_booking(request, tenant_slug, booking_id):
    """
    Reagendar agendamento
    POST /agendar/{tenant_slug}/agendamentos/{booking_id}/reagendar/
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug)
    customer_phone = request.session.get('customer_phone')
    
    if not customer_phone:
        return JsonResponse({'success': False, 'error': 'Não autenticado'}, status=401)
    
    booking = get_object_or_404(
        Booking,
        id=booking_id,
        tenant=tenant,
        customer_phone__icontains=customer_phone[-8:]
    )
    
    policy = BookingPolicy.get_or_create_for_tenant(tenant)
    
    if not policy.allow_rescheduling:
        return JsonResponse({'success': False, 'error': 'Reagendamento não permitido'}, status=400)
    
    if not booking.can_reschedule(policy):
        hours_needed = policy.min_reschedule_hours
        return JsonResponse({
            'success': False,
            'error': f'Reagendamento deve ser feito com {hours_needed} horas de antecedência'
        }, status=400)
    
    # Novo agendamento
    new_scheduled_for_str = request.POST.get('new_scheduled_for')
    tz = ZoneInfo(tenant.timezone)
    new_scheduled_for = timezone.datetime.fromisoformat(new_scheduled_for_str).replace(tzinfo=tz)
    
    booking.scheduled_for = new_scheduled_for
    booking.save()
    
    return JsonResponse({
        'success': True,
        'message': 'Agendamento reagendado com sucesso',
        'new_date': new_scheduled_for.strftime('%d/%m/%Y %H:%M')
    })
```

---

## 3️⃣ APIs (JSON Endpoints)

```python
@require_http_methods(["GET"])
def get_service_professionals(request, tenant_slug):
    """
    Retorna profissionais que atendem um serviço
    GET /agendar/{tenant_slug}/api/profissionais/?service_id=1
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug)
    service_id = request.GET.get('service_id')
    
    if not service_id:
        return JsonResponse({'error': 'service_id obrigatório'}, status=400)
    
    service = get_object_or_404(Service, id=service_id, tenant=tenant)
    
    professionals = service.professionals.filter(is_active=True).values(
        'id', 'name', 'photo', 'allow_auto_assign'
    )
    
    return JsonResponse({
        'professionals': list(professionals)
    })

@require_http_methods(["GET"])
def get_available_slots(request, tenant_slug):
    """
    Retorna horários disponíveis
    GET /agendar/{tenant_slug}/api/horarios/?
        service_id=1&professional_id=1&date=2025-12-22
    """
    tenant = get_object_or_404(Tenant, slug=tenant_slug)
    service_id = request.GET.get('service_id')
    professional_id = request.GET.get('professional_id')
    date_str = request.GET.get('date')
    
    if not all([service_id, professional_id, date_str]):
        return JsonResponse({'error': 'Parâmetros faltando'}, status=400)
    
    service = get_object_or_404(Service, id=service_id, tenant=tenant)
    professional = get_object_or_404(Professional, id=professional_id, tenant=tenant)
    
    from datetime import datetime
    date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    # Calcular slots disponíveis
    availability_service = AvailabilityService(tenant)
    available_slots = availability_service.calculate_available_slots(
        service=service,
        professional=professional,
        date=date
    )
    
    return JsonResponse({
        'available_slots': available_slots,
        'professional_name': professional.name,
        'service_name': service.name,
    })
```

---

## 4️⃣ SERVIÇO - CÁLCULO DE DISPONIBILIDADE

```python
# src/scheduling/services/availability.py

from datetime import datetime, timedelta, time
from zoneinfo import ZoneInfo
from django.utils import timezone

class AvailabilityService:
    """Calcula horários disponíveis para agendamento"""
    
    def __init__(self, tenant):
        self.tenant = tenant
        self.tz = ZoneInfo(tenant.timezone)
    
    def calculate_available_slots(self, service, professional, date, duration_minutes=None):
        """
        Retorna lista de horários disponíveis para uma data
        
        Args:
            service: Serviço
            professional: Profissional
            date: Data (date object)
            duration_minutes: Duração em minutos (padrão: service.duration_minutes)
        
        Returns:
            list: Lista de horários em formato "HH:MM"
        """
        if duration_minutes is None:
            duration_minutes = service.duration_minutes
        
        # 1. Obter horários de funcionamento
        opening_time = time(9, 0)  # 09:00
        closing_time = time(18, 0)  # 18:00
        # TODO: Implementar AvailabilityRule para customizar por tenant
        
        # 2. Gerar todos os slots possíveis (intervalo de 30 min)
        all_slots = self._generate_time_slots(opening_time, closing_time, 30)
        
        # 3. Filtrar slots com conflitos
        available_slots = []
        
        for slot_time in all_slots:
            # Criar datetime para verificação
            slot_datetime = datetime.combine(date, slot_time)
            slot_datetime = slot_datetime.replace(tzinfo=self.tz)
            
            # Pular se já passou
            if slot_datetime < timezone.now():
                continue
            
            # Verificar se tem conflito
            conflict = self._check_booking_conflict(
                professional=professional,
                start_time=slot_datetime,
                duration_minutes=duration_minutes
            )
            
            if not conflict:
                available_slots.append(slot_time.strftime('%H:%M'))
        
        return available_slots
    
    def _generate_time_slots(self, start_time, end_time, interval_minutes=30):
        """Gera lista de horários entre start_time e end_time"""
        slots = []
        current = datetime.combine(datetime.today(), start_time)
        end = datetime.combine(datetime.today(), end_time)
        
        while current < end:
            slots.append(current.time())
            current += timedelta(minutes=interval_minutes)
        
        return slots
    
    def _check_booking_conflict(self, professional, start_time, duration_minutes):
        """Verifica se há agendamento conflitante"""
        from scheduling.models import Booking
        
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Buscar bookings que se sobrepõem
        conflict = Booking.objects.filter(
            professional=professional,
            tenant=self.tenant,
            status__in=['pending', 'confirmed'],
            scheduled_for__lt=end_time,
            scheduled_for__gte=start_time - timedelta(minutes=duration_minutes)
        ).exists()
        
        return conflict
```

---

## 5️⃣ NOTIFICAÇÕES (Email/WhatsApp)

```python
# src/scheduling/services/notification_dispatcher.py

from django.core.mail import send_mail
from django.template.loader import render_to_string

def send_booking_confirmation(booking):
    """Envia confirmação de agendamento para o cliente"""
    
    context = {
        'customer_name': booking.customer_name,
        'service_name': booking.service.name,
        'professional_name': booking.professional.name,
        'scheduled_for': booking.scheduled_for.strftime('%d/%m/%Y às %H:%M'),
        'tenant_name': booking.tenant.name,
    }
    
    subject = f"Agendamento confirmado - {booking.tenant.name}"
    
    # Usar template HTML
    html_message = render_to_string('scheduling/emails/booking_confirmation.html', context)
    
    send_mail(
        subject,
        f"Seu agendamento foi confirmado para {context['scheduled_for']}",
        'noreply@boraagendar.com',
        [booking.customer_email],
        html_message=html_message,
        fail_silently=False,
    )
    
    print(f"Email de confirmação enviado para {booking.customer_email}")

def send_cancellation_notification(booking):
    """Envia notificação de cancelamento"""
    context = {
        'customer_name': booking.customer_name,
        'service_name': booking.service.name,
        'scheduled_for': booking.scheduled_for.strftime('%d/%m/%Y às %H:%M'),
    }
    
    subject = f"Agendamento cancelado - {booking.tenant.name}"
    html_message = render_to_string('scheduling/emails/cancellation_notification.html', context)
    
    send_mail(
        subject,
        "Seu agendamento foi cancelado",
        'noreply@boraagendar.com',
        [booking.customer_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_reschedule_notification(booking, old_date):
    """Envia notificação de reagendamento"""
    context = {
        'customer_name': booking.customer_name,
        'service_name': booking.service.name,
        'old_date': old_date.strftime('%d/%m/%Y às %H:%M'),
        'new_date': booking.scheduled_for.strftime('%d/%m/%Y às %H:%M'),
    }
    
    subject = f"Agendamento reagendado - {booking.tenant.name}"
    html_message = render_to_string('scheduling/emails/reschedule_notification.html', context)
    
    send_mail(
        subject,
        f"Seu agendamento foi reagendado para {context['new_date']}",
        'noreply@boraagendar.com',
        [booking.customer_email],
        html_message=html_message,
        fail_silently=False,
    )
```

---

## 6️⃣ URLS Configuration

```python
# src/scheduling/urls/public.py

from django.urls import path
from . import public_views

app_name = "public"

urlpatterns = [
    # Agendamento (4 passos)
    path("<slug:tenant_slug>/", public_views.booking_start, name="booking_start"),
    path("agendar/<slug:tenant_slug>/confirmar/", public_views.booking_confirm, name="booking_confirm"),
    path("agendar/<slug:tenant_slug>/sucesso/", public_views.booking_success, name="booking_success"),
    
    # Meus agendamentos
    path("agendar/<slug:tenant_slug>/meus-agendamentos/login/", public_views.my_bookings_login, name="my_bookings_login"),
    path("agendar/<slug:tenant_slug>/meus-agendamentos/", public_views.my_bookings, name="my_bookings"),
    
    # Ações
    path("agendar/<slug:tenant_slug>/agendamentos/<int:booking_id>/cancelar/", public_views.cancel_booking, name="cancel_booking"),
    path("agendar/<slug:tenant_slug>/agendamentos/<int:booking_id>/reagendar/", public_views.reschedule_booking, name="reschedule_booking"),
    
    # APIs
    path("agendar/<slug:tenant_slug>/api/profissionais/", public_views.get_service_professionals, name="get_service_professionals"),
    path("agendar/<slug:tenant_slug>/api/horarios/", public_views.get_available_slots, name="get_available_slots"),
]
```

---

Versão: 1.0 | Data: 2025-12-22
