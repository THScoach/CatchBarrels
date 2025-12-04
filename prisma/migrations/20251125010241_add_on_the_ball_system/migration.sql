-- CreateTable
CREATE TABLE "hittrax_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceFileName" TEXT,
    "level" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hittrax_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hittrax_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "ab" INTEGER,
    "date" TIMESTAMP(3),
    "timeStamp" TEXT,
    "pitch" DECIMAL(5,2),
    "strikeZone" INTEGER,
    "pType" TEXT,
    "velo" DECIMAL(5,2),
    "la" DECIMAL(5,2),
    "dist" DECIMAL(6,2),
    "res" TEXT,
    "type" TEXT,
    "horizAngle" DECIMAL(6,2),
    "sprayChartX" DECIMAL(6,2),
    "sprayChartZ" DECIMAL(6,2),
    "isFair" BOOLEAN NOT NULL DEFAULT false,
    "isFoul" BOOLEAN NOT NULL DEFAULT false,
    "isMiss" BOOLEAN NOT NULL DEFAULT false,
    "inZone" BOOLEAN NOT NULL DEFAULT false,
    "isBarrel" BOOLEAN NOT NULL DEFAULT false,
    "batting" TEXT,
    "playerLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hittrax_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_on_the_ball_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "assessmentSessionId" TEXT,
    "hittraxSessionId" TEXT,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "barrelRate" DECIMAL(5,4),
    "avgEv" DECIMAL(5,2),
    "avgLa" DECIMAL(5,2),
    "sdLa" DECIMAL(5,2),
    "sdEv" DECIMAL(5,2),
    "inzoneBarrelRate" DECIMAL(5,4),
    "inzoneSdLa" DECIMAL(5,2),
    "inzoneSdEv" DECIMAL(5,2),
    "foulPct" DECIMAL(5,4),
    "missPct" DECIMAL(5,4),
    "fairPct" DECIMAL(5,4),
    "level" TEXT,
    "contextJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_on_the_ball_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hittrax_sessions_userId_idx" ON "hittrax_sessions"("userId");

-- CreateIndex
CREATE INDEX "hittrax_sessions_sessionDate_idx" ON "hittrax_sessions"("sessionDate");

-- CreateIndex
CREATE INDEX "hittrax_events_sessionId_idx" ON "hittrax_events"("sessionId");

-- CreateIndex
CREATE INDEX "hittrax_events_isBarrel_idx" ON "hittrax_events"("isBarrel");

-- CreateIndex
CREATE INDEX "hittrax_events_isFair_idx" ON "hittrax_events"("isFair");

-- CreateIndex
CREATE UNIQUE INDEX "player_on_the_ball_history_assessmentSessionId_key" ON "player_on_the_ball_history"("assessmentSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "player_on_the_ball_history_hittraxSessionId_key" ON "player_on_the_ball_history"("hittraxSessionId");

-- CreateIndex
CREATE INDEX "player_on_the_ball_history_userId_idx" ON "player_on_the_ball_history"("userId");

-- CreateIndex
CREATE INDEX "player_on_the_ball_history_sessionDate_idx" ON "player_on_the_ball_history"("sessionDate");

-- CreateIndex
CREATE INDEX "player_on_the_ball_history_sourceType_idx" ON "player_on_the_ball_history"("sourceType");

-- AddForeignKey
ALTER TABLE "hittrax_sessions" ADD CONSTRAINT "hittrax_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hittrax_events" ADD CONSTRAINT "hittrax_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "hittrax_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_on_the_ball_history" ADD CONSTRAINT "player_on_the_ball_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_on_the_ball_history" ADD CONSTRAINT "player_on_the_ball_history_assessmentSessionId_fkey" FOREIGN KEY ("assessmentSessionId") REFERENCES "AssessmentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_on_the_ball_history" ADD CONSTRAINT "player_on_the_ball_history_hittraxSessionId_fkey" FOREIGN KEY ("hittraxSessionId") REFERENCES "hittrax_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
