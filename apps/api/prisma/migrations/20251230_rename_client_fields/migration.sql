-- Renomear isActive para active
ALTER TABLE "Client" RENAME COLUMN "isActive" TO "active";

-- Adicionar campos faltantes
ALTER TABLE "Client" ADD COLUMN "notifications" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Client" ADD COLUMN "blocked" BOOLEAN NOT NULL DEFAULT false;
