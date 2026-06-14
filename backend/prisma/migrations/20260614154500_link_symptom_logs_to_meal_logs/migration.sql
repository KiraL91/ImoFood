-- AlterTable
ALTER TABLE "SymptomLog" ADD COLUMN "mealLogId" TEXT;

-- CreateIndex
CREATE INDEX "SymptomLog_mealLogId_idx" ON "SymptomLog"("mealLogId");

-- AddForeignKey
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
