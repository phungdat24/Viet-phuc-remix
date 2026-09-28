/**
 * Tiện ích xử lý màu sắc cho Lớp 2 (hài hòa màu, công thức HSL).
 */

export type HSL = { h: number; s: number; l: number };

/** Chuyển mã hex (#rrggbb hoặc rrggbb) sang HSL (h: 0-360, s/l: 0-100). */
export function hexToHsl(hex: string): HSL {
  const clean = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    throw new Error(`Mã màu hex không hợp lệ: "${hex}"`);
  }

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h * 100) / 100,
    s: Math.round(s * 1000) / 10,
    l: Math.round(l * 1000) / 10,
  };
}

/** Khoảng cách góc Hue ngắn nhất trên vòng tròn màu (0-180 độ). */
export function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export type NhomHaiHoa =
  | "TRUNG_TINH" // 1 trong 2 màu là màu trung tính (đen/trắng/be/xám...) -> luôn phối được
  | "DONG_SAC" // Monochromatic: cùng tông
  | "TUONG_DONG" // Analogous: các tông màu liền kề nhau
  | "TAM_GIAC" // Triadic: cách nhau ~120 độ
  | "BO_TUC" // Complementary: đối nhau ~180 độ
  | "CHOI_MAU"; // không rơi vào quy tắc phối màu phổ thông nào

export type MucDoHaiHoa = "hai_hoa" | "trung_binh" | "choi_mau";

export interface KetQuaHaiHoaMau {
  gocHue1: number;
  gocHue2: number;
  khoangCachHue: number;
  nhom: NhomHaiHoa;
  mucDo: MucDoHaiHoa;
  diemHaiHoa: number; // 0-100, để dễ sắp xếp/so sánh giữa nhiều tổ hợp
  giaiThich: string;
}

/**
 * Phân loại độ hài hòa giữa 2 màu dựa trên công thức khoảng cách góc Hue (HSL).
 * Bộ quy tắc phổ thông: Monochromatic / Analogous / Triadic / Complementary.
 */
export function phanLoaiHaiHoaMau(
  hue1: number,
  hue2: number,
  options?: { laTrungTinh1?: boolean; laTrungTinh2?: boolean }
): KetQuaHaiHoaMau {
  const khoangCach = hueDistance(hue1, hue2);

  if (options?.laTrungTinh1 || options?.laTrungTinh2) {
    return {
      gocHue1: hue1,
      gocHue2: hue2,
      khoangCachHue: khoangCach,
      nhom: "TRUNG_TINH",
      mucDo: "hai_hoa",
      diemHaiHoa: 95,
      giaiThich:
        "Có màu trung tính (trắng/đen/be/xám...) nên phối được với hầu hết các màu khác.",
    };
  }

  // Monochromatic: cùng tông màu (chênh lệch rất nhỏ)
  if (khoangCach <= 15) {
    return {
      gocHue1: hue1,
      gocHue2: hue2,
      khoangCachHue: khoangCach,
      nhom: "DONG_SAC",
      mucDo: "hai_hoa",
      diemHaiHoa: 90,
      giaiThich: "Hai màu cùng tông (đồng sắc), phối an toàn, tạo cảm giác nhẹ nhàng, thanh lịch.",
    };
  }

  // Analogous: các tông liền kề nhau trên vòng thuần sắc
  if (khoangCach <= 45) {
    return {
      gocHue1: hue1,
      gocHue2: hue2,
      khoangCachHue: khoangCach,
      nhom: "TUONG_DONG",
      mucDo: "hai_hoa",
      diemHaiHoa: 85,
      giaiThich:
        "Hai màu tương đồng (liền kề trên vòng thuần sắc), hài hòa tự nhiên, gần với phối màu truyền thống.",
    };
  }

  // Triadic: cách nhau khoảng 120 độ (cho phép sai số ±15)
  if (Math.abs(khoangCach - 120) <= 15) {
    return {
      gocHue1: hue1,
      gocHue2: hue2,
      khoangCachHue: khoangCach,
      nhom: "TAM_GIAC",
      mucDo: "hai_hoa",
      diemHaiHoa: 75,
      giaiThich:
        "Hai màu tạo phối tam giác (~120 độ), nổi bật, tươi trẻ, hợp phong cách Gen Z remix.",
    };
  }

  // Complementary: đối nhau khoảng 180 độ (cho phép sai số ±30)
  if (khoangCach >= 150) {
    return {
      gocHue1: hue1,
      gocHue2: hue2,
      khoangCachHue: khoangCach,
      nhom: "BO_TUC",
      mucDo: "trung_binh",
      diemHaiHoa: 65,
      giaiThich:
        "Hai màu bổ túc (gần như đối nhau trên vòng thuần sắc), tương phản mạnh, nổi bật nhưng cần phối tỉ lệ diện tích hợp lý (1 màu chủ đạo, 1 màu điểm nhấn).",
    };
  }

  // Còn lại: không rơi vào quy tắc phối màu phổ thông nào -> dễ chỏi màu
  return {
    gocHue1: hue1,
    gocHue2: hue2,
    khoangCachHue: khoangCach,
    nhom: "CHOI_MAU",
    mucDo: "choi_mau",
    diemHaiHoa: 35,
    giaiThich:
      "Khoảng cách góc Hue không khớp quy tắc phối màu phổ thông nào (đồng sắc/tương đồng/tam giác/bổ túc), dễ bị chỏi màu. Nên cân nhắc đổi 1 trong 2 màu hoặc thêm màu trung tính để trung hòa.",
  };
}
