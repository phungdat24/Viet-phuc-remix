import type { MucDoVanHoa, PhuKien, QuyTacVanHoa } from '@/types/phoi-do';
import { layNhomCuaPhuKien } from '@/lib/phuKienTheoTrangPhuc';

/**
 * Tính mức độ văn hoá của MỘT phụ kiện từ danh sách quy tắc đã tải (chỉ để hiện nhanh ở giao diện).
 * Cùng thứ tự ưu tiên với server: quy tắc riêng theo dịp -> quy tắc chung -> chưa có dữ liệu.
 * Kết quả thẩm định cuối cùng vẫn do POST /api/kiem-tra-phoi-do quyết định.
 */
export function tinhMucDoMotMon(
  quyTacs: QuyTacVanHoa[],
  phuKienId: string,
  suKienId: string | null,
): { mucDo: MucDoVanHoa; lyDo: string | null; rieng: boolean } {
  const rieng = suKienId
    ? quyTacs.find((q) => q.phuKienId === phuKienId && q.suKienId === suKienId)
    : undefined;
  const quyTac = rieng ?? quyTacs.find((q) => q.phuKienId === phuKienId && q.suKienId === null);
  if (!quyTac) return { mucDo: 'chua_co_du_lieu', lyDo: null, rieng: false };
  return { mucDo: quyTac.mucDo, lyDo: quyTac.ghiChu, rieng: Boolean(rieng) };
}

/**
 * Món thay thế hợp lý: chỉ trong nhóm "chọn 1" (Nón, Khăn) và chỉ món được đánh giá "phu_hop".
 * Chọn món mới thì món cũ tự bị bỏ nhờ quy tắc chiChonMot.
 */
export function timMonThayThe(
  quyTacs: QuyTacVanHoa[],
  phuKien: PhuKien,
  tatCa: PhuKien[],
  suKienId: string | null,
): PhuKien[] {
  const nhom = layNhomCuaPhuKien(phuKien.ten);
  if (!nhom?.chiChonMot) return [];
  return tatCa.filter(
    (p) =>
      p.id !== phuKien.id &&
      layNhomCuaPhuKien(p.ten)?.ten === nhom.ten &&
      tinhMucDoMotMon(quyTacs, p.id, suKienId).mucDo === 'phu_hop',
  );
}