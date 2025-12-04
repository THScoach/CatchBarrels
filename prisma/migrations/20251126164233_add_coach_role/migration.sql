-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isCoach" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'player';
