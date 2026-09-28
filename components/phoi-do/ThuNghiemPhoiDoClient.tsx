'use client';

import { useEffect, useState } from 'react';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

export default function ThuNghiemPhoiDoClient() {
  const [danhSachTrangPhuc, setDanhSachTrangPhuc] = useState<TrangPhuc[]>([]);
  const [danhSachSuKien, setDanhSachSuKien] = useState<SuKien[]>([]);
  const [danhSachMau, setDanhSachMau] = useState<MauSac[]>([]);
  const [danhSachPhuKien, setDanhSachPhuKien] = useState<PhuKien[]>([]);
  const [dangTai, setDangTai] = useState(true);

  const [trangPhucId, setTrangPhucId] = useState<string | null>(null);
  const [suKienId, setSuKienId] = useState<string | null>(null);
  const [mauChinhId, setMauChinhId] = useState<string | null>(null);
  const [mauPhuId, setMauPhuId] = useState<string | null>(null);
  const [phuKienId, setPhuKienId] = useState<string | null>(null);

  const [loi, setLoi] = useState<string | null>(null);

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
      setDanhSachTrangPhuc(tp);
      setDanhSachSuKien(sk);
      setDanhSachMau(ms);
      setDanhSachPhuKien(pk);
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

      <section className="bg-paper-raised rounded-md flex items-center justify-center text-ink-soft min-h-100">
        [Khu vực xem trước — sẽ làm ở B7]
      </section>
    </main>
  );
}