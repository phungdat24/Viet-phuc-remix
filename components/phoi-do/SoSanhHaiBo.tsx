'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import XemTruoc from './XemTruoc';
import GhiChuAnhAI from './GhiChuAnhAI';
import { GIAO_DIEN_MUC_DO } from './CanhBaoVanHoa';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import { useNganSoSanh } from '@/hooks/useNganSoSanh';
import { useQuyTacVanHoa } from '@/hooks/useQuyTacVanHoa';
import { mucVanHoaDeHienThi, timMonThayThe } from '@/lib/canhBaoVanHoa';
import { chuanHoaTen } from '@/lib/mauTheoTrangPhuc';
import { timMonXungDot } from '@/lib/phuKienTheoTrangPhuc';
import { saveLookbook } from '@/lib/localLookbook';
import { saoChepChiaSe } from '@/lib/chiaSe';
import {
  NHAN_MUC_MAU,
  TEN_DIP_MAC_DINH,
  datNgan,
  docSoSanhTuUrl,
  khoaBo,
  taoLinkSoSanh,
  taoNoiDungChiaSeSoSanh,
  taoTomTat,
  tinhKhacBiet,
  type BoDaGiai,
  type BoSoSanh,
} from '@/lib/soSanh';
import type { KetQuaKiemTra, PhuKien, QuyTacVanHoa } from '@/types/phoi-do';

interface AnhAI {
  id: string;
  imageUrl: string;
}

/** Trạng thái tải của một bộ: kết quả thẩm định + ảnh AI đã có sẵn (nếu có). */
interface TrangThaiBo {
  dang: boolean;
  loi: string | null;
  ketQua: KetQuaKiemTra | null;
  anh: AnhAI | null;
}

const NHAN_SLOT = ['Bộ A', 'Bộ B'];

async function taiMotBo(
  bo: BoSoSanh,
  suKienId: string | null,
  suKienAnhId: string | null,
): Promise<Omit<TrangThaiBo, 'dang'>> {
  const thamDinh = fetch('/api/kiem-tra-phoi-do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Thẩm định văn hoá CHỈ dùng dịp người dùng chọn (null nếu chưa chọn), giống trang phối đồ.
    body: JSON.stringify({
      trangPhucId: bo.trangPhucId,
      mauChinhId: bo.mauChinhId,
      mauPhuId: bo.mauPhuId,
      phuKienIds: bo.phuKienIds,
      suKienId,
    }),
  }).then(async (res) => {
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? `Máy chủ trả về lỗi ${res.status}`);
    return body.data as KetQuaKiemTra;
  });

  // Chỉ tra cứu ảnh đã có, không bao giờ sinh ảnh mới ở trang này.
  const anh: Promise<AnhAI | null> = suKienAnhId
    ? fetch(
        `/api/to-hop-duoc-duyet/tra-cuu?${new URLSearchParams({
          trangPhucId: bo.trangPhucId,
          mauChinhId: bo.mauChinhId,
          mauPhuId: bo.mauPhuId,
          suKienId: suKienAnhId,
          phuKienIds: bo.phuKienIds.join(','),
        })}`,
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => (json?.data as AnhAI | null) ?? null)
        .catch(() => null)
    : Promise.resolve(null);

  const [kq, a] = await Promise.allSettled([thamDinh, anh]);
  return {
    ketQua: kq.status === 'fulfilled' ? kq.value : null,
    loi:
      kq.status === 'rejected'
        ? kq.reason instanceof Error
          ? kq.reason.message
          : 'Không thể thẩm định lúc này'
        : null,
    anh: a.status === 'fulfilled' ? a.value : null,
  };
}

function NhanKhac({ khac }: { khac: boolean }) {
  return khac ? (
    <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-ink">Khác</span>
  ) : (
    <span className="text-xs text-ink-soft">Giống nhau</span>
  );
}

