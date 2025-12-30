/*
  Warnings:

  - Made the column `commissionRate` on table `Professional` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Configuration" ADD COLUMN     "backgroundColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "buttonColorPrimary" TEXT NOT NULL DEFAULT '#505afb',
ADD COLUMN     "buttonTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "sectionsConfig" TEXT,
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "themeTemplate" TEXT NOT NULL DEFAULT 'light';

-- AlterTable
ALTER TABLE "Professional" ALTER COLUMN "commissionRate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Category_tenantId_name_idx" ON "Category"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Client_tenantId_name_idx" ON "Client"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Professional_tenantId_name_idx" ON "Professional"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Service_tenantId_name_idx" ON "Service"("tenantId", "name");

-- CreateIndex
CREATE INDEX "Supplier_tenantId_name_idx" ON "Supplier"("tenantId", "name");
