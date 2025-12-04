-- AlterTable
ALTER TABLE "ModelVideo" ADD COLUMN     "impactFrame" INTEGER,
ADD COLUMN     "normalizedFps" DOUBLE PRECISION NOT NULL DEFAULT 60,
ADD COLUMN     "skeletonExtracted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trimmedPath" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "fps" DOUBLE PRECISION,
ADD COLUMN     "impactFrame" INTEGER,
ADD COLUMN     "normalizedFps" DOUBLE PRECISION NOT NULL DEFAULT 60,
ADD COLUMN     "skeletonData" JSONB,
ADD COLUMN     "skeletonExtracted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trimmedPath" TEXT;