/** Một dòng so sánh: nhãn + ô Bộ A + ô Bộ B. Dòng khác nhau được tô nền; dòng giống nhau mờ đi. */
function Dong({ nhan, khac, a, b }: { nhan: string; khac: boolean; a: ReactNode; b: ReactNode }) {
  return (
    <div
      className={`rounded-lg p-3 text-sm md:grid md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] md:gap-4 ${
        khac ? 'bg-gold/15 text-ink' : 'text-ink-soft'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2 md:mb-0 md:block md:space-y-1">
        <p className="font-semibold text-ink">{nhan}</p>
        <NhanKhac khac={khac} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:contents">
        <div className="min-w-0">
          <p className="mb-0.5 text-[11px] font-semibold text-ink-soft md:hidden">BỘ A</p>
          {a}
        </div>
        <div className="min-w-0">
          <p className="mb-0.5 text-[11px] font-semibold text-ink-soft md:hidden">BỘ B</p>
          {b}
        </div>
      </div>
    </div>
  );
}

export default function SoSanhHaiBo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { danhMuc, loi, dangTai } = useDanhMuc();
  const { cacBo, daDoc, thay, xoa, xoaHet } = useNganSoSanh();

  // undefined = chưa khởi tạo; null = chưa chọn dịp. Một dịp chung cho cả hai bộ.
  const [suKienChung, setSuKienChung] = useState<string | null | undefined>(undefined);
  const [trangThai, setTrangThai] = useState<Record<string, TrangThaiBo>>({});
  // null = tự động (có đủ ảnh AI của cả hai bộ thì hiện ảnh AI, không thì hiện 2D).
  const [cheDo, setCheDo] = useState<'2d' | 'ai' | null>(null);
  // URL ảnh đã tải lỗi (file không còn trên kho lưu trữ) -> coi như chưa có ảnh.
  const [anhLoi, setAnhLoi] = useState<string[]>([]);
  const [daLuu, setDaLuu] = useState<string[]>([]);
  const [daSaoChep, setDaSaoChep] = useState(false);
  const [daChepLinkSoSanh, setDaChepLinkSoSanh] = useState(false);
  // Thông báo: vừa mở link được chia sẻ / vừa gỡ bộ không còn hợp lệ.
  const [thongBaoNhap, setThongBaoNhap] = useState<string | null>(null);
  const [thongBaoGo, setThongBaoGo] = useState<string | null>(null);
  // Chỉ đọc link chia sẻ MỘT lần; nếu đã đặt dịp từ link thì bỏ qua bước lấy dịp từ ngăn cũ.
  const daNhapUrl = useRef(false);
  const daDatDipTuUrl = useRef(false);

  // Quy tắc văn hoá của từng bộ (để gợi ý món thay thế). Luôn gọi đủ 2 hook, trước mọi return sớm.
  const { quyTac: quyTacA } = useQuyTacVanHoa(cacBo[0]?.trangPhucId ?? null);
  const { quyTac: quyTacB } = useQuyTacVanHoa(cacBo[1]?.trangPhucId ?? null);

  // (1) Mở link so sánh được chia sẻ: thay ngăn bằng các bộ trong link rồi xoá tham số khỏi URL
  // (để F5 hoặc chỉnh sửa sau đó không bị link ghi đè lại). PHẢI khai báo trước effect khởi tạo dịp.
  useEffect(() => {
    if (!daDoc || daNhapUrl.current) return;
    daNhapUrl.current = true;
    const tuUrl = docSoSanhTuUrl(searchParams);
    if (!tuUrl) return;
    const coNganCu = cacBo.length > 0;
    datNgan(tuUrl.cacBo);
    daDatDipTuUrl.current = true;
    setSuKienChung(tuUrl.suKienId);
    setThongBaoNhap(
      coNganCu
        ? 'Đã mở bộ so sánh được chia sẻ. Ngăn so sánh trước đó của bạn đã được thay bằng các bộ này.'
        : 'Đã mở bộ so sánh được chia sẻ.',
    );
    router.replace('/phoi-do/so-sanh', { scroll: false });
  }, [daDoc, searchParams, cacBo, router]);

  // (2) Dịp chung ban đầu = dịp của bộ đầu tiên có chọn dịp.
  useEffect(() => {
    if (!daDoc || suKienChung !== undefined || daDatDipTuUrl.current) return;
    setSuKienChung(cacBo.find((b) => b.suKienId)?.suKienId ?? null);
  }, [daDoc, cacBo, suKienChung]);

  // (3) Gỡ bộ có lựa chọn không còn trong danh mục (thường do seed lại database hoặc link từ bản khác).
  useEffect(() => {
    if (!danhMuc || !daDoc) return;
    const co = (ds: { id: string }[], id: string) => ds.some((x) => x.id === id);
    const hong = cacBo.filter(
      (bo) =>
        !co(danhMuc.trangPhuc, bo.trangPhucId) ||
        !co(danhMuc.mauSac, bo.mauChinhId) ||
        !co(danhMuc.mauSac, bo.mauPhuId) ||
        bo.phuKienIds.some((id) => !co(danhMuc.phuKien, id)),
    );
    if (hong.length === 0) return;
    hong.forEach((bo) => xoa(bo.id));
    setThongBaoGo(
      `Đã gỡ ${hong.length} bộ khỏi ngăn so sánh vì có lựa chọn không còn trong hệ thống (có thể do dữ liệu đã được cập nhật hoặc link từ bản khác). Hãy phối lại và thêm vào so sánh.`,
    );
  }, [danhMuc, daDoc, cacBo, xoa]);

  // Dịp dùng để tra ảnh AI: dịp đã chọn, hoặc dịp mặc định (Tết) như trang phối đồ.
  const dipMacDinhId =
    danhMuc?.suKien.find((sk) => chuanHoaTen(sk.ten) === chuanHoaTen(TEN_DIP_MAC_DINH))?.id ??
    danhMuc?.suKien[0]?.id ??
    null;
  const suKienAnhId = suKienChung ?? dipMacDinhId;

  // Tải lại khi đổi nội dung các bộ hoặc đổi dịp (không tải lại khi chỉ đổi thứ tự phụ kiện).
  const chuKyTai = `${cacBo.map((b) => `${b.id}:${khoaBo(b)}`).join('|')}@${suKienChung ?? ''}@${suKienAnhId ?? ''}`;
  useEffect(() => {
    if (suKienChung === undefined || !danhMuc || cacBo.length === 0) return;
    let huy = false;
    for (const bo of cacBo) {
      setTrangThai((truoc) => ({
        ...truoc,
        [bo.id]: { ketQua: truoc[bo.id]?.ketQua ?? null, anh: null, loi: null, dang: true },
      }));
      void taiMotBo(bo, suKienChung, suKienAnhId).then((kq) => {
        if (!huy) setTrangThai((truoc) => ({ ...truoc, [bo.id]: { ...kq, dang: false } }));
      });
    }
    return () => {
      huy = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chuKyTai, danhMuc]);

  if (dangTai || !daDoc) return <p className="py-12 text-center text-ink-soft">Đang tải dữ liệu...</p>;
  if (loi || !danhMuc) return <p className="py-12 text-center text-lacquer">Đã xảy ra lỗi: {loi}</p>;

  const tatCaPhuKien = danhMuc.phuKien;
  const quyTacTheoBo: (QuyTacVanHoa[] | null)[] = [quyTacA, quyTacB];
  const suKienDangDung = suKienChung ? (danhMuc.suKien.find((s) => s.id === suKienChung) ?? null) : null;
  const tenDipAnh = danhMuc.suKien.find((s) => s.id === suKienAnhId)?.ten ?? TEN_DIP_MAC_DINH;

  const boDaGiai: BoDaGiai[] = cacBo.map((bo) => ({
    bo,
    trangPhuc: danhMuc.trangPhuc.find((t) => t.id === bo.trangPhucId) ?? null,
    mauChinh: danhMuc.mauSac.find((m) => m.id === bo.mauChinhId) ?? null,
    mauPhu: danhMuc.mauSac.find((m) => m.id === bo.mauPhuId) ?? null,
    cacPhuKien: bo.phuKienIds
      .map((id) => tatCaPhuKien.find((p) => p.id === id))
      .filter((p): p is PhuKien => Boolean(p)),
    ketQua: trangThai[bo.id]?.ketQua ?? null,
  }));

  const [a, b] = boDaGiai;
  const coHaiBo = boDaGiai.length === 2;
  const ttBo = (x: BoDaGiai): TrangThaiBo =>
    trangThai[x.bo.id] ?? { dang: true, loi: null, ketQua: null, anh: null };
  // Ảnh AI dùng được = đã tra thấy và chưa bị lỗi tải.
  const anhDung = (x: BoDaGiai): AnhAI | null => {
    const anh = ttBo(x).anh;
    return anh && !anhLoi.includes(anh.imageUrl) ? anh : null;
  };
  const coKetQuaCaHai = coHaiBo && Boolean(a.ketQua && b.ketQua);
  const khac = coHaiBo ? tinhKhacBiet(a, b) : null;
  const tomTat = coKetQuaCaHai && khac ? taoTomTat(a, b, khac) : null;

  // Chỉ so sánh ảnh AI khi CẢ HAI bộ đã có ảnh sẵn; nếu không thì dùng xem trước 2D.
  const coAnhCaHai = coHaiBo && Boolean(anhDung(a) && anhDung(b));
  const cheDoDangDung: '2d' | 'ai' = coAnhCaHai ? (cheDo ?? 'ai') : '2d';
  // Bộ nào chưa có ảnh (chỉ báo khi đã tra xong, tránh nháy thông báo lúc đang tải).
  const dangTraAnh = coHaiBo && boDaGiai.some((x) => ttBo(x).dang);
  const boThieuAnh =
    coHaiBo && !dangTraAnh
      ? boDaGiai.map((x, i) => ({ x, i })).filter(({ x }) => !anhDung(x))
      : [];

  function duongDanSua(bo: BoSoSanh): string {
    const p = new URLSearchParams({
      trangPhucId: bo.trangPhucId,
      mauChinhId: bo.mauChinhId,
      mauPhuId: bo.mauPhuId,
    });
    if (bo.phuKienIds.length > 0) p.set('phuKienIds', bo.phuKienIds.join(','));
    if (suKienChung) p.set('suKienId', suKienChung);
    // Để trang phối đồ biết đang sửa bộ nào trong ngăn: bấm "Cập nhật" là ghi đè đúng bộ này.
    p.set('suaBoId', bo.id);
    return `/phoi-do?${p.toString()}`;
  }

  /** Món cần chú ý của một bộ + món thay thế hợp lý (cùng nhóm, được đánh giá "Phù hợp", không xung đột). */
  function goiYThayThe(x: BoDaGiai, chiSo: number) {
    const quyTac = quyTacTheoBo[chiSo];
    if (!quyTac || !x.ketQua) return [];
    const ketQuaGoiY: { cu: PhuKien; moi: PhuKien[] }[] = [];
    for (const c of x.ketQua.phuHopVanHoa.chiTietPhuKien ?? []) {
      if (c.mucDo !== 'khong_phu_hop' && c.mucDo !== 'tuy_dip') continue;
      const cu = tatCaPhuKien.find((p) => p.id === c.phuKien.id);
      if (!cu) continue;
      const tenConLai = x.cacPhuKien.filter((p) => p.id !== cu.id).map((p) => p.ten);
      const moi = timMonThayThe(quyTac, cu, tatCaPhuKien, suKienChung ?? null)
        .filter((t) => !x.bo.phuKienIds.includes(t.id) && timMonXungDot(t.ten, tenConLai) === null)
        .slice(0, 2);
      if (moi.length > 0) ketQuaGoiY.push({ cu, moi });
      if (ketQuaGoiY.length >= 2) break;
    }
    return ketQuaGoiY;
  }

  function thayMon(bo: BoSoSanh, cuId: string, moiId: string) {
    // Món thay cùng nhóm "chọn 1" nên thay đúng vị trí là đủ.
    thay(bo.id, { phuKienIds: bo.phuKienIds.map((id) => (id === cuId ? moiId : id)) });
    setDaLuu((truoc) => truoc.filter((id) => id !== bo.id));
  }

  function luuVaoLookbook(x: BoDaGiai) {
    if (!x.ketQua) return;
    const anh = anhDung(x);
    saveLookbook({
      trangPhucId: x.bo.trangPhucId,
      suKienId: suKienChung ?? dipMacDinhId,
      suKienNgauNhien: suKienChung === null,
      mauChinhId: x.bo.mauChinhId,
      mauPhuId: x.bo.mauPhuId,
      phuKienId: x.bo.phuKienIds[0] ?? null,
      phuKienIds: x.bo.phuKienIds,
      ketQuaKiemTra: x.ketQua,
      ...(anh ? { imageUrl: anh.imageUrl, toHopId: anh.id } : {}),
    });
    setDaLuu((truoc) => [...truoc, x.bo.id]);
  }

  async function chiaSe() {
    if (!coHaiBo) return;
    const link = taoLinkSoSanh(cacBo, suKienChung ?? null);
    const noiDung = taoNoiDungChiaSeSoSanh(a, b, suKienDangDung, tomTat ?? '', link || undefined);
    if (!noiDung) return;
    setDaSaoChep(await saoChepChiaSe(noiDung));
  }

  async function chepLinkSoSanh() {
    const link = taoLinkSoSanh(cacBo, suKienChung ?? null);
    if (!link) return;
    const thanhCong = await saoChepChiaSe(link);
    setDaChepLinkSoSanh(thanhCong);
    if (thanhCong) setTimeout(() => setDaChepLinkSoSanh(false), 2000);
  }

  // ---------- Các ô nội dung ----------
  const oMau = (x: BoDaGiai) => (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {[x.mauChinh, x.mauPhu].map(
        (m, i) =>
          m && (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span
                className="h-4 w-4 rounded-full border border-ink-soft/20"
                style={{ backgroundColor: m.maHex }}
                aria-hidden
              />
              {m.ten}
            </span>
          ),
      )}
    </p>
  );

  const oDangTai = (x: BoDaGiai): ReactNode | null => {
    const tt = ttBo(x);
    if (x.ketQua) return null;
    if (tt.loi) return <p className="text-lacquer">{tt.loi}</p>;
    return <p className="text-ink-soft">Đang thẩm định...</p>;
  };

  const oHaiHoaMau = (x: BoDaGiai) =>
    oDangTai(x) ?? (
      <>
        <p className="font-semibold">{NHAN_MUC_MAU[x.ketQua!.haiHoaMau.mucDo] ?? x.ketQua!.haiHoaMau.mucDo}</p>
        <p className="mt-0.5 text-xs">
          {x.ketQua!.haiHoaMau.lyDo ? (
            <>
              <span className="font-medium">Giải thích: </span>
              {x.ketQua!.haiHoaMau.lyDo}
            </>
          ) : (
            x.ketQua!.haiHoaMau.goiY
          )}
        </p>
      </>
    );

  const oPhuKien = (x: BoDaGiai) =>
    x.cacPhuKien.length === 0 ? (
      <p>Không dùng phụ kiện</p>
    ) : (
      <ul className="space-y-0.5">
        {x.cacPhuKien.map((p) => (
          <li key={p.id}>
            {p.ten}
            {p.vungMien && <span className="text-xs text-ink-soft"> · {p.vungMien}</span>}
          </li>
        ))}
      </ul>
    );

  const oVanHoa = (x: BoDaGiai, chiSo: number) => {
    const cho = oDangTai(x);
    if (cho) return cho;
    const pv = x.ketQua!.phuHopVanHoa;
    const mucTong = mucVanHoaDeHienThi(pv);
    // Mọi món đều chưa có dữ liệu: không hiện nhãn "Chưa có dữ liệu", chỉ để dấu gạch.
    if (!mucTong) return <p className="text-ink-soft">—</p>;
    const gd = GIAO_DIEN_MUC_DO[mucTong];
    const monCanChuY = (pv.chiTietPhuKien ?? []).filter(
      (c) => c.mucDo === 'khong_phu_hop' || c.mucDo === 'tuy_dip',
    );
    const goiY = goiYThayThe(x, chiSo);
    return (
      <div className="space-y-2">
        <p className={`flex items-center gap-1.5 font-semibold ${gd.chu}`}>
          <span
            aria-hidden
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${gd.tron}`}
          >
            {gd.bieuTuong}
          </span>
          {gd.nhan}
        </p>
        {monCanChuY.map((c) => (
          <p key={c.phuKien.id} className="text-xs">
            <span className="font-medium">{c.phuKien.ten}: </span>
            {c.lyDo ?? 'Chưa có ghi chú cho món này.'}
          </p>
        ))}
        {pv.mucDo === 'khong_co_phu_kien' && <p className="text-xs">Chưa có phụ kiện để đối chiếu.</p>}
        {goiY.map(({ cu, moi }) => (
          <div key={cu.id} className="rounded-md bg-paper p-2 text-xs">
            <p>
              Gợi ý: thay <b className="font-semibold">{cu.ten}</b> bằng
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {moi.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => thayMon(x.bo, cu.id, t.id)}
                  className="min-h-11 rounded-md border border-lacquer px-3 font-semibold text-lacquer hover:bg-lacquer/5"
                >
                  {t.ten}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const theBo = (x: BoDaGiai, chiSo: number) => {
    const anh = anhDung(x);
    const hienAnh = cheDoDangDung === 'ai' && anh !== null;
    return (
      <div className="min-w-0 rounded-xl bg-paper-raised p-3 md:p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold md:text-xl">{NHAN_SLOT[chiSo]}</h2>
          <div className="flex items-center gap-1">
            <Link
              href={duongDanSua(x.bo)}
              className="flex min-h-11 items-center rounded-md border border-ink-soft/30 px-3 text-xs hover:border-gold md:text-sm"
            >
              Sửa bộ này
            </Link>
            <button
              type="button"
              onClick={() => xoa(x.bo.id)}
              aria-label={`Xoá ${NHAN_SLOT[chiSo]} khỏi so sánh`}
              className="flex h-11 w-11 items-center justify-center rounded-md text-ink-soft hover:text-lacquer"
            >
              ✕
            </button>
          </div>
        </div>
        {/* Ảnh AI là ảnh dọc toàn thân nên khung cao hơn khung xem trước 2D. */}
        <div
          className={`relative overflow-hidden rounded-md bg-paper ${hienAnh ? 'h-80 md:h-112' : 'h-60 md:h-72'}`}
        >
          {hienAnh && anh ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={anh.imageUrl}
              alt={`Ảnh AI ${NHAN_SLOT[chiSo]}`}
              onError={() => setAnhLoi((truoc) => [...truoc, anh.imageUrl])}
              className="h-full w-full object-contain"
            />
          ) : (
            <XemTruoc
              trangPhuc={x.trangPhuc}
              mauChinh={x.mauChinh}
              mauPhu={x.mauPhu}
              cacPhuKien={x.cacPhuKien}
            />
          )}
        </div>
        <p className="mt-2 text-center text-xs text-ink-soft md:text-sm">
          {x.trangPhuc?.ten} · {x.mauChinh?.ten} / {x.mauPhu?.ten}
        </p>
      </div>
    );
  };

  // ---------- Giao diện ----------
  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 pb-28 lg:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/phoi-do"
            className="flex min-h-11 items-center rounded-md border border-ink-soft/30 px-3 text-sm hover:border-gold"
          >
            ← <span className="ml-1 hidden sm:inline">Quay lại phối đồ</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold lg:text-3xl">So sánh 2 bộ</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-full border border-ink-soft/30 bg-paper-raised px-3 text-sm">
            <span>Dịp (cả hai bộ):</span>
            <select
              value={suKienChung ?? ''}
              onChange={(e) => setSuKienChung(e.target.value || null)}
              className="bg-transparent font-semibold focus:outline-none"
            >
              <option value="">Chưa chọn</option>
              {danhMuc.suKien.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.ten}
                </option>
              ))}
            </select>
          </label>
          <div className="flex overflow-hidden rounded-md border border-ink-soft/30 text-sm" role="group" aria-label="Kiểu xem">
            <button
              type="button"
              aria-pressed={cheDoDangDung === '2d'}
              onClick={() => setCheDo('2d')}
              className={`min-h-11 px-3 ${cheDoDangDung === '2d' ? 'bg-ink text-paper' : 'hover:bg-paper-raised'}`}
            >
              Xem trước 2D
            </button>
            <button
              type="button"
              aria-pressed={cheDoDangDung === 'ai'}
              disabled={!coAnhCaHai}
              onClick={() => setCheDo('ai')}
              title={coAnhCaHai ? undefined : 'Cần cả hai bộ đã có ảnh AI sẵn'}
              className={`min-h-11 px-3 disabled:cursor-not-allowed disabled:opacity-50 ${
                cheDoDangDung === 'ai' ? 'bg-ink text-paper' : 'hover:bg-paper-raised'
              }`}
            >
              Ảnh AI{coAnhCaHai ? '' : ' · chưa đủ'}
            </button>
          </div>
        </div>
      </div>

      {thongBaoNhap && (
        <p role="status" className="rounded-md bg-paper-raised p-2.5 text-xs text-ink-soft">
          <span aria-hidden>ⓘ </span>
          {thongBaoNhap}
        </p>
      )}
      {thongBaoGo && (
        <p role="status" className="rounded-md border border-lacquer/40 bg-lacquer/10 p-2.5 text-xs text-lacquer">
          {thongBaoGo}
        </p>
      )}

      {boDaGiai.length === 0 && (
        <div className="rounded-xl bg-paper-raised p-6 text-center">
          <p className="text-ink-soft">Ngăn so sánh đang trống.</p>
          <Link href="/phoi-do" className="mt-3 inline-block font-medium text-lacquer hover:underline">
            Quay lại phối đồ để thêm bộ đầu tiên →
          </Link>
        </div>
      )}

      {boDaGiai.length === 1 && (
        <>
          <p className="rounded-lg bg-paper-raised p-3 text-sm text-ink-soft">
            Mới có 1 bộ. Quay lại phối đồ, đổi một thứ (màu, phụ kiện...) rồi bấm “Thêm bộ này vào so sánh”.
          </p>
          <div className="max-w-md">{theBo(a, 0)}</div>
        </>
      )}

      {coHaiBo && (
        <>
          {suKienChung === null && (
            <p className="rounded-md bg-paper-raised p-2.5 text-xs text-ink-soft">
              <span aria-hidden>ⓘ </span>
              Bạn chưa chọn dịp nên nhận định văn hoá có độ tin cậy thấp hơn. Chọn dịp ở phía trên để chính xác hơn.
            </p>
          )}

          <div className="rounded-lg bg-paper-raised px-4 py-3">
            <p className="text-xs font-semibold tracking-wide text-ink-soft">KHÁC BIỆT CHÍNH</p>
            <p className="mt-1 text-sm md:text-base">{tomTat ?? 'Đang thẩm định hai bộ...'}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-[150px_minmax(0,1fr)_minmax(0,1fr)] md:gap-4">
            <div className="hidden md:block" />
            {theBo(a, 0)}
            {theBo(b, 1)}
          </div>

          {cheDoDangDung === 'ai' && <GhiChuAnhAI />}

          {boThieuAnh.length > 0 && (
            <div role="status" className="rounded-md bg-paper-raised p-3 text-xs text-ink-soft">
              <p>
                <span aria-hidden>ⓘ </span>
                Chưa so sánh được ảnh AI vì{' '}
                {boThieuAnh.map(({ i }) => NHAN_SLOT[i]).join(' và ')} chưa có ảnh sẵn cho dịp{' '}
                <b className="font-semibold">{tenDipAnh}</b> (hoặc ảnh không tải được). Trang này chỉ tra ảnh đã
                có, không sinh ảnh mới. Muốn có ảnh, mở bộ đó ở trang phối đồ rồi bấm “Xem kết quả phối đồ”.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {boThieuAnh.map(({ x, i }) => (
                  <Link
                    key={x.bo.id}
                    href={duongDanSua(x.bo)}
                    className="inline-flex min-h-11 items-center rounded-md border border-lacquer px-3 font-semibold text-lacquer hover:bg-lacquer/5"
                  >
                    Sinh ảnh {NHAN_SLOT[i]} ở trang phối đồ →
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {khac?.trangPhuc && (
              <Dong
                nhan="Trang phục"
                khac
                a={
                  <p>
                    {a.trangPhuc?.ten}
                    <span className="text-xs text-ink-soft"> · {a.trangPhuc?.vungMien}</span>
                  </p>
                }
                b={
                  <p>
                    {b.trangPhuc?.ten}
                    <span className="text-xs text-ink-soft"> · {b.trangPhuc?.vungMien}</span>
                  </p>
                }
              />
            )}
            <Dong nhan="Màu" khac={Boolean(khac?.mau)} a={oMau(a)} b={oMau(b)} />
            <Dong nhan="Hài hoà màu" khac={Boolean(khac?.haiHoaMau)} a={oHaiHoaMau(a)} b={oHaiHoaMau(b)} />
            <Dong nhan="Phụ kiện" khac={Boolean(khac?.phuKien)} a={oPhuKien(a)} b={oPhuKien(b)} />
            <Dong nhan="Chuẩn mực văn hoá" khac={Boolean(khac?.vanHoa)} a={oVanHoa(a, 0)} b={oVanHoa(b, 1)} />
            <Dong
              nhan="Dịp"
              khac={false}
              a={<p>{suKienDangDung?.ten ?? 'Chưa chọn dịp'}</p>}
              b={<p>{suKienDangDung?.ten ?? 'Chưa chọn dịp'}</p>}
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={chiaSe}
              className="min-h-12 rounded-md border border-ink-soft/30 px-4 text-sm font-medium hover:border-gold"
            >
              {daSaoChep ? 'Đã sao chép ✓' : 'Chia sẻ so sánh'}
            </button>
            <button
              type="button"
              onClick={chepLinkSoSanh}
              className="min-h-12 rounded-md border border-ink-soft/30 px-4 text-sm font-medium hover:border-gold"
            >
              {daChepLinkSoSanh ? 'Đã chép link ✓' : 'Sao chép link so sánh'}
            </button>
            {boDaGiai.map((x, i) => {
              const daLuuBo = daLuu.includes(x.bo.id);
              return (
                <button
                  key={x.bo.id}
                  type="button"
                  disabled={!x.ketQua || daLuuBo}
                  onClick={() => luuVaoLookbook(x)}
                  className={`min-h-12 rounded-md px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                    i === 1 ? 'bg-lacquer text-white hover:opacity-90' : 'border border-lacquer text-lacquer hover:bg-lacquer/5'
                  }`}
                >
                  {daLuuBo ? `Đã lưu ${NHAN_SLOT[i]} ✓` : `Lưu ${NHAN_SLOT[i]} vào Lookbook`}
                </button>
              );
            })}
            <button
              type="button"
              onClick={xoaHet}
              className="min-h-12 px-3 text-sm text-ink-soft hover:text-lacquer"
            >
              Xoá cả hai
            </button>
          </div>
        </>
      )}
    </main>
  );
}