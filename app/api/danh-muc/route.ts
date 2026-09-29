import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Cache đơn giản trong bộ nhớ server — đủ dùng vì dữ liệu này hiếm khi đổi
let cache: { data: unknown; thoiDiem: number } | null = null;
const TTL_MS = 5 * 60 * 1000; // 5 phút

export async function GET() {
  try {
    if (cache && Date.now() - cache.thoiDiem < TTL_MS) {
      return NextResponse.json({ data: cache.data, cached: true });
    }

    const [trangPhuc, mauSac, phuKien, suKien] = await Promise.all([
      prisma.trangPhuc.findMany({ orderBy: { ten: "asc" } }),
      prisma.mauSac.findMany({ orderBy: { gocHue: "asc" } }),
      prisma.phuKien.findMany({ orderBy: { ten: "asc" } }),
      prisma.suKien.findMany({ orderBy: { ten: "asc" } }),
    ]);

    const data = { trangPhuc, mauSac, phuKien, suKien };
    cache = { data, thoiDiem: Date.now() };

    return NextResponse.json({ data, cached: false });
  } catch (error) {
    console.error("[GET /api/danh-muc]", error);
    return NextResponse.json({ error: "Không thể lấy danh mục." }, { status: 500 });
  }
}