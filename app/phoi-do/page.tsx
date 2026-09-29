import { Suspense } from 'react';
import ThuNghiemPhoiDoClient from '@/components/phoi-do/ThuNghiemPhoiDoClient';

export default function ThuNghiemPhoiDoPage() {
  return (
    <Suspense fallback={<p className="text-center py-12 text-ink-soft">Đang tải...</p>}>
      <ThuNghiemPhoiDoClient />
    </Suspense>
  );
}