-- CreateTable
CREATE TABLE "SymptomLog" (
    "id" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL,
    "bloating" INTEGER NOT NULL,
    "pain" INTEGER NOT NULL,
    "gas" INTEGER NOT NULL,
    "transit" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "sleep" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SymptomLog_loggedAt_idx" ON "SymptomLog"("loggedAt");
