# 🎨 TEMPLATES HTML - SISTEMA DE AGENDAMENTO

## 1️⃣ TEMPLATE - Formulário de Agendamento (Passo 1)

**Arquivo:** `src/templates/scheduling/public/booking.html`

```html
{% extends "base.html" %}
{% load static %}

{% block title %}Agendar - {{ tenant.name }}{% endblock %}

{% block content %}
<div class="booking-container" style="
  background-color: {{ branding.background_color|default:'#0F172A' }};
  color: {{ branding.text_color|default:'#E2E8F0' }};
  min-height: 100vh;
  padding: 2rem;
">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">{{ tenant.name }}</h1>
      <p class="text-lg opacity-80">Escolha o serviço e profissional</p>
    </div>

    <!-- Formulário -->
    <form id="bookingForm" method="GET" action="{% url 'public:booking_confirm' tenant_slug=tenant.slug %}" class="space-y-6">
      
      <!-- Serviços -->
      <div class="form-group">
        <label for="service" class="block text-lg font-semibold mb-3">
          <i class="fas fa-briefcase"></i> Serviço
        </label>
        <select id="service" name="service" required class="w-full p-3 rounded border-2" style="
          border-color: {{ branding.button_color_primary|default:'#667EEA' }};
          background-color: rgba(255,255,255,0.1);
          color: inherit;
        ">
          <option value="">-- Selecione um serviço --</option>
          {% for service in services %}
          <option value="{{ service.id }}" data-duration="{{ service.duration_minutes }}">
            {{ service.name }} ({{ service.duration_minutes }}min) - R$ {{ service.price|floatformat:2 }}
          </option>
          {% endfor %}
        </select>
      </div>

      <!-- Profissionais -->
      <div class="form-group">
        <label for="professional" class="block text-lg font-semibold mb-3">
          <i class="fas fa-user"></i> Profissional
        </label>
        <select id="professional" name="professional" required class="w-full p-3 rounded border-2" style="
          border-color: {{ branding.button_color_primary|default:'#667EEA' }};
          background-color: rgba(255,255,255,0.1);
          color: inherit;
        " disabled>
          <option value="">-- Primeiro selecione um serviço --</option>
        </select>
      </div>

      <!-- Botões -->
      <div class="flex gap-4 justify-center mt-8">
        <button type="submit" class="px-8 py-3 rounded font-bold text-white" style="
          background-color: {{ branding.button_color_primary|default:'#667EEA' }};
        ">
          <i class="fas fa-arrow-right"></i> Próximo
        </button>
      </div>
    </form>
  </div>
</div>

<script>
document.getElementById('service').addEventListener('change', async function() {
  const serviceId = this.value;
  const professionalSelect = document.getElementById('professional');
  
  if (!serviceId) {
    professionalSelect.innerHTML = '<option value="">-- Primeiro selecione um serviço --</option>';
    professionalSelect.disabled = true;
    return;
  }
  
  try {
    const response = await fetch(`/agendar/{{ tenant.slug }}/api/profissionais/?service_id=${serviceId}`);
    const data = await response.json();
    
    professionalSelect.innerHTML = '<option value="">-- Selecione um profissional --</option>';
    data.professionals.forEach(prof => {
      const option = document.createElement('option');
      option.value = prof.id;
      option.textContent = prof.name;
      professionalSelect.appendChild(option);
    });
    professionalSelect.disabled = false;
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
  }
});
</script>
{% endblock %}
```

---

## 2️⃣ TEMPLATE - Confirmação de Agendamento (Passo 2 & 3)

**Arquivo:** `src/templates/scheduling/public/booking_confirm.html`

