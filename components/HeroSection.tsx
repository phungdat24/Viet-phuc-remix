import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-md min-h-115 md:min-h-130 flex items-center">
      {/* Ảnh nền do Gemini tạo; người mẫu nằm bên phải, bên trái để trống cho chữ */}
      <Image
        src="/images/hero-viet-phuc.jpg"
        alt="Ba trang phục truyền thống Việt Nam: áo bà ba, áo dài và áo tứ thân"
        fill
        priority
        sizes="(min-width: 1024px) 1024px, 100vw"
        className="object-cover object-right"
      />

      {/* Lớp phủ giúp chữ dễ đọc: kem đậm bên trái, mờ dần sang phải (màn hình lớn) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-paper/75 md:bg-transparent md:bg-linear-to-r md:from-paper md:from-30% md:via-paper/70 md:via-50% md:to-transparent"
      />

      <div className="relative z-10 px-6 py-12 md:px-12 md:max-w-[58%]">
        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-ink">
          Khám phá vẻ đẹp Việt phục, phối theo cách của bạn
        </h1>
        <p className="mt-4 text-base md:text-lg text-ink-soft leading-relaxed">
          Chọn trang phục, phối màu và phụ kiện — xem gợi ý có hợp tông, có đúng nếp văn hoá hay không,
          rồi lưu lại thành lookbook của riêng bạn.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/phoi-do"
            className="inline-block bg-lacquer text-white font-medium px-6 py-3 rounded-md hover:opacity-90 transition"
          >
            Phối đồ ngay
          </Link>
          <Link
            href="/van-hoa"
            className="inline-block border border-ink-soft/40 bg-paper/70 text-ink font-medium px-6 py-3 rounded-md hover:border-gold transition"
          >
            Tìm hiểu văn hoá
          </Link>
        </div>
      </div>
    </section>
  );
}