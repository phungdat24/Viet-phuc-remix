'use client';

import type { PhuKien } from '@/types/phoi-do';
import { NHOM_PHU_KIEN, chuanHoaTenPhuKien } from '@/lib/phuKienTheoTrangPhuc';

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
            {monItPhuHopDaChon.map((p) => p.ten).join(', ')}{' '}
            {monItPhuHopDaChon.length > 1 ? 'ít' : 'ít'} phù hợp với {tenTrangPhuc ?? 'trang phục này'}.
            Bạn vẫn có thể giữ lại, bấm &quot;Xem kết quả&quot; để đọc giải thích chi tiết.
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
                      className={`rounded-md border px-2 py-2 text-xs text-center transition ${
                        dangChon
                          ? 'border-lacquer bg-paper-raised'
                          : 'border-ink-soft/20 hover:border-gold'
                      }`}
                    >
                      {pk.ten}
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