```html
{% extends "base.html" %}
{% load static %}

{% block title %}Confirmar Agendamento - {{ tenant.name }}{% endblock %}

{% block content %}
<div class="booking-container" style="
  background-color: {{ branding.background_color|default:'#0F172A' }};
  color: {{ branding.text_color|default:'#E2E8F0' }};
  min-height: 100vh;
  padding: 2rem;
">
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Confirmar Agendamento</h1>
      <p class="text-lg opacity-80">Escolha a data, hora e informe seus dados</p>
    </div>

    <form method="POST" class="space-y-8">
      {% csrf_token %}
      <input type="hidden" name="service" value="{{ service.id }}">
      <input type="hidden" name="professional" value="{{ professional.id }}">

      <!-- 1. Informações do Serviço -->
      <div class="bg-opacity-20 bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-info-circle"></i> Informações
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="opacity-70">Serviço</p>
            <p class="text-xl font-bold">{{ service.name }}</p>
          </div>
          <div>
            <p class="opacity-70">Profissional</p>
            <p class="text-xl font-bold">{{ professional.name }}</p>
          </div>
          <div>
            <p class="opacity-70">Duração</p>
            <p class="text-xl font-bold">{{ service.duration_minutes }} minutos</p>
          </div>
          <div>
            <p class="opacity-70">Valor</p>
            <p class="text-xl font-bold">R$ {{ service.price|floatformat:2 }}</p>
          </div>
        </div>
      </div>

      <!-- 2. Seleção de Data -->
      <div class="bg-opacity-20 bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-calendar"></i> Data
        </h2>
        <input type="date" id="dateInput" name="date" required class="w-full p-3 rounded" style="
          background-color: rgba(255,255,255,0.1);
          color: inherit;
          border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
        ">
      </div>

      <!-- 3. Seleção de Horário -->
      <div class="bg-opacity-20 bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-clock"></i> Horário
        </h2>
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3" id="slotsContainer">
          <p class="col-span-full opacity-70">Selecione uma data primeiro</p>
        </div>
        <input type="hidden" id="selectedSlot" name="scheduled_for">
      </div>

      <!-- 4. Dados do Cliente -->
      <div class="bg-opacity-20 bg-white rounded-lg p-6">
        <h2 class="text-2xl font-bold mb-4">
          <i class="fas fa-user"></i> Seus Dados
        </h2>
        <div class="space-y-4">
          <input type="text" name="customer_name" placeholder="Nome completo" required class="w-full p-3 rounded" style="
            background-color: rgba(255,255,255,0.1);
            color: inherit;
            border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
          ">
          
          <input type="tel" name="customer_phone" placeholder="(00) 00000-0000" required class="w-full p-3 rounded" style="
            background-color: rgba(255,255,255,0.1);
            color: inherit;
            border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
          ">
          
          <input type="email" name="customer_email" placeholder="seu@email.com" class="w-full p-3 rounded" style="
            background-color: rgba(255,255,255,0.1);
            color: inherit;
            border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
          ">
          
          <textarea name="notes" placeholder="Observações (opcional)" rows="3" class="w-full p-3 rounded" style="
            background-color: rgba(255,255,255,0.1);
            color: inherit;
            border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
          "></textarea>
        </div>
      </div>

      <!-- Botões -->
      <div class="flex gap-4 justify-center">
        <a href="{% url 'public:booking_start' tenant_slug=tenant.slug %}" class="px-8 py-3 rounded font-bold" style="
          background-color: {{ branding.button_color_secondary|default:'#764BA2' }};
          color: {{ branding.button_text_color|default:'#FFFFFF' }};
        ">
          <i class="fas fa-arrow-left"></i> Voltar
        </a>
        <button type="submit" class="px-8 py-3 rounded font-bold text-white" style="
          background-color: {{ branding.button_color_primary|default:'#667EEA' }};
        ">
          <i class="fas fa-check"></i> Confirmar
        </button>
      </div>
    </form>
  </div>
</div>

<script>
document.getElementById('dateInput').addEventListener('change', async function() {
  const date = this.value;
  const serviceId = document.querySelector('[name="service"]').value;
  const professionalId = document.querySelector('[name="professional"]').value;
  
  if (!date) return;
  
  try {
    const response = await fetch(`/agendar/{{ tenant.slug }}/api/horarios/?service_id=${serviceId}&professional_id=${professionalId}&date=${date}`);
    const data = await response.json();
    
    const container = document.getElementById('slotsContainer');
    container.innerHTML = '';
    
    if (data.available_slots.length === 0) {
      container.innerHTML = '<p class="col-span-full opacity-70">Nenhum horário disponível para este dia</p>';
      return;
    }
    
    data.available_slots.forEach(slot => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'slot-btn p-3 rounded font-bold border-2 cursor-pointer';
      button.textContent = slot;
      button.style.borderColor = '{{ branding.button_color_primary|default:"#667EEA" }}';
      button.style.backgroundColor = 'rgba(255,255,255,0.1)';
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.slot-btn').forEach(btn => {
          btn.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        button.style.backgroundColor = '{{ branding.button_color_primary|default:"#667EEA" }}';
        
        const datetime = `${date}T${slot}`;
        document.getElementById('selectedSlot').value = datetime;
      });
      
      container.appendChild(button);
    });
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
  }
});

// Validar data mínima (hoje)
const dateInput = document.getElementById('dateInput');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);
</script>
{% endblock %}
```

