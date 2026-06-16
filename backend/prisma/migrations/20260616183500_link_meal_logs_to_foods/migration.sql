-- CreateTable
CREATE TABLE "MealLogFood" (
    "mealLogId" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealLogFood_pkey" PRIMARY KEY ("mealLogId","foodId")
);

-- CreateIndex
CREATE INDEX "MealLogFood_foodId_idx" ON "MealLogFood"("foodId");

-- AddForeignKey
ALTER TABLE "MealLogFood" ADD CONSTRAINT "MealLogFood_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealLogFood" ADD CONSTRAINT "MealLogFood_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE CASCADE ON UPDATE CASCADE;
