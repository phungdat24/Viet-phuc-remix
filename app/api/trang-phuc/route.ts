import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/trang-phuc
 *
 * Query params (đều optional):
 *  - vungMien: lọc theo vùng miền (vd: "Bắc", "Trung", "Nam")
 *  - doiTuong: lọc theo đối tượng (vd: "nam", "nu", "unisex")
 *  - q: tìm theo tên trang phục (không phân biệt hoa thường)
 *  - kemNoiDungVanHoa: "1" -> trả kèm nội dung văn hóa liên quan
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vungMien = searchParams.get("vungMien");
    const doiTuong = searchParams.get("doiTuong");
    const q = searchParams.get("q");
    const kemNoiDungVanHoa = searchParams.get("kemNoiDungVanHoa") === "1";

    const where: Prisma.TrangPhucWhereInput = {
      ...(vungMien ? { vungMien } : {}),
      ...(doiTuong ? { doiTuong } : {}),
      ...(q ? { ten: { contains: q, mode: "insensitive" } } : {}),
    };

    const danhSach = await prisma.trangPhuc.findMany({
      where,
      orderBy: { ten: "asc" },
      include: kemNoiDungVanHoa ? { noiDungVanHoa: true } : undefined,
    });

    return NextResponse.json({ data: danhSach, total: danhSach.length });
  } catch (error) {
    console.error("[GET /api/trang-phuc]", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách trang phục." },
      { status: 500 }
    );
  }
}
