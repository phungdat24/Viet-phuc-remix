import { Suspense } from 'react';
import SoSanhHaiBo from '@/components/phoi-do/SoSanhHaiBo';

export const metadata = { title: 'So sánh 2 bộ phối đồ' };

export default function SoSanhPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-ink-soft">Đang tải...</p>}>
      <SoSanhHaiBo />
    </Suspense>
  );
}