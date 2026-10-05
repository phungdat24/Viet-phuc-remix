'use client';

import type { MauSac } from '@/types/phoi-do';

interface Props {
  danhSachMauChinh: MauSac[];
  danhSachMauPhu: MauSac[];
  mauChinhDangChon: string | null;
  mauPhuDangChon: string | null;
  daChonTrangPhuc: boolean;
  onChonMauChinh: (id: string) => void;
  onChonMauPhu: (id: string) => void;
}

function laMauSang(hex: string): boolean {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
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
    <div className="grid grid-cols-3 gap-x-2 gap-y-1">
      {danhSachMau.map((m) => {
        const chon = dangChon === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChon(m.id)}
            title={m.ten}
            aria-label={m.ten}
            aria-pressed={chon}
            className="group flex flex-col items-center gap-1.5 rounded-md p-1.5 transition hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-transform duration-200 group-hover:scale-110 ${
                chon
                  ? 'scale-105 border-transparent ring-2 ring-ink ring-offset-2 ring-offset-paper'
                  : 'border-ink-soft/20'
              }`}
              style={{ backgroundColor: m.maHex }}
            >
              {chon && (
                <svg
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="none"
                  stroke={laMauSang(m.maHex) ? '#2A2118' : '#FFFFFF'}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3.5 8.5l3 3 6-7" />
                </svg>
              )}
            </span>
            <span
              className={`text-center text-[11px] leading-tight ${
                chon ? 'font-medium text-ink' : 'text-ink-soft'
              }`}
            >
              {m.ten}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const TIEU_DE = 'font-display text-sm font-semibold text-ink-soft uppercase tracking-wide';

export default function BangMau({
  danhSachMauChinh,
  danhSachMauPhu,
  mauChinhDangChon,
  mauPhuDangChon,
  daChonTrangPhuc,
  onChonMauChinh,
  onChonMauPhu,
}: Props) {
  if (!daChonTrangPhuc) {
    return (
      <div>
        <h3 className={`${TIEU_DE} mb-3`}>Màu sắc</h3>
        <p className="text-sm text-ink-soft">
          Chọn trang phục trước, các màu phù hợp với trang phục đó sẽ hiện ra ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`${TIEU_DE} mb-2`}>Màu chính</h3>
        <HangMau danhSachMau={danhSachMauChinh} dangChon={mauChinhDangChon} onChon={onChonMauChinh} />
      </div>
      <div>
        <h3 className={`${TIEU_DE} mb-2`}>Màu phụ</h3>
        <HangMau danhSachMau={danhSachMauPhu} dangChon={mauPhuDangChon} onChon={onChonMauPhu} />
      </div>
    </div>
  );
}