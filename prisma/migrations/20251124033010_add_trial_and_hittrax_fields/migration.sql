-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "ballFlightDistance" DOUBLE PRECISION,
ADD COLUMN     "ballFlightDistanceMax" DOUBLE PRECISION,
ADD COLUMN     "ballScoreComposite" DOUBLE PRECISION,
ADD COLUMN     "hitTraxDataImported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hitTraxImportDate" TIMESTAMP(3),
ADD COLUMN     "sprayAngle" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trialConvertedToPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3),
ADD COLUMN     "trialTier" TEXT,
ADD COLUMN     "trialUsed" BOOLEAN NOT NULL DEFAULT false;
