'use client';

import { useState } from 'react';
import type { MucDoVanHoa, PhuKien } from '@/types/phoi-do';
import { NHOM_PHU_KIEN, chuanHoaTenPhuKien } from '@/lib/phuKienTheoTrangPhuc';
import { layAnhPhuKien } from '@/lib/anhPhuKien';
import { useQuyTacVanHoa } from '@/hooks/useQuyTacVanHoa';
import { tinhMucDoMotMon, timMonThayThe } from '@/lib/canhBaoVanHoa';
import CanhBaoVanHoa, { type MucCanhBaoVanHoa } from './CanhBaoVanHoa';

interface Props {
  danhSachPhuKien: PhuKien[];
  /** Chỉ dùng dự phòng khi không tải được quy tắc từ máy chủ. */
  tenPhuKienPhuHop?: string[];
  tenTrangPhuc: string | null;
  trangPhucId: string | null;
  /** Dịp do NGƯỜI DÙNG chọn (không tính dịp ngẫu nhiên). */
  suKienId: string | null;
  phuKienDangChon: string[];
  daChonTrangPhuc: boolean;
  onBatTatPhuKien: (id: string) => void;
}

const TIEU_DE = 'font-display text-sm font-semibold text-ink-soft uppercase tracking-wide mb-3';

/** Khung ảnh vuông của một phụ kiện; chưa có ảnh hoặc ảnh lỗi thì hiện ký hiệu thay thế. */
function AnhPhuKien({ ten }: { ten: string }) {
  const [anhLoi, setAnhLoi] = useState(false);
  const duongDan = layAnhPhuKien(ten);

  return (
    <div className="aspect-square w-full overflow-hidden rounded bg-paper">
      {duongDan && !anhLoi ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={duongDan}
          alt=""
          width={256}
          height={256}
          loading="lazy"
          onError={() => setAnhLoi(true)}
          className="h-full w-full object-contain"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-full w-full items-center justify-center text-2xl text-ink-soft/40"
        >
          ✦
        </div>
      )}
    </div>
  );
}

