'use client';

import type { MucDoVanHoa } from '@/types/phoi-do';
import { GIAO_DIEN_MUC_DO } from './CanhBaoVanHoa';

export interface MucLuuYVanHoa {
  id: string;
  ten: string;
  mucDo: MucDoVanHoa;
  lyDo: string | null;
}

interface Props {
  /** Kết quả văn hoá của từng phụ kiện người dùng đang chọn. */
  cacMuc: MucLuuYVanHoa[];
}

/** Thứ tự hiện: cảnh báo đỏ trước, "hợp có điều kiện" sau. */
const CAC_MUC_HIEN: Array<'khong_phu_hop' | 'tuy_dip'> = ['khong_phu_hop', 'tuy_dip'];

/**
 * Huy hiệu cảnh báo văn hoá NHỎ ở góc trên bên trái khung xem trước.
 * Chỉ hiện khi bộ phối đang chọn có món "Cần lưu ý" hoặc "Hợp có điều kiện";
 * chi tiết đầy đủ vẫn nằm ở khung Phụ kiện và phần kết quả thẩm định.
 * Phải đặt trong khung cha có `relative`.
 */
export default function HuyHieuVanHoa({ cacMuc }: Props) {
  const nhom = CAC_MUC_HIEN.map((mucDo) => ({
    mucDo,
    cacMon: cacMuc.filter((m) => m.mucDo === mucDo),
  })).filter((n) => n.cacMon.length > 0);

  if (nhom.length === 0) return null;

  return (
    <ul
      aria-label="Lưu ý văn hoá về bộ phối đang chọn"
      aria-live="polite"
      className="pointer-events-none absolute left-3 top-3 z-10 flex max-w-[75%] flex-col items-start gap-1"
    >
      {nhom.map(({ mucDo, cacMon }) => {
        const gd = GIAO_DIEN_MUC_DO[mucDo];
        const tenCacMon = cacMon.map((m) => m.ten).join(', ');
        const goiY = cacMon.map((m) => (m.lyDo ? `${m.ten}: ${m.lyDo}` : m.ten)).join('\n');
        return (
          <li key={mucDo} className="pointer-events-auto max-w-full rounded-full bg-paper/90 shadow-sm" title={goiY}>
            <span
              className={`inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pl-1 pr-2.5 text-[11px] ${gd.khung}`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${gd.tron}`}
              >
                {gd.bieuTuong}
              </span>
              <span className={`shrink-0 font-semibold ${gd.chu}`}>{gd.nhan}</span>
              <span className="truncate text-ink">· {tenCacMon}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
