'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ChonTrangPhuc from './ChonTrangPhuc';
import BangMau from './BangMau';
import ChonPhuKien from './ChonPhuKien';
import XemTruoc from './XemTruoc';
import KetQuaPhoiDo from './KetQuaPhoiDo';
import { saveLookbook } from '@/lib/localLookbook';
import { taoNoiDungChiaSe, saoChepChiaSe } from '@/lib/chiaSe';
import { layBoMau, chuanHoaTen } from '@/lib/mauTheoTrangPhuc';
import { layPhuKienChoPhep, layNhomCuaPhuKien, timMonXungDot } from '@/lib/phuKienTheoTrangPhuc';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import type { KetQuaKiemTra, ToHopAI } from '@/types/phoi-do';
import GioiThieuVanHoa from './GioiThieuVanHoa';
import TienTrinhPhoiDo from './TienTrinhPhoiDo';

/** Dịp dùng để sinh ảnh khi người dùng chưa chọn dịp (khớp với bộ ảnh làm sẵn cho demo). */
const TEN_DIP_MAC_DINH = 'Tết';

/** Đọc danh sách phụ kiện từ URL: ưu tiên `phuKienIds=a,b`, nếu không có thì dùng `phuKienId=a` (bản cũ). */
function docPhuKienTuUrl(params: URLSearchParams): string[] {
  const nhieu = params.get('phuKienIds');
  if (nhieu) return nhieu.split(',').filter(Boolean);
  const mot = params.get('phuKienId');
  return mot ? [mot] : [];
}

