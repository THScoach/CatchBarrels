-- CreateTable
CREATE TABLE "player_assessments" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "confidenceLevel" TEXT NOT NULL,
    "swingIdentity" TEXT,
    "identityLocked" BOOLEAN NOT NULL DEFAULT false,
    "constraints" TEXT,
    "constraintsJson" JSONB,
    "primaryTrainingLane" TEXT,
    "baselineMetrics" JSONB,
    "coachSystemStatement" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "rebootMotionFiles" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "player_assessments_athleteId_idx" ON "player_assessments"("athleteId");

-- CreateIndex
CREATE INDEX "player_assessments_status_idx" ON "player_assessments"("status");

-- CreateIndex
CREATE INDEX "player_assessments_createdBy_idx" ON "player_assessments"("createdBy");

-- AddForeignKey
ALTER TABLE "player_assessments" ADD CONSTRAINT "player_assessments_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_assessments" ADD CONSTRAINT "player_assessments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
