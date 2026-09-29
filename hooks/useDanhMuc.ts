'use client';

import { useEffect, useState } from 'react';
import type { TrangPhuc, SuKien, MauSac, PhuKien } from '@/types/phoi-do';

interface DanhMuc {
  trangPhuc: TrangPhuc[];
  suKien: SuKien[];
  mauSac: MauSac[];
  phuKien: PhuKien[];
}

export function useDanhMuc() {
  const [danhMuc, setDanhMuc] = useState<DanhMuc | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/danh-muc')
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi API danh-muc: ${res.status}`);
        return res.json();
      })
      .then((json) => setDanhMuc(json.data))
      .catch((err) => setLoi(err instanceof Error ? err.message : 'Lỗi không xác định'));
  }, []);

  return { danhMuc, loi, dangTai: !danhMuc && !loi };
}