import prisma from "@/lib/prisma";

/**
 * LỚP 1 — Quy tắc văn hóa (tra cứu DB, không gọi AI).
 *
 * Kiểm tra (trang phục + MỘT HOẶC NHIỀU phụ kiện) có hợp văn hóa không, có xét theo dịp.
 * Với mỗi phụ kiện, thứ tự ưu tiên:
 *   1. Quy tắc riêng cho đúng sự kiện (suKienId khớp)
 *   2. Quy tắc chung (suKienId = null)
 *   3. Không có quy tắc nào -> "chua_co_du_lieu" (KHÔNG cảnh báo, tránh báo sai)
 *
 * Kết quả chung lấy mức "nặng nhất" trong các phụ kiện:
 *   khong_phu_hop > tuy_dip > phu_hop > chua_co_du_lieu
 */

export type MucDoVanHoa =
  | "phu_hop"
  | "khong_phu_hop"
  | "tuy_dip"
  | "chua_co_du_lieu"
  | "khong_co_phu_kien"; // người dùng chưa chọn phụ kiện

export type NguonQuyTac = "rieng_theo_su_kien" | "chung" | "khong_co";

/** Kết quả riêng cho từng phụ kiện. */
export interface KetQuaVanHoaMotPhuKien {
  phuKien: { id: string; ten: string };
  mucDo: MucDoVanHoa;
  lyDo: string | null;
  nguonQuyTac: NguonQuyTac;
}

export interface KetQuaVanHoa {
  /** true = hiện cảnh báo cho người dùng (khi có ít nhất 1 phụ kiện "khong_phu_hop"). */
  canhBao: boolean;
  /** Mức độ chung (mức nặng nhất trong các phụ kiện). */
  mucDo: MucDoVanHoa;
  /** Lý do cảnh báo / ghi chú văn hóa (đã gộp, có ghi tên phụ kiện khi chọn nhiều). */
  lyDo: string | null;
  nguonQuyTac: NguonQuyTac;
  /** Có ít nhất 1 phụ kiện "tuy_dip" mà chưa chọn dịp -> frontend nhắc chọn dịp. */
  canChonDip: boolean;
  /** Khi cảnh báo: tên các phụ kiện phù hợp hơn với trang phục này (không gồm món đã chọn). */
  goiYThayThe: string[];
  trangPhuc: { id: string; ten: string };
  /** Giữ để tương thích bản cũ: phụ kiện đầu tiên (null nếu không chọn). */
  phuKien: { id: string; ten: string } | null;
  /** Tất cả phụ kiện đã chọn. */
  cacPhuKien: { id: string; ten: string }[];
  /** Kết quả chi tiết từng phụ kiện. */
  chiTietPhuKien: KetQuaVanHoaMotPhuKien[];
}

export class KhongTimThayError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KhongTimThayError";
  }
}

const TOI_DA_PHU_KIEN = 10;
const LY_DO_MAC_DINH_KHONG_PHU_HOP = "có thể làm sai lệch đặc trưng văn hoá gốc.";

/** Điểm ưu tiên: càng cao càng "nặng". */
const DO_NANG: Record<MucDoVanHoa, number> = {
  khong_phu_hop: 4,
  tuy_dip: 3,
  phu_hop: 2,
  chua_co_du_lieu: 1,
  khong_co_phu_kien: 0,
};

function gopLyDo(chiTiet: KetQuaVanHoaMotPhuKien[], mucDoChung: MucDoVanHoa): string | null {
  if (chiTiet.length === 1) return chiTiet[0].lyDo;

  const dong = chiTiet
    .filter((c) => c.mucDo === mucDoChung)
    .map((c) => {
      const lyDo = c.lyDo ?? (c.mucDo === "khong_phu_hop" ? LY_DO_MAC_DINH_KHONG_PHU_HOP : null);
      return lyDo ? `${c.phuKien.ten}: ${lyDo}` : null;
    })
    .filter((x): x is string => Boolean(x));

  if (mucDoChung === "phu_hop") {
    const thieu = chiTiet.filter((c) => c.mucDo === "chua_co_du_lieu").map((c) => c.phuKien.ten);
    if (thieu.length > 0) dong.push(`Chưa có dữ liệu quy tắc cho: ${thieu.join(", ")}.`);
  }

  return dong.length > 0 ? dong.join(" ") : null;
}

