-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionName" TEXT NOT NULL DEFAULT 'Assessment Session',
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,
    "assessorName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "processedAt" TIMESTAMP(3),
    "totalSwings" INTEGER NOT NULL DEFAULT 0,
    "processedSwings" INTEGER NOT NULL DEFAULT 0,
    "successfulSwings" INTEGER NOT NULL DEFAULT 0,
    "failedSwings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwingAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "videoId" TEXT,
    "swingNumber" INTEGER NOT NULL,
    "swingType" TEXT,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "analysisStatus" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "ballDataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SwingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwingMetrics" (
    "id" TEXT NOT NULL,
    "swingId" TEXT NOT NULL,
    "loadToLaunchMs" DOUBLE PRECISION,
    "launchToImpactMs" DOUBLE PRECISION,
    "totalSwingTimeMs" DOUBLE PRECISION,
    "batSpeedMph" DOUBLE PRECISION,
    "handSpeedMph" DOUBLE PRECISION,
    "peakAngularVelocity" DOUBLE PRECISION,
    "pelvisMaxVelocity" DOUBLE PRECISION,
    "torsoMaxVelocity" DOUBLE PRECISION,
    "armMaxVelocity" DOUBLE PRECISION,
    "batMaxVelocity" DOUBLE PRECISION,
    "pelvisPeakTimingMs" DOUBLE PRECISION,
    "torsoPeakTimingMs" DOUBLE PRECISION,
    "armPeakTimingMs" DOUBLE PRECISION,
    "batPeakTimingMs" DOUBLE PRECISION,
    "sequenceScore" DOUBLE PRECISION,
    "sequenceOrder" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hipShoulderSeparation" DOUBLE PRECISION,
    "frontKneeAngle" DOUBLE PRECISION,
    "leadElbowAngle" DOUBLE PRECISION,
    "rearElbowAngle" DOUBLE PRECISION,
    "strideLength" DOUBLE PRECISION,
    "batPathEfficiency" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwingMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwingJointSeries" (
    "id" TEXT NOT NULL,
    "swingId" TEXT NOT NULL,
    "frames" JSONB NOT NULL,
    "cameraAngle" TEXT,
    "fps" DOUBLE PRECISION,
    "normalizedFps" DOUBLE PRECISION,
    "impactFrame" INTEGER,
    "qualityScore" DOUBLE PRECISION,
    "framesExtracted" INTEGER,
    "playerHeight" DOUBLE PRECISION,
    "handedness" TEXT,
    "extractedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwingJointSeries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BallDataPoint" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exitVelocity" DOUBLE PRECISION,
    "launchAngle" DOUBLE PRECISION,
    "distance" DOUBLE PRECISION,
    "direction" DOUBLE PRECISION,
    "hangTime" DOUBLE PRECISION,
    "spinRate" INTEGER,
    "spinAxis" DOUBLE PRECISION,
    "result" TEXT,
    "hitType" TEXT,
    "pitchSpeed" DOUBLE PRECISION,
    "pitchType" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BallDataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentMetricsSummary" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "avgBatSpeed" DOUBLE PRECISION,
    "maxBatSpeed" DOUBLE PRECISION,
    "avgSwingTime" DOUBLE PRECISION,
    "consistencyScore" DOUBLE PRECISION,
    "avgPelvisVelocity" DOUBLE PRECISION,
    "avgTorsoVelocity" DOUBLE PRECISION,
    "avgArmVelocity" DOUBLE PRECISION,
    "avgSequenceScore" DOUBLE PRECISION,
    "sequenceConsistency" DOUBLE PRECISION,
    "avgXFactor" DOUBLE PRECISION,
    "avgFrontKneeAngle" DOUBLE PRECISION,
    "avgStrideLength" DOUBLE PRECISION,
    "avgExitVelocity" DOUBLE PRECISION,
    "maxExitVelocity" DOUBLE PRECISION,
    "avgLaunchAngle" DOUBLE PRECISION,
    "avgDistance" DOUBLE PRECISION,
    "barrelRate" DOUBLE PRECISION,
    "overallSwingScore" DOUBLE PRECISION,
    "biomechanicsScore" DOUBLE PRECISION,
    "ballContactScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentMetricsSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentReport" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "scoreExplanation" TEXT,
    "ballDataSummary" JSONB,
    "movementNotes" TEXT,
    "lowerBodyNotes" TEXT,
    "upperBodyNotes" TEXT,
    "batPathNotes" TEXT,
    "plan" TEXT,
    "topPriorities" JSONB,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "drills" JSONB,
    "generatedAt" TIMESTAMP(3),
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssessmentSession_userId_status_idx" ON "AssessmentSession"("userId", "status");

-- CreateIndex
CREATE INDEX "AssessmentSession_sessionDate_idx" ON "AssessmentSession"("sessionDate");

-- CreateIndex
CREATE UNIQUE INDEX "SwingAnalysis_ballDataId_key" ON "SwingAnalysis"("ballDataId");

-- CreateIndex
CREATE INDEX "SwingAnalysis_sessionId_swingNumber_idx" ON "SwingAnalysis"("sessionId", "swingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SwingMetrics_swingId_key" ON "SwingMetrics"("swingId");

-- CreateIndex
CREATE UNIQUE INDEX "SwingJointSeries_swingId_key" ON "SwingJointSeries"("swingId");

-- CreateIndex
CREATE INDEX "BallDataPoint_sessionId_idx" ON "BallDataPoint"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentMetricsSummary_reportId_key" ON "AssessmentMetricsSummary"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentReport_sessionId_key" ON "AssessmentReport"("sessionId");

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwingAnalysis" ADD CONSTRAINT "SwingAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwingAnalysis" ADD CONSTRAINT "SwingAnalysis_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwingAnalysis" ADD CONSTRAINT "SwingAnalysis_ballDataId_fkey" FOREIGN KEY ("ballDataId") REFERENCES "BallDataPoint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwingMetrics" ADD CONSTRAINT "SwingMetrics_swingId_fkey" FOREIGN KEY ("swingId") REFERENCES "SwingAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwingJointSeries" ADD CONSTRAINT "SwingJointSeries_swingId_fkey" FOREIGN KEY ("swingId") REFERENCES "SwingAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BallDataPoint" ADD CONSTRAINT "BallDataPoint_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentMetricsSummary" ADD CONSTRAINT "AssessmentMetricsSummary_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "AssessmentReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentReport" ADD CONSTRAINT "AssessmentReport_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
