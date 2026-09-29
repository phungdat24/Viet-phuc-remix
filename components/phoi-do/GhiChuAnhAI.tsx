/**
 * Chú thích đặt ngay dưới MỌI ảnh do AI sinh (trang Thử nghiệm + Lookbook).
 * Dùng chung một chỗ để câu chữ không bị lệch giữa các màn hình.
 */
export default function GhiChuAnhAI({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <p className="text-xs text-ink-soft">AI tạo ảnh</p>
      <p className="text-xs font-bold text-ink">Chú ý: tất cả đều là ảnh AI.</p>
    </div>
  );
}
