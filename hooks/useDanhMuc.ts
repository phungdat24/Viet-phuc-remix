'use client';

import { useEffect, useState } from 'react';
import { layDanhSach } from '@/lib/api';
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
    Promise.all([
      layDanhSach<TrangPhuc>('/api/trang-phuc'),
      layDanhSach<SuKien>('/api/su-kien'),
      layDanhSach<MauSac>('/api/mau-sac'),
      layDanhSach<PhuKien>('/api/phu-kien'),
    ])
      .then(([trangPhuc, suKien, mauSac, phuKien]) =>
        setDanhMuc({ trangPhuc, suKien, mauSac, phuKien })
      )
      .catch((err) =>
        setLoi(err instanceof Error ? err.message : 'Lỗi không xác định')
      );
  }, []);

  return { danhMuc, loi, dangTai: !danhMuc && !loi };
}