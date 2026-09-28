-- AlterTable
ALTER TABLE "QuyTacPhuHop" ADD COLUMN "suKienId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "QuyTacPhuHop_trangPhucId_phuKienId_suKienId_key" ON "QuyTacPhuHop"("trangPhucId", "phuKienId", "suKienId");

-- AddForeignKey
ALTER TABLE "QuyTacPhuHop" ADD CONSTRAINT "QuyTacPhuHop_suKienId_fkey" FOREIGN KEY ("suKienId") REFERENCES "SuKien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
