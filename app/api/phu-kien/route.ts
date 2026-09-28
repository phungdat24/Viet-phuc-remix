import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/phu-kien
 *
 * Query params (đều optional):
 *  - vungMien: lọc theo vùng miền
 *  - q: tìm theo tên phụ kiện (không phân biệt hoa thường)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vungMien = searchParams.get("vungMien");
    const q = searchParams.get("q");

    const where: Prisma.PhuKienWhereInput = {
      ...(vungMien ? { vungMien } : {}),
      ...(q ? { ten: { contains: q, mode: "insensitive" } } : {}),
    };

    const danhSach = await prisma.phuKien.findMany({
      where,
      orderBy: { ten: "asc" },
    });

    return NextResponse.json({ data: danhSach, total: danhSach.length });
  } catch (error) {
    console.error("[GET /api/phu-kien]", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách phụ kiện." },
      { status: 500 }
    );
  }
}
