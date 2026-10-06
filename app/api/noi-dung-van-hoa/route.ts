import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET /api/noi-dung-van-hoa?trangPhucId=...
 * Trả nội dung văn hoá (tiêu đề, nội dung, nguồn tham khảo) của một trang phục.
 * Response 200: { data: [{ id, tieuDe, noiDung, nguonThamKhao }], total }
 */
export async function GET(request: NextRequest) {
  const trangPhucId = new URL(request.url).searchParams.get("trangPhucId");
  if (!trangPhucId) {
    return NextResponse.json({ error: "Thiếu trangPhucId." }, { status: 400 });
  }

  try {
    const data = await prisma.noiDungVanHoa.findMany({
      where: { trangPhucId },
      select: { id: true, tieuDe: true, noiDung: true, nguonThamKhao: true },
    });
    return NextResponse.json(
      { data, total: data.length },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("[GET /api/noi-dung-van-hoa]", error);
    return NextResponse.json({ error: "Không tải được nội dung văn hoá." }, { status: 500 });
  }
}