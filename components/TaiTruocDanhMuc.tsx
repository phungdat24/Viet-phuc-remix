'use client';

import { useEffect } from 'react';
import { taiTruocDanhMuc } from '@/hooks/useDanhMuc';

/** Không hiển thị gì; chỉ tải sẵn danh mục khi web vừa mở. */
export default function TaiTruocDanhMuc() {
  useEffect(() => {
    taiTruocDanhMuc();
  }, []);
  return null;
}
