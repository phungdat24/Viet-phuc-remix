import type { Metadata } from 'next';
import Link from 'next/link';
import DongThoiGian from '@/components/van-hoa/DongThoiGian';
import BangSoSanh from '@/components/van-hoa/BangSoSanh';
import ThuVienVanHoa from '@/components/van-hoa/ThuVienVanHoa';
import DoVuiVanHoa from '@/components/van-hoa/DoVuiVanHoa';
import { CAC_MUC, NHAN_TRANG_THAI, NHAN_LOAI_NGUON } from '@/lib/vanHoa/duLieu';

export const metadata: Metadata = {
  title: 'Khám phá văn hoá Việt phục — Việt Phục Studio',
  description:
    'Dòng thời gian, thư viện trang phục và phụ kiện truyền thống Việt Nam, có dẫn nguồn và ghi rõ chỗ còn tranh luận.',
};

const TIEU_DE_MUC = 'font-display text-2xl font-semibold text-ink';

export default function TrangVanHoa() {
  const soTrangPhuc = CAC_MUC.filter((m) => m.nhom === 'trang-phuc').length;
  const soPhuKien = CAC_MUC.filter((m) => m.nhom === 'phu-kien').length;
  const soChuaKiemChung = CAC_MUC.filter((m) => m.trangThai === 'chua-kiem-chung').length;

  return (
    <main className="mx-auto max-w-5xl space-y-14 px-4 py-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">Khám phá văn hoá</p>
        <h1 className="mt-1 font-display text-3xl font-semibold leading-tight md:text-4xl">
          Việt phục không chỉ có ba bộ
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">
          Tính năng phối đồ chọn ba bộ dễ hình dung nhất. Nhưng câu chuyện trang phục Việt dài hơn nhiều: từ chiếc áo
          giao lĩnh trong tranh thời Trần đến áo dài hippy năm 1968. Ở đây có {soTrangPhuc} trang phục và {soPhuKien}{' '}
          phụ kiện. Mỗi ý đều có số nguồn đi kèm, chỗ các tài liệu còn khác nhau được ghi rõ, và mục nào chưa kiểm chứng được sẽ bị gắn cảnh báo đỏ.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a href="#thu-vien" className="rounded-md bg-lacquer px-5 py-2.5 font-medium text-white hover:opacity-90">
            Vào thư viện
          </a>
          <Link href="/phoi-do" className="rounded-md border border-ink-soft/30 px-5 py-2.5 font-medium hover:border-gold">
            Sang phần phối đồ
          </Link>
        </div>
      </header>

      <section aria-labelledby="h-thoi-gian">
        <h2 id="h-thoi-gian" className={TIEU_DE_MUC}>
          Dòng thời gian: trang phục cũng có lịch sử của quyền lực và giao thoa
        </h2>
        <p className="mb-6 mt-1 text-sm text-ink-soft">
          Các mốc dưới đây dựa trên các nguồn công bố. Mốc nào các nguồn ghi khác nhau đều được đánh dấu.
        </p>
        <DongThoiGian />
      </section>

      <section aria-labelledby="h-so-sanh">
        <h2 id="h-so-sanh" className={TIEU_DE_MUC}>
          So sánh nhanh năm kiểu áo
        </h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">Nhận ra sự khác biệt trước khi phối: cùng là &ldquo;áo dài&rdquo; nhưng không giống nhau.</p>
        <BangSoSanh />
      </section>

      <section id="thu-vien" aria-labelledby="h-thu-vien" className="scroll-mt-6">
        <h2 id="h-thu-vien" className={TIEU_DE_MUC}>
          Thư viện trang phục và phụ kiện
        </h2>
        <p className="mb-5 mt-1 text-sm text-ink-soft">
          Mục có nhãn &ldquo;Có trong phối đồ&rdquo; có thể bấm sang phối thử ngay; các mục còn lại chỉ để tìm hiểu. Khung đỏ là mục chưa kiểm chứng được nguồn.
        </p>
        <ThuVienVanHoa />
      </section>

      <section aria-labelledby="h-do-vui">
        <h2 id="h-do-vui" className={TIEU_DE_MUC}>
          Đố vui: bạn nhớ được bao nhiêu?
        </h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft">6 câu hỏi từ chính nội dung phía trên, có giải thích sau mỗi câu.</p>
        <DoVuiVanHoa />
      </section>

      <section aria-labelledby="h-nguon" className="rounded-md border border-ink-soft/15 bg-paper-raised p-5">
        <h2 id="h-nguon" className="font-display text-xl font-semibold text-ink">
          Chúng tôi bảo đảm thông tin văn hoá như thế nào?
        </h2>
        <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
          <li>
            <strong className="text-ink">1. Dẫn nguồn theo từng ý.</strong> Sau mỗi ý có số nguồn dạng [1][2], bấm vào là
            tới đúng nguồn trong danh sách cuối trang. Nguồn được gắn nhãn{' '}
            {Object.values(NHAN_LOAI_NGUON).join(', ').toLowerCase()}; nguồn học thuật, bảo tàng và báo chí chính thống
            được ưu tiên hơn nguồn phổ thông.
          </li>
          <li>
            <strong className="text-ink">2. Tách sự kiện lịch sử với cách lý giải biểu tượng.</strong> Niên đại và cấu tạo
            là một chuyện; “năm khuy tượng trưng cho điều gì” là cách lý giải văn hoá. Hai loại này được trình bày ở hai
            phần riêng.
          </li>
          <li>
            <strong className="text-ink">3. Ba nhãn xác minh.</strong>
            <span className="mt-2 flex flex-wrap gap-2">
              {Object.values(NHAN_TRANG_THAI).map((t) => (
                <span key={t.ten} className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${t.mau}`}>
                  {t.ten}
                </span>
              ))}
            </span>
            <span className="mt-2 block">
              {Object.values(NHAN_TRANG_THAI)
                .map((t) => `“${t.ten.replace('⚠ ', '')}”: ${t.moTa}`)
                .join(' ')}
            </span>
          </li>
          <li>
            <strong className="text-ink">4. Chưa có nguồn thì không viết thêm.</strong> Mục nào chưa có nguồn kiểm chứng sẽ
            bị gắn cảnh báo đỏ và chỉ giữ thông tin sơ bộ; phần nào chưa có nguồn đáng tin thì để trống chứ không suy đoán.
            Hiện có {soChuaKiemChung} mục như vậy. Đố vui cũng không hỏi về các mục này.
          </li>
          <li>
            <strong className="text-ink">5. Ảnh AI chỉ là minh hoạ.</strong> Mọi ảnh do AI vẽ trong phần phối đồ đều gắn
            nhãn rõ và không thay thế tài liệu.
          </li>
        </ul>
      </section>
    </main>
  );
}
