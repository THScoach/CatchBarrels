-- CreateTable
CREATE TABLE "model_swings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "jointData" JSONB NOT NULL,
    "hitterName" TEXT,
    "handedness" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "model_swings_pkey" PRIMARY KEY ("id")
);
