-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "AppUser_active_idx" ON "AppUser"("active");