export default function ChonPhuKien({
  danhSachPhuKien,
  tenPhuKienPhuHop = [],
  tenTrangPhuc,
  trangPhucId,
  suKienId,
  phuKienDangChon,
  daChonTrangPhuc,
  onBatTatPhuKien,
}: Props) {
  const { quyTac, loi: loiQuyTac } = useQuyTacVanHoa(trangPhucId);
  // Các thẻ cảnh báo người dùng đã bấm "Giữ lại" (khoá theo trang phục + phụ kiện).
  const [daAn, setDaAn] = useState<Set<string>>(new Set());
  const khoaAn = (id: string) => `${tenTrangPhuc ?? ''}|${id}`;

  function batTat(id: string) {
    setDaAn((truoc) => {
      if (!truoc.has(khoaAn(id))) return truoc;
      const moi = new Set(truoc);
      moi.delete(khoaAn(id));
      return moi;
    });
    onBatTatPhuKien(id);
  }

  function giuLai(id: string) {
    setDaAn((truoc) => new Set(truoc).add(khoaAn(id)));
  }

  if (!daChonTrangPhuc) {
    return (
      <div>
        <h3 className={TIEU_DE}>Phụ kiện</h3>
        <p className="text-sm text-ink-soft">Chọn trang phục trước để xem các phụ kiện.</p>
      </div>
    );
  }

  const tenPhuHop = new Set(tenPhuKienPhuHop.map(chuanHoaTenPhuKien));

  // Chỉ hiện thẻ khi người dùng ĐÃ CHỌN món cần lưu ý (nút phụ kiện không đánh dấu sẵn).
  const cacMucCanhBao: MucCanhBaoVanHoa[] = [];
  for (const p of danhSachPhuKien) {
    if (!phuKienDangChon.includes(p.id) || daAn.has(khoaAn(p.id))) continue;

    let mucDo: MucDoVanHoa;
    let lyDoGoc: string | null = null;
    let rieng = false;
    if (quyTac) {
      const kq = tinhMucDoMotMon(quyTac, p.id, suKienId);
      mucDo = kq.mucDo;
      lyDoGoc = kq.lyDo;
      rieng = kq.rieng;
    } else if (loiQuyTac) {
      mucDo = tenPhuHop.has(chuanHoaTenPhuKien(p.ten)) ? 'phu_hop' : 'khong_phu_hop';
    } else {
      continue; // đang tải quy tắc
    }
    if (mucDo !== 'khong_phu_hop' && mucDo !== 'tuy_dip') continue;

    let lyDo: string;
    if (mucDo === 'khong_phu_hop') {
      lyDo =
        lyDoGoc ??
        `Nét này thường gắn với phong cách khác, nên có thể làm lệch đặc trưng gốc của ${tenTrangPhuc ?? 'trang phục này'}. Bạn vẫn có thể giữ lại nếu muốn.`;
    } else {
      lyDo = lyDoGoc ?? 'Món này hợp hay không còn tuỳ dịp.';
      if (!rieng) {
        lyDo += suKienId
          ? ' Hiện chưa có quy tắc riêng cho dịp bạn chọn.'
          : ' Hãy chọn thêm dịp sử dụng ở khung bên trái để có kết quả rõ hơn.';
      }
    }

    cacMucCanhBao.push({
      id: p.id,
      ten: p.ten,
      vungMien: p.vungMien,
      mucDo,
      lyDo,
      thayThe: quyTac
        ? timMonThayThe(quyTac, p, danhSachPhuKien, suKienId).map((t) => ({ id: t.id, ten: t.ten }))
        : [],
    });
  }

  const daXep = new Set<string>();
  const cacNhom = NHOM_PHU_KIEN.map((nhom) => {
    const danhSach = nhom.cacPhuKien
      .map((ten) => danhSachPhuKien.find((p) => chuanHoaTenPhuKien(p.ten) === chuanHoaTenPhuKien(ten)))
      .filter((p): p is PhuKien => Boolean(p));
    danhSach.forEach((p) => daXep.add(p.id));
    return { ten: nhom.ten, chiChonMot: nhom.chiChonMot, danhSach };
  });
  const conLai = danhSachPhuKien.filter((p) => !daXep.has(p.id));
  if (conLai.length > 0) cacNhom.push({ ten: 'Khác', chiChonMot: false, danhSach: conLai });

  return (
    <div>
      <h3 className={TIEU_DE}>Phụ kiện</h3>
      <p className="text-xs text-ink-soft mb-3">
        Tuỳ chọn, có thể chọn nhiều món. Bấm lại để bỏ chọn; không chọn nghĩa là không dùng.
      </p>

      {cacMucCanhBao.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-ink-soft">Gợi ý về văn hoá</p>
          <CanhBaoVanHoa
            cacMuc={cacMucCanhBao}
            chuaChonDip={!suKienId}
            onThayBang={batTat}
            onBoMon={batTat}
            onGiuLai={giuLai}
          />
        </div>
      )}

      <div className="space-y-4">
        {cacNhom
          .filter((nhom) => nhom.danhSach.length > 0)
          .map((nhom) => (
            <div key={nhom.ten}>
              <p className="text-xs font-medium text-ink-soft mb-1.5">
                {nhom.ten}
                {nhom.chiChonMot && nhom.danhSach.length > 1 && (
                  <span className="font-normal"> (chọn 1)</span>
                )}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {nhom.danhSach.map((pk) => {
                  const dangChon = phuKienDangChon.includes(pk.id);
                  return (
                    <button
                      key={pk.id}
                      type="button"
                      aria-pressed={dangChon}
                      onClick={() => batTat(pk.id)}
                      className={`relative flex flex-col gap-1 rounded-md border p-1.5 text-center transition ${
                        dangChon
                          ? 'border-lacquer bg-lacquer/10 shadow-sm'
                          : 'border-ink-soft/20 bg-paper-raised/60 hover:border-gold hover:bg-paper-raised'
                      }`}
                    >
                      <AnhPhuKien ten={pk.ten} />
                      {dangChon && (
                        <span
                          aria-hidden
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-lacquer text-[11px] font-bold text-white"
                        >
                          ✓
                        </span>
                      )}
                      <span
                        className={`block text-[11px] leading-tight text-ink ${dangChon ? 'font-semibold' : 'font-medium'}`}
                      >
                        {pk.ten}
                      </span>
                      {pk.vungMien && (
                        <span className="block truncate text-[10px] leading-tight text-ink-soft">
                          {pk.vungMien}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}