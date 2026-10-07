import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import NhanTrangThai from '@/components/van-hoa/NhanTrangThai';
import NutPhoiThu from '@/components/van-hoa/NutPhoiThu';
import AnhMinhHoa from '@/components/van-hoa/AnhMinhHoa';
import { DanhSachY, SoNguon } from '@/components/van-hoa/DanhSachY';
import {
  CAC_MUC,
  NHAN_LOAI_NGUON,
  NHAN_TRANG_THAI,
  layCacMucLienQuan,
  layMucTheoSlug,
} from '@/lib/vanHoa/duLieu';

/** Ảnh minh hoạ có sẵn cho 3 trang phục chính (không có file thì tự ẩn). */
const ANH_THEO_SLUG: Record<string, string> = {
  'ao-dai': '/images/trang-phuc/ao-dai.jpg',
  'ao-tu-than': '/images/trang-phuc/ao-tu-than.jpg',
  'ao-ba-ba': '/images/trang-phuc/ao-ba-ba.jpg',
};

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CAC_MUC.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const muc = layMucTheoSlug(slug);
  if (!muc) return { title: 'Không tìm thấy — Việt Phục Studio' };
  return { title: `${muc.ten} — Việt Phục Studio`, description: muc.tomTat };
}

function Khoi({ id, tieuDe, ghiChu, children }: { id: string; tieuDe: string; ghiChu?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-display text-xl font-semibold text-ink">
        {tieuDe}
      </h2>
      {ghiChu && <p className="mt-1 text-xs text-ink-soft">{ghiChu}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function TrangChiTietVanHoa({ params }: Props) {
  const { slug } = await params;
  const muc = layMucTheoSlug(slug);
  if (!muc) notFound();

  const lienQuan = layCacMucLienQuan(muc);
  const anh = ANH_THEO_SLUG[muc.slug];
  const laDo = muc.trangThai === 'chua-kiem-chung';
  const viTri = CAC_MUC.findIndex((m) => m.slug === muc.slug);
  const truoc = CAC_MUC[(viTri - 1 + CAC_MUC.length) % CAC_MUC.length];
  const sau = CAC_MUC[(viTri + 1) % CAC_MUC.length];

  return (
    <main className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <nav aria-label="Vị trí trang" className="text-sm text-ink-soft">
        <Link href="/van-hoa" className="hover:text-ink hover:underline">
          Khám phá văn hoá
        </Link>{' '}
        <span aria-hidden>›</span> <span className="text-ink">{muc.ten}</span>
      </nav>

      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-ink/10 px-2.5 py-0.5 font-medium text-ink">
            {muc.nhom === 'trang-phuc' ? 'Trang phục' : 'Phụ kiện'}
          </span>
          <NhanTrangThai trangThai={muc.trangThai} ganMoTa />
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight md:text-4xl">{muc.ten}</h1>
        {muc.tenKhac && <p className="mt-1 text-sm italic text-ink-soft">Còn gọi: {muc.tenKhac}</p>}
        <p className="mt-1 text-sm text-ink-soft">
          {muc.vung} · {muc.thoiKy}
        </p>
        <p className="mt-4 text-base leading-relaxed text-ink md:text-lg">{muc.tomTat}</p>
      </header>

      {laDo && muc.canhBaoDo && (
        <div role="alert" className="rounded-md border-2 border-lacquer bg-lacquer/10 p-4">
          <p className="font-display text-lg font-semibold text-lacquer">⚠ Chưa kiểm chứng</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{muc.canhBaoDo}</p>
        </div>
      )}

      {anh && !laDo && <AnhMinhHoa src={anh} alt={`Hình minh hoạ ${muc.ten}`} />}

      <Khoi id="h-thoi-nao" tieuDe="Có từ thời nào?">
        <DanhSachY ds={muc.coTuThoiNao} />
        {muc.hanhTrinh.length > 0 && (
          <ol className="relative ml-2 mt-5 space-y-4 border-l-2 border-gold/40">
            {muc.hanhTrinh.map((h) => (
              <li key={h.moc} className="ml-5">
                <span aria-hidden className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-gold bg-paper" />
                <p className="text-xs font-semibold uppercase tracking-wide text-gold">{h.moc}</p>
                <p className="text-sm leading-relaxed text-ink">
                  {h.y.n}
                  <SoNguon s={h.y.s} />
                </p>
              </li>
            ))}
          </ol>
        )}
      </Khoi>

      <Khoi id="h-nhan-biet" tieuDe="Cấu tạo và cách nhận biết">
        <div className="rounded-md border border-ink-soft/15 bg-paper-raised p-5">
          <DanhSachY ds={muc.nhanBiet} kieu="gach" />
        </div>
      </Khoi>

      <Khoi
        id="h-y-nghia"
        tieuDe="Ý nghĩa và biểu tượng"
        ghiChu="Phần này ghi cách lý giải văn hoá, được tách riêng khỏi các sự kiện lịch sử ở trên."
      >
        <DanhSachY ds={muc.yNghia} kieu="gach" />
      </Khoi>

      <Khoi id="h-doc-dao" tieuDe="Điểm độc đáo">
        <DanhSachY ds={muc.diemDocDao} kieu="gach" />
      </Khoi>

      <Khoi id="h-ai-mac" tieuDe="Ai mặc, vào dịp nào, bằng gì?">
        <DanhSachY ds={muc.nguoiMacDip} kieu="gach" />
      </Khoi>

      {muc.conTranhLuan.length > 0 && (
        <section aria-labelledby="h-tranh-luan" className="rounded-md border border-gold/40 bg-gold/10 p-5">
          <h2 id="h-tranh-luan" className="font-display text-xl font-semibold text-ink">
            Các quan điểm khác nhau
          </h2>
          <div className="mt-2">
            <DanhSachY ds={muc.conTranhLuan} />
          </div>
          <p className="mt-3 text-xs text-ink-soft">{NHAN_TRANG_THAI[muc.trangThai].moTa}</p>
        </section>
      )}

      {muc.phoiThu && (
        <NutPhoiThu trangPhuc={muc.phoiThu.trangPhuc} phuKien={muc.phoiThu.phuKien} ghiChu={muc.phoiThu.ghiChu} />
      )}

      <section aria-labelledby="h-nguon">
        <h2 id="h-nguon" className="font-display text-xl font-semibold text-ink">
          Nguồn tham khảo
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          Số trong ngoặc vuông ở các đoạn trên trỏ về đúng nguồn tại đây. Nguồn học thuật, bảo tàng và báo chí chính thống
          được ưu tiên hơn nguồn phổ thông.
        </p>
        <ol className="mt-3 space-y-2 text-sm">
          {muc.nguon.map((n, i) => (
            <li key={n.url} id={`nguon-${i + 1}`} className="flex scroll-mt-20 gap-2">
              <span className="font-semibold text-ink">[{i + 1}]</span>
              <span>
                <span className="mr-2 rounded-full border border-ink-soft/25 px-2 py-0.5 text-[11px] text-ink-soft">
                  {NHAN_LOAI_NGUON[n.loai]}
                </span>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-lacquer underline-offset-2 hover:underline"
                >
                  {n.tieuDe}
                </a>
                <span className="text-ink-soft"> — {n.donVi}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {lienQuan.length > 0 && (
        <section aria-labelledby="h-lien-quan">
          <h2 id="h-lien-quan" className="font-display text-xl font-semibold text-ink">
            Đọc tiếp
          </h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {lienQuan.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/van-hoa/${m.slug}`}
                  className={`block rounded-md border bg-paper-raised p-4 transition hover:border-gold ${
                    m.trangThai === 'chua-kiem-chung' ? 'border-lacquer/50' : 'border-ink-soft/15'
                  }`}
                >
                  <p className="font-display text-base font-semibold text-ink">
                    {m.trangThai === 'chua-kiem-chung' && <span className="mr-1 text-lacquer">⚠</span>}
                    {m.ten}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{m.tomTat}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Mục trước và sau" className="flex justify-between gap-4 border-t border-ink-soft/15 pt-4 text-sm">
        <Link href={`/van-hoa/${truoc.slug}`} className="text-lacquer hover:underline">
          ← {truoc.ten}
        </Link>
        <Link href={`/van-hoa/${sau.slug}`} className="text-right text-lacquer hover:underline">
          {sau.ten} →
        </Link>
      </nav>
    </main>
  );
}
