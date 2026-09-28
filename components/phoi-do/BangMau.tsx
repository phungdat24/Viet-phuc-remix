'use client';

import type { MauSac } from '@/types/phoi-do';

interface Props {
  danhSachMau: MauSac[];
  mauChinhDangChon: string | null;
  mauPhuDangChon: string | null;
  onChonMauChinh: (id: string) => void;
  onChonMauPhu: (id: string) => void;
}

function HangMau({
  danhSachMau,
  dangChon,
  onChon,
}: {
  danhSachMau: MauSac[];
  dangChon: string | null;
  onChon: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {danhSachMau.map((m) => (
        <button
          key={m.id}
          onClick={() => onChon(m.id)}
          title={m.ten}
          className="flex flex-col items-center gap-1"
        >
          <span
            className={`w-8 h-8 rounded-full border ${
              dangChon === m.id ? 'ring-2 ring-offset-2 ring-ink' : 'border-ink-soft/20'
            }`}
            style={{ backgroundColor: m.maHex }}
          />
          <span className="text-[11px] text-ink-soft leading-tight text-center">{m.ten}</span>
        </button>
      ))}
    </div>
  );
}

export default function BangMau({
  danhSachMau,
  mauChinhDangChon,
  mauPhuDangChon,
  onChonMauChinh,
  onChonMauPhu,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Màu chính
        </h3>
        <HangMau danhSachMau={danhSachMau} dangChon={mauChinhDangChon} onChon={onChonMauChinh} />
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Màu phụ
        </h3>
        <HangMau danhSachMau={danhSachMau} dangChon={mauPhuDangChon} onChon={onChonMauPhu} />
      </div>
    </div>
  );
}