---

## 3️⃣ TEMPLATE - Sucesso do Agendamento (Passo 4)

**Arquivo:** `src/templates/scheduling/public/booking_success.html`

```html
{% extends "base.html" %}
{% load static %}

{% block title %}Agendamento Confirmado - {{ tenant.name }}{% endblock %}

{% block content %}
<div class="booking-container" style="
  background-color: {{ branding.background_color|default:'#0F172A' }};
  color: {{ branding.text_color|default:'#E2E8F0' }};
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
">
  <div class="max-w-2xl mx-auto text-center">
    <!-- Ícone de sucesso -->
    <div class="mb-8">
      <i class="fas fa-check-circle text-6xl" style="color: #10b981;"></i>
    </div>

    <!-- Mensagem -->
    <h1 class="text-5xl font-bold mb-4">Agendamento Confirmado!</h1>
    <p class="text-xl opacity-80 mb-8">
      Seu agendamento foi registrado com sucesso. Você receberá uma confirmação por email/WhatsApp.
    </p>

    <!-- Dicas -->
    <div class="bg-opacity-20 bg-white rounded-lg p-8 mb-8 text-left">
      <h2 class="text-2xl font-bold mb-4">
        <i class="fas fa-lightbulb"></i> Próximos Passos
      </h2>
      <ul class="space-y-3">
        <li class="flex items-center">
          <i class="fas fa-envelope text-green-500 mr-3"></i>
          Confira seu email para a confirmação
        </li>
        <li class="flex items-center">
          <i class="fas fa-bell text-green-500 mr-3"></i>
          Chegue 10 minutos antes do horário
        </li>
        <li class="flex items-center">
          <i class="fas fa-sync text-green-500 mr-3"></i>
          Você pode cancelar ou reagendar a qualquer momento
        </li>
      </ul>
    </div>

    <!-- Botões -->
    <div class="flex flex-col md:flex-row gap-4 justify-center">
      <a href="{% url 'public:my_bookings_login' tenant_slug=tenant.slug %}" class="px-8 py-4 rounded font-bold text-lg" style="
        background-color: {{ branding.button_color_primary|default:'#667EEA' }};
        color: {{ branding.button_text_color|default:'#FFFFFF' }};
        text-decoration: none;
      ">
        <i class="fas fa-list"></i> Meus Agendamentos
      </a>
      <a href="{% url 'public:booking_start' tenant_slug=tenant.slug %}" class="px-8 py-4 rounded font-bold text-lg" style="
        background-color: {{ branding.button_color_secondary|default:'#764BA2' }};
        color: {{ branding.button_text_color|default:'#FFFFFF' }};
        text-decoration: none;
      ">
        <i class="fas fa-plus-circle"></i> Agendar Outro
      </a>
    </div>
  </div>
</div>
{% endblock %}
```

