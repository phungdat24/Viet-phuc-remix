'use client';

import { useEffect, useState } from 'react';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import XemTruoc from './XemTruoc';
import KetQuaPhoiDo from './KetQuaPhoiDo';
import { saveLookbook } from '@/lib/localLookbook';
import { layDanhSach } from '@/lib/api';
import type {
  TrangPhuc,
  SuKien,
  MauSac,
  PhuKien,
  KetQuaKiemTra,
} from '@/types/phoi-do';

export default function ThuNghiemPhoiDoClient() {
  const [danhSachTrangPhuc, setDanhSachTrangPhuc] = useState<TrangPhuc[]>([]);
  const [danhSachSuKien, setDanhSachSuKien] = useState<SuKien[]>([]);
  const [danhSachMau, setDanhSachMau] = useState<MauSac[]>([]);
  const [danhSachPhuKien, setDanhSachPhuKien] = useState<PhuKien[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const [trangPhucId, setTrangPhucId] = useState<string | null>(null);
  const [suKienId, setSuKienId] = useState<string | null>(null);
  const [mauChinhId, setMauChinhId] = useState<string | null>(null);
  const [mauPhuId, setMauPhuId] = useState<string | null>(null);
  const [phuKienId, setPhuKienId] = useState<string | null>(null);

  const [ketQua, setKetQua] = useState<KetQuaKiemTra | null>(null);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [loiKiemTra, setLoiKiemTra] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);
  const [daSaoChep, setDaSaoChep] = useState(false);

  const trangPhucDangChon = danhSachTrangPhuc.find((tp) => tp.id === trangPhucId) ?? null;
  const suKienDangChon = danhSachSuKien.find((sk) => sk.id === suKienId) ?? null;
  const mauChinhDangChon = danhSachMau.find((m) => m.id === mauChinhId) ?? null;
  const mauPhuDangChon = danhSachMau.find((m) => m.id === mauPhuId) ?? null;
  const phuKienDangChon = danhSachPhuKien.find((p) => p.id === phuKienId) ?? null;

  const daChonDuDeXem = Boolean(trangPhucId && mauChinhId && mauPhuId);

  useEffect(() => {
    async function taiDuLieu() {
      try {
        const [tp, sk, ms, pk] = await Promise.all([
          layDanhSach<TrangPhuc>('/api/trang-phuc'),
          layDanhSach<SuKien>('/api/su-kien'),
          layDanhSach<MauSac>('/api/mau-sac'),
          layDanhSach<PhuKien>('/api/phu-kien'),
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

  function datLaiKetQua() {
    setKetQua(null);
    setLoiKiemTra(null);
    setDaLuu(false);
    setDaSaoChep(false);
  }

  function boc<T>(setter: (giaTri: T) => void) {
    return (giaTri: T) => {
      setter(giaTri);
      datLaiKetQua();
    };
  }

  async function xuLyXemKetQua() {
    if (!trangPhucId || !mauChinhId || !mauPhuId) return;

    setDangKiemTra(true);
    setLoiKiemTra(null);
    try {
      const res = await fetch('/api/kiem-tra-phoi-do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Máy chủ trả về lỗi ${res.status}`);
      setKetQua(body.data);
    } catch (err) {
      setLoiKiemTra(err instanceof Error ? err.message : 'Không thể thẩm định lúc này');
    } finally {
      setDangKiemTra(false);
    }
  }

  function xuLyLuu() {
    if (!trangPhucId || !mauChinhId || !mauPhuId || !ketQua) return;
    saveLookbook({ trangPhucId, suKienId, mauChinhId, mauPhuId, phuKienId, ketQuaKiemTra: ketQua });
    setDaLuu(true);
  }

  async function xuLyChiaSe() {
    if (!trangPhucDangChon || !mauChinhDangChon || !mauPhuDangChon) return;
    const noiDung =
      `Việt Phục Remix: ${trangPhucDangChon.ten}` +
      (suKienDangChon ? `, dịp ${suKienDangChon.ten}` : '') +
      `, tông ${mauChinhDangChon.ten} phối ${mauPhuDangChon.ten}` +
      (phuKienDangChon ? `, cùng ${phuKienDangChon.ten}` : '') +
      '.';
    try {
      await navigator.clipboard.writeText(noiDung);
      setDaSaoChep(true);
    } catch {
      window.prompt('Sao chép nội dung bên dưới để chia sẻ:', noiDung);
    }
  }

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
          onChonTrangPhuc={boc(setTrangPhucId)}
          onChonSuKien={boc(setSuKienId)}
        />
        <BangMau
          danhSachMau={danhSachMau}
          mauChinhDangChon={mauChinhId}
          mauPhuDangChon={mauPhuId}
          onChonMauChinh={boc(setMauChinhId)}
          onChonMauPhu={boc(setMauPhuId)}
        />
        <ChonPhuKien
          danhSachPhuKien={danhSachPhuKien}
          phuKienDangChon={phuKienId}
          onChonPhuKien={boc(setPhuKienId)}
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

        {!daChonDuDeXem && trangPhucId && (
          <p className="p-4 border-t border-ink-soft/15 text-sm text-ink-soft text-center">
            Chọn thêm màu chính và màu phụ để xem kết quả phối đồ.
          </p>
        )}

        {daChonDuDeXem && !ketQua && (
          <div className="p-4 border-t border-ink-soft/15">
            {loiKiemTra && <p className="text-sm text-lacquer mb-2">{loiKiemTra}</p>}
            <button
              onClick={xuLyXemKetQua}
              disabled={dangKiemTra}
              className="w-full bg-lacquer text-white font-medium py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-60"
            >
              {dangKiemTra ? 'Đang thẩm định...' : 'Xem kết quả phối đồ'}
            </button>
          </div>
        )}

        {ketQua && (
          <KetQuaPhoiDo
            ketQua={ketQua}
            daLuu={daLuu}
            daSaoChep={daSaoChep}
            onLuu={xuLyLuu}
            onChiaSe={xuLyChiaSe}
          />
        )}
      </section>
    </main>
  );
}