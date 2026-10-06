/**
 * Phần "thuần" (không đụng DB) của script nạp ảnh: đọc tên file -> 5 phần.
 * Mẫu tên: {trang-phuc}__{mau-chinh}__{mau-phu}__{phu-kien}__{su-kien}.png
 * Phụ kiện không có thì ghi: khong-phu-kien
 */
export const DUOI_ANH = [".png", ".jpg", ".jpeg", ".webp"];

export interface BonPhanTen {
  trangPhuc: string;
  mauChinh: string;
  mauPhu: string;
  phuKien: string; // "khong-phu-kien" nếu không có
  suKien: string;
}

export function tachTenFile(tenFile: string): { ok: true; phan: BonPhanTen } | { ok: false; loi: string } {
  const diem = tenFile.lastIndexOf(".");
  const goc = (diem > 0 ? tenFile.slice(0, diem) : tenFile).trim().toLowerCase();
  const p = goc.split("__");
  if (p.length !== 5 || p.some((x) => !x)) {
    return {
      ok: false,
      loi: `Tên phải có đúng 5 phần cách nhau bằng 2 dấu gạch dưới "__" (đang có ${p.length}). Mẫu: ao-dai__do-son__trang-nga__tram-cai__cuoi-hoi.png`,
    };
  }
  return { ok: true, phan: { trangPhuc: p[0], mauChinh: p[1], mauPhu: p[2], phuKien: p[3], suKien: p[4] } };
}