---

## 4️⃣ TEMPLATE - Login Meus Agendamentos

**Arquivo:** `src/templates/scheduling/public/my_bookings_login.html`

```html
{% extends "base.html" %}

{% block title %}Meus Agendamentos - {{ tenant.name }}{% endblock %}

{% block content %}
<div class="booking-container" style="
  background-color: {{ branding.background_color|default:'#0F172A' }};
  color: {{ branding.text_color|default:'#E2E8F0' }};
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
">
  <div class="max-w-md mx-auto w-full">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Meus Agendamentos</h1>
      <p class="opacity-80">Informe seu telefone para acessar</p>
    </div>

    {% if error_message %}
    <div class="bg-red-500 bg-opacity-20 border-2 border-red-500 rounded p-4 mb-6 text-red-200">
      <i class="fas fa-exclamation-circle"></i> {{ error_message }}
    </div>
    {% endif %}

    <!-- Formulário -->
    <form method="POST" class="space-y-4">
      {% csrf_token %}
      
      <input 
        type="tel" 
        name="phone" 
        placeholder="(00) 00000-0000" 
        required 
        class="w-full p-4 rounded text-lg" 
        style="
          background-color: rgba(255,255,255,0.1);
          color: inherit;
          border: 2px solid {{ branding.button_color_primary|default:'#667EEA' }};
        "
      >
      
      <button type="submit" class="w-full p-4 rounded font-bold text-white text-lg" style="
        background-color: {{ branding.button_color_primary|default:'#667EEA' }};
      ">
        <i class="fas fa-sign-in-alt"></i> Acessar Agendamentos
      </button>
    </form>

    <!-- Link voltar -->
    <div class="text-center mt-6">
      <a href="{% url 'public:booking_start' tenant_slug=tenant.slug %}" style="color: {{ branding.button_color_primary|default:'#667EEA' }};">
        <i class="fas fa-arrow-left"></i> Voltar
      </a>
    </div>
  </div>
</div>
{% endblock %}
```

---

## 5️⃣ TEMPLATE - Lista de Agendamentos

**Arquivo:** `src/templates/scheduling/public/my_bookings.html`

