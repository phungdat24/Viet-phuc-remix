-- CreateTable
CREATE TABLE "TrangPhuc" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "vungMien" TEXT NOT NULL,
    "doiTuong" TEXT NOT NULL,

    CONSTRAINT "TrangPhuc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoiDungVanHoa" (
    "id" TEXT NOT NULL,
    "trangPhucId" TEXT NOT NULL,
    "tieuDe" TEXT NOT NULL,
    "noiDung" TEXT NOT NULL,
    "nguonThamKhao" TEXT,

    CONSTRAINT "NoiDungVanHoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MauSac" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "maHex" TEXT NOT NULL,
    "gocHue" DOUBLE PRECISION NOT NULL,
    "laTrungTinh" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MauSac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhuKien" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "vungMien" TEXT NOT NULL,

    CONSTRAINT "PhuKien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuKien" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,

    CONSTRAINT "SuKien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuyTacPhuHop" (
    "id" TEXT NOT NULL,
    "trangPhucId" TEXT NOT NULL,
    "phuKienId" TEXT NOT NULL,
    "mucDo" TEXT NOT NULL,
    "ghiChu" TEXT,

    CONSTRAINT "QuyTacPhuHop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanhGiaMauSac" (
    "id" TEXT NOT NULL,
    "mucDo" TEXT NOT NULL,
    "noiDungAiSinh" TEXT NOT NULL,

    CONSTRAINT "DanhGiaMauSac_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToHopDuocDuyet" (
    "id" TEXT NOT NULL,
    "comboKey" TEXT NOT NULL,
    "trangPhucId" TEXT NOT NULL,
    "mauChinhId" TEXT NOT NULL,
    "mauPhuId" TEXT NOT NULL,
    "phuKienId" TEXT NOT NULL,
    "suKienId" TEXT NOT NULL,
    "danhGiaMauId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "aiAssessment" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToHopDuocDuyet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ToHopDuocDuyet_comboKey_key" ON "ToHopDuocDuyet"("comboKey");

-- AddForeignKey
ALTER TABLE "NoiDungVanHoa" ADD CONSTRAINT "NoiDungVanHoa_trangPhucId_fkey" FOREIGN KEY ("trangPhucId") REFERENCES "TrangPhuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuyTacPhuHop" ADD CONSTRAINT "QuyTacPhuHop_trangPhucId_fkey" FOREIGN KEY ("trangPhucId") REFERENCES "TrangPhuc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuyTacPhuHop" ADD CONSTRAINT "QuyTacPhuHop_phuKienId_fkey" FOREIGN KEY ("phuKienId") REFERENCES "PhuKien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
