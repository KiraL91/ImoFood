-- AlterTable
ALTER TABLE "MealLog" ADD COLUMN "userId" TEXT;
ALTER TABLE "SymptomLog" ADD COLUMN "userId" TEXT;
ALTER TABLE "Treatment" ADD COLUMN "userId" TEXT;
ALTER TABLE "TreatmentLog" ADD COLUMN "userId" TEXT;

-- Backfill existing personal data to the first active owner.
WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "MealLog"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "SymptomLog"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "Treatment"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "TreatmentLog"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "MealLog" WHERE "userId" IS NULL)
        OR EXISTS (SELECT 1 FROM "SymptomLog" WHERE "userId" IS NULL)
        OR EXISTS (SELECT 1 FROM "Treatment" WHERE "userId" IS NULL)
        OR EXISTS (SELECT 1 FROM "TreatmentLog" WHERE "userId" IS NULL)
    THEN
        RAISE EXCEPTION 'Cannot assign existing personal data to an active owner. Create or enable an owner before applying this migration.';
    END IF;
END $$;

-- AlterTable
ALTER TABLE "MealLog" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "SymptomLog" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Treatment" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "TreatmentLog" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "MealLog_userId_consumedAt_idx" ON "MealLog"("userId", "consumedAt");
CREATE INDEX "SymptomLog_userId_loggedAt_idx" ON "SymptomLog"("userId", "loggedAt");
CREATE INDEX "Treatment_userId_category_idx" ON "Treatment"("userId", "category");
CREATE INDEX "Treatment_userId_status_idx" ON "Treatment"("userId", "status");
CREATE INDEX "TreatmentLog_userId_takenAt_idx" ON "TreatmentLog"("userId", "takenAt");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreatmentLog" ADD CONSTRAINT "TreatmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
