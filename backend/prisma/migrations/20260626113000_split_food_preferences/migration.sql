-- CreateTable
CREATE TABLE "FoodPreference" (
    "userId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "status" "FoodStatus" NOT NULL,
    "tolerance" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodPreference_pkey" PRIMARY KEY ("userId","foodId")
);

-- Backfill existing personal food state from the temporary per-user food owner.
INSERT INTO "FoodPreference" ("userId", "foodId", "status", "tolerance", "notes", "createdAt", "updatedAt")
SELECT "userId", "id", "status", "tolerance", "notes", "createdAt", "updatedAt"
FROM "Food";

-- DropForeignKey
ALTER TABLE "Food" DROP CONSTRAINT "Food_userId_fkey";

-- DropIndex
DROP INDEX "Food_userId_name_idx";
DROP INDEX "Food_userId_category_idx";
DROP INDEX "Food_userId_status_idx";

-- AlterTable
ALTER TABLE "Food" DROP COLUMN "userId";

-- CreateIndex
CREATE INDEX "FoodPreference_foodId_idx" ON "FoodPreference"("foodId");
CREATE INDEX "FoodPreference_userId_status_idx" ON "FoodPreference"("userId", "status");

-- AddForeignKey
ALTER TABLE "FoodPreference" ADD CONSTRAINT "FoodPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FoodPreference" ADD CONSTRAINT "FoodPreference_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
