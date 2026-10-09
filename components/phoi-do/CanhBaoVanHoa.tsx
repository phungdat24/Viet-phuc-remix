'use client';

import type { MucDoVanHoa } from '@/types/phoi-do';
import { layMucTheoSlug, laySlugTheoTen } from '@/lib/vanHoa/duLieu';
import NhanTrangThai from '@/components/van-hoa/NhanTrangThai';
import { NHAN_HOP_CO_DIEU_KIEN } from '@/lib/canhBaoVanHoa';

/** Mỗi mức có biểu tượng + nhãn chữ + màu, nên không chỉ dựa vào màu. */
export const GIAO_DIEN_MUC_DO: Record<
  MucDoVanHoa,
  { nhan: string; bieuTuong: string; khung: string; chu: string; tron: string }
> = {
  phu_hop: {
    nhan: 'Phù hợp',
    bieuTuong: '✓',
    khung: 'border-jade/40 bg-jade/10',
    chu: 'text-jade',
    tron: 'bg-jade text-white',
  },
  tuy_dip: {
    nhan: NHAN_HOP_CO_DIEU_KIEN,
    bieuTuong: '◐',
    khung: 'border-gold/50 bg-gold/10',
    chu: 'text-ink',
    tron: 'bg-gold text-white',
  },
  khong_phu_hop: {
    nhan: 'Cần lưu ý',
    bieuTuong: '!',
    khung: 'border-lacquer/40 bg-lacquer/5',
    chu: 'text-lacquer',
    tron: 'bg-lacquer text-white',
  },
  chua_co_du_lieu: {
    nhan: 'Chưa có dữ liệu',
    bieuTuong: '?',
    khung: 'border-ink-soft/30 bg-paper',
    chu: 'text-ink-soft',
    tron: 'bg-ink-soft text-white',
  },
  khong_co_phu_kien: {
    nhan: 'Chưa chọn phụ kiện',
    bieuTuong: '–',
    khung: 'border-ink-soft/30 bg-paper',
    chu: 'text-ink-soft',
    tron: 'bg-ink-soft text-white',
  },
};

export interface MucCanhBaoVanHoa {
  id: string;
  ten: string;
  vungMien?: string | null;
  mucDo: MucDoVanHoa;
  lyDo: string | null;
  /** Món thay thế cùng nhóm (chỉ dùng ở kiểu "day-du"). */
  thayThe?: { id: string; ten: string }[];
}

interface Props {
  cacMuc: MucCanhBaoVanHoa[];
  kieu?: 'day-du' | 'gon';
  /** true = người dùng chưa chọn dịp: thẻ "Cần lưu ý" kèm câu về độ tin cậy. */
  chuaChonDip?: boolean;
  /** Không truyền hàm nào thì thẻ không hiện nút (dùng ở trang kết quả). */
  onThayBang?: (id: string) => void;
  onBoMon?: (id: string) => void;
  onGiuLai?: (id: string) => void;
}

const NUT =
  'rounded-md border border-ink-soft/30 bg-paper px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-gold';

export default function CanhBaoVanHoa({
  cacMuc,
  kieu = 'day-du',
  chuaChonDip = false,
  onThayBang,
  onBoMon,
  onGiuLai,
}: Props) {
  if (cacMuc.length === 0) return null;

  if (kieu === 'gon') {
    return (
      <ul className="flex flex-wrap gap-1.5">
        {cacMuc.map((m) => {
          const gd = GIAO_DIEN_MUC_DO[m.mucDo];
          return (
            <li
              key={m.id}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${gd.khung}`}
            >
              <span
                aria-hidden
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${gd.tron}`}
              >
                {gd.bieuTuong}
              </span>
              <span className={`font-medium ${gd.chu}`}>{gd.nhan}</span>
              <span className="text-ink">· {m.ten}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="space-y-2" aria-live="polite">
      {cacMuc.map((m) => {
        const gd = GIAO_DIEN_MUC_DO[m.mucDo];
        const slug = laySlugTheoTen(m.ten);
        const mucVanHoa = slug ? layMucTheoSlug(slug) : undefined;
        const coNut = Boolean(onThayBang || onBoMon || onGiuLai);
        return (
          <li key={m.id} className={`rounded-md border p-3 ${gd.khung}`}>
            <div className="flex items-start gap-2">
              <span
                aria-hidden
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${gd.tron}`}
              >
                {gd.bieuTuong}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${gd.chu}`}>
                  {gd.nhan} <span className="font-medium text-ink">· {m.ten}</span>
                </p>
                {m.vungMien && <p className="text-[11px] text-ink-soft">Vùng gắn với món này: {m.vungMien}</p>}
                {m.lyDo && <p className="mt-1 text-xs leading-relaxed text-ink">{m.lyDo}</p>}
                {chuaChonDip && m.mucDo === 'khong_phu_hop' && (
                  <p className="mt-1 text-[11px] italic text-ink-soft">
                    <span aria-hidden>ⓘ </span>
                    Bạn chưa chọn dịp nên nhận định này có độ tin cậy thấp hơn. Chọn dịp ở khung bên trái để
                    chính xác hơn.
                  </p>
                )}
                {mucVanHoa && (
                  <div className="mt-1.5">
                    <NhanTrangThai trangThai={mucVanHoa.trangThai} />
                  </div>
                )}

                {coNut && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {onThayBang &&
                      m.thayThe?.map((t) => (
                        <button key={t.id} type="button" className={NUT} onClick={() => onThayBang(t.id)}>
                          Thay bằng {t.ten}
                        </button>
                      ))}
                    {onBoMon && (
                      <button type="button" className={NUT} onClick={() => onBoMon(m.id)}>
                        Bỏ món này
                      </button>
                    )}
                    {onGiuLai && (
                      <button type="button" className={NUT} onClick={() => onGiuLai(m.id)}>
                        Giữ lại
                      </button>
                    )}
                  </div>
                )}

                {slug && (
                  <a
                    href={`/van-hoa/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-lacquer hover:underline"
                  >
                    Tìm hiểu thêm về {m.ten} →<span className="sr-only"> (mở tab mới)</span>
                  </a>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}