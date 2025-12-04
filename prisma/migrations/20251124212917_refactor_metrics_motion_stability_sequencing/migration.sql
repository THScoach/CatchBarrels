/*
  Warnings:

  - You are about to drop the column `avgStrideLength` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `avgSwingTime` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `consistencyScore` on the `AssessmentMetricsSummary` table. All the data in the column will be lost.
  - You are about to drop the column `armMaxVelocity` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `batMaxVelocity` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `batPathEfficiency` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `batSpeedMph` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `frontKneeAngle` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `handSpeedMph` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `peakAngularVelocity` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `pelvisMaxVelocity` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `strideLength` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `torsoMaxVelocity` on the `SwingMetrics` table. All the data in the column will be lost.
  - You are about to drop the column `totalSwingTimeMs` on the `SwingMetrics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssessmentMetricsSummary" DROP COLUMN "avgStrideLength",
DROP COLUMN "avgSwingTime",
DROP COLUMN "consistencyScore",
ADD COLUMN     "anchorEngineMotion" DOUBLE PRECISION,
ADD COLUMN     "anchorEngineScore" DOUBLE PRECISION,
ADD COLUMN     "anchorEngineSequencing" DOUBLE PRECISION,
ADD COLUMN     "anchorEngineStability" DOUBLE PRECISION,
ADD COLUMN     "avgArmPeakTiming" DOUBLE PRECISION,
ADD COLUMN     "avgArmToBatGap" DOUBLE PRECISION,
ADD COLUMN     "avgBatPeakTiming" DOUBLE PRECISION,
ADD COLUMN     "avgBatVelocity" DOUBLE PRECISION,
ADD COLUMN     "avgHandSpeed" DOUBLE PRECISION,
ADD COLUMN     "avgHeadDisplacement" DOUBLE PRECISION,
ADD COLUMN     "avgLaunchToImpact" DOUBLE PRECISION,
ADD COLUMN     "avgLoadToLaunch" DOUBLE PRECISION,
ADD COLUMN     "avgPelvisAngleAtImpact" DOUBLE PRECISION,
ADD COLUMN     "avgPelvisAngleAtLaunch" DOUBLE PRECISION,
ADD COLUMN     "avgPelvisPeakTiming" DOUBLE PRECISION,
ADD COLUMN     "avgPelvisToTorsoGap" DOUBLE PRECISION,
ADD COLUMN     "avgSequenceOrderScore" DOUBLE PRECISION,
ADD COLUMN     "avgSequenceTimingScore" DOUBLE PRECISION,
ADD COLUMN     "avgShoulderTiltAtImpact" DOUBLE PRECISION,
ADD COLUMN     "avgShoulderTiltAtLaunch" DOUBLE PRECISION,
ADD COLUMN     "avgSpineTiltAtImpact" DOUBLE PRECISION,
ADD COLUMN     "avgSpineTiltAtLaunch" DOUBLE PRECISION,
ADD COLUMN     "avgStrideLengthFactor" DOUBLE PRECISION,
ADD COLUMN     "avgSwingDuration" DOUBLE PRECISION,
ADD COLUMN     "avgTorsoPeakTiming" DOUBLE PRECISION,
ADD COLUMN     "avgTorsoToArmGap" DOUBLE PRECISION,
ADD COLUMN     "headStabilityScore" DOUBLE PRECISION,
ADD COLUMN     "maxHandSpeed" DOUBLE PRECISION,
ADD COLUMN     "motionConsistencyScore" DOUBLE PRECISION,
ADD COLUMN     "overallStabilityScore" DOUBLE PRECISION,
ADD COLUMN     "pelvisAngleConsistencyScore" DOUBLE PRECISION,
ADD COLUMN     "solidContactRate" DOUBLE PRECISION,
ADD COLUMN     "spineTiltConsistencyScore" DOUBLE PRECISION,
ADD COLUMN     "whipMotion" DOUBLE PRECISION,
ADD COLUMN     "whipScore" DOUBLE PRECISION,
ADD COLUMN     "whipSequencing" DOUBLE PRECISION,
ADD COLUMN     "whipStability" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SwingMetrics" DROP COLUMN "armMaxVelocity",
DROP COLUMN "batMaxVelocity",
DROP COLUMN "batPathEfficiency",
DROP COLUMN "batSpeedMph",
DROP COLUMN "frontKneeAngle",
DROP COLUMN "handSpeedMph",
DROP COLUMN "peakAngularVelocity",
DROP COLUMN "pelvisMaxVelocity",
DROP COLUMN "strideLength",
DROP COLUMN "torsoMaxVelocity",
DROP COLUMN "totalSwingTimeMs",
ADD COLUMN     "armMaxAngularVelocity" DOUBLE PRECISION,
ADD COLUMN     "armToBatGapMs" DOUBLE PRECISION,
ADD COLUMN     "avgBatSpeedMph" DOUBLE PRECISION,
ADD COLUMN     "avgHandSpeedMph" DOUBLE PRECISION,
ADD COLUMN     "backKneeFlexionAtLaunchDeg" DOUBLE PRECISION,
ADD COLUMN     "batMaxAngularVelocity" DOUBLE PRECISION,
ADD COLUMN     "frontKneeFlexionAtImpactDeg" DOUBLE PRECISION,
ADD COLUMN     "headDisplacementFromStanceCm" DOUBLE PRECISION,
ADD COLUMN     "maxBatSpeedMph" DOUBLE PRECISION,
ADD COLUMN     "maxHandSpeedMph" DOUBLE PRECISION,
ADD COLUMN     "pelvisAngleAtImpactDeg" DOUBLE PRECISION,
ADD COLUMN     "pelvisAngleAtLaunchDeg" DOUBLE PRECISION,
ADD COLUMN     "pelvisMaxAngularVelocity" DOUBLE PRECISION,
ADD COLUMN     "pelvisToTorsoGapMs" DOUBLE PRECISION,
ADD COLUMN     "sequenceOrderScore" DOUBLE PRECISION,
ADD COLUMN     "sequenceTimingScore" DOUBLE PRECISION,
ADD COLUMN     "shoulderTiltAtImpactDeg" DOUBLE PRECISION,
ADD COLUMN     "shoulderTiltAtLaunchDeg" DOUBLE PRECISION,
ADD COLUMN     "spineTiltAtImpactDeg" DOUBLE PRECISION,
ADD COLUMN     "spineTiltAtLaunchDeg" DOUBLE PRECISION,
ADD COLUMN     "strideLengthFactor" DOUBLE PRECISION,
ADD COLUMN     "swingDurationMs" DOUBLE PRECISION,
ADD COLUMN     "torsoMaxAngularVelocity" DOUBLE PRECISION,
ADD COLUMN     "torsoToArmGapMs" DOUBLE PRECISION;
