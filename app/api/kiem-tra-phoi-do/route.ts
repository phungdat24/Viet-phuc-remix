import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { kiemTraQuyTacVanHoa, KhongTimThayError } from "@/lib/rules/quyTacVanHoa";
import { kiemTraHoaHopMau } from "@/lib/rules/hoaHopMauSac";

const TOI_DA_PHU_KIEN = 10;

/** Lỗi không kết nối được database (vd: Supabase Free đang tạm dừng). */
function laLoiMatKetNoiDb(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  const noiDung = error instanceof Error ? error.message : "";
  return /can't reach database server|P1001|P1002/i.test(noiDung);
}

/**
 * POST /api/kiem-tra-phoi-do
 *
 * Gộp Lớp 1 (quy tắc văn hóa) + Lớp 2 (hòa hợp màu) trong 1 request duy nhất,
 * để frontend chỉ cần gọi 1 lần mỗi khi người dùng đổi lựa chọn.
 *
 * Body JSON:
 *  {
 *    "trangPhucId": string       (bắt buộc)
 *    "mauChinhId":  string       (bắt buộc)
 *    "mauPhuId":    string       (bắt buộc)
 *    "phuKienIds"?: string[]     (nhiều phụ kiện, tối đa 10)
 *    "phuKienId"?:  string|null  (bản cũ: 1 phụ kiện, vẫn được chấp nhận)
 *    "suKienId"?:   string|null
 *  }
 *
 * Response 200:
 *  {
 *    "data": {
 *      "phuHopVanHoa": { canhBao, mucDo, lyDo, nguonQuyTac, canChonDip, goiYThayThe,
 *                        trangPhuc, phuKien, cacPhuKien, chiTietPhuKien },
 *      "haiHoaMau":    { mucDo, goiY, khoangCachHue, mauChinh, mauPhu }
 *    }
 *  }
 * `canhBao` + `lyDo` và `mucDo` + `goiY` khớp với `ketQuaKiemTra` trong lib/localLookbook.ts.
 *
 * Lỗi: 400 (dữ liệu sai), 404 (id không còn trong database, thường do link/bộ lưu từ trước khi seed lại),
 *       503 (không kết nối được database), 500 (lỗi khác).
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

  let phuKienIds: string[] = [];
  if (b.phuKienIds != null) {
    if (!Array.isArray(b.phuKienIds) || !b.phuKienIds.every((x) => typeof x === "string")) {
      return NextResponse.json({ error: "Sai kiểu dữ liệu: phuKienIds phải là mảng string." }, { status: 400 });
    }
    if (b.phuKienIds.length > TOI_DA_PHU_KIEN) {
      return NextResponse.json({ error: `Chỉ được chọn tối đa ${TOI_DA_PHU_KIEN} phụ kiện.` }, { status: 400 });
    }
    phuKienIds = b.phuKienIds as string[];
  }

  try {
    const [phuHopVanHoa, haiHoaMau] = await Promise.all([
      kiemTraQuyTacVanHoa({
        trangPhucId: b.trangPhucId as string,
        phuKienIds,
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
      // Chi tiết (có id) chỉ ghi vào log; người dùng chỉ thấy câu dễ hiểu.
      console.warn("[POST /api/kiem-tra-phoi-do] id không tồn tại:", error.message);
      return NextResponse.json(
        {
          error:
            "Một số lựa chọn trong bộ phối này không còn trong hệ thống (có thể do dữ liệu đã được cập nhật). Hãy chọn lại trang phục, màu và phụ kiện.",
        },
        { status: 404 },
      );
    }
    if (laLoiMatKetNoiDb(error)) {
      console.error("[POST /api/kiem-tra-phoi-do] mất kết nối database:", error);
      return NextResponse.json(
        { error: "Hệ thống dữ liệu đang tạm nghỉ hoặc quá tải. Vui lòng thử lại sau ít phút." },
        { status: 503 },
      );
    }
    console.error("[POST /api/kiem-tra-phoi-do]", error);
    return NextResponse.json({ error: "Không thể kiểm tra phối đồ." }, { status: 500 });
  }
}