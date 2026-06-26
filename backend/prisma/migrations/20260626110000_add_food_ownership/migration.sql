-- AlterTable
ALTER TABLE "Food" ADD COLUMN "userId" TEXT;

-- Backfill existing foods to the first active owner.
WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "Food"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Food" WHERE "userId" IS NULL)
    THEN
        RAISE EXCEPTION 'Cannot assign existing foods to an active owner. Create or enable an owner before applying this migration.';
    END IF;
END $$;

-- AlterTable
ALTER TABLE "Food" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Food_userId_name_idx" ON "Food"("userId", "name");
CREATE INDEX "Food_userId_category_idx" ON "Food"("userId", "category");
CREATE INDEX "Food_userId_status_idx" ON "Food"("userId", "status");

-- AddForeignKey
ALTER TABLE "Food" ADD CONSTRAINT "Food_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
