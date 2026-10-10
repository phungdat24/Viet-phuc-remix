'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  SU_KIEN_SO_SANH,
  docNgan,
  themBo,
  thayBo,
  xoaBo,
  xoaHetNgan,
  type BoMoi,
  type BoSoSanh,
  type KetQuaThem,
} from '@/lib/soSanh';

/** Ngăn so sánh (tối đa 2 bộ), tự cập nhật khi đổi ở component khác hoặc tab khác. */
export function useNganSoSanh() {
  // Bắt đầu rỗng rồi mới đọc localStorage trong effect để không lệch với HTML dựng từ máy chủ.
  const [cacBo, setCacBo] = useState<BoSoSanh[]>([]);
  const [daDoc, setDaDoc] = useState(false);

  useEffect(() => {
    const capNhat = () => {
      setCacBo(docNgan());
      setDaDoc(true);
    };
    capNhat();
    window.addEventListener(SU_KIEN_SO_SANH, capNhat);
    window.addEventListener('storage', capNhat);
    return () => {
      window.removeEventListener(SU_KIEN_SO_SANH, capNhat);
      window.removeEventListener('storage', capNhat);
    };
  }, []);

  const them = useCallback((moi: BoMoi): KetQuaThem => themBo(moi), []);

  return { cacBo, daDoc, them, xoa: xoaBo, thay: thayBo, xoaHet: xoaHetNgan };
}
