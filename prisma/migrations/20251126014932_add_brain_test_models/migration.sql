-- CreateEnum
CREATE TYPE "BrainTestType" AS ENUM ('GO_NO_GO');

-- CreateTable
CREATE TABLE "brain_test_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "athleteId" TEXT,
    "type" "BrainTestType" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "summaryJson" JSONB,

    CONSTRAINT "brain_test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brain_test_trials" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "stimulus" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "reactionMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brain_test_trials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "brain_test_sessions_userId_idx" ON "brain_test_sessions"("userId");

-- CreateIndex
CREATE INDEX "brain_test_sessions_completedAt_idx" ON "brain_test_sessions"("completedAt");

-- CreateIndex
CREATE INDEX "brain_test_trials_sessionId_idx" ON "brain_test_trials"("sessionId");

-- CreateIndex
CREATE INDEX "brain_test_trials_createdAt_idx" ON "brain_test_trials"("createdAt");

-- AddForeignKey
ALTER TABLE "brain_test_sessions" ADD CONSTRAINT "brain_test_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brain_test_trials" ADD CONSTRAINT "brain_test_trials_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "brain_test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
