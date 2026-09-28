import prisma from "@/lib/prisma";

/**
 * LỚP 1 — Quy tắc văn hóa (tra cứu DB, không gọi AI).
 *
 * Kiểm tra cặp (trang phục + phụ kiện) có hợp văn hóa không, có xét theo dịp.
 * Thứ tự ưu tiên:
 *   1. Quy tắc riêng cho đúng sự kiện (suKienId khớp)
 *   2. Quy tắc chung (suKienId = null)
 *   3. Không có quy tắc nào -> "chua_co_du_lieu" (KHÔNG cảnh báo, tránh báo sai)
 */

export type MucDoVanHoa =
  | "phu_hop"
  | "khong_phu_hop"
  | "tuy_dip"
  | "chua_co_du_lieu"
  | "khong_co_phu_kien"; // người dùng chưa chọn phụ kiện

export interface KetQuaVanHoa {
  /** true = hiện cảnh báo cho người dùng (chỉ khi mucDo = "khong_phu_hop"). */
  canhBao: boolean;
  mucDo: MucDoVanHoa;
  /** Lý do cảnh báo / ghi chú văn hóa. null nếu không có gì để nói. */
  lyDo: string | null;
  nguonQuyTac: "rieng_theo_su_kien" | "chung" | "khong_co";
  /** Chỉ có khi mucDo = "tuy_dip" mà chưa chọn dịp -> frontend nhắc chọn dịp. */
  canChonDip: boolean;
  /** Khi cảnh báo: tên các phụ kiện phù hợp hơn với trang phục này. */
  goiYThayThe: string[];
  trangPhuc: { id: string; ten: string };
  phuKien: { id: string; ten: string } | null;
}

export class KhongTimThayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KhongTimThayError";
  }
}

export async function kiemTraQuyTacVanHoa(input: {
  trangPhucId: string;
  phuKienId?: string | null;
  suKienId?: string | null;
}): Promise<KetQuaVanHoa> {
  const { trangPhucId } = input;
  const phuKienId = input.phuKienId || null;
  const suKienId = input.suKienId || null;

  const [trangPhuc, phuKien, suKien] = await Promise.all([
    prisma.trangPhuc.findUnique({ where: { id: trangPhucId } }),
    phuKienId ? prisma.phuKien.findUnique({ where: { id: phuKienId } }) : null,
    suKienId ? prisma.suKien.findUnique({ where: { id: suKienId } }) : null,
  ]);

  if (!trangPhuc) throw new KhongTimThayError(`Không tìm thấy trang phục với id "${trangPhucId}".`);
  if (phuKienId && !phuKien) throw new KhongTimThayError(`Không tìm thấy phụ kiện với id "${phuKienId}".`);
  if (suKienId && !suKien) throw new KhongTimThayError(`Không tìm thấy sự kiện với id "${suKienId}".`);

  const thongTinTrangPhuc = { id: trangPhuc.id, ten: trangPhuc.ten };

  // Chưa chọn phụ kiện -> không có gì để kiểm tra
  if (!phuKien) {
    return {
      canhBao: false,
      mucDo: "khong_co_phu_kien",
      lyDo: null,
      nguonQuyTac: "khong_co",
      canChonDip: false,
      goiYThayThe: [],
      trangPhuc: thongTinTrangPhuc,
      phuKien: null,
    };
  }

  const quyTacRieng = suKienId
    ? await prisma.quyTacPhuHop.findFirst({
        where: { trangPhucId, phuKienId: phuKien.id, suKienId },
      })
    : null;
  const quyTacChung = quyTacRieng
    ? null
    : await prisma.quyTacPhuHop.findFirst({
        where: { trangPhucId, phuKienId: phuKien.id, suKienId: null },
      });
  const quyTac = quyTacRieng ?? quyTacChung;

  const nguonQuyTac = quyTacRieng ? "rieng_theo_su_kien" : quyTacChung ? "chung" : "khong_co";
  const mucDo = (quyTac?.mucDo as MucDoVanHoa | undefined) ?? "chua_co_du_lieu";
  const canhBao = mucDo === "khong_phu_hop";
  const canChonDip = mucDo === "tuy_dip" && !suKienId;

  let lyDo = quyTac?.ghiChu ?? null;
  if (!lyDo) {
    if (canChonDip) lyDo = "Sự phù hợp còn tuỳ dịp. Hãy chọn thêm dịp để có kết quả chính xác.";
    else if (mucDo === "chua_co_du_lieu")
      lyDo = "Chưa có dữ liệu quy tắc cho cặp này, cần chuyên gia văn hoá bổ sung.";
  }

  // Khi cảnh báo, gợi ý vài phụ kiện phù hợp hơn để người dùng đổi
  let goiYThayThe: string[] = [];
  if (canhBao) {
    const phuHop = await prisma.quyTacPhuHop.findMany({
      where: { trangPhucId, mucDo: "phu_hop", suKienId: null },
      include: { phuKien: true },
      take: 3,
    });
    goiYThayThe = phuHop.map((q) => q.phuKien.ten);
  }

  return {
    canhBao,
    mucDo,
    lyDo,
    nguonQuyTac,
    canChonDip,
    goiYThayThe,
    trangPhuc: thongTinTrangPhuc,
    phuKien: { id: phuKien.id, ten: phuKien.ten },
  };
}
