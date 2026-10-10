'use client';

import { useState } from 'react';
import Link from 'next/link';
import XemTruoc from '@/components/phoi-do/XemTruoc';
import GhiChuAnhAI from '@/components/phoi-do/GhiChuAnhAI';
import { GIAO_DIEN_MUC_DO } from '@/components/phoi-do/CanhBaoVanHoa';
import { mucVanHoaDeHienThi } from '@/lib/canhBaoVanHoa';
import { taoNoiDungChiaSe, taoLinkChiaSe, taoThamSoPhoiDo, saoChepChiaSe } from '@/lib/chiaSe';
import { taiAnhVe, taoTenFileAnh } from '@/lib/taiAnh';
import type { LookbookItem } from '@/lib/localLookbook';
import { layPhuKienIds } from '@/lib/localLookbook';
import type { TrangPhuc, SuKien, MauSac, PhuKien, MucDoVanHoa } from '@/types/phoi-do';

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

/** Món cần chú ý xếp trước, món phù hợp xếp sau. */
const THU_TU_MUC: Record<MucDoVanHoa, number> = {
  khong_phu_hop: 0,
  tuy_dip: 1,
  chua_co_du_lieu: 2,
  phu_hop: 3,
  khong_co_phu_kien: 4,
};

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

  // Lưu ý: trường `suKienNgauNhien` giữ tên cũ; nay nghĩa là "dịp do hệ thống chọn mặc định".
  const meta = [
    suKien ? (item.suKienNgauNhien ? `${suKien.ten} (dịp mặc định)` : suKien.ten) : null,
    cacPhuKien.length > 0 ? cacPhuKien.map((p) => p.ten).join(', ') : 'Không phụ kiện',
  ]
    .filter(Boolean)
    .join(' · ');

  // ===== Cảnh báo văn hoá (từ kết quả thẩm định đã lưu cùng bộ phối) =====
  const pv = item.ketQuaKiemTra?.phuHopVanHoa ?? null;
  // Món "chưa có dữ liệu" không hiện ra cho người dùng (giống trang phối đồ). Bộ cũ không có chiTietPhuKien thì mảng rỗng.
  const monDaDanhGia = (pv?.chiTietPhuKien ?? [])
    .filter((c) => c.mucDo !== 'chua_co_du_lieu' && c.mucDo !== 'khong_co_phu_kien')
    .sort((a, b) => THU_TU_MUC[a.mucDo] - THU_TU_MUC[b.mucDo]);
  const monCanLuuY = monDaDanhGia.filter((c) => c.mucDo === 'khong_phu_hop' || c.mucDo === 'tuy_dip');
  // Mức tổng thể; null khi mọi món đều chưa có dữ liệu.
  const mucTong = pv ? mucVanHoaDeHienThi(pv) : null;
  const gdChung = mucTong ? (GIAO_DIEN_MUC_DO[mucTong] ?? null) : null;
  const chuaDungPhuKien = pv?.mucDo === 'khong_co_phu_kien';
  // Bộ cũ chỉ có cờ canhBao (không có mức) -> vẫn giữ cảnh báo chung.
  const canhBaoCu = Boolean(pv?.canhBao) && !gdChung && !chuaDungPhuKien;
  // Bộ lưu khi chưa chọn dịp: nhận định văn hoá kém tin cậy hơn.
  const canNhacDip = Boolean(item.suKienNgauNhien) && monCanLuuY.length > 0;

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

        {/* ===== Chuẩn mực văn hoá ===== */}
        {gdChung && (
          <div className="space-y-1.5">
            <p className={`flex items-center gap-1.5 text-xs font-medium ${gdChung.chu}`}>
              <span
                aria-hidden
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${gdChung.tron}`}
              >
                {gdChung.bieuTuong}
              </span>
              Chuẩn mực văn hoá: {gdChung.nhan}
            </p>

            {monDaDanhGia.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Mức phù hợp văn hoá của từng phụ kiện">
                {monDaDanhGia.map((c) => {
                  const gd = GIAO_DIEN_MUC_DO[c.mucDo];
                  if (!gd) return null;
                  return (
                    <li
                      key={c.phuKien.id}
                      className="inline-flex items-center gap-1 rounded-full border border-ink-soft/20 px-2 py-0.5 text-xs"
                    >
                      <span
                        aria-hidden
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${gd.tron}`}
                      >
                        {gd.bieuTuong}
                      </span>
                      {c.phuKien.ten}
                      <span className="sr-only">: {gd.nhan}</span>
                    </li>
                  );
                })}
              </ul>
            )}

            {monCanLuuY.length > 0 && (
              <details className="text-xs text-ink-soft">
                <summary className="cursor-pointer select-none font-medium text-ink hover:underline">
                  Xem lý do
                </summary>
                <ul className="mt-1 space-y-1">
                  {monCanLuuY.map((c) => (
                    <li key={c.phuKien.id}>
                      <span className="font-medium text-ink">{c.phuKien.ten}: </span>
                      {c.lyDo ?? 'Chưa có ghi chú cho món này.'}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {canNhacDip && (
              <p className="text-[11px] text-ink-soft">
                <span aria-hidden>ⓘ </span>
                Bộ này lưu khi chưa chọn dịp nên nhận định có độ tin cậy thấp hơn. Bấm “Phối lại” và chọn dịp để
                xem lại.
              </p>
            )}
          </div>
        )}

        {chuaDungPhuKien && (
          <p className="text-xs text-ink-soft">Chưa dùng phụ kiện nên chưa có gì để đối chiếu văn hoá.</p>
        )}

        {canhBaoCu && (
          <p className="text-xs text-lacquer">⚠ Có điểm cần lưu ý về văn hoá. Bấm “Phối lại” để xem chi tiết.</p>
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