-- CreateTable
CREATE TABLE "MealLog" (
    "id" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealLog_consumedAt_idx" ON "MealLog"("consumedAt");
