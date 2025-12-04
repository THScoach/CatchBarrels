-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT,
    "email" TEXT,
    "name" TEXT,
    "whopUserId" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "height" INTEGER,
    "weight" INTEGER,
    "bats" TEXT,
    "throws" TEXT,
    "position" TEXT,
    "level" TEXT,
    "batLength" INTEGER,
    "batWeight" INTEGER,
    "batType" TEXT,
    "struggles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mentalApproach" TEXT,
    "confidenceLevel" INTEGER,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Swing',
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "anchor" INTEGER,
    "engine" INTEGER,
    "whip" INTEGER,
    "overallScore" INTEGER,
    "tier" TEXT,
    "anchorStance" INTEGER,
    "anchorWeightShift" INTEGER,
    "anchorGroundConnection" INTEGER,
    "anchorLowerBodyMechanics" INTEGER,
    "engineHipRotation" INTEGER,
    "engineSeparation" INTEGER,
    "engineCorePower" INTEGER,
    "engineTorsoMechanics" INTEGER,
    "whipArmPath" INTEGER,
    "whipBatSpeed" INTEGER,
    "whipBatPath" INTEGER,
    "whipConnection" INTEGER,
    "exitVelocity" INTEGER,
    "coachFeedback" TEXT,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "primaryPurpose" TEXT NOT NULL,
    "setup" TEXT NOT NULL,
    "execution" TEXT NOT NULL,
    "keyPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "targetSkills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" TEXT NOT NULL,
    "videoUrl" TEXT,
    "thumbnailUrl" TEXT,

    CONSTRAINT "Drill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drillId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "reps" INTEGER,
    "sets" INTEGER,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avgAnchor" INTEGER NOT NULL,
    "avgEngine" INTEGER NOT NULL,
    "avgWhip" INTEGER NOT NULL,
    "avgOverall" INTEGER NOT NULL,
    "avgAnchorStance" INTEGER,
    "avgAnchorWeightShift" INTEGER,
    "avgAnchorGroundConnection" INTEGER,
    "avgAnchorLowerBodyMechanics" INTEGER,
    "avgEngineHipRotation" INTEGER,
    "avgEngineSeparation" INTEGER,
    "avgEngineCorePower" INTEGER,
    "avgEngineTorsoMechanics" INTEGER,
    "avgWhipArmPath" INTEGER,
    "avgWhipBatSpeed" INTEGER,
    "avgWhipBatPath" INTEGER,
    "avgWhipConnection" INTEGER,

    CONSTRAINT "ProgressEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_whopUserId_key" ON "User"("whopUserId");

-- CreateIndex
CREATE INDEX "Video_userId_uploadDate_idx" ON "Video"("userId", "uploadDate");

-- CreateIndex
CREATE UNIQUE INDEX "Drill_name_key" ON "Drill"("name");

-- CreateIndex
CREATE INDEX "DrillProgress_userId_drillId_idx" ON "DrillProgress"("userId", "drillId");

-- CreateIndex
CREATE INDEX "ProgressEntry_userId_date_idx" ON "ProgressEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillProgress" ADD CONSTRAINT "DrillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrillProgress" ADD CONSTRAINT "DrillProgress_drillId_fkey" FOREIGN KEY ("drillId") REFERENCES "Drill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
