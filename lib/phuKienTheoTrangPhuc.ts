/**
 * Phụ kiện gợi ý theo từng trang phục + cách gom nhóm.
 * - Tên phải KHỚP với cột `ten` trong DB.
 * - PHU_KIEN_THEO_TRANG_PHUC = danh sách PHÙ HỢP, chỉ dùng DỰ PHÒNG khi không tải được quy tắc từ máy chủ.
 *   Quy tắc chính thức nằm trong DB (đồng bộ từ lib/vanHoa/quyTacDongBo.ts).
 * - `chiChonMot: true` => trong nhóm đó chỉ chọn được 1 món.
 */

export const PHU_KIEN_THEO_TRANG_PHUC: Record<string, string[]> = {
  'Áo dài': ['Nón lá', 'Khăn đóng', 'Trâm cài', 'Quạt giấy', 'Guốc mộc'],
  'Áo tứ thân': ['Nón quai thao', 'Khăn mỏ quạ', 'Yếm đào', 'Trâm cài', 'Quạt giấy', 'Guốc mộc', 'Nón lá'],
  'Áo bà ba': ['Nón lá', 'Khăn rằn', 'Quạt giấy', 'Guốc mộc'],
};

export interface NhomPhuKien {
  ten: string;
  cacPhuKien: string[];
  chiChonMot: boolean;
}

export const NHOM_PHU_KIEN: NhomPhuKien[] = [
  { ten: 'Nón', cacPhuKien: ['Nón lá', 'Nón quai thao'], chiChonMot: true },
  { ten: 'Khăn', cacPhuKien: ['Khăn đóng', 'Khăn mỏ quạ', 'Khăn rằn'], chiChonMot: true },
  { ten: 'Trang sức & vật dụng', cacPhuKien: ['Trâm cài', 'Quạt giấy'], chiChonMot: false },
  { ten: 'Giày dép', cacPhuKien: ['Guốc mộc'], chiChonMot: false },
  { ten: 'Trang phục kèm', cacPhuKien: ['Yếm đào'], chiChonMot: false },
];

/**
 * Hai nhóm đồ đội đầu KHÔNG dùng cùng lúc: mỗi món của nhóm này xung đột với mọi món của nhóm kia.
 * (Khăn rằn quấn ở cổ nên không nằm trong danh sách này.)
 */
export const NHOM_XUNG_DOT: [string[], string[]] = [
  ['Nón lá', 'Nón quai thao'],
  ['Khăn đóng', 'Khăn mỏ quạ'],
];

export function chuanHoaTenPhuKien(ten: string): string {
  return ten.normalize('NFC').trim();
}

/**
 * Nếu thêm món `ten` thì món nào đang chọn gây xung đột? Trả về tên món đó, hoặc null nếu không xung đột.
 * `tenCacMonDangChon` là tên các phụ kiện đang chọn.
 */
export function timMonXungDot(ten: string, tenCacMonDangChon: string[]): string | null {
  const khoa = chuanHoaTenPhuKien(ten);
  const [nhomA, nhomB] = NHOM_XUNG_DOT.map((n) => n.map(chuanHoaTenPhuKien));
  const nhomDoiDien = nhomA.includes(khoa) ? nhomB : nhomB.includes(khoa) ? nhomA : null;
  if (!nhomDoiDien) return null;
  return tenCacMonDangChon.find((t) => nhomDoiDien.includes(chuanHoaTenPhuKien(t))) ?? null;
}

/** Danh sách tên phụ kiện PHÙ HỢP với trang phục, hoặc null nếu chưa chọn / không nhận ra. */
export function layPhuKienChoPhep(tenTrangPhuc: string | null | undefined): string[] | null {
  if (!tenTrangPhuc) return null;
  const khoa = chuanHoaTenPhuKien(tenTrangPhuc);
  const tim = Object.keys(PHU_KIEN_THEO_TRANG_PHUC).find((k) => chuanHoaTenPhuKien(k) === khoa);
  return tim ? PHU_KIEN_THEO_TRANG_PHUC[tim] : null;
}

/** Tìm nhóm chứa phụ kiện (theo tên), hoặc null nếu phụ kiện chưa thuộc nhóm nào. */
export function layNhomCuaPhuKien(ten: string): NhomPhuKien | null {
  const khoa = chuanHoaTenPhuKien(ten);
  return (
    NHOM_PHU_KIEN.find((n) => n.cacPhuKien.some((t) => chuanHoaTenPhuKien(t) === khoa)) ?? null
  );
}