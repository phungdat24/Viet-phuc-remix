import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/quy-tac-van-hoa?trangPhucId=...
 * Trả toàn bộ quy tắc phụ kiện của MỘT trang phục, để giao diện hiện lý do cụ thể ngay khi chọn phụ kiện.
 * Kết quả thẩm định cuối cùng vẫn do POST /api/kiem-tra-phoi-do quyết định.
 */
export async function GET(request: NextRequest) {
  const trangPhucId = request.nextUrl.searchParams.get("trangPhucId");
  if (!trangPhucId) {
    return NextResponse.json({ error: "Thiếu tham số trangPhucId." }, { status: 400 });
  }

  try {
    const quyTacs = await prisma.quyTacPhuHop.findMany({
      where: { trangPhucId },
      select: { phuKienId: true, suKienId: true, mucDo: true, ghiChu: true },
    });

    return NextResponse.json(
      { data: quyTacs, total: quyTacs.length },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch (error) {
    console.error("[GET /api/quy-tac-van-hoa]", error);
    return NextResponse.json({ error: "Không thể tải quy tắc văn hoá." }, { status: 500 });
  }
}