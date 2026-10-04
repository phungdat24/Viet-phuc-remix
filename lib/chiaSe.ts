import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

/** "A" / "A và B" / "A, B và C" */
function noiTen(cacTen: string[]): string {
  if (cacTen.length <= 1) return cacTen[0] ?? '';
  return `${cacTen.slice(0, -1).join(', ')} và ${cacTen[cacTen.length - 1]}`;
}

export function taoNoiDungChiaSe(input: {
  trangPhuc: TrangPhuc | null;
  suKien: SuKien | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  cacPhuKien: PhuKien[];
}): string {
  const { trangPhuc, suKien, mauChinh, mauPhu, cacPhuKien } = input;
  if (!trangPhuc || !mauChinh || !mauPhu) return '';

  return (
    `Việt Phục Remix: ${trangPhuc.ten}` +
    (suKien ? `, dịp ${suKien.ten}` : '') +
    `, tông ${mauChinh.ten} phối ${mauPhu.ten}` +
    (cacPhuKien.length > 0 ? `, cùng ${noiTen(cacPhuKien.map((p) => p.ten))}` : '') +
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