import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hexToHsl, phanLoaiHaiHoaMau } from "@/lib/color";

/**
 * POST /api/kiem-tra-lop2
 *
 * Kiểm tra Lớp 2: độ hài hòa màu sắc giữa màu chính và màu phụ, dựa trên
 * công thức khoảng cách góc Hue (HSL) và bộ quy tắc phối màu phổ thông
 * (Đồng sắc / Tương đồng / Tam giác / Bổ túc).
 *
 * Body JSON - chọn 1 trong 2 cách cung cấp mỗi màu:
 *  {
 *    "mauChinhId"?: string,   // id trong bảng MauSac
 *    "mauPhuId"?: string,
 *    "mauChinhHex"?: string,  // hoặc truyền thẳng mã hex, vd "#8B0000"
 *    "mauPhuHex"?: string
 *  }
 * (mauChinh* và mauPhu* mỗi bên bắt buộc có đúng 1 trong 2: *Id hoặc *Hex)
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

  const { mauChinhId, mauPhuId, mauChinhHex, mauPhuHex } = (body ?? {}) as {
    mauChinhId?: unknown;
    mauPhuId?: unknown;
    mauChinhHex?: unknown;
    mauPhuHex?: unknown;
  };

  const layThongTinMau = async (
    nhan: "mauChinh" | "mauPhu",
    id: unknown,
    hex: unknown
  ): Promise<
    | { loi: string }
    | { loi: null; ten: string | null; gocHue: number; laTrungTinh: boolean; maHex: string }
  > => {
    const idHopLe = typeof id === "string" && id.length > 0 ? id : undefined;
    const hexHopLe = typeof hex === "string" && hex.length > 0 ? hex : undefined;

    if (!idHopLe && !hexHopLe) {
      return { loi: `Thiếu dữ liệu màu: cần truyền "${nhan}Id" hoặc "${nhan}Hex".` };
    }
    if (idHopLe && hexHopLe) {
      return {
        loi: `Chỉ được truyền 1 trong 2: "${nhan}Id" hoặc "${nhan}Hex", không phải cả hai.`,
      };
    }

    if (idHopLe) {
      const mau = await prisma.mauSac.findUnique({ where: { id: idHopLe } });
      if (!mau) {
        return { loi: `Không tìm thấy màu với id "${idHopLe}" (${nhan}Id).` };
      }
      return {
        loi: null,
        ten: mau.ten,
        gocHue: mau.gocHue,
        laTrungTinh: mau.laTrungTinh,
        maHex: mau.maHex,
      };
    }

    try {
      const { h } = hexToHsl(hexHopLe as string);
      return { loi: null, ten: null, gocHue: h, laTrungTinh: false, maHex: hexHopLe as string };
    } catch {
      return { loi: `Mã hex không hợp lệ cho "${nhan}Hex": "${hexHopLe}".` };
    }
  };

  try {
    const [mauChinh, mauPhu] = await Promise.all([
      layThongTinMau("mauChinh", mauChinhId, mauChinhHex),
      layThongTinMau("mauPhu", mauPhuId, mauPhuHex),
    ]);

    const loiList = [mauChinh, mauPhu]
      .filter((m): m is { loi: string } => m.loi !== null)
      .map((m) => m.loi);
    if (loiList.length > 0) {
      return NextResponse.json({ error: loiList.join(" ") }, { status: 400 });
    }

    // Sau bước lọc loi phía trên, TypeScript chưa tự narrow được nên ép kiểu tường minh.
    const chinh = mauChinh as Exclude<typeof mauChinh, { loi: string }>;
    const phu = mauPhu as Exclude<typeof mauPhu, { loi: string }>;

    const ketQua = phanLoaiHaiHoaMau(chinh.gocHue, phu.gocHue, {
      laTrungTinh1: chinh.laTrungTinh,
      laTrungTinh2: phu.laTrungTinh,
    });

    return NextResponse.json({
      data: {
        mauChinh: { ten: chinh.ten, maHex: chinh.maHex, gocHue: chinh.gocHue },
        mauPhu: { ten: phu.ten, maHex: phu.maHex, gocHue: phu.gocHue },
        ketQua,
      },
    });
  } catch (error) {
    console.error("[POST /api/kiem-tra-lop2]", error);
    return NextResponse.json(
      { error: "Không thể kiểm tra hài hòa màu (Lớp 2)." },
      { status: 500 }
    );
  }
}
