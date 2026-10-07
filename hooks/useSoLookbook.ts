'use client';

import { useEffect, useState } from 'react';
import { loadLookbook, SU_KIEN_LOOKBOOK } from '@/lib/localLookbook';

/** Số bộ phối trong Lookbook, tự cập nhật khi lưu/xoá (kể cả ở tab khác). */
export function useSoLookbook(): number {
  const [so, setSo] = useState(0);

  useEffect(() => {
    const capNhat = () => setSo(loadLookbook().length);
    capNhat();
    window.addEventListener(SU_KIEN_LOOKBOOK, capNhat);
    window.addEventListener('storage', capNhat);
    return () => {
      window.removeEventListener(SU_KIEN_LOOKBOOK, capNhat);
      window.removeEventListener('storage', capNhat);
    };
  }, []);

  return so;
}
