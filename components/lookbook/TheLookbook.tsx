'use client';

import { useState } from 'react';
import Link from 'next/link';
import XemTruoc from '@/components/phoi-do/XemTruoc';
import GhiChuAnhAI from '@/components/phoi-do/GhiChuAnhAI';
import { taoNoiDungChiaSe, taoLinkChiaSe, taoThamSoPhoiDo, saoChepChiaSe } from '@/lib/chiaSe';
import { taiAnhVe, taoTenFileAnh } from '@/lib/taiAnh';
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
  const [daChepLink, setDaChepLink] = useState(false);
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [thongBaoTai, setThongBaoTai] = useState<string | null>(null);

  const canhBao = item.ketQuaKiemTra?.phuHopVanHoa?.canhBao ?? false;
  // Lưu ý: trường `suKienNgauNhien` giữ tên cũ; nay nghĩa là "dịp do hệ thống chọn mặc định".
  const meta = [
    suKien ? (item.suKienNgauNhien ? `${suKien.ten} (dịp mặc định)` : suKien.ten) : null,
    cacPhuKien.length > 0 ? cacPhuKien.map((p) => p.ten).join(', ') : 'Không phụ kiện',
  ]
    .filter(Boolean)
    .join(' · ');

  // Tham số mở lại bộ phối: chỉ mang dịp do người dùng chọn (dịp mặc định thì để trống,
  // khi mở lại hệ thống tự dùng dịp mặc định).
  const phuKienIds = layPhuKienIds(item);
  const thamSoPhoiDo = {
    trangPhucId: item.trangPhucId || null,
    suKienId: item.suKienId && !item.suKienNgauNhien ? item.suKienId : null,
    mauChinhId: item.mauChinhId || null,
    mauPhuId: item.mauPhuId || null,
    phuKienIds,
  };

  async function xuLyChiaSe() {
    const link = taoLinkChiaSe(thamSoPhoiDo);
    const noiDung = taoNoiDungChiaSe({ trangPhuc, suKien, mauChinh, mauPhu, cacPhuKien, link });
    if (!noiDung) return;
    const thanhCong = await saoChepChiaSe(noiDung);
    setDaSaoChep(thanhCong);
    setTimeout(() => setDaSaoChep(false), 2000);
  }

  async function xuLySaoChepLink() {
    const link = taoLinkChiaSe(thamSoPhoiDo);
    if (!link) return;
    const thanhCong = await saoChepChiaSe(link);
    setDaChepLink(thanhCong);
    setTimeout(() => setDaChepLink(false), 2000);
  }

  async function xuLyTaiAnh() {
    if (!item.imageUrl) return;
    setDangTaiAnh(true);
    setThongBaoTai(null);
    const taiDuoc = await taiAnhVe(item.imageUrl, taoTenFileAnh(trangPhuc?.ten));
    if (!taiDuoc) setThongBaoTai('Ảnh đã mở ở tab mới, hãy nhấn giữ hoặc chuột phải để lưu.');
    setDangTaiAnh(false);
  }

  function xuLyXoa() {
    if (window.confirm('Xoá bộ phối này khỏi Lookbook? Không thể hoàn tác.')) {
      onXoa(item.id);
    }
  }

  const nutPhu = 'flex-1 py-2.5 text-ink-soft hover:text-ink transition';

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

        {thongBaoTai && (
          <p className="text-xs text-ink-soft" role="status">
            {thongBaoTai}
          </p>
        )}
      </div>

      <div className="flex flex-wrap border-t border-ink-soft/15 text-sm divide-x divide-ink-soft/15">
        <button onClick={xuLyXoa} className="flex-1 py-2.5 text-ink-soft hover:text-lacquer transition">
          Xoá
        </button>
        <button onClick={xuLyChiaSe} className={nutPhu}>
          {daSaoChep ? 'Đã chép ✓' : 'Chia sẻ'}
        </button>
        <button onClick={xuLySaoChepLink} className={nutPhu}>
          {daChepLink ? 'Đã chép ✓' : 'Chép link'}
        </button>
        {item.imageUrl && (
          <button onClick={xuLyTaiAnh} disabled={dangTaiAnh} className={`${nutPhu} disabled:opacity-60`}>
            {dangTaiAnh ? 'Đang tải...' : 'Tải ảnh'}
          </button>
        )}
        <Link
          href={`/phoi-do?${taoThamSoPhoiDo(thamSoPhoiDo).toString()}`}
          className="flex-1 py-2.5 text-center text-lacquer font-medium hover:opacity-80 transition"
        >
          Phối lại
        </Link>
      </div>
    </article>
  );
}