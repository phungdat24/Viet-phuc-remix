'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CAC_MUC, SLUG_THEO_TEN, type MucVanHoa } from '@/lib/vanHoa/duLieu';
import NhanTrangThai from './NhanTrangThai';

const SLUG_CO_TRONG_PHOI_DO = new Set(Object.values(SLUG_THEO_TEN));

type BoLoc = 'tat-ca' | 'trang-phuc' | 'phu-kien' | 'chi-tim-hieu' | 'chua-kiem-chung';

const CAC_LOC: { id: BoLoc; ten: string }[] = [
  { id: 'tat-ca', ten: 'Tất cả' },
  { id: 'trang-phuc', ten: 'Trang phục' },
  { id: 'phu-kien', ten: 'Phụ kiện' },
  { id: 'chi-tim-hieu', ten: 'Chỉ để tìm hiểu' },
  { id: 'chua-kiem-chung', ten: '⚠ Chưa kiểm chứng' },
];

function khop(m: MucVanHoa, loc: BoLoc): boolean {
  if (loc === 'tat-ca') return true;
  if (loc === 'chi-tim-hieu') return !SLUG_CO_TRONG_PHOI_DO.has(m.slug);
  if (loc === 'chua-kiem-chung') return m.trangThai === 'chua-kiem-chung';
  return m.nhom === loc;
}

export default function ThuVienVanHoa() {
  const [loc, setLoc] = useState<BoLoc>('tat-ca');
  const dsHienThi = CAC_MUC.filter((m) => khop(m, loc));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Lọc theo nhóm">
        {CAC_LOC.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={loc === l.id}
            onClick={() => setLoc(l.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              loc === l.id ? 'border-ink bg-ink text-paper' : 'border-ink-soft/30 hover:border-gold'
            }`}
          >
            {l.ten}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-ink-soft" aria-live="polite">
          {dsHienThi.length} mục
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dsHienThi.map((m) => {
          const trongPhoiDo = SLUG_CO_TRONG_PHOI_DO.has(m.slug);
          return (
            <li key={m.slug}>
              <Link
                href={`/van-hoa/${m.slug}`}
                className={`flex h-full flex-col rounded-md border bg-paper-raised p-4 transition hover:border-gold hover:shadow-sm ${
                  m.trangThai === 'chua-kiem-chung' ? 'border-2 border-lacquer/60' : 'border-ink-soft/15'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="rounded-full bg-ink/10 px-2 py-0.5 font-medium text-ink">
                    {m.nhom === 'trang-phuc' ? 'Trang phục' : 'Phụ kiện'}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      trongPhoiDo ? 'bg-jade/15 text-jade' : 'bg-ink-soft/10 text-ink-soft'
                    }`}
                  >
                    {trongPhoiDo ? 'Có trong phối đồ' : 'Chỉ để tìm hiểu'}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">{m.ten}</h3>
                <p className="text-xs text-ink-soft">
                  {m.vung} · {m.thoiKy}
                </p>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{m.tomTat}</p>
                <div className="mt-auto pt-3">
                  <NhanTrangThai trangThai={m.trangThai} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
