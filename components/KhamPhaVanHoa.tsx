import Link from 'next/link';
import { CAC_MUC, layMucTheoSlug } from '@/lib/vanHoa/duLieu';

const NOI_BAT = ['ao-ngu-than', 'ao-dai', 'ao-tu-than'];

export default function KhamPhaVanHoa() {
  const mucNoiBat = NOI_BAT.map((s) => layMucTheoSlug(s)).filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <section className="my-10" aria-labelledby="h-kham-pha">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="h-kham-pha" className="font-display text-2xl font-semibold">
            Trước khi phối, hãy nghe câu chuyện của chúng
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            {CAC_MUC.length} mục trang phục và phụ kiện, từ áo giao lĩnh thế kỷ XIV đến áo dài hippy 1968, có dẫn nguồn và
            ghi rõ chỗ còn tranh luận.
          </p>
        </div>
        <Link href="/van-hoa" className="text-sm font-medium text-lacquer hover:underline">
          Xem toàn bộ thư viện →
        </Link>
      </div>

      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {mucNoiBat.map((m) => (
          <li key={m.slug}>
            <Link
              href={`/van-hoa/${m.slug}`}
              className="flex h-full flex-col rounded-md border border-ink-soft/15 bg-paper-raised p-4 transition hover:border-gold hover:shadow-sm"
            >
              <p className="text-xs text-ink-soft">{m.thoiKy}</p>
              <h3 className="font-display text-lg font-semibold text-ink">{m.ten}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{m.tomTat}</p>
              <span className="mt-auto pt-3 text-sm font-medium text-lacquer">Đọc câu chuyện →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
