-- AlterTable
ALTER TABLE "ModelVideo" ADD COLUMN     "skeletonErrorMessage" TEXT,
ADD COLUMN     "skeletonStatus" TEXT NOT NULL DEFAULT 'COMPLETE';

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "skeletonErrorMessage" TEXT,
ADD COLUMN     "skeletonStatus" TEXT NOT NULL DEFAULT 'PENDING';
