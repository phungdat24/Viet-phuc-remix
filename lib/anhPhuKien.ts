import { chuanHoaTenPhuKien } from '@/lib/phuKienTheoTrangPhuc';

/**
 * Bảng tra: tên phụ kiện (khớp cột `ten` trong DB) -> ảnh trong public/images/phu-kien/.
 * Món nhiều màu chỉ dùng ảnh màu phổ biến nhất; các màu còn lại để dành cho giai đoạn sau.
 * Món chưa có ảnh (Trâm cài, Guốc mộc) thì không khai báo ở đây, giao diện sẽ hiện ký hiệu thay thế.
 */
const ANH_PHU_KIEN: Record<string, string> = {
  'Nón lá': '/images/phu-kien/non-la.webp',
  'Nón quai thao': '/images/phu-kien/non-quai-thao.webp',
  'Khăn đóng': '/images/phu-kien/khan-dong-den.webp',
  'Khăn mỏ quạ': '/images/phu-kien/khan-mo-qua-den.webp',
  'Khăn rằn': '/images/phu-kien/khan-ran-den.webp',
  'Quạt giấy': '/images/phu-kien/quat-giay-vang.webp',
  'Yếm đào': '/images/phu-kien/yem-dao-hong.webp',
  'Trâm cài': '/images/phu-kien/tram-cai.webp',
  'Guốc mộc': '/images/phu-kien/guoc-moc.webp',
};~

// Chuẩn hoá Unicode NFC một lần để so khớp không bị lỗi gõ dấu khác kiểu.
const BANG_TRA = new Map(
  Object.entries(ANH_PHU_KIEN).map(([ten, duongDan]) => [chuanHoaTenPhuKien(ten), duongDan]),
);

/** Đường dẫn ảnh của phụ kiện, hoặc null nếu chưa có ảnh. */
export function layAnhPhuKien(ten: string): string | null {
  return BANG_TRA.get(chuanHoaTenPhuKien(ten)) ?? null;
}