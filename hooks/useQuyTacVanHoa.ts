'use client';

import { useEffect, useState } from 'react';
import type { QuyTacVanHoa } from '@/types/phoi-do';

/** Bộ nhớ tạm: đã tải của trang phục nào thì không gọi lại. */
const boNho = new Map<string, QuyTacVanHoa[]>();
/** Yêu cầu đang chạy: nhiều component cùng cần một trang phục thì chỉ gọi mạng một lần. */
const dangChay = new Map<string, Promise<QuyTacVanHoa[]>>();

/**
 * Tải quy tắc văn hoá của một trang phục.
 * - quyTac: null nếu chưa có trang phục, đang tải, hoặc bị lỗi.
 * - dangTai / loi: để giao diện chọn cách hiển thị (khi lỗi vẫn dùng được bình thường,
 *   chỉ thiếu cảnh báo tức thời; kết quả cuối cùng vẫn do máy chủ thẩm định).
 */
export function useQuyTacVanHoa(trangPhucId: string | null) {
  const [, veLai] = useState(0);
  const [loiId, setLoiId] = useState<string | null>(null);

  useEffect(() => {
    if (!trangPhucId || boNho.has(trangPhucId)) return;
    let huy = false;

    let yeuCau = dangChay.get(trangPhucId);
    if (!yeuCau) {
      yeuCau = fetch(`/api/quy-tac-van-hoa?trangPhucId=${encodeURIComponent(trangPhucId)}`)
        .then(async (res) => {
          const body = await res.json();
          if (!res.ok) throw new Error(body.error ?? `Lỗi ${res.status}`);
          return body.data as QuyTacVanHoa[];
        })
        .finally(() => dangChay.delete(trangPhucId));
      dangChay.set(trangPhucId, yeuCau);
    }

    yeuCau
      .then((ds) => {
        boNho.set(trangPhucId, ds);
        if (!huy) veLai((n) => n + 1);
      })
      .catch(() => {
        if (!huy) setLoiId(trangPhucId);
      });

    return () => {
      huy = true;
    };
  }, [trangPhucId]);

  const quyTac = trangPhucId ? (boNho.get(trangPhucId) ?? null) : null;
  const loi = Boolean(trangPhucId) && !quyTac && loiId === trangPhucId;
  const dangTai = Boolean(trangPhucId) && !quyTac && !loi;

  return { quyTac, dangTai, loi };
}