#!/bin/bash

# =====================================================
# VERIFICADOR DE IMPLEMENTAÇÃO
# Script para verificar o progresso da implementação
# =====================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_header() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1"
        return 1
    fi
}

print_header "CHECKLIST DE IMPLEMENTAÇÃO - SISTEMA DE AGENDAMENTO"

echo -e "${YELLOW}FASE 1: DOCUMENTAÇÃO${NC}"
check_file "IMPLEMENTACAO_SISTEMA_AGENDAMENTO.md"
check_file "implementar-agendamento.sh"

echo -e "\n${YELLOW}FASE 2: BANCO DE DADOS${NC}"
check_file "apps/api/prisma/schema.prisma"
echo "  Verificando campos no schema..."
grep -q "BookingPolicy" apps/api/prisma/schema.prisma && echo -e "  ${GREEN}✅${NC} BookingPolicy no schema" || echo -e "  ${RED}❌${NC} BookingPolicy não encontrado"
grep -q "AvailabilityRule" apps/api/prisma/schema.prisma && echo -e "  ${GREEN}✅${NC} AvailabilityRule no schema" || echo -e "  ${RED}❌${NC} AvailabilityRule não encontrado"

echo -e "\n${YELLOW}FASE 3: SERVIÇOS${NC}"
check_file "apps/api/src/lib/services/availability.service.ts"
check_file "apps/api/src/lib/services/notification.service.ts"

echo -e "\n${YELLOW}FASE 4: ROTAS${NC}"
check_file "apps/api/src/routes/bookings.ts"

echo -e "\n${YELLOW}FASE 5: COMPONENTES FRONTEND${NC}"
check_dir "apps/web/src/components/booking"

if [ -d "apps/web/src/components/booking" ]; then
    check_file "apps/web/src/components/booking/ServiceSelector.tsx"
    check_file "apps/web/src/components/booking/DateTimeSelector.tsx"
    check_file "apps/web/src/components/booking/BookingForm.tsx"
fi

echo -e "\n${YELLOW}FASE 6: PÁGINAS${NC}"
check_file "apps/web/src/app/agendar/[tenantSlug]/page.tsx"
check_file "apps/web/src/app/meus-agendamentos/[tenantSlug]/page.tsx"

echo -e "\n${YELLOW}FASE 7: SEEDS${NC}"
check_file "apps/api/prisma/seed-booking.ts"

echo -e "\n${YELLOW}FASE 8: ENV VARS${NC}"
echo "Variáveis obrigatórias no .env:"
echo "  - SMTP_HOST"
echo "  - SMTP_PORT"
echo "  - SMTP_USER"
echo "  - SMTP_PASSWORD"
echo "  - SMTP_FROM"

echo -e "\n${YELLOW}COMANDOS ESSENCIAIS:${NC}"
echo ""
echo "1. Atualizar schema:"
echo "   cd apps/api && npx prisma migrate create add_booking_system"
echo ""
echo "2. Aplicar migration:"
echo "   npx prisma migrate deploy"
echo ""
echo "3. Gerar seed:"
echo "   npx tsx prisma/seed-booking.ts"
echo ""
echo "4. Instalar dependências:"
echo "   npm install date-fns nodemailer"
echo ""
echo -e "\n${GREEN}Próximas etapas no IMPLEMENTACAO_SISTEMA_AGENDAMENTO.md${NC}"
