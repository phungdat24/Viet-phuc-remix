'use client';

import { useEffect, useState } from 'react';
import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

interface DanhMuc {
  trangPhuc: TrangPhuc[];
  suKien: SuKien[];
  mauSac: MauSac[];
  phuKien: PhuKien[];
}

/**
 * Danh mục (trang phục, màu, phụ kiện, dịp) gần như không đổi trong một phiên dùng.
 * Trước đây MỖI trang gọi lại /api/danh-muc nên chuyển trang nào cũng hiện "Đang tải...".
 * Giờ chỉ tải một lần và dùng chung giữa các trang (bộ nhớ của trình duyệt, mất khi tải lại trang).
 */
let boNho: DanhMuc | null = null;
let dangTaiChung: Promise<DanhMuc> | null = null;

function taiDanhMuc(): Promise<DanhMuc> {
  if (boNho) return Promise.resolve(boNho);
  if (!dangTaiChung) {
    dangTaiChung = fetch('/api/danh-muc')
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi API danh-muc: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        boNho = json.data as DanhMuc;
        return boNho;
      })
      .catch((err) => {
        dangTaiChung = null; // cho phép thử lại ở lần sau
        throw err;
      });
  }
  return dangTaiChung;
}

/** Gọi sớm (khi web vừa mở) để lúc người dùng sang trang phối đồ thì dữ liệu đã sẵn sàng. */
export function taiTruocDanhMuc(): void {
  void taiDanhMuc().catch(() => {});
}

export function useDanhMuc() {
  const [danhMuc, setDanhMuc] = useState<DanhMuc | null>(boNho);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let huy = false;
    taiDanhMuc()
      .then((d) => {
        if (!huy) setDanhMuc(d);
      })
      .catch((err) => {
        if (!huy) setLoi(err instanceof Error ? err.message : 'Lỗi không xác định');
      });
    return () => {
      huy = true;
    };
  }, []);

  return { danhMuc, loi, dangTai: !danhMuc && !loi };
}
