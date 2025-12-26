-- Adicionar novos campos ao Professional
ALTER TABLE "Professional" 
ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "profession" TEXT,
ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rg" TEXT,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "addressNumber" TEXT,
ADD COLUMN IF NOT EXISTS "addressComplement" TEXT,
ADD COLUMN IF NOT EXISTS "neighborhood" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "state" TEXT,
ADD COLUMN IF NOT EXISTS "zipCode" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "signature" TEXT,
ADD COLUMN IF NOT EXISTS "availableOnline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "generateSchedule" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "receivesCommission" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "partnershipContract" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "commissionRate" DECIMAL(5,2) DEFAULT 0;

-- Migrar dados existentes de 'name' para 'firstName' se ainda não tiver valor
UPDATE "Professional" 
SET "firstName" = "name" 
WHERE "firstName" IS NULL;
