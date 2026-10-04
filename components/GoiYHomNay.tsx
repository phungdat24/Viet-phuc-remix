'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import { goiYTheoThoiTiet, moTaThoiTiet, type ThoiTiet } from '@/lib/goiYThoiTiet';
import { chuanHoaTen } from '@/lib/mauTheoTrangPhuc';

const THANH_PHO = [
  { ma: 'ha-noi', ten: 'Hà Nội', lat: 21.03, lon: 105.85 },
  { ma: 'hue', ten: 'Huế', lat: 16.46, lon: 107.59 },
  { ma: 'da-nang', ten: 'Đà Nẵng', lat: 16.05, lon: 108.2 },
  { ma: 'tp-hcm', ten: 'TP. Hồ Chí Minh', lat: 10.78, lon: 106.7 },
  { ma: 'can-tho', ten: 'Cần Thơ', lat: 10.03, lon: 105.78 },
];

const CHU_KY_CAP_NHAT_MS = 10 * 60 * 1000;

function timTheoTen<T extends { ten: string }>(danhSach: T[], ten: string): T | undefined {
  return danhSach.find((x) => chuanHoaTen(x.ten) === chuanHoaTen(ten));
}

export default function GoiYHomNay() {
  const { danhMuc } = useDanhMuc();

  const [maThanhPho, setMaThanhPho] = useState('ha-noi');
  const [viTriMay, setViTriMay] = useState<{ lat: number; lon: number } | null>(null);
  const [loiViTri, setLoiViTri] = useState<string | null>(null);

  const [thoiTiet, setThoiTiet] = useState<ThoiTiet | null>(null);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const thanhPho = THANH_PHO.find((t) => t.ma === maThanhPho) ?? THANH_PHO[0];
  const diem = maThanhPho === 'vi-tri' && viTriMay ? viTriMay : thanhPho;
  const { lat, lon } = diem;

  // Lấy thời tiết khi đổi địa điểm, rồi tự cập nhật mỗi 10 phút.
  useEffect(() => {
    let huy = false;

    async function tai(hienDangTai: boolean) {
      if (hienDangTai) setDangTai(true);
      try {
        const res = await fetch(`/api/thoi-tiet?lat=${lat}&lon=${lon}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? `Lỗi ${res.status}`);
        if (!huy) {
          setThoiTiet(body.data);
          setLoi(null);
        }
      } catch (err) {
        if (!huy) setLoi(err instanceof Error ? err.message : 'Không lấy được thời tiết.');
      } finally {
        if (!huy) setDangTai(false);
      }
    }

    void tai(true);
    const hen = setInterval(() => void tai(false), CHU_KY_CAP_NHAT_MS);
    return () => {
      huy = true;
      clearInterval(hen);
    };
  }, [lat, lon]);

  function dungViTriCuaToi() {
    if (!navigator.geolocation) {
      setLoiViTri('Trình duyệt không hỗ trợ định vị.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setViTriMay({ lat: p.coords.latitude, lon: p.coords.longitude });
        setMaThanhPho('vi-tri');
        setLoiViTri(null);
      },
      () => setLoiViTri('Không lấy được vị trí. Hãy cho phép truy cập vị trí hoặc chọn một thành phố.'),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }

  const goiY = thoiTiet ? goiYTheoThoiTiet(thoiTiet) : null;

  // Tra danh mục để điền sẵn lựa chọn khi sang trang phối đồ (nếu DB lỗi thì chỉ mở trang trống).
  const trangPhuc = goiY && danhMuc ? timTheoTen(danhMuc.trangPhuc, goiY.tenTrangPhuc) : undefined;
  const mauChinh = goiY && danhMuc ? timTheoTen(danhMuc.mauSac, goiY.tenMauChinh) : undefined;
  const mauPhu = goiY && danhMuc ? timTheoTen(danhMuc.mauSac, goiY.tenMauPhu) : undefined;
  const cacPhuKien =
    goiY && danhMuc
      ? goiY.tenCacPhuKien
          .map((ten) => timTheoTen(danhMuc.phuKien, ten))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
      : [];

  let href = '/phoi-do';
  if (trangPhuc && mauChinh && mauPhu) {
    const thamSo = new URLSearchParams({
      trangPhucId: trangPhuc.id,
      mauChinhId: mauChinh.id,
      mauPhuId: mauPhu.id,
    });
    if (cacPhuKien.length > 0) thamSo.set('phuKienIds', cacPhuKien.map((p) => p.id).join(','));
    href = `/phoi-do?${thamSo.toString()}`;
  }

  const gioCapNhat = thoiTiet?.thoiGian.split('T')[1] ?? null;

  return (
    <section className="mt-6 bg-paper-raised rounded-md border-l-4 border-gold p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">Gợi ý hôm nay theo thời tiết</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="chon-thanh-pho">
            Chọn địa điểm
          </label>
          <select
            id="chon-thanh-pho"
            value={maThanhPho}
            onChange={(e) => setMaThanhPho(e.target.value)}
            className="rounded-md border border-ink-soft/30 bg-paper px-2 py-1 text-sm"
          >
            {THANH_PHO.map((t) => (
              <option key={t.ma} value={t.ma}>
                {t.ten}
              </option>
            ))}
            {viTriMay && <option value="vi-tri">Vị trí của tôi</option>}
          </select>
          <button
            type="button"
            onClick={dungViTriCuaToi}
            className="rounded-md border border-ink-soft/30 px-2 py-1 text-sm hover:border-gold transition"
          >
            Dùng vị trí của tôi
          </button>
        </div>
      </div>
      {loiViTri && <p className="mt-2 text-xs text-lacquer">{loiViTri}</p>}

      {dangTai && !thoiTiet && <p className="mt-4 text-sm text-ink-soft">Đang lấy thời tiết...</p>}

      {loi && !thoiTiet && (
        <div className="mt-4">
          <p className="text-sm text-lacquer">{loi}</p>
          <Link href="/phoi-do" className="mt-2 inline-block text-sm text-lacquer font-medium hover:opacity-80">
            Vẫn có thể tự phối đồ →
          </Link>
        </div>
      )}

      {thoiTiet && goiY && (
        <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr] md:items-start">
          {/* Thời tiết hiện tại */}
          <div className="md:pr-6 md:border-r md:border-ink-soft/15">
            <p className="font-display text-4xl font-semibold text-ink">{Math.round(thoiTiet.nhietDo)}°C</p>
            <p className="text-sm text-ink">{moTaThoiTiet(thoiTiet.maThoiTiet)}</p>
            <p className="mt-1 text-xs text-ink-soft">
              Cảm giác {Math.round(thoiTiet.camGiac)}°C · Độ ẩm {Math.round(thoiTiet.doAm)}% · Gió{' '}
              {Math.round(thoiTiet.tocDoGio)} km/h
            </p>
            {gioCapNhat && <p className="mt-1 text-xs text-ink-soft">Cập nhật lúc {gioCapNhat}</p>}
          </div>

          {/* Đề xuất trang phục */}
          <div>
            <p className="text-sm text-ink-soft">{goiY.tieuDe}, thử phối</p>
            <p className="font-display text-xl font-semibold text-ink">{goiY.tenTrangPhuc}</p>
            <p className="mt-1 text-sm text-ink-soft">{goiY.lyDo}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {[
                { mau: mauChinh, ten: goiY.tenMauChinh },
                { mau: mauPhu, ten: goiY.tenMauPhu },
              ].map(({ mau, ten }) => (
                <span
                  key={ten}
                  className="inline-flex items-center gap-1.5 rounded-full border border-ink-soft/20 px-2 py-1"
                >
                  {mau && (
                    <span
                      className="h-3 w-3 rounded-full border border-ink-soft/20"
                      style={{ backgroundColor: mau.maHex }}
                    />
                  )}
                  {ten}
                </span>
              ))}
              {goiY.tenCacPhuKien.map((ten) => (
                <span key={ten} className="rounded-full border border-ink-soft/20 px-2 py-1">
                  {ten}
                </span>
              ))}
            </div>

            <Link
              href={href}
              className="mt-4 inline-block bg-lacquer text-white text-sm font-medium px-4 py-2 rounded-md hover:opacity-90 transition"
            >
              Phối thử bộ này
            </Link>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11px] text-ink-soft">
        Dữ liệu thời tiết:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="underline">
          Open-Meteo.com
        </a>
      </p>
    </section>
  );
}