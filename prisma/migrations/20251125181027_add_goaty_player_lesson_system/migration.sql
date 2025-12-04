-- CreateEnum
CREATE TYPE "PlayerLessonStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "playerLessonId" TEXT;

-- CreateTable
CREATE TABLE "PlayerLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goal" TEXT,
    "notes" TEXT,
    "status" "PlayerLessonStatus" NOT NULL DEFAULT 'ACTIVE',
    "lessonBarrelScore" DOUBLE PRECISION,
    "lessonAnchorScore" DOUBLE PRECISION,
    "lessonEngineScore" DOUBLE PRECISION,
    "lessonWhipScore" DOUBLE PRECISION,
    "coachRecommendation" TEXT,
    "drillRecommendations" JSONB,
    "swingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerLesson_userId_createdAt_idx" ON "PlayerLesson"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PlayerLesson_userId_status_idx" ON "PlayerLesson"("userId", "status");

-- CreateIndex
CREATE INDEX "PlayerLesson_userId_completedAt_idx" ON "PlayerLesson"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_playerLessonId_fkey" FOREIGN KEY ("playerLessonId") REFERENCES "PlayerLesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerLesson" ADD CONSTRAINT "PlayerLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
