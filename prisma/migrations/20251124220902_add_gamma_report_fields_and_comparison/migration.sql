-- AlterTable
ALTER TABLE "AssessmentReport" ADD COLUMN     "bodyPlan" TEXT,
ADD COLUMN     "comparisonData" JSONB,
ADD COLUMN     "executiveSummary" TEXT,
ADD COLUMN     "motionSummary" TEXT,
ADD COLUMN     "neuroNotes" TEXT,
ADD COLUMN     "previousAssessmentId" TEXT,
ADD COLUMN     "sequencingSummary" TEXT,
ADD COLUMN     "stabilitySummary" TEXT;
