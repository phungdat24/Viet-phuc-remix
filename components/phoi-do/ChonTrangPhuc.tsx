'use client';

import type { TrangPhuc, SuKien } from '@/types/phoi-do';

interface Props {
  danhSachTrangPhuc: TrangPhuc[];
  danhSachSuKien: SuKien[];
  trangPhucDangChon: string | null;
  suKienDangChon: string | null;
  onChonTrangPhuc: (id: string) => void;
  onChonSuKien: (id: string) => void;
}

export default function ChonTrangPhuc({
  danhSachTrangPhuc,
  danhSachSuKien,
  trangPhucDangChon,
  suKienDangChon,
  onChonTrangPhuc,
  onChonSuKien,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Trang phục
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {danhSachTrangPhuc.map((tp) => (
            <button
              key={tp.id}
              onClick={() => onChonTrangPhuc(tp.id)}
              className={`aspect-square rounded-md border-2 flex flex-col items-center justify-center text-center p-2 transition ${
                trangPhucDangChon === tp.id
                  ? 'border-lacquer bg-paper-raised'
                  : 'border-transparent bg-paper-raised/50 hover:border-gold'
              }`}
            >
              <span className="text-sm font-medium">{tp.ten}</span>
              <span className="text-xs text-ink-soft mt-1">{tp.vungMien}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Dịp sử dụng
        </h3>
        <div className="flex flex-wrap gap-2">
          {danhSachSuKien.map((sk) => (
            <button
              key={sk.id}
              onClick={() => onChonSuKien(sk.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                suKienDangChon === sk.id
                  ? 'bg-ink text-paper border-ink'
                  : 'border-ink-soft/30 hover:border-gold'
              }`}
            >
              {sk.ten}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}