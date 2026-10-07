import type { YCoNguon } from '@/lib/vanHoa/duLieu';

/** Số nguồn dạng [1][3], bấm vào là nhảy tới đúng nguồn trong danh sách "Nguồn tham khảo". */
export function SoNguon({ s }: { s: number[] }) {
  if (s.length === 0) return null;
  return (
    <sup className="ml-1 whitespace-nowrap text-[11px] font-medium">
      {s.map((k) => (
        <a
          key={k}
          href={`#nguon-${k}`}
          aria-label={`Xem nguồn ${k}`}
          className="mr-0.5 text-lacquer hover:underline"
        >
          [{k}]
        </a>
      ))}
    </sup>
  );
}

export function DanhSachY({ ds, kieu = 'doan' }: { ds: YCoNguon[]; kieu?: 'doan' | 'gach' }) {
  if (ds.length === 0) {
    return (
      <p className="text-sm italic text-ink-soft">
        Chưa có đủ nguồn đáng tin để viết phần này. Nhóm chọn để trống thay vì suy đoán.
      </p>
    );
  }
  if (kieu === 'gach') {
    return (
      <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-ink">
        {ds.map((i) => (
          <li key={i.n}>
            {i.n}
            <SoNguon s={i.s} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="space-y-3 text-base leading-relaxed text-ink">
      {ds.map((i) => (
        <p key={i.n}>
          {i.n}
          <SoNguon s={i.s} />
        </p>
      ))}
    </div>
  );
}
