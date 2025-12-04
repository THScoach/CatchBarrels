-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastWhopSync" TIMESTAMP(3),
ADD COLUMN     "membershipExpiresAt" TIMESTAMP(3),
ADD COLUMN     "membershipStatus" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN     "membershipTier" TEXT NOT NULL DEFAULT 'free',
ADD COLUMN     "whopMembershipId" TEXT;

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "whopPaymentId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountPaid" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "location" TEXT,
    "reportGenerated" BOOLEAN NOT NULL DEFAULT false,
    "reportUrl" TEXT,
    "reportData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhopProduct" (
    "id" TEXT NOT NULL,
    "whopProductId" TEXT NOT NULL,
    "whopPlanId" TEXT,
    "productName" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "membershipTier" TEXT,
    "assessmentType" TEXT,
    "price" INTEGER NOT NULL,
    "billingInterval" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhopProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_whopPaymentId_key" ON "Assessment"("whopPaymentId");

-- CreateIndex
CREATE INDEX "Assessment_userId_status_idx" ON "Assessment"("userId", "status");

-- CreateIndex
CREATE INDEX "Assessment_assessmentType_idx" ON "Assessment"("assessmentType");

-- CreateIndex
CREATE UNIQUE INDEX "WhopProduct_whopProductId_key" ON "WhopProduct"("whopProductId");

-- CreateIndex
CREATE INDEX "WhopProduct_productType_isActive_idx" ON "WhopProduct"("productType", "isActive");

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
