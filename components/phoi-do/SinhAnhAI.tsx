'use client';

import Link from 'next/link';
import type { ToHopAI } from '@/types/phoi-do';
import GhiChuAnhAI from './GhiChuAnhAI';

export interface AnhAIProps {
  /** true khi không có dịp nào để dùng (danh mục dịp rỗng) → không thể sinh ảnh AI */
  thieuThongTin: boolean;
  /** Dịp dùng để sinh ảnh (do người dùng chọn hoặc dịp mặc định). */
  tenSuKien: string | null;
  /** true khi người dùng chưa chọn dịp và hệ thống dùng dịp mặc định (Tết). */
  suKienMacDinh: boolean;
  /** null = không chọn phụ kiện. */
  tenPhuKien: string | null;
  /** Cảnh báo sai phạm văn hoá (hiện khung đỏ dưới ảnh). null = không có cảnh báo. */
  canhBaoVanHoa?: string | null;
  /** true = ẩn nhận xét do AI viết (khi Lớp 1 đang cảnh báo hoặc có món chưa kiểm chứng). */
  anNhanXet?: boolean;
  dangSinh: boolean;
  loi: string | null;
  toHop: ToHopAI | null;
  dangDuyet: boolean;
  daLuu: boolean;
  onDuyet: () => void;
  onKhongDuyet: () => void;
  onSinhLai: () => void;
}

export default function SinhAnhAI({
  thieuThongTin,
  tenSuKien,
  suKienMacDinh,
  tenPhuKien,
  canhBaoVanHoa = null,
  anNhanXet = false,
  dangSinh,
  loi,
  toHop,
  dangDuyet,
  daLuu,
  onDuyet,
  onKhongDuyet,
  onSinhLai,
}: AnhAIProps) {
  if (thieuThongTin) {
    return (
      <p className="text-xs text-ink-soft bg-paper rounded-md p-3 mt-3">
        Chưa có danh sách <strong>dịp sử dụng</strong> nên chưa thể nhờ AI vẽ ảnh minh hoạ cho bộ phối này.
      </p>
    );
  }

  if (dangSinh) {
    return (
      <div className="mt-3 rounded-md border border-dashed border-ink-soft/30 p-6 text-center">
        <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-ink-soft/30 border-t-lacquer" />
        <p className="text-sm text-ink-soft">Đang sinh ảnh AI... (khoảng 10–20 giây)</p>
      </div>
    );
  }

  if (loi && !toHop) {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-sm text-lacquer bg-lacquer/10 rounded-md p-3">{loi}</p>
        <button
          onClick={onSinhLai}
          className="w-full border border-ink-soft/30 font-medium py-2 rounded-md hover:border-gold transition"
        >
          Thử sinh lại ảnh
        </button>
      </div>
    );
  }

  if (!toHop) return null;

  const daDuyet = toHop.status === 'approved';
  const biTuChoi = toHop.status === 'rejected';
  const nhanXet = toHop.aiAssessment?.nhanXetAI ?? null;

  return (
    <div className="mt-3 space-y-3">
      {toHop.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={toHop.imageUrl}
          alt="Ảnh AI sinh cho bộ phối đồ"
          className="w-full max-h-160 object-contain rounded-md border border-ink-soft/15 bg-paper"
        />
      )}

      {toHop.imageUrl && <GhiChuAnhAI />}

      {suKienMacDinh && tenSuKien && (
        <p className="text-xs text-ink-soft bg-paper rounded-md p-3">
          Bạn chưa chọn dịp nên ảnh được vẽ theo dịp mặc định là <strong>{tenSuKien}</strong>. Muốn dịp khác, hãy
          chọn ở khung bên trái rồi xem lại kết quả.
        </p>
      )}
      {!tenPhuKien && (
        <p className="text-xs text-ink-soft bg-paper rounded-md p-3">
          Bạn không chọn phụ kiện nên ảnh được vẽ không kèm phụ kiện.
        </p>
      )}

      {nhanXet &&
        (anNhanXet ? (
          <p className="text-xs text-ink-soft bg-paper rounded-md p-3">
            Nhận xét của AI được ẩn vì bộ phối này có điểm cần lưu ý về văn hoá. Hãy xem mục &quot;Chuẩn mực văn
            hoá&quot; phía trên.
          </p>
        ) : (
          <div>
            <p className="text-sm text-ink-soft italic">“{nhanXet}”</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Nhận xét do AI viết về phối màu và phong cách, không phải kết luận về văn hoá.
            </p>
          </div>
        ))}

      {canhBaoVanHoa && (
        <div
          role="alert"
          className="rounded-md border border-lacquer/40 bg-lacquer/10 p-3 text-sm text-lacquer"
        >
          <p className="font-semibold">⚠ Cảnh báo văn hoá</p>
          <p>{canhBaoVanHoa}</p>
        </div>
      )}

      {loi && <p className="text-sm text-lacquer bg-lacquer/10 rounded-md p-3">{loi}</p>}

      {biTuChoi ? (
        <div className="space-y-2">
          <p className="text-sm text-ink-soft">
            Ảnh này đã bị quản trị viên từ chối nên bộ phối <strong>không được lưu</strong> vào Lookbook.
          </p>
          <button
            onClick={onSinhLai}
            className="w-full border border-ink-soft/30 font-medium py-2 rounded-md hover:border-gold transition"
          >
            Sinh ảnh khác
          </button>
        </div>
      ) : daLuu ? (
        <div className="rounded-md border border-jade/40 bg-jade/10 p-3 text-center" role="status">
          <p className="text-sm font-medium text-jade">Đã lưu vào Lookbook cá nhân ✓</p>
          <Link href="/lookbook" className="mt-1 inline-block text-sm font-medium text-lacquer hover:underline">
            Xem Lookbook của tôi →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-soft">
            {daDuyet
              ? 'Ảnh này đã được duyệt trước đó.'
              : 'Bạn có muốn lưu bộ phối kèm ảnh AI vào Lookbook cá nhân không? Ảnh đang chờ quản trị viên duyệt.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onDuyet}
              disabled={dangDuyet}
              className="flex-1 bg-lacquer text-white font-medium py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-60"
            >
              {dangDuyet ? 'Đang lưu...' : daDuyet ? 'Lưu vào Lookbook' : 'Lưu vào Lookbook cá nhân'}
            </button>
            {!daDuyet && (
              <button
                onClick={onKhongDuyet}
                disabled={dangDuyet}
                className="flex-1 border border-ink-soft/30 font-medium py-2.5 rounded-md hover:border-lacquer hover:text-lacquer transition disabled:opacity-60"
              >
                Không lưu
              </button>
            )}
          </div>
          {/* Ảnh đã duyệt thì server không cho ghi đè; còn lại (draft) được phép sinh ảnh khác. */}
          {!daDuyet && (
            <button
              onClick={onSinhLai}
              disabled={dangDuyet}
              className="w-full border border-ink-soft/30 font-medium py-2 rounded-md hover:border-gold transition disabled:opacity-60"
            >
              Sinh ảnh khác
            </button>
          )}
        </>
      )}
    </div>
  );
}