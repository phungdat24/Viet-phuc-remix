import Link from 'next/link';
import { DONG_THOI_GIAN } from '@/lib/vanHoa/duLieu';

export default function DongThoiGian() {
  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-gold/40">
      {DONG_THOI_GIAN.map((m) => (
        <li key={`${m.moc}-${m.tieuDe}`} className="ml-6">
          <span
            aria-hidden
            className="absolute -left-2.25 mt-1.5 h-4 w-4 rounded-full border-2 border-gold bg-paper"
          />
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            {m.moc}
            {m.tranhLuan && (
              <span className="ml-2 rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] normal-case tracking-normal">
                mốc còn tranh luận
              </span>
            )}
          </p>
          <h3 className="font-display text-lg font-semibold text-ink">{m.tieuDe}</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{m.moTa}</p>
          <Link
            href={`/van-hoa/${m.slug}`}
            className="mt-1 inline-block text-sm font-medium text-lacquer hover:underline"
          >
            Đọc thêm →
          </Link>
        </li>
      ))}
    </ol>
  );
}
