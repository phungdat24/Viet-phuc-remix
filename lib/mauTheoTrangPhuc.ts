/**
 * Danh sách màu hiển thị cho từng trang phục (chỉ lọc ở giao diện).
 * - Tên màu / tên trang phục phải KHỚP với cột `ten` trong DB (đã seed).
 * - 10 màu vẫn nằm nguyên trong DB, Lớp 2 vẫn tính hài hoà như cũ.
 * - Muốn thêm/bớt màu: chỉ cần sửa file này.
 */

export interface BoMauTrangPhuc {
  chinh: string[]; // màu chính (áo) được phép chọn
  phu: string[]; // màu phụ (quần/váy) được phép chọn
  macDinhChinh: string; // tự chọn khi vừa chọn trang phục
  macDinhPhu: string;
}

export const MAU_THEO_TRANG_PHUC: Record<string, BoMauTrangPhuc> = {
  'Áo dài': {
    chinh: ['Đỏ son', 'Vàng nhũ', 'Lam chàm', 'Hồng đào', 'Tím Huế', 'Trắng ngà'],
    phu: ['Trắng ngà', 'Đen huyền', 'Vàng nhũ'],
    macDinhChinh: 'Đỏ son',
    macDinhPhu: 'Trắng ngà',
  },
  'Áo tứ thân': {
    chinh: ['Nâu non', 'Đen huyền', 'Lam chàm', 'Hồng đào'],
    phu: ['Đen huyền', 'Nâu non', 'Đỏ son'],
    macDinhChinh: 'Nâu non',
    macDinhPhu: 'Đen huyền',
  },
  'Áo bà ba': {
    chinh: ['Trắng ngà', 'Hồng đào', 'Lục ngọc', 'Tím Huế', 'Be pastel'],
    phu: ['Đen huyền', 'Trắng ngà', 'Nâu non'],
    macDinhChinh: 'Hồng đào',
    macDinhPhu: 'Đen huyền',
  },
};

export function chuanHoaTen(ten: string): string {
  return ten.normalize('NFC').trim();
}

export function layBoMau(tenTrangPhuc: string | null | undefined): BoMauTrangPhuc | null {
  if (!tenTrangPhuc) return null;
  const khoa = chuanHoaTen(tenTrangPhuc);
  const tim = Object.keys(MAU_THEO_TRANG_PHUC).find((k) => chuanHoaTen(k) === khoa);
  return tim ? MAU_THEO_TRANG_PHUC[tim] : null;
}