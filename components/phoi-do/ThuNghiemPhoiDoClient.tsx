'use client';

import { useEffect, useState } from 'react';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';
import XemTruoc from './XemTruoc';
import { saveLookbook } from '@/lib/localLookbook';

export default function ThuNghiemPhoiDoClient() {
  const [danhSachTrangPhuc, setDanhSachTrangPhuc] = useState<TrangPhuc[]>([]);
  const [danhSachSuKien, setDanhSachSuKien] = useState<SuKien[]>([]);
  const [danhSachMau, setDanhSachMau] = useState<MauSac[]>([]);
  const [danhSachPhuKien, setDanhSachPhuKien] = useState<PhuKien[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [daLuu, setDaLuu] = useState(false);

  const [trangPhucId, setTrangPhucId] = useState<string | null>(null);
  const [suKienId, setSuKienId] = useState<string | null>(null);
  const [mauChinhId, setMauChinhId] = useState<string | null>(null);
  const [mauPhuId, setMauPhuId] = useState<string | null>(null);
  const [phuKienId, setPhuKienId] = useState<string | null>(null);

  const [loi, setLoi] = useState<string | null>(null);

  const trangPhucDangChon = danhSachTrangPhuc.find((tp) => tp.id === trangPhucId) ?? null;
  const mauChinhDangChon = danhSachMau.find((m) => m.id === mauChinhId) ?? null;
  const mauPhuDangChon = danhSachMau.find((m) => m.id === mauPhuId) ?? null;
  const phuKienDangChon = danhSachPhuKien.find((p) => p.id === phuKienId) ?? null;

  const daChonDuDeLuu = trangPhucId && mauChinhId && mauPhuId;

  function xuLyLuuLookbook() {
  if (!trangPhucId || !mauChinhId || !mauPhuId) return;
  saveLookbook({ trangPhucId, suKienId, mauChinhId, mauPhuId, phuKienId, ketQuaKiemTra: null });
  setDaLuu(true);
  setTimeout(() => setDaLuu(false), 2000);
}

useEffect(() => {
  async function taiDuLieu() {
    try {
      const [tp, sk, ms, pk] = await Promise.all([
        fetch('/api/trang-phuc').then((r) => {
          if (!r.ok) throw new Error(`Lỗi API trang-phuc: ${r.status}`);
          return r.json();
        }),
        fetch('/api/su-kien').then((r) => {
          if (!r.ok) throw new Error(`Lỗi API su-kien: ${r.status}`);
          return r.json();
        }),
        fetch('/api/mau-sac').then((r) => {
          if (!r.ok) throw new Error(`Lỗi API mau-sac: ${r.status}`);
          return r.json();
        }),
        fetch('/api/phu-kien').then((r) => {
          if (!r.ok) throw new Error(`Lỗi API phu-kien: ${r.status}`);
          return r.json();
        }),
      ]);
      setDanhSachTrangPhuc(tp.data);
      setDanhSachSuKien(sk.data);
      setDanhSachMau(ms.data);
      setDanhSachPhuKien(pk.data);
    } catch (err) {
      setLoi(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setDangTai(false);
    }
  }
  taiDuLieu();
}, []);
  if (dangTai) return <p className="text-center py-12 text-ink-soft">Đang tải dữ liệu...</p>;
  if (loi) return <p className="text-center py-12 text-lacquer">Đã xảy ra lỗi: {loi}</p>;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
      <aside className="space-y-8">
        <ChonTrangPhuc
          danhSachTrangPhuc={danhSachTrangPhuc}
          danhSachSuKien={danhSachSuKien}
          trangPhucDangChon={trangPhucId}
          suKienDangChon={suKienId}
          onChonTrangPhuc={setTrangPhucId}
          onChonSuKien={setSuKienId}
        />
        <BangMau
          danhSachMau={danhSachMau}
          mauChinhDangChon={mauChinhId}
          mauPhuDangChon={mauPhuId}
          onChonMauChinh={setMauChinhId}
          onChonMauPhu={setMauPhuId}
        />
        <ChonPhuKien
          danhSachPhuKien={danhSachPhuKien}
          phuKienDangChon={phuKienId}
          onChonPhuKien={setPhuKienId}
        />
      </aside>

      <section className="bg-paper-raised rounded-md min-h-100 flex flex-col">
  <div className="flex-1">
    <XemTruoc
      trangPhuc={trangPhucDangChon}
      mauChinh={mauChinhDangChon}
      mauPhu={mauPhuDangChon}
      phuKien={phuKienDangChon}
    />
  </div>
  {daChonDuDeLuu && (
    <div className="p-4 border-t border-ink-soft/15">
      <button
        onClick={xuLyLuuLookbook}
        className="w-full bg-lacquer text-white font-medium py-2.5 rounded-md hover:opacity-90 transition"
      >
        {daLuu ? 'Đã lưu vào Lookbook ✓' : 'Lưu vào Lookbook của tôi'}
      </button>
    </div>
  )}
</section>
    </main>
  );
}