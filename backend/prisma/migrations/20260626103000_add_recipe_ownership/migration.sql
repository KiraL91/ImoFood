-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN "userId" TEXT;

-- Backfill existing recipes to the first active owner.
WITH legacy_owner AS (
    SELECT "id"
    FROM "AppUser"
    WHERE "role" = 'owner' AND "active" = true
    ORDER BY "createdAt" ASC
    LIMIT 1
)
UPDATE "Recipe"
SET "userId" = (SELECT "id" FROM legacy_owner)
WHERE "userId" IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "Recipe" WHERE "userId" IS NULL)
    THEN
        RAISE EXCEPTION 'Cannot assign existing recipes to an active owner. Create or enable an owner before applying this migration.';
    END IF;
END $$;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Recipe_userId_name_idx" ON "Recipe"("userId", "name");
CREATE INDEX "Recipe_userId_rating_idx" ON "Recipe"("userId", "rating");

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
