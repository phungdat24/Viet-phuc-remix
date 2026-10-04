'use client';

import { useState } from 'react';
import Link from 'next/link';
import XemTruoc from '@/components/phoi-do/XemTruoc';
import GhiChuAnhAI from '@/components/phoi-do/GhiChuAnhAI';
import { taoNoiDungChiaSe, saoChepChiaSe } from '@/lib/chiaSe';
import type { LookbookItem } from '@/lib/localLookbook';
import { layPhuKienIds } from '@/lib/localLookbook';
import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

interface Props {
  item: LookbookItem;
  trangPhuc: TrangPhuc | null;
  suKien: SuKien | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  /** Các phụ kiện của bộ phối (mảng rỗng = không dùng). */
  cacPhuKien: PhuKien[];
  onToggleYeuThich: (id: string) => void;
  onXoa: (id: string) => void;
}

export default function TheLookbook({
  item,
  trangPhuc,
  suKien,
  mauChinh,
  mauPhu,
  cacPhuKien,
  onToggleYeuThich,
  onXoa,
}: Props) {
  const [daSaoChep, setDaSaoChep] = useState(false);

  const canhBao = item.ketQuaKiemTra?.phuHopVanHoa?.canhBao ?? false;
  const meta = [
    suKien ? (item.suKienNgauNhien ? `${suKien.ten} (dịp ngẫu nhiên)` : suKien.ten) : null,
    cacPhuKien.length > 0 ? cacPhuKien.map((p) => p.ten).join(', ') : 'Không phụ kiện',
  ]
    .filter(Boolean)
    .join(' · ');

  async function xuLyChiaSe() {
    const noiDung = taoNoiDungChiaSe({ trangPhuc, suKien, mauChinh, mauPhu, cacPhuKien });
    if (!noiDung) return;
    const thanhCong = await saoChepChiaSe(noiDung);
    setDaSaoChep(thanhCong);
    setTimeout(() => setDaSaoChep(false), 2000);
  }

  function xuLyXoa() {
    if (window.confirm('Xoá bộ phối này khỏi Lookbook? Không thể hoàn tác.')) {
      onXoa(item.id);
    }
  }

  const thamSo = new URLSearchParams();
  if (item.trangPhucId) thamSo.set('trangPhucId', item.trangPhucId);
  // Dịp ngẫu nhiên không phải lựa chọn của người dùng → khi phối lại để trống, hệ thống bốc lại.
  if (item.suKienId && !item.suKienNgauNhien) thamSo.set('suKienId', item.suKienId);
  if (item.mauChinhId) thamSo.set('mauChinhId', item.mauChinhId);
  if (item.mauPhuId) thamSo.set('mauPhuId', item.mauPhuId);
  const phuKienIds = layPhuKienIds(item);
  if (phuKienIds.length > 0) thamSo.set('phuKienIds', phuKienIds.join(','));

  return (
    <article className="bg-paper-raised rounded-md overflow-hidden flex flex-col">
      <div className="bg-paper">
        {item.imageUrl ? (
          <>
            {/* object-contain để thấy trọn cả người từ đầu tới chân, không bị cắt */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={`Ảnh AI: ${trangPhuc?.ten ?? 'bộ phối đồ'}`}
              className="w-full h-80 object-contain"
            />
            <GhiChuAnhAI className="px-4 py-2 border-t border-ink-soft/10" />
          </>
        ) : (
          // XemTruoc phủ kín khung cha (absolute inset-0) nên khung này bắt buộc có `relative` + chiều cao.
          <div className="relative h-72">
            <XemTruoc trangPhuc={trangPhuc} mauChinh={mauChinh} mauPhu={mauPhu} cacPhuKien={cacPhuKien} />
          </div>
        )}
      </div>

      <div className="p-4 space-y-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold">
            {trangPhuc?.ten ?? 'Trang phục không còn tồn tại'}
          </h3>
          <button
            onClick={() => onToggleYeuThich(item.id)}
            aria-pressed={item.yeuThich}
            aria-label={item.yeuThich ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            className={`text-xl leading-none transition ${
              item.yeuThich ? 'text-lacquer' : 'text-ink-soft/50 hover:text-lacquer'
            }`}
          >
            {item.yeuThich ? '♥' : '♡'}
          </button>
        </div>

        <p className="text-sm text-ink-soft">{meta}</p>

        <div className="flex items-center gap-2">
          {[mauChinh, mauPhu].map(
            (m, i) =>
              m && (
                <span
                  key={i}
                  title={m.ten}
                  className="w-4 h-4 rounded-full border border-ink-soft/20"
                  style={{ backgroundColor: m.maHex }}
                />
              )
          )}
          <span className="text-xs text-ink-soft">
            {mauChinh?.ten} · {mauPhu?.ten}
          </span>
        </div>

        {item.ketQuaKiemTra && (
          <p className={`text-xs ${canhBao ? 'text-lacquer' : 'text-jade'}`}>
            {canhBao ? '⚠ Có điểm cần lưu ý về văn hoá' : '✓ Đã kiểm tra chuẩn văn hoá'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 border-t border-ink-soft/15 text-sm">
        <button onClick={xuLyXoa} className="py-2.5 text-ink-soft hover:text-lacquer transition">
          Xoá
        </button>
        <button
          onClick={xuLyChiaSe}
          className="py-2.5 text-ink-soft hover:text-ink transition border-x border-ink-soft/15"
        >
          {daSaoChep ? 'Đã chép ✓' : 'Chia sẻ'}
        </button>
        <Link
          href={`/phoi-do?${thamSo.toString()}`}
          className="py-2.5 text-center text-lacquer font-medium hover:opacity-80 transition"
        >
          Phối lại
        </Link>
      </div>
    </article>
  );
}