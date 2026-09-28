import prisma from "@/lib/prisma";
import { hueDistance } from "@/lib/color";
import { KhongTimThayError } from "@/lib/rules/quyTacVanHoa";

/**
 * LỚP 2 — Độ hòa hợp màu sắc.
 *
 * Bước 1 (toán thuần, KHÔNG gọi AI): dựa vào góc Hue của 2 màu -> 1 trong 4 mức.
 * Bước 2 (tra cứu): lấy 1 câu nhận xét có sẵn trong bảng DanhGiaMauSac
 *          (bảng chỉ có 4 dòng, seed ở prisma/seed.ts).
 */

export type MucDoMau = "tuong_dong" | "bo_tuc" | "trung_tinh" | "lech_tong";

export interface MauDauVao {
  gocHue: number;
  laTrungTinh: boolean;
}

/** Hàm thuần: có thể test độc lập, không cần DB. */
export function tinhMucDoHoaHop(a: MauDauVao, b: MauDauVao): { mucDo: MucDoMau; khoangCachHue: number } {
  const khoangCachHue = hueDistance(a.gocHue, b.gocHue);

  // Có màu trung tính (trắng ngà, đen huyền, nâu, be...) -> luôn an toàn
  if (a.laTrungTinh || b.laTrungTinh) return { mucDo: "trung_tinh", khoangCachHue };
  // Liền kề hoặc cùng tông: <= 45°
  if (khoangCachHue <= 45) return { mucDo: "tuong_dong", khoangCachHue };
  // Gần đối nhau trên vòng màu: >= 135° (vd Đỏ son 7° / Lục ngọc 146°)
  if (khoangCachHue >= 135) return { mucDo: "bo_tuc", khoangCachHue };
  // Khoảng giữa (45°–135°): không rơi vào quy tắc nào
  return { mucDo: "lech_tong", khoangCachHue };
}

const CAU_DU_PHONG: Record<MucDoMau, string> = {
  tuong_dong: "Hai tông màu gần nhau, tạo cảm giác hài hoà.",
  bo_tuc: "Hai màu tương phản mạnh, tạo điểm nhấn nổi bật.",
  trung_tinh: "Phối cùng tông trung tính luôn an toàn.",
  lech_tong: "Hai màu hơi lệch tông, nên thêm chi tiết trung tính để cân bằng.",
};

export interface KetQuaHoaHopMau {
  mucDo: MucDoMau;
  /** Câu nhận xét lấy từ DanhGiaMauSac (đã sinh sẵn, không gọi AI lúc chạy). */
  goiY: string;
  khoangCachHue: number;
  mauChinh: { id: string; ten: string; maHex: string; gocHue: number };
  mauPhu: { id: string; ten: string; maHex: string; gocHue: number };
}

export async function kiemTraHoaHopMau(input: {
  mauChinhId: string;
  mauPhuId: string;
}): Promise<KetQuaHoaHopMau> {
  const [mauChinh, mauPhu] = await Promise.all([
    prisma.mauSac.findUnique({ where: { id: input.mauChinhId } }),
    prisma.mauSac.findUnique({ where: { id: input.mauPhuId } }),
  ]);
  if (!mauChinh) throw new KhongTimThayError(`Không tìm thấy màu chính với id "${input.mauChinhId}".`);
  if (!mauPhu) throw new KhongTimThayError(`Không tìm thấy màu phụ với id "${input.mauPhuId}".`);

  const { mucDo, khoangCachHue } = tinhMucDoHoaHop(mauChinh, mauPhu);

  // Chỉ tra cứu 1 câu có sẵn, không sinh mới
  const danhGia = await prisma.danhGiaMauSac.findFirst({ where: { mucDo } });

  const rut = (m: typeof mauChinh) => ({ id: m.id, ten: m.ten, maHex: m.maHex, gocHue: m.gocHue });
  return {
    mucDo,
    goiY: danhGia?.noiDungAiSinh ?? CAU_DU_PHONG[mucDo],
    khoangCachHue,
    mauChinh: rut(mauChinh),
    mauPhu: rut(mauPhu),
  };
}
