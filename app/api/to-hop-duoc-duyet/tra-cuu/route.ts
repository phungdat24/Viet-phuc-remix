import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { taoComboKey, gopPhuKienId } from "@/lib/comboKey";

const TOI_DA_PHU_KIEN = 10;

/**
 * GET /api/to-hop-duoc-duyet/tra-cuu
 *
 * Chỉ TRA CỨU ảnh AI đã có cho một tổ hợp, KHÔNG BAO GIỜ sinh ảnh mới (khác với POST ở route cha),
 * nên an toàn để trang so sánh gọi cho cả hai bộ mà không tốn chi phí AI.
 *
 * Query (đều bắt buộc trừ phuKienIds): trangPhucId, mauChinhId, mauPhuId, suKienId,
 *   phuKienIds = "id1,id2" (bỏ trống = không phụ kiện; thứ tự không quan trọng).
 * Trả { data: { id, imageUrl } | null }. Tổ hợp bị từ chối hoặc chưa có ảnh -> data = null.
 */
export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams;
  const trangPhucId = q.get("trangPhucId");
  const mauChinhId = q.get("mauChinhId");
  const mauPhuId = q.get("mauPhuId");
  const suKienId = q.get("suKienId");
  const cacPhuKienId = (q.get("phuKienIds") ?? "").split(",").filter(Boolean);

  if (!trangPhucId || !mauChinhId || !mauPhuId || !suKienId) {
    return NextResponse.json(
      { error: "Thiếu trangPhucId, mauChinhId, mauPhuId hoặc suKienId." },
      { status: 400 },
    );
  }
  if (cacPhuKienId.length > TOI_DA_PHU_KIEN) {
    return NextResponse.json({ error: `Chỉ được chọn tối đa ${TOI_DA_PHU_KIEN} phụ kiện.` }, { status: 400 });
  }

  let comboKey: string;
  try {
    comboKey = taoComboKey({
      trangPhucId,
      mauChinhId,
      mauPhuId,
      phuKienId: gopPhuKienId(cacPhuKienId),
      suKienId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "comboKey không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const toHop = await prisma.toHopDuocDuyet.findUnique({
      where: { comboKey },
      select: { id: true, imageUrl: true, status: true },
    });
    if (!toHop || !toHop.imageUrl || toHop.status === "rejected") {
      return NextResponse.json({ data: null });
    }
    return NextResponse.json({ data: { id: toHop.id, imageUrl: toHop.imageUrl } });
  } catch (error) {
    console.error("[tra-cuu to-hop] lỗi:", error);
    return NextResponse.json({ error: "Không tra cứu được ảnh lúc này." }, { status: 500 });
  }
}
