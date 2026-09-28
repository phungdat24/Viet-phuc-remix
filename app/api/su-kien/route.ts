import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/su-kien
 * Trả về danh sách dịp/sự kiện (Tết, Lễ hội, Cưới hỏi...).
 */
export async function GET() {
  try {
    const danhSach = await prisma.suKien.findMany({ orderBy: { ten: "asc" } });
    return NextResponse.json({ data: danhSach, total: danhSach.length });
  } catch (error) {
    console.error("[GET /api/su-kien]", error);
    return NextResponse.json({ error: "Không thể lấy danh sách sự kiện." }, { status: 500 });
  }
}
