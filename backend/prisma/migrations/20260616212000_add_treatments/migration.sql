-- CreateTable
CREATE TABLE "Treatment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "targets" TEXT[],
    "status" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentLog" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL,
    "dose" TEXT,
    "timing" TEXT,
    "relatedMealLogId" TEXT,
    "relatedSymptomLogId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Treatment_category_idx" ON "Treatment"("category");

-- CreateIndex
CREATE INDEX "Treatment_status_idx" ON "Treatment"("status");

-- CreateIndex
CREATE INDEX "TreatmentLog_takenAt_idx" ON "TreatmentLog"("takenAt");

-- CreateIndex
CREATE INDEX "TreatmentLog_treatmentId_idx" ON "TreatmentLog"("treatmentId");

-- CreateIndex
CREATE INDEX "TreatmentLog_relatedMealLogId_idx" ON "TreatmentLog"("relatedMealLogId");

-- CreateIndex
CREATE INDEX "TreatmentLog_relatedSymptomLogId_idx" ON "TreatmentLog"("relatedSymptomLogId");

-- AddForeignKey
ALTER TABLE "TreatmentLog" ADD CONSTRAINT "TreatmentLog_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "Treatment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentLog" ADD CONSTRAINT "TreatmentLog_relatedMealLogId_fkey" FOREIGN KEY ("relatedMealLogId") REFERENCES "MealLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentLog" ADD CONSTRAINT "TreatmentLog_relatedSymptomLogId_fkey" FOREIGN KEY ("relatedSymptomLogId") REFERENCES "SymptomLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
