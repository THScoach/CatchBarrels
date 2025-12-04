-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "jointAnalysisDate" TIMESTAMP(3),
ADD COLUMN     "jointAnalysisSource" TEXT,
ADD COLUMN     "jointAnalyzed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jointData" JSONB;
