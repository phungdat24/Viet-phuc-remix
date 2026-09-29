'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDanhMuc } from '@/hooks/useDanhMuc';
import TheLookbook from './TheLookbook';
import { loadLookbook, deleteItem, toggleYeuThich, type LookbookItem } from '@/lib/localLookbook';

export default function LookbookClient() {
  const { danhMuc, loi, dangTai } = useDanhMuc();
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [boLoc, setBoLoc] = useState('tat-ca');

  // localStorage chỉ có ở trình duyệt nên phải đọc trong useEffect
  useEffect(() => {
    setItems(loadLookbook());
  }, []);

  function xuLyToggleYeuThich(id: string) {
    toggleYeuThich(id);
    setItems(loadLookbook());
  }
  function xuLyXoa(id: string) {
  deleteItem(id);
  setItems(loadLookbook());
}

  if (dangTai) {
    return <p className="text-center py-12 text-ink-soft">Đang tải Lookbook...</p>;
  }
  if (loi || !danhMuc) {
    return <p className="text-center py-12 text-lacquer">Đã xảy ra lỗi: {loi}</p>;
  }

  const cacTab = [
    { id: 'tat-ca', ten: 'Tất cả' },
    ...danhMuc.trangPhuc.map((tp) => ({ id: tp.id, ten: tp.ten })),
    { id: 'yeu-thich', ten: 'Yêu thích ♥' },
  ];

  const itemsHienThi = items
    .filter((it) => {
      if (boLoc === 'tat-ca') return true;
      if (boLoc === 'yeu-thich') return it.yeuThich;
      return it.trangPhucId === boLoc;
    })
    .sort((a, b) => b.ngayTao - a.ngayTao); // mới nhất lên đầu

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-semibold">Lookbook của tôi</h1>
      <p className="text-sm text-ink-soft mt-1 mb-6">
        Bộ sưu tập Việt phục bạn đã phối và lưu lại.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {cacTab.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setBoLoc(tab.id)}
            aria-pressed={boLoc === tab.id}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              boLoc === tab.id
                ? 'bg-ink text-paper border-ink'
                : 'border-ink-soft/30 hover:border-gold'
            }`}
          >
            {tab.ten}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-ink-soft/30 rounded-md p-10 text-center">
          <p className="text-ink-soft mb-4">Chưa có bộ phối nào được lưu.</p>
          <Link
            href="/phoi-do"
            className="inline-block bg-lacquer text-white font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition"
          >
            Bắt đầu phối đồ
          </Link>
        </div>
      ) : itemsHienThi.length === 0 ? (
        <p className="text-ink-soft text-center py-10">Không có bộ phối nào trong mục này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {itemsHienThi.map((it) => (
            <TheLookbook
              key={it.id}
              item={it}
              trangPhuc={danhMuc.trangPhuc.find((x) => x.id === it.trangPhucId) ?? null}
              suKien={danhMuc.suKien.find((x) => x.id === it.suKienId) ?? null}
              mauChinh={danhMuc.mauSac.find((x) => x.id === it.mauChinhId) ?? null}
              mauPhu={danhMuc.mauSac.find((x) => x.id === it.mauPhuId) ?? null}
              phuKien={danhMuc.phuKien.find((x) => x.id === it.phuKienId) ?? null}
              onToggleYeuThich={xuLyToggleYeuThich}
              onXoa={xuLyXoa}
            />
          ))}
        </div>
      )}
    </main>
  );
}