export default function ThuNghiemPhoiDoClient() {
  const searchParams = useSearchParams();
  const { danhMuc, loi, dangTai } = useDanhMuc();

  const [trangPhucId, setTrangPhucId] = useState<string | null>(searchParams.get('trangPhucId'));
  const [suKienId, setSuKienId] = useState<string | null>(searchParams.get('suKienId'));
  const [mauChinhId, setMauChinhId] = useState<string | null>(searchParams.get('mauChinhId'));
  const [mauPhuId, setMauPhuId] = useState<string | null>(searchParams.get('mauPhuId'));
  const [phuKienIds, setPhuKienIds] = useState<string[]>(() => docPhuKienTuUrl(searchParams));

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
  // Mỗi lần bấm "Xem kết quả" / đổi lựa chọn tăng số này để bỏ qua phản hồi cũ đến muộn.
  const idYeuCau = useRef(0);
  // Khi có kết quả thì tự cuộn tới khu kết quả (trên điện thoại kết quả nằm dưới cùng, dễ bị bỏ sót).
  const khuKetQuaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ketQua) return;
    const laDiDong = window.matchMedia('(max-width: 1023px)').matches;
    khuKetQuaRef.current?.scrollIntoView({ behavior: 'smooth', block: laDiDong ? 'start' : 'nearest' });
  }, [ketQua]);

  if (dangTai) return <p className="text-center py-12 text-ink-soft">Đang tải dữ liệu...</p>;
  if (loi || !danhMuc) return <p className="text-center py-12 text-lacquer">Đã xảy ra lỗi: {loi}</p>;

  // Chụp lại thành const để dùng được trong các hàm khai báo bên dưới (TypeScript không giữ
  // kết quả "danhMuc đã khác null" bên trong function declaration).
  const tatCaMau = danhMuc.mauSac;
  const tatCaTrangPhuc = danhMuc.trangPhuc;
  const tatCaPhuKien = danhMuc.phuKien;

  const trangPhucDangChon = tatCaTrangPhuc.find((tp) => tp.id === trangPhucId) ?? null;
  const suKienDangChon = danhMuc.suKien.find((sk) => sk.id === suKienId) ?? null;
  const mauChinhDangChon = tatCaMau.find((m) => m.id === mauChinhId) ?? null;
  const mauPhuDangChon = tatCaMau.find((m) => m.id === mauPhuId) ?? null;
  // Giữ đúng thứ tự người dùng bấm chọn.
  const cacPhuKienDangChon = phuKienIds
    .map((id) => tatCaPhuKien.find((p) => p.id === id))
    .filter((p): p is (typeof tatCaPhuKien)[number] => Boolean(p));
  // Tương thích tạm: các nơi chưa hỗ trợ nhiều phụ kiện dùng món đầu tiên.
  const phuKienDauTien = cacPhuKienDangChon[0] ?? null;

  const daChonDuDeXem = Boolean(trangPhucId && mauChinhId && mauPhuId);

  // Dịp mặc định (Tết) chỉ dùng để sinh ảnh khi người dùng chưa chọn dịp.
  // Thẩm định văn hoá KHÔNG dùng dịp này (chỉ dùng dịp người dùng tự chọn).
  const dipMacDinh = suKienDangChon
    ? null
    : (danhMuc.suKien.find((sk) => chuanHoaTen(sk.ten) === chuanHoaTen(TEN_DIP_MAC_DINH)) ??
      danhMuc.suKien[0] ??
      null);
  const dungDipMacDinh = dipMacDinh !== null;
  const suKienHieuLuc = suKienDangChon ?? dipMacDinh;
  // Đã có ảnh AI thì bỏ hình minh hoạ phác thảo phía trên, chỉ giữ ảnh AI.
  const coAnhAI = Boolean(toHop?.imageUrl);

  // ===== Lọc màu + phụ kiện theo trang phục =====
  const boMau = layBoMau(trangPhucDangChon?.ten);
  const tenPhuKienChoPhep = layPhuKienChoPhep(trangPhucDangChon?.ten);

  /**
   * Tra theo tên (giữ đúng thứ tự khai báo); luôn giữ lại các mục người dùng đang chọn
   * (vd: vào từ "Phối lại" ở Lookbook) để không làm mất dữ liệu.
   */
  function locTheoTen<T extends { id: string; ten: string }>(
    nguon: T[],
    tenCacMuc: string[],
    idsDangChon: (string | null)[],
  ): T[] {
    const ketQuaLoc = tenCacMuc
      .map((ten) => nguon.find((m) => chuanHoaTen(m.ten) === chuanHoaTen(ten)))
      .filter((m): m is T => Boolean(m));
    for (const id of idsDangChon) {
      if (!id) continue;
      const dangChon = nguon.find((m) => m.id === id);
      if (dangChon && !ketQuaLoc.some((m) => m.id === dangChon.id)) ketQuaLoc.push(dangChon);
    }
    return ketQuaLoc;
  }

  const danhSachMauChinh = boMau ? locTheoTen(tatCaMau, boMau.chinh, [mauChinhId]) : [];
  const danhSachMauPhu = boMau ? locTheoTen(tatCaMau, boMau.phu, [mauPhuId]) : [];
  const danhSachPhuKienHienThi = trangPhucDangChon ? tatCaPhuKien : [];

  function timIdMauTheoTen(ten: string): string | null {
    return tatCaMau.find((m) => chuanHoaTen(m.ten) === chuanHoaTen(ten))?.id ?? null;
  }

  function mauThuocDanhSach(idMau: string | null, tenCacMau: string[]): boolean {
    if (!idMau) return false;
    const mau = tatCaMau.find((m) => m.id === idMau);
    if (!mau) return false;
    return tenCacMau.some((ten) => chuanHoaTen(ten) === chuanHoaTen(mau.ten));
  }

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
  }

  function boc<T>(setter: (giaTri: T) => void) {
    return (giaTri: T) => {
      setter(giaTri);
      datLaiKetQua();
    };
  }

  /**
   * Bấm 1 phụ kiện:
   * - đang chọn -> bỏ chọn;
   * - chưa chọn -> thêm vào; nếu nhóm của nó là "chỉ chọn 1" thì bỏ các món khác cùng nhóm;
   * - nón (Nón lá, Nón quai thao) và khăn đội đầu (Khăn đóng, Khăn mỏ quạ) không dùng cùng lúc:
   *   thêm món xung đột thì bị từ chối (giao diện cũng đã khoá ô đó).
   */
  function xuLyBatTatPhuKien(id: string) {
    const phuKien = tatCaPhuKien.find((p) => p.id === id);
    if (!phuKien) return;

    if (!phuKienIds.includes(id)) {
      const xungDot = timMonXungDot(
        phuKien.ten,
        cacPhuKienDangChon.map((p) => p.ten),
      );
      if (xungDot) return;
    }

    setPhuKienIds((truoc) => {
      if (truoc.includes(id)) return truoc.filter((x) => x !== id);

      const nhom = layNhomCuaPhuKien(phuKien.ten);
      let giuLai = truoc;
      if (nhom?.chiChonMot) {
        giuLai = truoc.filter((x) => {
          const pk = tatCaPhuKien.find((p) => p.id === x);
          return !pk || layNhomCuaPhuKien(pk.ten)?.ten !== nhom.ten;
        });
      }
      return [...giuLai, id];
    });
    datLaiKetQua();
  }

  /**
   * Đổi trang phục:
   * - màu cũ còn hợp lệ thì giữ, không thì đặt về màu mặc định;
   * - phụ kiện giữ nguyên (món ít phù hợp sẽ bị Lớp 1 cảnh báo).
   */
  function xuLyChonTrangPhuc(id: string) {
    setTrangPhucId(id);
    const trangPhucMoi = tatCaTrangPhuc.find((tp) => tp.id === id);

    const boMauMoi = layBoMau(trangPhucMoi?.ten);
    if (boMauMoi) {
      if (!mauThuocDanhSach(mauChinhId, boMauMoi.chinh)) {
        setMauChinhId(timIdMauTheoTen(boMauMoi.macDinhChinh));
      }
      if (!mauThuocDanhSach(mauPhuId, boMauMoi.phu)) {
        setMauPhuId(timIdMauTheoTen(boMauMoi.macDinhPhu));
      }
    }

    datLaiKetQua();
  }

  async function xuLyXemKetQua() {
    if (!trangPhucId || !mauChinhId || !mauPhuId) return;
    const idHienTai = ++idYeuCau.current;
    setDangKiemTra(true);
    setLoiKiemTra(null);
    setToHop(null);
    setLoiAnh(null);

    // Dịp dùng để sinh ảnh: người dùng chọn, hoặc dịp mặc định (Tết).
    const suKienDungChoAnh = suKienHieuLuc?.id ?? null;

    try {
      const res = await fetch('/api/kiem-tra-phoi-do', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Thẩm định văn hoá CHỈ dùng dịp do người dùng chọn (null nếu chưa chọn).
        body: JSON.stringify({
          trangPhucId,
          mauChinhId,
          mauPhuId,
          phuKienIds,
          suKienId,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Máy chủ trả về lỗi ${res.status}`);
      if (idHienTai !== idYeuCau.current) return;
      setKetQua(body.data);
      // Có kết quả thẩm định rồi thì hiện ngay, ảnh AI sinh tiếp phía sau (10–20 giây).
      // Phụ kiện là tuỳ chọn (không chọn = ảnh không kèm phụ kiện) nên luôn sinh ảnh khi có dịp.
      if (suKienDungChoAnh) void sinhAnhAI(false, idHienTai, suKienDungChoAnh);
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
        // Server dùng `phuKienIds` (toàn bộ phụ kiện) để tạo comboKey; `phuKienId` chỉ để tương thích.
        body: JSON.stringify({
          trangPhucId,
          mauChinhId,
          mauPhuId,
          phuKienId: phuKienDauTien?.id ?? null,
          phuKienIds,
          suKienId: suKienDung,
          sinhLai,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.chiTiet) console.error('[sinh ảnh AI] chi tiết lỗi từ server:', body.chiTiet);
        throw new Error(body.error ?? `Lỗi API (HTTP ${res.status})`);
      }
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

  /**
   * Lưu bộ phối và ảnh AI vào Lookbook cá nhân.
   * Việc duyệt tổ hợp trong database do admin thực hiện.
   * Lưu ý: trường `suKienNgauNhien` giữ tên cũ để tương thích Lookbook; nay nghĩa là "dịp do hệ thống chọn mặc định".
   */
  function xuLyDuyetAnh() {
    if (!toHop || !trangPhucId || !mauChinhId || !mauPhuId || !ketQua) {
      return;
    }

    setLoiAnh(null);

    try {
      saveLookbook({
        trangPhucId,
        suKienId: suKienHieuLuc?.id ?? null,
        suKienNgauNhien: dungDipMacDinh,
        mauChinhId,
        mauPhuId,
        phuKienId: phuKienDauTien?.id ?? null,
        phuKienIds,
        ketQuaKiemTra: ketQua,
        imageUrl: toHop.imageUrl,
        toHopId: toHop.id,
      });

      setDaLuu(true);
    } catch (error) {
      setLoiAnh(
        error instanceof Error ? error.message : 'Không thể lưu bộ phối vào Lookbook cá nhân.',
      );
    }
  }

  /**
   * Người dùng bấm "Không lưu": bỏ kết quả + ảnh AI vừa sinh và quay về mô hình 2D ban đầu
   * (giữ nguyên các lựa chọn trang phục/màu/phụ kiện để họ chỉnh tiếp).
   * Không cập nhật trạng thái duyệt trong database.
   */
  function xuLyKhongDuyetAnh() {
    datLaiKetQua();
  }

  function xuLySinhLaiAnh() {
    // Giữ nguyên dịp đã dùng (kể cả dịp mặc định) để "Sinh ảnh khác" chỉ đổi ảnh, không đổi dịp.
    if (suKienHieuLuc) void sinhAnhAI(true, ++idYeuCau.current, suKienHieuLuc.id);
  }

  function xuLyLuu() {
    if (!trangPhucId || !mauChinhId || !mauPhuId || !ketQua) return;
    saveLookbook({
      trangPhucId,
      suKienId: suKienHieuLuc?.id ?? null,
      suKienNgauNhien: dungDipMacDinh,
      mauChinhId,
      mauPhuId,
      phuKienId: phuKienDauTien?.id ?? null,
      phuKienIds,
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
      cacPhuKien: cacPhuKienDangChon,
    });
    if (!noiDung) return;
    const thanhCong = await saoChepChiaSe(noiDung);
    setDaSaoChep(thanhCong);
  }

  return (
    // Trên màn hình lớn: cả trang cao đúng bằng cửa sổ trình duyệt (h-dvh), không cuộn cả trang.
    <main className="max-w-6xl mx-auto w-full px-4 py-4 pb-20 lg:pb-4 flex flex-col lg:h-dvh">
      <h1 className="font-display text-xl lg:text-2xl font-semibold mb-3 shrink-0">Thử nghiệm phối đồ</h1>

      <TienTrinhPhoiDo
        daChonTrangPhuc={Boolean(trangPhucId)}
        daChonMau={daChonDuDeXem}
        daCoKetQua={Boolean(ketQua)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px] lg:grid-rows-[minmax(0,1fr)] gap-6 lg:flex-1 lg:min-h-0">
        {/* Cột trái: Chọn trang phục & bối cảnh */}
        <aside className="order-1 lg:order-0 space-y-8 lg:min-h-0 lg:overflow-y-auto p-1">
          <ChonTrangPhuc
            danhSachTrangPhuc={danhMuc.trangPhuc}
            danhSachSuKien={danhMuc.suKien}
            trangPhucDangChon={trangPhucId}
            suKienDangChon={suKienId}
            onChonTrangPhuc={xuLyChonTrangPhuc}
            onChonSuKien={boc(setSuKienId)}
            phanGioiThieu={
              trangPhucDangChon ? (
                <GioiThieuVanHoa
                  key={trangPhucDangChon.id}
                  trangPhucId={trangPhucDangChon.id}
                  tenTrangPhuc={trangPhucDangChon.ten}
                  vungMien={trangPhucDangChon.vungMien}
                />
              ) : null
            }
          />
        </aside>

        {/* Cột giữa: Khu xem trước (co giãn theo khung) + nút thẩm định luôn nằm cuối */}
        <section className="order-3 lg:order-0 bg-paper-raised rounded-md flex flex-col lg:min-h-0 lg:overflow-y-auto">
          {/* Có ảnh AI rồi thì xoá phần hình minh hoạ phác thảo ở trên */}
          {!coAnhAI && (
            <>
              <div className="relative flex-1 min-h-105 lg:min-h-75">
                <XemTruoc
                  trangPhuc={trangPhucDangChon}
                  mauChinh={mauChinhDangChon}
                  mauPhu={mauPhuDangChon}
                  cacPhuKien={cacPhuKienDangChon}
                />
              </div>

              {trangPhucDangChon && (
                <div className="shrink-0 flex flex-wrap items-center justify-center gap-1.5 px-4 pb-3 text-xs">
                  <span className="rounded-full bg-ink px-2.5 py-1 font-medium text-paper">
                    {trangPhucDangChon.ten}
                  </span>
                  {[mauChinhDangChon, mauPhuDangChon].map(
                    (m) =>
                      m && (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-ink-soft/20 px-2.5 py-1"
                        >
                          <span
                            className="h-3 w-3 rounded-full border border-ink-soft/20"
                            style={{ backgroundColor: m.maHex }}
                          />
                          {m.ten}
                        </span>
                      ),
                  )}
                  {cacPhuKienDangChon.map((p) => (
                    <span key={p.id} className="rounded-full border border-ink-soft/20 px-2.5 py-1">
                      {p.ten}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {!daChonDuDeXem && trangPhucId && (
            <p className="p-4 border-t border-ink-soft/15 text-sm text-ink-soft text-center shrink-0">
              Chọn thêm màu chính và màu phụ để xem kết quả phối đồ.
            </p>
          )}

          {daChonDuDeXem && !ketQua && (
            <div className="p-4 border-t border-ink-soft/15 shrink-0">
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
            <div ref={khuKetQuaRef} className="scroll-mt-16">
              <KetQuaPhoiDo
                ketQua={ketQua}
                chuaChonDip={!suKienId}
                cacPhuKien={cacPhuKienDangChon}
                daLuu={daLuu}
                daSaoChep={daSaoChep}
                onLuu={xuLyLuu}
                onChiaSe={xuLyChiaSe}
                anhAI={{
                  thieuThongTin: !suKienHieuLuc,
                  tenSuKien: suKienHieuLuc?.ten ?? null,
                  suKienMacDinh: dungDipMacDinh,
                  tenPhuKien:
                    cacPhuKienDangChon.length > 0
                      ? cacPhuKienDangChon.map((p) => p.ten).join(', ')
                      : null,
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
            </div>
          )}
        </section>

        {/* Cột phải: Tùy chỉnh màu sắc & phụ kiện */}
        <aside className="order-2 lg:order-0 space-y-6 lg:min-h-0 lg:overflow-y-auto p-1">
          <BangMau
            danhSachMauChinh={danhSachMauChinh}
            danhSachMauPhu={danhSachMauPhu}
            mauChinhDangChon={mauChinhId}
            mauPhuDangChon={mauPhuId}
            daChonTrangPhuc={Boolean(trangPhucDangChon)}
            onChonMauChinh={boc(setMauChinhId)}
            onChonMauPhu={boc(setMauPhuId)}
          />
          <ChonPhuKien
            danhSachPhuKien={danhSachPhuKienHienThi}
            tenPhuKienPhuHop={tenPhuKienChoPhep ?? []}
            tenTrangPhuc={trangPhucDangChon?.ten ?? null}
            trangPhucId={trangPhucId}
            suKienId={suKienId}
            phuKienDangChon={phuKienIds}
            daChonTrangPhuc={Boolean(trangPhucDangChon)}
            onBatTatPhuKien={xuLyBatTatPhuKien}
          />
        </aside>
      </div>

      {/* Điện thoại: nút hành động luôn thấy được, không phải cuộn xuống tìm */}
      {trangPhucId && !ketQua && (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 border-t border-ink-soft/15 bg-paper/95 px-4 py-2 backdrop-blur lg:hidden">
          {loiKiemTra && <p className="mb-1 text-xs text-lacquer">{loiKiemTra}</p>}
          {daChonDuDeXem ? (
            <button
              onClick={xuLyXemKetQua}
              disabled={dangKiemTra}
              className="w-full rounded-md bg-lacquer py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {dangKiemTra ? 'Đang thẩm định...' : 'Xem kết quả phối đồ'}
            </button>
          ) : (
            <p className="text-center text-sm text-ink-soft">Chọn màu chính và màu phụ để tiếp tục</p>
          )}
        </div>
      )}
    </main>
  );
}