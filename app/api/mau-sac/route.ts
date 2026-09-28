import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * GET /api/mau-sac
 *
 * Query params (đều optional):
 *  - laTrungTinh: "1" | "0" -> chỉ lấy màu trung tính / không trung tính
 *  - q: tìm theo tên màu (không phân biệt hoa thường)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const laTrungTinhParam = searchParams.get("laTrungTinh");
    const q = searchParams.get("q");

    const where: Prisma.MauSacWhereInput = {
      ...(laTrungTinhParam !== null
        ? { laTrungTinh: laTrungTinhParam === "1" }
        : {}),
      ...(q ? { ten: { contains: q, mode: "insensitive" } } : {}),
    };

    const danhSach = await prisma.mauSac.findMany({
      where,
      orderBy: { gocHue: "asc" },
    });

    return NextResponse.json({ data: danhSach, total: danhSach.length });
  } catch (error) {
    console.error("[GET /api/mau-sac]", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách màu sắc." },
      { status: 500 }
    );
  }
}
