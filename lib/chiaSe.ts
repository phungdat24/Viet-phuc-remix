import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

/** "A" / "A và B" / "A, B và C" */
function noiTen(cacTen: string[]): string {
  if (cacTen.length <= 1) return cacTen[0] ?? '';
  return `${cacTen.slice(0, -1).join(', ')} và ${cacTen[cacTen.length - 1]}`;
}

/** Các id cần để mở lại đúng một bộ phối ở /phoi-do. */
export interface ThamSoPhoiDo {
  trangPhucId: string | null;
  /** Chỉ truyền dịp do NGƯỜI DÙNG chọn; dịp mặc định thì truyền null. */
  suKienId: string | null;
  mauChinhId: string | null;
  mauPhuId: string | null;
  phuKienIds: string[];
}

/** Tạo query string cho /phoi-do (cùng quy ước với trang đọc ở ThuNghiemPhoiDoClient). */
export function taoThamSoPhoiDo(input: ThamSoPhoiDo): URLSearchParams {
  const thamSo = new URLSearchParams();
  if (input.trangPhucId) thamSo.set('trangPhucId', input.trangPhucId);
  if (input.suKienId) thamSo.set('suKienId', input.suKienId);
  if (input.mauChinhId) thamSo.set('mauChinhId', input.mauChinhId);
  if (input.mauPhuId) thamSo.set('mauPhuId', input.mauPhuId);
  if (input.phuKienIds.length > 0) thamSo.set('phuKienIds', input.phuKienIds.join(','));
  return thamSo;
}

/** Link tuyệt đối tới bộ phối. Chỉ gọi ở trình duyệt (trong event handler); trả '' nếu thiếu thông tin. */
export function taoLinkChiaSe(input: ThamSoPhoiDo): string {
  if (typeof window === 'undefined') return '';
  if (!input.trangPhucId || !input.mauChinhId || !input.mauPhuId) return '';
  const chuoi = taoThamSoPhoiDo(input).toString().replace(/%2C/g, ',');
  return `${window.location.origin}/phoi-do?${chuoi}`;
}

export function taoNoiDungChiaSe(input: {
  trangPhuc: TrangPhuc | null;
  suKien: SuKien | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  cacPhuKien: PhuKien[];
  /** Link mở lại bộ phối (tuỳ chọn). Có thì thêm một dòng cuối. */
  link?: string;
}): string {
  const { trangPhuc, suKien, mauChinh, mauPhu, cacPhuKien, link } = input;
  if (!trangPhuc || !mauChinh || !mauPhu) return '';

  const dong1 =
    `Việt Phục Remix: ${trangPhuc.ten}` +
    (suKien ? `, dịp ${suKien.ten}` : '') +
    `, tông ${mauChinh.ten} phối ${mauPhu.ten}` +
    (cacPhuKien.length > 0 ? `, cùng ${noiTen(cacPhuKien.map((p) => p.ten))}` : '') +
    '.';

  return link ? `${dong1}\nThử phối bộ này: ${link}` : dong1;
}

export async function saoChepChiaSe(noiDung: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(noiDung);
    return true;
  } catch {
    window.prompt('Sao chép nội dung bên dưới để chia sẻ:', noiDung);
    return false;
  }
}