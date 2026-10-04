'use client';

import type { MauSac } from '@/types/phoi-do';

interface Props {
  /** Màu chính được phép theo trang phục đang chọn (đã lọc sẵn ở component cha). */
  danhSachMauChinh: MauSac[];
  /** Màu phụ được phép theo trang phục đang chọn (đã lọc sẵn ở component cha). */
  danhSachMauPhu: MauSac[];
  mauChinhDangChon: string | null;
  mauPhuDangChon: string | null;
  /** false khi chưa chọn trang phục -> hiện lời nhắc thay vì bảng màu. */
  daChonTrangPhuc: boolean;
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
    <div className="grid grid-cols-3 gap-x-3 gap-y-2">
      {danhSachMau.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChon(m.id)}
          title={m.ten}
          aria-label={m.ten}
          aria-pressed={dangChon === m.id}
          className="flex flex-col items-center gap-1 p-1"
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
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3">
          Màu sắc
        </h3>
        <p className="text-sm text-ink-soft">
          Chọn trang phục trước, các màu phù hợp với trang phục đó sẽ hiện ra ở đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Màu chính
        </h3>
        <HangMau danhSachMau={danhSachMauChinh} dangChon={mauChinhDangChon} onChon={onChonMauChinh} />
      </div>
      <div>
        <h3 className="font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-2">
          Màu phụ
        </h3>
        <HangMau danhSachMau={danhSachMauPhu} dangChon={mauPhuDangChon} onChon={onChonMauPhu} />
      </div>
    </div>
  );
}