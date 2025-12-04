-- AlterTable
ALTER TABLE "Video" 
ADD COLUMN "threeDSource" TEXT,
ADD COLUMN "threeDData" JSONB,
ADD COLUMN "cameraAngle" TEXT;
