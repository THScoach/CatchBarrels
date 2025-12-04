-- CreateTable
CREATE TABLE "CoachingCall" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "zoomLink" TEXT NOT NULL,
    "description" TEXT,
    "callDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachingCall_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingCall_callDate_idx" ON "CoachingCall"("callDate");
