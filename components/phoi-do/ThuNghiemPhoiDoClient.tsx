'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import XemTruoc from './XemTruoc';
import KetQuaPhoiDo from './KetQuaPhoiDo';
import { saveLookbook } from '@/lib/localLookbook';
import { taoNoiDungChiaSe, saoChepChiaSe } from '@/lib/chiaSe';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import type { KetQuaKiemTra } from '@/types/phoi-do';

export default function ThuNghiemPhoiDoClient() {
  const searchParams = useSearchParams();
  const { danhMuc, loi, dangTai } = useDanhMuc();

  const [trangPhucId, setTrangPhucId] = useState<string | null>(searchParams.get('trangPhucId'));
  const [suKienId, setSuKienId] = useState<string | null>(searchParams.get('suKienId'));
  const [mauChinhId, setMauChinhId] = useState<string | null>(searchParams.get('mauChinhId'));
  const [mauPhuId, setMauPhuId] = useState<string | null>(searchParams.get('mauPhuId'));
  const [phuKienId, setPhuKienId] = useState<string | null>(searchParams.get('phuKienId'));

  const [ketQua, setKetQua] = useState<KetQuaKiemTra | null>(null);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [loiKiemTra, setLoiKiemTra] = useState<string | null>(null);
  const [daLuu, setDaLuu] = useState(false);
  const [daSaoChep, setDaSaoChep] = useState(false);

  if (dangTai) return <p className="text-center py-12 text-ink-soft">Đang tải dữ liệu...</p>;
  if (loi || !danhMuc) return <p className="text-center py-12 text-lacquer">Đã xảy ra lỗi: {loi}</p>;

  const trangPhucDangChon = danhMuc.trangPhuc.find((tp) => tp.id === trangPhucId) ?? null;
  const suKienDangChon = danhMuc.suKien.find((sk) => sk.id === suKienId) ?? null;
  const mauChinhDangChon = danhMuc.mauSac.find((m) => m.id === mauChinhId) ?? null;
  const mauPhuDangChon = danhMuc.mauSac.find((m) => m.id === mauPhuId) ?? null;
  const phuKienDangChon = danhMuc.phuKien.find((p) => p.id === phuKienId) ?? null;

  const daChonDuDeXem = Boolean(trangPhucId && mauChinhId && mauPhuId);

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
    const noiDung = taoNoiDungChiaSe({
      trangPhuc: trangPhucDangChon,
      suKien: suKienDangChon,
      mauChinh: mauChinhDangChon,
      mauPhu: mauPhuDangChon,
      phuKien: phuKienDangChon,
    });
    if (!noiDung) return;
    const thanhCong = await saoChepChiaSe(noiDung);
    setDaSaoChep(thanhCong);
  }

    return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold mb-6">Thử nghiệm phối đồ</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
        {/* Cột trái: Chọn trang phục & bối cảnh */}
        <aside className="space-y-8">
          <ChonTrangPhuc
            danhSachTrangPhuc={danhMuc.trangPhuc}
            danhSachSuKien={danhMuc.suKien}
            trangPhucDangChon={trangPhucId}
            suKienDangChon={suKienId}
            onChonTrangPhuc={boc(setTrangPhucId)}
            onChonSuKien={boc(setSuKienId)}
          />
        </aside>

        {/* Cột giữa: Khu xem trước + kết quả thẩm định */}
        <section className="bg-paper-raised rounded-md flex flex-col min-h-100">
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

        {/* Cột phải: Tùy chỉnh màu sắc & phụ kiện */}
        <aside className="space-y-8">
          <BangMau
            danhSachMau={danhMuc.mauSac}
            mauChinhDangChon={mauChinhId}
            mauPhuDangChon={mauPhuId}
            onChonMauChinh={boc(setMauChinhId)}
            onChonMauPhu={boc(setMauPhuId)}
          />
          <ChonPhuKien
            danhSachPhuKien={danhMuc.phuKien}
            phuKienDangChon={phuKienId}
            onChonPhuKien={boc(setPhuKienId)}
          />
        </aside>
      </div>
    </main>
  );
}