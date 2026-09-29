'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import XemTruoc from './XemTruoc';
import KetQuaPhoiDo from './KetQuaPhoiDo';
import { saveLookbook } from '@/lib/localLookbook';
import { taoNoiDungChiaSe, saoChepChiaSe } from '@/lib/chiaSe';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import type { KetQuaKiemTra, SuKien, ToHopAI } from '@/types/phoi-do';

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

  // Ảnh AI + bước duyệt
  const [toHop, setToHop] = useState<ToHopAI | null>(null);
  const [dangSinhAnh, setDangSinhAnh] = useState(false);
  const [loiAnh, setLoiAnh] = useState<string | null>(null);
  const [dangDuyet, setDangDuyet] = useState(false);
  // Dịp do hệ thống bốc ngẫu nhiên khi người dùng chưa chọn dịp (null nếu người dùng tự chọn).
  const [suKienNgauNhien, setSuKienNgauNhien] = useState<SuKien | null>(null);
  // Mỗi lần bấm "Xem kết quả" / đổi lựa chọn tăng số này để bỏ qua phản hồi cũ đến muộn.
  const idYeuCau = useRef(0);

  if (dangTai) return <p className="text-center py-12 text-ink-soft">Đang tải dữ liệu...</p>;
  if (loi || !danhMuc) return <p className="text-center py-12 text-lacquer">Đã xảy ra lỗi: {loi}</p>;

  const trangPhucDangChon = danhMuc.trangPhuc.find((tp) => tp.id === trangPhucId) ?? null;
  const suKienDangChon = danhMuc.suKien.find((sk) => sk.id === suKienId) ?? null;
  const mauChinhDangChon = danhMuc.mauSac.find((m) => m.id === mauChinhId) ?? null;
  const mauPhuDangChon = danhMuc.mauSac.find((m) => m.id === mauPhuId) ?? null;
  const phuKienDangChon = danhMuc.phuKien.find((p) => p.id === phuKienId) ?? null;

  const daChonDuDeXem = Boolean(trangPhucId && mauChinhId && mauPhuId);

  // Dịp thực sự dùng để thẩm định + sinh ảnh: người dùng chọn, hoặc dịp ngẫu nhiên.
  const suKienHieuLuc = suKienDangChon ?? suKienNgauNhien;
  const danhSachSuKien = danhMuc.suKien;
  // Đã có ảnh AI thì bỏ hình minh hoạ phác thảo phía trên, chỉ giữ ảnh AI.
  const coAnhAI = Boolean(toHop?.imageUrl);

  function datLaiKetQua() {
    idYeuCau.current += 1;
    setKetQua(null);
    setLoiKiemTra(null);
    setDangKiemTra(false);
    setDaLuu(false);
    setDaSaoChep(false);
    setToHop(null);
    setDangSinhAnh(false);
    setLoiAnh(null);
    setDangDuyet(false);
    setSuKienNgauNhien(null);
  }

  function boc<T>(setter: (giaTri: T) => void) {
    return (giaTri: T) => {
      setter(giaTri);
      datLaiKetQua();
    };
  }

  async function xuLyXemKetQua() {
    if (!trangPhucId || !mauChinhId || !mauPhuId) return;
    const idHienTai = ++idYeuCau.current;
    setDangKiemTra(true);
    setLoiKiemTra(null);
    setToHop(null);
    setLoiAnh(null);

    // Chưa chọn dịp → bốc ngẫu nhiên 1 dịp để thẩm định và minh hoạ (có ghi chú cho người dùng).
    let suKienDung: string | null = suKienId;
    let ngauNhien: SuKien | null = null;
    if (!suKienDung && danhSachSuKien.length > 0) {
      ngauNhien = danhSachSuKien[Math.floor(Math.random() * danhSachSuKien.length)];
      suKienDung = ngauNhien.id;
    }
    setSuKienNgauNhien(ngauNhien);

    try {
      const res = await fetch('/api/kiem-tra-phoi-do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId: suKienDung }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Máy chủ trả về lỗi ${res.status}`);
      if (idHienTai !== idYeuCau.current) return;
      setKetQua(body.data);
      // Có kết quả thẩm định rồi thì hiện ngay, ảnh AI sinh tiếp phía sau (10–20 giây).
      // Phụ kiện là tuỳ chọn (không chọn = ảnh không kèm phụ kiện) nên luôn sinh ảnh khi có dịp.
      if (suKienDung) void sinhAnhAI(false, idHienTai, suKienDung);
    } catch (err) {
      if (idHienTai === idYeuCau.current) {
        setLoiKiemTra(err instanceof Error ? err.message : 'Không thể thẩm định lúc này');
      }
    } finally {
      if (idHienTai === idYeuCau.current) setDangKiemTra(false);
    }
  }

  async function sinhAnhAI(sinhLai: boolean, idHienTai: number, suKienDung: string) {
    if (!trangPhucId || !mauChinhId || !mauPhuId) return;
    setDangSinhAnh(true);
    setLoiAnh(null);
    setToHop(null);
    try {
      const res = await fetch('/api/to-hop-duoc-duyet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId: suKienDung, sinhLai }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Lỗi API (HTTP ${res.status})`);
      if (idHienTai !== idYeuCau.current) return;
      setToHop(body.data);
    } catch (err) {
      if (idHienTai === idYeuCau.current) {
        setLoiAnh(err instanceof Error ? err.message : 'Không thể sinh ảnh AI lúc này');
      }
    } finally {
      if (idHienTai === idYeuCau.current) setDangSinhAnh(false);
    }
  }

  async function capNhatTrangThai(id: string, status: 'approved' | 'rejected'): Promise<ToHopAI> {
    const res = await fetch(`/api/to-hop-duoc-duyet/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? `Lỗi API (HTTP ${res.status})`);
    return body.data as ToHopAI;
  }

  /** Duyệt ảnh AI → lưu bộ phối (kèm ảnh) vào Lookbook. */
  async function xuLyDuyetAnh() {
    if (!toHop || !trangPhucId || !mauChinhId || !mauPhuId || !ketQua) return;
    setDangDuyet(true);
    setLoiAnh(null);
    try {
      const hienTai = toHop.status === 'approved' ? toHop : await capNhatTrangThai(toHop.id, 'approved');
      setToHop(hienTai);
      saveLookbook({
        trangPhucId,
        suKienId: suKienHieuLuc?.id ?? null,
        suKienNgauNhien: suKienNgauNhien !== null,
        mauChinhId,
        mauPhuId,
        phuKienId,
        ketQuaKiemTra: ketQua,
        imageUrl: hienTai.imageUrl,
        toHopId: hienTai.id,
      });
      setDaLuu(true);
    } catch (err) {
      setLoiAnh(err instanceof Error ? err.message : 'Không thể duyệt lúc này');
    } finally {
      setDangDuyet(false);
    }
  }

  /** Không duyệt → không lưu Lookbook. */
  async function xuLyKhongDuyetAnh() {
    if (!toHop) return;
    setDangDuyet(true);
    setLoiAnh(null);
    try {
      setToHop(await capNhatTrangThai(toHop.id, 'rejected'));
    } catch (err) {
      setLoiAnh(err instanceof Error ? err.message : 'Không thể cập nhật lúc này');
    } finally {
      setDangDuyet(false);
    }
  }

  function xuLySinhLaiAnh() {
    // Giữ nguyên dịp đã dùng (kể cả dịp ngẫu nhiên) để "Sinh ảnh khác" chỉ đổi ảnh, không đổi dịp.
    if (suKienHieuLuc) void sinhAnhAI(true, ++idYeuCau.current, suKienHieuLuc.id);
  }

  function xuLyLuu() {
    if (!trangPhucId || !mauChinhId || !mauPhuId || !ketQua) return;
    saveLookbook({
      trangPhucId,
      suKienId: suKienHieuLuc?.id ?? null,
      suKienNgauNhien: suKienNgauNhien !== null,
      mauChinhId,
      mauPhuId,
      phuKienId,
      ketQuaKiemTra: ketQua,
    });
    setDaLuu(true);
  }

  async function xuLyChiaSe() {
    const noiDung = taoNoiDungChiaSe({
      trangPhuc: trangPhucDangChon,
      suKien: suKienHieuLuc,
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
          {/* Có ảnh AI rồi thì xoá phần hình minh hoạ phác thảo ở trên */}
          {!coAnhAI && (
            <div className="flex-1">
              <XemTruoc
                trangPhuc={trangPhucDangChon}
                mauChinh={mauChinhDangChon}
                mauPhu={mauPhuDangChon}
                phuKien={phuKienDangChon}
              />
            </div>
          )}

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
              anhAI={{
                thieuThongTin: !suKienHieuLuc,
                tenSuKien: suKienHieuLuc?.ten ?? null,
                suKienNgauNhien: suKienNgauNhien !== null,
                tenPhuKien: phuKienDangChon?.ten ?? null,
                dangSinh: dangSinhAnh,
                loi: loiAnh,
                toHop,
                dangDuyet,
                daLuu,
                onDuyet: xuLyDuyetAnh,
                onKhongDuyet: xuLyKhongDuyetAnh,
                onSinhLai: xuLySinhLaiAnh,
              }}
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