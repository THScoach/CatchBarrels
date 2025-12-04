/*
  Warnings:

  - You are about to drop the column `anchorEngineMotion` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `anchorEngineScore` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `anchorEngineSequencing` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `anchorEngineStability` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssessmentMetricsSummary" DROP COLUMN "anchorEngineMotion",
DROP COLUMN "anchorEngineScore",
DROP COLUMN "anchorEngineSequencing",
DROP COLUMN "anchorEngineStability",
ADD COLUMN     "anchorMotion" DOUBLE PRECISION,
ADD COLUMN     "anchorScore" DOUBLE PRECISION,
ADD COLUMN     "anchorSequencing" DOUBLE PRECISION,
ADD COLUMN     "anchorStability" DOUBLE PRECISION,
ADD COLUMN     "engineMotion" DOUBLE PRECISION,
ADD COLUMN     "engineScore" DOUBLE PRECISION,
ADD COLUMN     "engineSequencing" DOUBLE PRECISION,
ADD COLUMN     "engineStability" DOUBLE PRECISION;
