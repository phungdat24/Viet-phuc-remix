/**
 * QUY ƯỚC comboKey (dùng cho bảng ToHopDuocDuyet, Lớp C4 — sinh ảnh AI + duyệt).
 *
 * comboKey là khoá DUY NHẤT (unique) định danh 1 tổ hợp phối đồ, dùng để:
 *  1. Tránh gọi lại Gemini image API nhiều lần cho cùng 1 tổ hợp (idempotent) —
 *     mỗi lượt gọi ảnh có chi phí, nên trước khi sinh ảnh LUÔN kiểm tra
 *     comboKey đã tồn tại trong DB chưa.
 *  2. Cho phép tra cứu nhanh 1 tổ hợp bất kỳ mà không cần join nhiều bảng.
 *
 * ĐỊNH DẠNG:
 *   `${trangPhucId}:${mauChinhId}:${mauPhuId}:${phuKienId}:${suKienId}`
 *
 * Quy tắc:
 *  - Đúng 5 thành phần, đúng thứ tự trên (KHÔNG sắp xếp lại/sort — mauChinh và
 *    mauPhu có vai trò khác nhau nên thứ tự có ý nghĩa, đổi chỗ 2 màu là 1
 *    tổ hợp khác).
 *  - Nối bằng dấu hai chấm ":" — id trong hệ thống là uuid (Prisma
 *    @default(uuid())) nên không bao giờ chứa ký tự ":", tránh được đụng độ.
 *  - Cả 5 trường đều BẮT BUỘC (khớp schema Prisma: trangPhucId, mauChinhId,
 *    mauPhuId, phuKienId, suKienId trong ToHopDuocDuyet đều NOT NULL).
 *    + "Không chọn phụ kiện" vẫn được sinh ảnh AI: phuKienId khi đó là hằng
 *      PHU_KIEN_KHONG_CHON (không cần đổi schema vì cột này không có khoá ngoại).
 *    + "Chưa chọn dịp": giao diện tự bốc ngẫu nhiên 1 dịp trong danh mục rồi
 *      truyền suKienId thật vào đây, nên suKienId luôn là id hợp lệ.
 *  - danhGiaMauId KHÔNG nằm trong comboKey: đây là kết quả tra cứu suy ra từ
 *    (mauChinhId, mauPhuId), không phải lựa chọn độc lập của người dùng, nên
 *    không cần thiết để định danh tổ hợp.
 *
 * VÍ DỤ:
 *   taoComboKey({
 *     trangPhucId: "a1..", mauChinhId: "b2..", mauPhuId: "c3..",
 *     phuKienId: "d4..", suKienId: "e5..",
 *   })
 *   // => "a1..:b2..:c3..:d4..:e5.."
 */

/** Giá trị phuKienId lưu trong DB khi người dùng KHÔNG chọn phụ kiện. */
export const PHU_KIEN_KHONG_CHON = "khong-phu-kien";

export interface ThanhPhanComboKey {
  trangPhucId: string;
  mauChinhId: string;
  mauPhuId: string;
  phuKienId: string;
  suKienId: string;
}

const DELIMITER = ":";

/** Tạo comboKey từ 5 thành phần bắt buộc. Ném lỗi nếu thiếu trường nào. */
export function taoComboKey(input: ThanhPhanComboKey): string {
  const thuTu: (keyof ThanhPhanComboKey)[] = [
    "trangPhucId",
    "mauChinhId",
    "mauPhuId",
    "phuKienId",
    "suKienId",
  ];

  for (const key of thuTu) {
    const gia_tri = input[key];
    if (typeof gia_tri !== "string" || gia_tri.length === 0) {
      throw new Error(`taoComboKey: thiếu hoặc sai kiểu dữ liệu cho "${key}".`);
    }
    if (gia_tri.includes(DELIMITER)) {
      // Không nên xảy ra với uuid, nhưng chặn sớm để tránh comboKey sai lệch.
      throw new Error(`taoComboKey: "${key}" chứa ký tự "${DELIMITER}" không hợp lệ.`);
    }
  }

  return thuTu.map((key) => input[key]).join(DELIMITER);
}

/** Giải mã comboKey ngược lại thành 5 thành phần. Ném lỗi nếu sai định dạng. */
export function giaiMaComboKey(comboKey: string): ThanhPhanComboKey {
  const phan = comboKey.split(DELIMITER);
  if (phan.length !== 5) {
    throw new Error(`giaiMaComboKey: comboKey "${comboKey}" không đúng định dạng (cần đúng 5 thành phần).`);
  }
  const [trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId] = phan;
  return { trangPhucId, mauChinhId, mauPhuId, phuKienId, suKienId };
}
