'use client';

import { useEffect, useState } from 'react';

const BUOC = [
  { so: 1, ten: 'Chọn trang phục & bối cảnh', moTa: 'Chọn 1 trong 3 trang phục truyền thống và dịp sử dụng phù hợp.' },
  { so: 2, ten: 'Tuỳ chỉnh màu sắc & phụ kiện', moTa: 'Phối màu theo từng bộ phận, thêm phụ kiện yêu thích.' },
  { so: 3, ten: 'Kiểm tra chuẩn văn hoá & Lưu Lookbook', moTa: 'Xem đánh giá hài hoà màu và cảnh báo văn hoá, rồi lưu lại.' },
];

const KEY = 'viet-phuc-remix-da-xem-huong-dan';

export default function HuongDanSoBo() {
  const [hienThi, setHienThi] = useState(false);

  useEffect(() => {
    const daXem = localStorage.getItem(KEY);
    if (!daXem) setHienThi(true);
  }, []);

  const dong = () => {
    localStorage.setItem(KEY, 'true');
    setHienThi(false);
  };

  if (!hienThi) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Bắt đầu trong 3 bước</h2>
        <button onClick={dong} className="text-sm text-ink-soft hover:text-ink">
          Bỏ qua
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {BUOC.map((b) => (
          <div key={b.so} className="bg-paper-raised rounded-md p-4">
            <div className="w-8 h-8 rounded-full bg-lacquer text-white flex items-center justify-center font-semibold mb-3">
              {b.so}
            </div>
            <p className="font-medium mb-1">{b.ten}</p>
            <p className="text-sm text-ink-soft">{b.moTa}</p>
          </div>
        ))}
      </div>
    </section>
  );
}