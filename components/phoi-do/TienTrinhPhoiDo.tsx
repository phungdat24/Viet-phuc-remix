interface Props {
  daChonTrangPhuc: boolean;
  daChonMau: boolean;
  daCoKetQua: boolean;
}

const BUOC = [
  { so: 1, ten: 'Trang phục & dịp' },
  { so: 2, ten: 'Màu & phụ kiện' },
  { so: 3, ten: 'Kết quả & lưu' },
];

/** Thanh tiến trình 3 bước: cho người dùng biết đang ở đâu và bước tiếp theo là gì. */
export default function TienTrinhPhoiDo({ daChonTrangPhuc, daChonMau, daCoKetQua }: Props) {
  const xong = [daChonTrangPhuc, daChonMau, daCoKetQua];
  const buocHienTai = xong.findIndex((x) => !x); // -1 = đã xong cả 3

  const goiY =
    buocHienTai === 0
      ? 'Bắt đầu bằng việc chọn một trang phục. Dịp sử dụng có thể chọn sau.'
      : buocHienTai === 1
        ? 'Chọn màu chính và màu phụ. Phụ kiện là tuỳ chọn.'
        : buocHienTai === 2
          ? 'Đã đủ thông tin. Bấm "Xem kết quả phối đồ" để được thẩm định.'
          : 'Xong rồi! Lưu vào Lookbook hoặc chia sẻ bộ phối này.';

  return (
    <div className="mb-3 shrink-0">
      <ol className="flex items-center gap-2" aria-label="Các bước phối đồ">
        {BUOC.map((b, i) => {
          const hoanThanh = xong[i];
          const dangLam = i === buocHienTai;
          return (
            <li
              key={b.so}
              aria-current={dangLam ? 'step' : undefined}
              className={`flex flex-1 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition ${
                dangLam
                  ? 'border-lacquer bg-lacquer/10 font-medium text-ink'
                  : hoanThanh
                    ? 'border-jade/40 bg-jade/10 text-ink'
                    : 'border-ink-soft/20 text-ink-soft'
              }`}
            >
              <span
                aria-hidden
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  hoanThanh ? 'bg-jade text-white' : dangLam ? 'bg-lacquer text-white' : 'bg-ink-soft/20 text-ink-soft'
                }`}
              >
                {hoanThanh ? '✓' : b.so}
              </span>
              <span className="truncate">
                {b.ten}
                {hoanThanh && <span className="sr-only"> (đã xong)</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-xs text-ink-soft" aria-live="polite">
        {goiY}
      </p>
    </div>
  );
}
