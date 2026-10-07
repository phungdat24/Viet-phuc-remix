import Link from 'next/link';

export default function KhongTimThay() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="font-display text-5xl font-semibold text-lacquer">404</p>
      <h1 className="mt-3 font-display text-2xl font-semibold">Không tìm thấy trang này</h1>
      <p className="mt-2 text-ink-soft">Đường dẫn có thể đã đổi hoặc chưa tồn tại.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/van-hoa" className="rounded-md bg-lacquer px-5 py-2.5 font-medium text-white hover:opacity-90">
          Khám phá văn hoá
        </Link>
        <Link href="/phoi-do" className="rounded-md border border-ink-soft/30 px-5 py-2.5 font-medium hover:border-gold">
          Thử phối đồ
        </Link>
      </div>
    </main>
  );
}
