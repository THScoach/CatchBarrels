-- AlterTable
ALTER TABLE "Video" 
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "shareableLink" TEXT,
ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sharedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Video_shareableLink_key" ON "Video"("shareableLink");

-- CreateIndex
CREATE INDEX "Video_isPublic_sharedAt_idx" ON "Video"("isPublic", "sharedAt");
