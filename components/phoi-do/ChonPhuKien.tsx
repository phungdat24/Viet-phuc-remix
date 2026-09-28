'use client';

import type { PhuKien } from '@/types/phoi-do';

interface Props {
  danhSachPhuKien: PhuKien[];
  phuKienDangChon: string | null;
  onChonPhuKien: (id: string | null) => void;
}

export default function ChonPhuKien({ danhSachPhuKien, phuKienDangChon, onChonPhuKien }: Props) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
        Phụ kiện
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onChonPhuKien(null)}
          className={`rounded-md border px-2 py-2 text-xs text-center transition ${
            phuKienDangChon === null
              ? 'border-lacquer bg-paper-raised'
              : 'border-ink-soft/20 hover:border-gold'
          }`}
        >
          Không dùng
        </button>
        {danhSachPhuKien.map((pk) => (
          <button
            key={pk.id}
            onClick={() => onChonPhuKien(pk.id)}
            className={`rounded-md border px-2 py-2 text-xs text-center transition ${
              phuKienDangChon === pk.id
                ? 'border-lacquer bg-paper-raised'
                : 'border-ink-soft/20 hover:border-gold'
            }`}
          >
            {pk.ten}
          </button>
        ))}
      </div>
    </div>
  );
}