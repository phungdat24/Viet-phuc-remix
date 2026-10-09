/** Tên file tải về, không dấu: "Áo dài" -> "viet-phuc-remix-ao-dai". */
export function taoTenFileAnh(tenTrangPhuc: string | null | undefined): string {
  const goc = (tenTrangPhuc ?? 'bo-phoi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `viet-phuc-remix-${goc || 'bo-phoi'}`;
}

const DUOI_THEO_LOAI: Record<string, string> = {
  'image/webp': 'webp',
  'image/png': 'png',
  'image/jpeg': 'jpg',
};

/**
 * Tải ảnh về máy. Thuộc tính `download` của thẻ <a> không hoạt động với ảnh khác domain (Supabase),
 * nên tải ảnh thành blob rồi tạo link tạm. Nếu bị chặn (CORS, mạng) thì mở ảnh ở tab mới.
 * Trả về true nếu tải trực tiếp được, false nếu phải mở tab mới.
 */
export async function taiAnhVe(url: string, tenFile: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const duoi = DUOI_THEO_LOAI[blob.type] ?? 'png';
    const diaChiTam = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = diaChiTam;
    a.download = `${tenFile}.${duoi}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(diaChiTam), 1000);
    return true;
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
    return false;
  }
}