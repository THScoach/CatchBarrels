-- AlterTable
ALTER TABLE "player_assessments" ADD COLUMN "rebootDerivedIdentityConfidence" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "assessment_history" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "previousValues" JSONB,
    "newValues" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assessment_history_assessmentId_createdAt_idx" ON "assessment_history"("assessmentId", "createdAt");

-- CreateIndex
CREATE INDEX "assessment_history_changedBy_idx" ON "assessment_history"("changedBy");

-- AddForeignKey
ALTER TABLE "assessment_history" ADD CONSTRAINT "assessment_history_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "player_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_history" ADD CONSTRAINT "assessment_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
