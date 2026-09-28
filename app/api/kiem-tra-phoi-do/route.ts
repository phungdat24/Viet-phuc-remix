import { NextRequest, NextResponse } from "next/server";
import { kiemTraQuyTacVanHoa, KhongTimThayError } from "@/lib/rules/quyTacVanHoa";
import { kiemTraHoaHopMau } from "@/lib/rules/hoaHopMauSac";

/**
 * POST /api/kiem-tra-phoi-do
 *
 * Gộp Lớp 1 (quy tắc văn hóa) + Lớp 2 (hòa hợp màu) trong 1 request duy nhất,
 * để frontend chỉ cần gọi 1 lần mỗi khi người dùng đổi lựa chọn.
 *
 * Body JSON:
 *  {
 *    "trangPhucId": string   (bắt buộc)
 *    "mauChinhId":  string   (bắt buộc)
 *    "mauPhuId":    string   (bắt buộc)
 *    "phuKienId"?:  string | null
 *    "suKienId"?:   string | null
 *  }
 *
 * Response 200:
 *  {
 *    "data": {
 *      "phuHopVanHoa": { canhBao, mucDo, lyDo, nguonQuyTac, canChonDip, goiYThayThe, trangPhuc, phuKien },
 *      "haiHoaMau":    { mucDo, goiY, khoangCachHue, mauChinh, mauPhu }
 *    }
 *  }
 * `canhBao` + `lyDo` và `mucDo` + `goiY` khớp với `ketQuaKiemTra` trong lib/localLookbook.ts.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body request phải là JSON hợp lệ." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;

  const batBuoc = ["trangPhucId", "mauChinhId", "mauPhuId"] as const;
  for (const key of batBuoc) {
    if (typeof b[key] !== "string" || !b[key]) {
      return NextResponse.json({ error: `Thiếu hoặc sai kiểu dữ liệu: ${key}.` }, { status: 400 });
    }
  }
  for (const key of ["phuKienId", "suKienId"] as const) {
    if (b[key] != null && typeof b[key] !== "string") {
      return NextResponse.json({ error: `Sai kiểu dữ liệu: ${key} phải là string hoặc null.` }, { status: 400 });
    }
  }

  try {
    const [phuHopVanHoa, haiHoaMau] = await Promise.all([
      kiemTraQuyTacVanHoa({
        trangPhucId: b.trangPhucId as string,
        phuKienId: (b.phuKienId as string | null | undefined) ?? null,
        suKienId: (b.suKienId as string | null | undefined) ?? null,
      }),
      kiemTraHoaHopMau({
        mauChinhId: b.mauChinhId as string,
        mauPhuId: b.mauPhuId as string,
      }),
    ]);

    return NextResponse.json({ data: { phuHopVanHoa, haiHoaMau } });
  } catch (error) {
    if (error instanceof KhongTimThayError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("[POST /api/kiem-tra-phoi-do]", error);
    return NextResponse.json({ error: "Không thể kiểm tra phối đồ." }, { status: 500 });
  }
}
