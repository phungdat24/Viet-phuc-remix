import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * POST /api/kiem-tra-lop1
 *
 * Kiểm tra Lớp 1: quy tắc văn hóa giữa trang phục + phụ kiện, có xét theo
 * sự kiện/dịp (vd: một phụ kiện có thể phù hợp khi đi lễ Tết nhưng không
 * phù hợp khi đi làm hằng ngày).
 *
 * Body JSON:
 *  {
 *    "trangPhucId": string (bắt buộc),
 *    "phuKienId": string (bắt buộc),
 *    "suKienId"?: string (tuỳ chọn - dịp/sự kiện đang phối đồ)
 *  }
 *
 * Cách chọn quy tắc:
 *  1. Nếu có suKienId -> ưu tiên quy tắc riêng cho đúng sự kiện đó.
 *  2. Nếu không có quy tắc riêng -> dùng quy tắc chung (suKienId = null).
 *  3. Nếu không có quy tắc nào -> trả mucDo "chua_co_du_lieu".
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request phải là JSON hợp lệ." },
      { status: 400 }
    );
  }

  const { trangPhucId, phuKienId, suKienId } = (body ?? {}) as {
    trangPhucId?: unknown;
    phuKienId?: unknown;
    suKienId?: unknown;
  };

  if (typeof trangPhucId !== "string" || !trangPhucId) {
    return NextResponse.json(
      { error: "Thiếu hoặc sai kiểu dữ liệu: trangPhucId." },
      { status: 400 }
    );
  }
  if (typeof phuKienId !== "string" || !phuKienId) {
    return NextResponse.json(
      { error: "Thiếu hoặc sai kiểu dữ liệu: phuKienId." },
      { status: 400 }
    );
  }
  if (suKienId !== undefined && typeof suKienId !== "string") {
    return NextResponse.json(
      { error: "Sai kiểu dữ liệu: suKienId phải là string." },
      { status: 400 }
    );
  }
  const suKienIdSafe = (suKienId as string | undefined) || undefined;

  try {
    const [trangPhuc, phuKien, suKien] = await Promise.all([
      prisma.trangPhuc.findUnique({ where: { id: trangPhucId } }),
      prisma.phuKien.findUnique({ where: { id: phuKienId } }),
      suKienIdSafe
        ? prisma.suKien.findUnique({ where: { id: suKienIdSafe } })
        : Promise.resolve(null),
    ]);

    if (!trangPhuc) {
      return NextResponse.json(
        { error: `Không tìm thấy trang phục với id "${trangPhucId}".` },
        { status: 404 }
      );
    }
    if (!phuKien) {
      return NextResponse.json(
        { error: `Không tìm thấy phụ kiện với id "${phuKienId}".` },
        { status: 404 }
      );
    }
    if (suKienIdSafe && !suKien) {
      return NextResponse.json(
        { error: `Không tìm thấy sự kiện với id "${suKienIdSafe}".` },
        { status: 404 }
      );
    }

        // Ưu tiên quy tắc riêng cho sự kiện cụ thể (nếu có truyền suKienId)
    const quyTacRieng = suKienIdSafe
      ? await prisma.quyTacPhuHop.findFirst({
          where: { trangPhucId, phuKienId, suKienId: suKienIdSafe },
        })
      : null;

    // Fallback: quy tắc chung áp dụng cho mọi dịp
    const quyTacChung = !quyTacRieng
      ? await prisma.quyTacPhuHop.findFirst({
          where: { trangPhucId, phuKienId, suKienId: null },
        })
      : null;

    const quyTacApDung = quyTacRieng ?? quyTacChung;
    const nguonQuyTac: "rieng_theo_su_kien" | "chung" | "khong_co" =
      quyTacRieng ? "rieng_theo_su_kien" : quyTacChung ? "chung" : "khong_co";

    const mucDo = quyTacApDung?.mucDo ?? "chua_co_du_lieu";
    const canChonDip = mucDo === "tuy_dip" && !suKienIdSafe;

    let phuHop: boolean | null;
    let goiY: string;
    switch (mucDo) {
      case "phu_hop":
        phuHop = true;
        goiY = "Trang phục và phụ kiện này phù hợp về mặt văn hóa, có thể phối cùng nhau.";
        break;
      case "khong_phu_hop":
        phuHop = false;
        goiY =
          "Trang phục và phụ kiện này không phù hợp về mặt văn hóa. Nên chọn phụ kiện khác.";
        break;
      case "tuy_dip":
        phuHop = null;
        goiY = canChonDip
          ? "Sự phù hợp còn tuỳ dịp/sự kiện. Vui lòng chọn thêm dịp (suKienId) để có kết quả chính xác."
          : "Chưa có quy tắc riêng cho dịp này, kết quả nói chung là tuỳ theo bối cảnh sử dụng.";
        break;
      default:
        phuHop = null;
        goiY =
          "Chưa có dữ liệu quy tắc cho cặp trang phục/phụ kiện này, cần chuyên gia văn hóa bổ sung thêm.";
    }

    return NextResponse.json({
      data: {
        trangPhuc: { id: trangPhuc.id, ten: trangPhuc.ten },
        phuKien: { id: phuKien.id, ten: phuKien.ten },
        suKien: suKien ? { id: suKien.id, ten: suKien.ten } : null,
        ketQua: {
          mucDo,
          phuHop,
          nguonQuyTac,
          canChonDip,
          ghiChu: quyTacApDung?.ghiChu ?? null,
          goiY,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/kiem-tra-lop1]", error);
    return NextResponse.json(
      { error: "Không thể kiểm tra quy tắc văn hóa (Lớp 1)." },
      { status: 500 }
    );
  }
}
