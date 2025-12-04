-- CreateTable
CREATE TABLE "timing_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "testType" TEXT NOT NULL DEFAULT '52_pitch_timing',
    "machineDistanceFt" DECIMAL(5,2) NOT NULL,
    "videoFps" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timing_pitches" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "pitchNumber" INTEGER NOT NULL,
    "speedLabel" TEXT NOT NULL,
    "machineSpeedMph" DECIMAL(5,2) NOT NULL,
    "timeToPlatMs" DECIMAL(6,2),
    "frameRelease" INTEGER,
    "frameLaunch" INTEGER,
    "frameContact" INTEGER,
    "decisionTimeMs" DECIMAL(6,2),
    "bufferMs" DECIMAL(6,2),
    "swingTimeMs" DECIMAL(6,2),
    "outcome" TEXT,
    "exitVelo" DECIMAL(5,2),
    "contactType" TEXT,
    "resultType" TEXT,
    "resultLocation" TEXT,
    "launchAngle" DECIMAL(5,2),
    "distance" DECIMAL(6,2),
    "previousPitchSpeedLabel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timing_pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "s2_cognition_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testDate" TIMESTAMP(3) NOT NULL,
    "filePath" TEXT NOT NULL,
    "perceptionSpeedScore" INTEGER,
    "timingControlScore" INTEGER,
    "stoppingControlScore" INTEGER,
    "trajectoryPredictionScore" INTEGER,
    "rhythmControlScore" INTEGER,
    "impulseControlScore" INTEGER,
    "distractionControlScore" INTEGER,
    "instinctiveLearningScore" INTEGER,
    "overallScore" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "s2_cognition_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timing_pitches_sessionId_idx" ON "timing_pitches"("sessionId");

-- CreateIndex
CREATE INDEX "timing_pitches_sessionId_pitchNumber_idx" ON "timing_pitches"("sessionId", "pitchNumber");

-- CreateIndex
CREATE INDEX "s2_cognition_reports_userId_idx" ON "s2_cognition_reports"("userId");

-- CreateIndex
CREATE INDEX "s2_cognition_reports_userId_testDate_idx" ON "s2_cognition_reports"("userId", "testDate");

-- AddForeignKey
ALTER TABLE "timing_sessions" ADD CONSTRAINT "timing_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timing_pitches" ADD CONSTRAINT "timing_pitches_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "timing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "s2_cognition_reports" ADD CONSTRAINT "s2_cognition_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