```html
{% extends "base.html" %}

{% block title %}Meus Agendamentos - {{ tenant.name }}{% endblock %}

{% block content %}
<div class="booking-container" style="
  background-color: {{ branding.background_color|default:'#0F172A' }};
  color: {{ branding.text_color|default:'#E2E8F0' }};
  min-height: 100vh;
  padding: 2rem;
">
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-4xl font-bold mb-2">Meus Agendamentos</h1>
        <p class="opacity-80">Gerencie seus agendamentos</p>
      </div>
      <div class="space-y-2">
        <a href="{% url 'public:booking_start' tenant_slug=tenant.slug %}" class="block px-6 py-2 rounded font-bold" style="
          background-color: {{ branding.button_color_primary|default:'#667EEA' }};
          color: white;
          text-decoration: none;
          text-align: center;
        ">
          <i class="fas fa-plus"></i> Novo Agendamento
        </a>
        <a href="{% url 'public:logout_bookings' tenant_slug=tenant.slug %}" class="block px-6 py-2 rounded font-bold" style="
          background-color: {{ branding.button_color_secondary|default:'#764BA2' }};
          color: white;
          text-decoration: none;
          text-align: center;
        ">
          <i class="fas fa-sign-out-alt"></i> Sair
        </a>
      </div>
    </div>

    <!-- Agendamentos Próximos -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">
        <i class="fas fa-calendar-check"></i> Próximos Agendamentos
      </h2>
      
      {% if upcoming_bookings %}
        <div class="space-y-4">
          {% for booking in upcoming_bookings %}
          <div class="bg-opacity-20 bg-white rounded-lg p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold">{{ booking.service.name }}</h3>
                <p class="opacity-70">{{ booking.professional.name }}</p>
                <p class="text-lg mt-3">
                  <i class="fas fa-calendar"></i> {{ booking.scheduled_for|date:"d/m/Y" }}
                  <i class="fas fa-clock ml-4"></i> {{ booking.scheduled_for|time:"H:i" }}
                </p>
                {% if booking.notes %}
                <p class="opacity-70 mt-2">
                  <i class="fas fa-sticky-note"></i> {{ booking.notes }}
                </p>
                {% endif %}
              </div>
              <div class="text-right space-y-2">
                <span class="block px-4 py-2 rounded font-bold" style="
                  background-color: #10b981;
                  color: white;
                ">{{ booking.get_status_display }}</span>
                <form method="POST" action="{% url 'public:reschedule_booking' tenant_slug=tenant.slug booking_id=booking.id %}" style="display: inline;">
                  {% csrf_token %}
                  <button type="submit" class="block w-full px-4 py-2 rounded font-bold mt-2" style="
                    background-color: {{ branding.button_color_primary|default:'#667EEA' }};
                    color: white;
                  ">
                    <i class="fas fa-edit"></i> Reagendar
                  </button>
                </form>
                <button onclick="cancelBooking({{ booking.id }})" class="block w-full px-4 py-2 rounded font-bold" style="
                  background-color: #ef4444;
                  color: white;
                ">
                  <i class="fas fa-times"></i> Cancelar
                </button>
              </div>
            </div>
          </div>
          {% endfor %}
        </div>
      {% else %}
        <p class="opacity-70">Nenhum agendamento futuro</p>
      {% endif %}
    </div>

    <!-- Histórico -->
    <div>
      <h2 class="text-2xl font-bold mb-4">
        <i class="fas fa-history"></i> Histórico
      </h2>
      
      {% if past_bookings %}
        <div class="space-y-4">
          {% for booking in past_bookings %}
          <div class="bg-opacity-10 bg-gray-500 rounded-lg p-6 opacity-60">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-bold">{{ booking.service.name }}</h3>
                <p class="opacity-70">{{ booking.professional.name }}</p>
                <p class="text-lg mt-3">
                  {{ booking.scheduled_for|date:"d/m/Y H:i" }}
                </p>
              </div>
              <span class="px-4 py-2 rounded font-bold" style="
                background-color: #6b7280;
                color: white;
              ">{{ booking.get_status_display }}</span>
            </div>
          </div>
          {% endfor %}
        </div>
      {% else %}
        <p class="opacity-70">Nenhum agendamento anterior</p>
      {% endif %}
    </div>
  </div>
</div>

<script>
async function cancelBooking(bookingId) {
  if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
  
  try {
    const response = await fetch(`/agendar/{{ tenant.slug }}/agendamentos/${bookingId}/cancelar/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': '{{ csrf_token }}',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({reason: ''})
    });
    
    const data = await response.json();
    if (data.success) {
      location.reload();
    } else {
      alert('Erro: ' + data.error);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao cancelar agendamento');
  }
}
</script>
{% endblock %}
```

---

## CSS Essencial (Tailwind)

```css
/* src/static/css/booking.css */

.booking-container {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.booking-container input,
.booking-container select,
.booking-container textarea {
  transition: all 0.3s ease;
}

.booking-container input:focus,
.booking-container select:focus,
.booking-container textarea:focus {
  outline: none;
  opacity: 1 !important;
  transform: scale(1.02);
}

.slot-btn {
  transition: all 0.2s ease;
}

.slot-btn:hover {
  transform: scale(1.05);
}

/* Responsividade */
@media (max-width: 640px) {
  .booking-container {
    padding: 1rem;
  }
  
  h1 { font-size: 1.875rem; }
  h2 { font-size: 1.5rem; }
}
```

---

Versão: 1.0 | Data: 2025-12-22
