-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "originalUrl" TEXT,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'upload';