export async function kiemTraQuyTacVanHoa(input: {
  trangPhucId: string;
  /** Danh sách phụ kiện (khuyến nghị dùng). */
  phuKienIds?: string[] | null;
  /** Tương thích bản cũ: 1 phụ kiện. */
  phuKienId?: string | null;
  suKienId?: string | null;
}): Promise<KetQuaVanHoa> {
  const { trangPhucId } = input;
  const suKienId = input.suKienId || null;

  const ids = Array.from(
    new Set([...(input.phuKienIds ?? []), ...(input.phuKienId ? [input.phuKienId] : [])].filter(Boolean)),
  ).slice(0, TOI_DA_PHU_KIEN);

  const [trangPhuc, danhSachPhuKien, suKien] = await Promise.all([
    prisma.trangPhuc.findUnique({ where: { id: trangPhucId } }),
    ids.length > 0 ? prisma.phuKien.findMany({ where: { id: { in: ids } } }) : Promise.resolve([]),
    suKienId ? prisma.suKien.findUnique({ where: { id: suKienId } }) : Promise.resolve(null),
  ]);

  if (!trangPhuc) throw new KhongTimThayError(`Không tìm thấy trang phục với id "${trangPhucId}".`);
  if (suKienId && !suKien) throw new KhongTimThayError(`Không tìm thấy sự kiện với id "${suKienId}".`);

  // Dùng Map để tra nhanh và giữ đúng thứ tự người dùng chọn.
  const phuKienTheoId = new Map(danhSachPhuKien.map((p) => [p.id, p]));
  const cacPhuKien = ids.map((id) => {
    const pk = phuKienTheoId.get(id);
    if (!pk) throw new KhongTimThayError(`Không tìm thấy phụ kiện với id "${id}".`);
    return pk;
  });

  const thongTinTrangPhuc = { id: trangPhuc.id, ten: trangPhuc.ten };

  // Chưa chọn phụ kiện -> không có gì để kiểm tra
  if (cacPhuKien.length === 0) {
    return {
      canhBao: false,
      mucDo: "khong_co_phu_kien",
      lyDo: null,
      nguonQuyTac: "khong_co",
      canChonDip: false,
      goiYThayThe: [],
      trangPhuc: thongTinTrangPhuc,
      phuKien: null,
      cacPhuKien: [],
      chiTietPhuKien: [],
    };
  }

  // 1 truy vấn lấy quy tắc của tất cả phụ kiện (riêng theo dịp + chung)
  const quyTacs = await prisma.quyTacPhuHop.findMany({
    where: {
      trangPhucId,
      phuKienId: { in: cacPhuKien.map((p) => p.id) },
      OR: [{ suKienId: null }, ...(suKienId ? [{ suKienId }] : [])],
    },
  });

  const chiTietPhuKien: KetQuaVanHoaMotPhuKien[] = cacPhuKien.map((pk) => {
    const quyTacRieng = suKienId
      ? quyTacs.find((q) => q.phuKienId === pk.id && q.suKienId === suKienId)
      : undefined;
    const quyTacChung = quyTacRieng
      ? undefined
      : quyTacs.find((q) => q.phuKienId === pk.id && q.suKienId === null);
    const quyTac = quyTacRieng ?? quyTacChung;

    const nguonQuyTac: NguonQuyTac = quyTacRieng ? "rieng_theo_su_kien" : quyTacChung ? "chung" : "khong_co";
    const mucDo = (quyTac?.mucDo as MucDoVanHoa | undefined) ?? "chua_co_du_lieu";

    let lyDo = quyTac?.ghiChu ?? null;
    if (!lyDo) {
      if (mucDo === "tuy_dip" && !suKienId) {
        lyDo = "Sự phù hợp còn tuỳ dịp. Hãy chọn thêm dịp để có kết quả chính xác.";
      } else if (mucDo === "chua_co_du_lieu") {
        lyDo = "Chưa có dữ liệu quy tắc cho cặp này, cần chuyên gia văn hoá bổ sung.";
      }
    }

    return { phuKien: { id: pk.id, ten: pk.ten }, mucDo, lyDo, nguonQuyTac };
  });

  // Mức chung = mức nặng nhất
  const mucDoChung = chiTietPhuKien.reduce<MucDoVanHoa>(
    (nang, c) => (DO_NANG[c.mucDo] > DO_NANG[nang] ? c.mucDo : nang),
    "chua_co_du_lieu",
  );
  const canhBao = chiTietPhuKien.some((c) => c.mucDo === "khong_phu_hop");
  const canChonDip = !suKienId && chiTietPhuKien.some((c) => c.mucDo === "tuy_dip");
  const nguonChung = chiTietPhuKien.find((c) => c.mucDo === mucDoChung)?.nguonQuyTac ?? "khong_co";

  // Khi cảnh báo, gợi ý vài phụ kiện phù hợp hơn (không lặp lại món đã chọn)
  let goiYThayThe: string[] = [];
  if (canhBao) {
    const phuHop = await prisma.quyTacPhuHop.findMany({
      where: {
        trangPhucId,
        mucDo: "phu_hop",
        suKienId: null,
        phuKienId: { notIn: cacPhuKien.map((p) => p.id) },
      },
      include: { phuKien: true },
      take: 3,
    });
    goiYThayThe = phuHop.map((q) => q.phuKien.ten);
  }

  return {
    canhBao,
    mucDo: mucDoChung,
    lyDo: gopLyDo(chiTietPhuKien, mucDoChung),
    nguonQuyTac: nguonChung,
    canChonDip,
    goiYThayThe,
    trangPhuc: thongTinTrangPhuc,
    phuKien: chiTietPhuKien[0].phuKien,
    cacPhuKien: chiTietPhuKien.map((c) => c.phuKien),
    chiTietPhuKien,
  };
}