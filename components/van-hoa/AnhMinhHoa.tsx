'use client';

import { useState } from 'react';

/** Ảnh minh hoạ có sẵn trong public/images/trang-phuc/. Không có ảnh (hoặc lỗi) thì ẩn đi, không hiện khung vỡ. */
export default function AnhMinhHoa({ src, alt }: { src: string; alt: string }) {
  const [loi, setLoi] = useState(false);
  if (loi) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setLoi(true)}
      className="h-64 w-full rounded-md border border-ink-soft/15 bg-paper-raised object-contain"
    />
  );
}
