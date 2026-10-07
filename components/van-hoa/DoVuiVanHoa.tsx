'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DO_VUI } from '@/lib/vanHoa/duLieu';

export default function DoVuiVanHoa() {
  const [cau, setCau] = useState(0);
  const [chon, setChon] = useState<number | null>(null);
  const [diem, setDiem] = useState(0);
  const [xong, setXong] = useState(false);

  const q = DO_VUI[cau];
  const daTraLoi = chon !== null;

  function traLoi(i: number) {
    if (daTraLoi) return;
    setChon(i);
    if (i === q.dapAn) setDiem((d) => d + 1);
  }

  function tiep() {
    if (cau + 1 >= DO_VUI.length) {
      setXong(true);
    } else {
      setCau((c) => c + 1);
      setChon(null);
    }
  }

  function choiLai() {
    setCau(0);
    setChon(null);
    setDiem(0);
    setXong(false);
  }

  if (xong) {
    return (
      <div className="rounded-md border border-ink-soft/15 bg-paper-raised p-6 text-center">
        <p className="font-display text-3xl font-semibold text-lacquer">
          {diem}/{DO_VUI.length}
        </p>
        <p className="mt-2 text-ink-soft">
          {diem === DO_VUI.length
            ? 'Tuyệt vời! Bạn nắm khá chắc các mốc và đặc điểm Việt phục.'
            : 'Mỗi câu sai là một mục để đọc thêm. Thử lại sau khi lướt thư viện phía trên nhé.'}
        </p>
        <button
          type="button"
          onClick={choiLai}
          className="mt-4 rounded-md bg-lacquer px-5 py-2.5 font-medium text-white hover:opacity-90"
        >
          Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink-soft/15 bg-paper-raised p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        Câu {cau + 1}/{DO_VUI.length}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-ink">{q.hoi}</h3>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {q.luaChon.map((l, i) => {
          const dung = daTraLoi && i === q.dapAn;
          const sai = daTraLoi && i === chon && i !== q.dapAn;
          return (
            <button
              key={l}
              type="button"
              disabled={daTraLoi}
              onClick={() => traLoi(i)}
              className={`rounded-md border px-3 py-2.5 text-left text-sm transition ${
                dung
                  ? 'border-jade bg-jade/15 font-medium text-ink'
                  : sai
                    ? 'border-lacquer bg-lacquer/10 text-ink'
                    : 'border-ink-soft/30 bg-paper hover:border-gold disabled:opacity-70'
              }`}
            >
              {l}
              {dung && <span className="sr-only"> (đáp án đúng)</span>}
              {sai && <span className="sr-only"> (chưa đúng)</span>}
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {daTraLoi && (
          <div className="mt-4 rounded-md bg-paper p-3 text-sm">
            <p className="font-medium text-ink">{chon === q.dapAn ? 'Chính xác!' : 'Chưa đúng.'}</p>
            <p className="mt-1 leading-relaxed text-ink-soft">{q.giaiThich}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={tiep}
                className="rounded-md bg-lacquer px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                {cau + 1 >= DO_VUI.length ? 'Xem điểm' : 'Câu tiếp theo'}
              </button>
              <Link href={`/van-hoa/${q.slug}`} className="text-sm font-medium text-lacquer hover:underline">
                Đọc thêm →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
