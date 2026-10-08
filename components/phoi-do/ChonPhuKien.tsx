'use client';

import { useState } from 'react';
import type { PhuKien } from '@/types/phoi-do';
import { NHOM_PHU_KIEN, chuanHoaTenPhuKien } from '@/lib/phuKienTheoTrangPhuc';
import { layAnhPhuKien } from '@/lib/anhPhuKien';

interface Props {
  danhSachPhuKien: PhuKien[];
  /** Tên các phụ kiện phù hợp với trang phục đang chọn (dùng để cảnh báo, KHÔNG hiện ở nút). */
  tenPhuKienPhuHop: string[];
  /** Tên trang phục đang chọn, dùng trong câu cảnh báo. */
  tenTrangPhuc: string | null;
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
  tenPhuKienPhuHop,
  tenTrangPhuc,
  phuKienDangChon,
  daChonTrangPhuc,
  onBatTatPhuKien,
}: Props) {
  if (!daChonTrangPhuc) {
    return (
      <div>
        <h3 className={TIEU_DE}>Phụ kiện</h3>
        <p className="text-sm text-ink-soft">Chọn trang phục trước để xem các phụ kiện.</p>
      </div>
    );
  }

  const tenPhuHop = new Set(tenPhuKienPhuHop.map(chuanHoaTenPhuKien));

  // Chỉ cảnh báo khi người dùng ĐÃ CHỌN món ít phù hợp.
  const monItPhuHopDaChon = danhSachPhuKien.filter(
    (p) => phuKienDangChon.includes(p.id) && !tenPhuHop.has(chuanHoaTenPhuKien(p.ten)),
  );

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

      {monItPhuHopDaChon.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-lacquer/40 bg-lacquer/5 px-3 py-2 text-xs text-ink"
        >
          <p className="font-medium text-lacquer">⚠ Cần lưu ý về văn hoá</p>
          <p className="mt-1">
            {monItPhuHopDaChon.map((p) => p.ten).join(', ')} ít phù hợp với{' '}
            {tenTrangPhuc ?? 'trang phục này'}. Bạn vẫn có thể giữ lại, bấm &quot;Xem kết quả&quot; để
            đọc giải thích chi tiết.
          </p>
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
                      onClick={() => onBatTatPhuKien(pk.id)}
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