-- CreateTable
CREATE TABLE "ModelVideo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "handedness" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "playerName" TEXT,
    "playerLevel" TEXT,
    "skeletonData" JSONB,
    "duration" INTEGER,
    "fps" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModelVideo_handedness_idx" ON "ModelVideo"("handedness");

-- CreateIndex
CREATE INDEX "ModelVideo_active_idx" ON "ModelVideo"("active");
