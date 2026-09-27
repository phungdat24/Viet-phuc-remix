import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-paper-raised rounded-lg overflow-hidden flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
      <div className="flex-1 space-y-4">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
          Khám phá vẻ đẹp của Áo dài truyền thống
        </h1>
        <p className="text-ink-soft text-base md:text-lg max-w-md">
          Chọn trang phục, phối màu và phụ kiện — xem gợi ý có hợp tông, có đúng
          nếp văn hoá hay không, rồi lưu lại thành lookbook của riêng bạn.
        </p>
        <Link
          href="/phoi-do"
          className="inline-block bg-lacquer text-white font-medium px-6 py-3 rounded-md hover:opacity-90 transition"
        >
          Khám phá & Phối đồ ngay
        </Link>
      </div>
      <div className="flex-1 w-full max-w-sm">
        <div className="aspect-[3/4] bg-paper rounded-md flex items-center justify-center text-ink-soft text-sm">
          [Hình minh hoạ nhân vật]
        </div>
      </div>
    </section>
  );
}