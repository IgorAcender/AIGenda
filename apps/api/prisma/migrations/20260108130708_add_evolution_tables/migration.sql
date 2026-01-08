-- CreateTable
CREATE TABLE "EvolutionInstance" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "maxConnections" INTEGER NOT NULL DEFAULT 100,
    "tenantCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvolutionInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantEvolutionMapping" (
    "tenantId" TEXT NOT NULL,
    "evolutionInstanceId" INTEGER NOT NULL,
    "whatsappPhoneNumber" TEXT,
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "disconnectedAt" TIMESTAMP(3),
    "lastQRCodeGeneratedAt" TIMESTAMP(3),
    "reconnectAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastReconnectAttempt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantEvolutionMapping_pkey" PRIMARY KEY ("tenantId")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvolutionInstance_name_key" ON "EvolutionInstance"("name");

-- CreateIndex
CREATE INDEX "EvolutionInstance_isActive_idx" ON "EvolutionInstance"("isActive");

-- CreateIndex
CREATE INDEX "EvolutionInstance_tenantCount_idx" ON "EvolutionInstance"("tenantCount");

-- CreateIndex
CREATE INDEX "TenantEvolutionMapping_evolutionInstanceId_idx" ON "TenantEvolutionMapping"("evolutionInstanceId");

-- CreateIndex
CREATE INDEX "TenantEvolutionMapping_whatsappPhoneNumber_idx" ON "TenantEvolutionMapping"("whatsappPhoneNumber");

-- CreateIndex
CREATE INDEX "TenantEvolutionMapping_isConnected_idx" ON "TenantEvolutionMapping"("isConnected");

-- CreateIndex
CREATE INDEX "TenantEvolutionMapping_createdAt_idx" ON "TenantEvolutionMapping"("createdAt");

-- AddForeignKey
ALTER TABLE "TenantEvolutionMapping" ADD CONSTRAINT "TenantEvolutionMapping_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantEvolutionMapping" ADD CONSTRAINT "TenantEvolutionMapping_evolutionInstanceId_fkey" FOREIGN KEY ("evolutionInstanceId") REFERENCES "EvolutionInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
