-- AlterTable
ALTER TABLE "AppUser"
ADD COLUMN "lastDisabledAt" TIMESTAMP(3),
ADD COLUMN "lastDisabledByUserId" TEXT,
ADD COLUMN "lastEnabledAt" TIMESTAMP(3),
ADD COLUMN "lastEnabledByUserId" TEXT,
ADD COLUMN "passwordResetAt" TIMESTAMP(3),
ADD COLUMN "passwordResetByUserId" TEXT;
