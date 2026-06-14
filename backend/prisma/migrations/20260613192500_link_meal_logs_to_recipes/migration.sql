-- AlterTable
ALTER TABLE "MealLog" ADD COLUMN "recipeId" TEXT;

-- CreateIndex
CREATE INDEX "MealLog_recipeId_idx" ON "MealLog"("recipeId");

-- AddForeignKey
ALTER TABLE "MealLog" ADD CONSTRAINT "MealLog_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE SET NULL ON UPDATE CASCADE;
