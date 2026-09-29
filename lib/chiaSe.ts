import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

export function taoNoiDungChiaSe(input: {
  trangPhuc: TrangPhuc | null;
  suKien: SuKien | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  phuKien: PhuKien | null;
}): string {
  const { trangPhuc, suKien, mauChinh, mauPhu, phuKien } = input;
  if (!trangPhuc || !mauChinh || !mauPhu) return '';

  return (
    `Việt Phục Remix: ${trangPhuc.ten}` +
    (suKien ? `, dịp ${suKien.ten}` : '') +
    `, tông ${mauChinh.ten} phối ${mauPhu.ten}` +
    (phuKien ? `, cùng ${phuKien.ten}` : '') +
    '.'
  );
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