'use client';

import type { ReactNode } from 'react';
import type { TrangPhuc, SuKien } from '@/types/phoi-do';

interface Props {
  danhSachTrangPhuc: TrangPhuc[];
  danhSachSuKien: SuKien[];
  trangPhucDangChon: string | null;
  suKienDangChon: string | null;
  onChonTrangPhuc: (id: string) => void;
  /** Truyền null khi người dùng bấm lại dịp đang chọn để bỏ chọn. */
  onChonSuKien: (id: string | null) => void;
  /** Khối giới thiệu văn hoá, hiện dưới phần "Dịp sử dụng". */
  phanGioiThieu?: ReactNode;
}

const TIEU_DE = 'font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3';

export default function ChonTrangPhuc({
  danhSachTrangPhuc,
  danhSachSuKien,
  trangPhucDangChon,
  suKienDangChon,
  onChonTrangPhuc,
  onChonSuKien,
  phanGioiThieu,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className={TIEU_DE}>Trang phục</h3>
        <div className="grid grid-cols-3 gap-2">
          {danhSachTrangPhuc.map((tp) => {
            const chon = trangPhucDangChon === tp.id;
            return (
              <button
                key={tp.id}
                type="button"
                aria-pressed={chon}
                onClick={() => onChonTrangPhuc(tp.id)}
                className={`rounded-md border-2 px-2 py-3 text-center transition ${
                  chon
                    ? 'border-lacquer bg-paper-raised'
                    : 'border-transparent bg-paper-raised/70 hover:border-gold'
                }`}
              >
                <span className="block text-sm font-medium text-ink">{tp.ten}</span>
                <span className="block text-xs text-ink-soft">{tp.vungMien}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className={TIEU_DE}>Dịp sử dụng</h3>
        <p className="mb-2 text-xs text-ink-soft">
          Không bắt buộc. Chọn dịp giúp nhận định văn hoá đáng tin hơn. Bấm lại để bỏ chọn.
        </p>
        <div className="flex flex-wrap gap-2">
          {danhSachSuKien.map((sk) => {
            const chon = suKienDangChon === sk.id;
            return (
              <button
                key={sk.id}
                type="button"
                aria-pressed={chon}
                onClick={() => onChonSuKien(chon ? null : sk.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  chon
                    ? 'border-lacquer bg-lacquer/10 font-medium text-ink'
                    : 'border-ink-soft/30 hover:border-gold'
                }`}
              >
                {chon && <span aria-hidden>✓ </span>}
                {sk.ten}
              </button>
            );
          })}
        </div>
      </div>

      {phanGioiThieu}
    </div>
  );
}