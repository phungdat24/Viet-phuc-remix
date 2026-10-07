'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { laySlugTheoTen } from '@/lib/vanHoa/duLieu';

interface MucNoiDung {
  id: string;
  tieuDe: string;
  noiDung: string;
  nguonThamKhao: string | null;
}

interface Props {
  trangPhucId: string;
  tenTrangPhuc: string;
  vungMien?: string | null;
}

/** Ảnh minh hoạ từng trang phục, đặt trong public/images/trang-phuc/ (xem phần 3). */
const ANH_TRANG_PHUC: Record<string, string> = {
  'Áo dài': '/images/trang-phuc/ao-dai.jpg',
  'Áo tứ thân': '/images/trang-phuc/ao-tu-than.jpg',
  'Áo bà ba': '/images/trang-phuc/ao-ba-ba.jpg',
};

/** Bộ nhớ tạm: đã tải của trang phục nào thì không gọi lại. */
const boNho = new Map<string, MucNoiDung[]>();

/** Thứ tự hiển thị: Nguồn gốc → đặc điểm/cấu tạo → ý nghĩa. */
function thuTu(tieuDe: string): number {
  const t = tieuDe.normalize('NFC').toLowerCase();
  if (t.includes('nguồn gốc')) return 0;
  if (t.includes('ý nghĩa')) return 2;
  return 1;
}

export default function GioiThieuVanHoa({ trangPhucId, tenTrangPhuc, vungMien }: Props) {
  const [, veLai] = useState(0);
  const [loiId, setLoiId] = useState<string | null>(null);
  // undefined = mặc định mở mục đầu; null = đóng hết; chuỗi = id mục đang mở.
  const [moId, setMoId] = useState<string | null | undefined>(undefined);
  const [anhLoi, setAnhLoi] = useState(false);

  const danhSach = boNho.get(trangPhucId) ?? null;

  useEffect(() => {
    if (boNho.has(trangPhucId)) return;
    let huy = false;

    fetch(`/api/noi-dung-van-hoa?trangPhucId=${encodeURIComponent(trangPhucId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? `Lỗi ${res.status}`);
        return body.data as MucNoiDung[];
      })
      .then((ds) => {
        boNho.set(
          trangPhucId,
          [...ds].sort((a, b) => thuTu(a.tieuDe) - thuTu(b.tieuDe)),
        );
        if (!huy) veLai((n) => n + 1);
      })
      .catch(() => {
        if (!huy) setLoiId(trangPhucId);
      });

    return () => {
      huy = true;
    };
  }, [trangPhucId]);

  const anh = ANH_TRANG_PHUC[tenTrangPhuc.normalize('NFC').trim()];
  const slugVanHoa = laySlugTheoTen(tenTrangPhuc);
  const dangMo = moId === undefined ? (danhSach?.[0]?.id ?? null) : moId;

  return (
    <section className="overflow-hidden rounded-md border border-ink-soft/15 bg-paper-raised" aria-live="polite">
      {anh && !anhLoi && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={anh}
          alt={`Hình minh hoạ ${tenTrangPhuc}`}
          onError={() => setAnhLoi(true)}
          className="h-44 w-full bg-paper object-contain lg:h-64"
        />
      )}

      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-ink-soft">
          Tìm hiểu trang phục{vungMien ? ` · ${vungMien}` : ''}
        </p>
        <h3 className="font-display text-base font-semibold text-ink">{tenTrangPhuc}</h3>

        <div className="mt-2">
          {danhSach ? (
            danhSach.length === 0 ? (
              <p className="text-xs text-ink-soft">Chưa có nội dung văn hoá cho trang phục này.</p>
            ) : (
              danhSach.map((m) => {
                const mo = dangMo === m.id;
                return (
                  <div key={m.id} className="border-t border-ink-soft/15 first:border-t-0">
                    <button
                      type="button"
                      aria-expanded={mo}
                      onClick={() => setMoId(mo ? null : m.id)}
                      className="flex w-full items-center justify-between gap-2 py-2 text-left text-sm font-medium text-ink"
                    >
                      {m.tieuDe}
                      <span
                        aria-hidden
                        className={`text-ink-soft transition-transform ${mo ? 'rotate-180' : ''}`}
                      >
                        ▾
                      </span>
                    </button>
                    {mo && (
                      <div className="pb-3">
                        <p className="text-sm leading-relaxed text-ink">{m.noiDung}</p>
                        {m.nguonThamKhao && (
                          <p className="mt-2 text-xs italic text-ink-soft">Nguồn: {m.nguonThamKhao}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : loiId === trangPhucId ? (
            <p className="text-xs text-lacquer">
              Chưa tải được nội dung văn hoá lúc này. Hãy thử chọn lại trang phục.
            </p>
          ) : (
            <div className="space-y-2 py-1" aria-label="Đang tải">
              <div className="h-3 w-3/4 animate-pulse rounded bg-ink/10" />
              <div className="h-3 w-full animate-pulse rounded bg-ink/10" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-ink/10" />
            </div>
          )}
        </div>

        {slugVanHoa && (
          <Link
            href={`/van-hoa/${slugVanHoa}`}
            className="mt-2 inline-block text-sm font-medium text-lacquer hover:underline"
          >
            Đọc đầy đủ về {tenTrangPhuc}, có nguồn và các quan điểm khác nhau →
          </Link>
        )}
      </div>
    </section>
  );
}