'use client';

import Link from 'next/link';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import { layBoMau, chuanHoaTen } from '@/lib/mauTheoTrangPhuc';

interface Props {
  trangPhuc: string;
  phuKien?: string[];
  ghiChu?: string;
}

/**
 * Nối trang văn hoá với trang phối đồ: bấm vào là sang thẳng bộ phối đã điền sẵn
 * trang phục, màu mặc định và phụ kiện (tra theo tên trong danh mục).
 */
export default function NutPhoiThu({ trangPhuc, phuKien = [], ghiChu }: Props) {
  const { danhMuc } = useDanhMuc();
  let href = '/phoi-do';

  if (danhMuc) {
    const tp = danhMuc.trangPhuc.find((x) => chuanHoaTen(x.ten) === chuanHoaTen(trangPhuc));
    if (tp) {
      const bo = layBoMau(tp.ten);
      const idMau = (ten?: string) =>
        ten ? danhMuc.mauSac.find((m) => chuanHoaTen(m.ten) === chuanHoaTen(ten))?.id : undefined;
      const thamSo = new URLSearchParams({ trangPhucId: tp.id });
      const chinh = idMau(bo?.macDinhChinh);
      const phu = idMau(bo?.macDinhPhu);
      if (chinh) thamSo.set('mauChinhId', chinh);
      if (phu) thamSo.set('mauPhuId', phu);
      const ids = phuKien
        .map((t) => danhMuc.phuKien.find((p) => chuanHoaTen(p.ten) === chuanHoaTen(t))?.id)
        .filter((id): id is string => Boolean(id));
      if (ids.length > 0) thamSo.set('phuKienIds', ids.join(','));
      href = `/phoi-do?${thamSo.toString()}`;
    }
  }

  return (
    <div className="rounded-md border border-lacquer/25 bg-lacquer/5 p-4">
      <p className="text-sm text-ink-soft">Muốn xem nó trông thế nào khi phối?</p>
      <Link
        href={href}
        className="mt-2 inline-block rounded-md bg-lacquer px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Phối thử {trangPhuc}
        {phuKien.length > 0 ? ` cùng ${phuKien.join(', ')}` : ''} →
      </Link>
      {ghiChu && <p className="mt-2 text-xs text-ink-soft">{ghiChu}</p>}
    </div>
  );
}
