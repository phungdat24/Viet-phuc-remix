export interface ThoiTiet {
  nhietDo: number;
  camGiac: number;
  doAm: number;
  luongMua: number;
  maThoiTiet: number;
  tocDoGio: number;
  thoiGian: string;
}

export interface GoiYThoiTiet {
  tieuDe: string;
  lyDo: string;
  tenTrangPhuc: string;
  tenMauChinh: string;
  tenMauPhu: string;
  tenCacPhuKien: string[];
}

/** Mô tả ngắn bằng tiếng Việt theo mã thời tiết WMO của Open-Meteo. */
export function moTaThoiTiet(ma: number): string {
  if (ma === 0) return 'Trời quang';
  if (ma === 1) return 'Gần như quang mây';
  if (ma === 2) return 'Có mây rải rác';
  if (ma === 3) return 'Nhiều mây';
  if (ma === 45 || ma === 48) return 'Có sương mù';
  if (ma >= 51 && ma <= 57) return 'Mưa phùn';
  if (ma >= 61 && ma <= 67) return 'Có mưa';
  if (ma >= 80 && ma <= 82) return 'Mưa rào';
  if (ma >= 95) return 'Có dông';
  return 'Thời tiết thay đổi';
}

export function coMua(tt: ThoiTiet): boolean {
  const ma = tt.maThoiTiet;
  return (
    (ma >= 51 && ma <= 67) || (ma >= 80 && ma <= 82) || ma >= 95 || tt.luongMua > 0.1
  );
}

/**
 * Gợi ý trang phục theo thời tiết (dựa trên nhiệt độ CẢM GIÁC, sát trải nghiệm hơn nhiệt độ thực).
 * BẢN NHÁP: cần nhóm rà soát cùng nội dung E1.
 */
export function goiYTheoThoiTiet(tt: ThoiTiet): GoiYThoiTiet {
  const nhiet = tt.camGiac;

  if (coMua(tt)) {
    if (nhiet >= 22) {
      return {
        tieuDe: 'Trời đang mưa',
        lyDo: 'Áo bà ba may bằng vải mềm, thoáng, xẻ tà hai bên nên gọn và dễ chịu khi trời ẩm; thêm nón lá che mưa nhẹ.',
        tenTrangPhuc: 'Áo bà ba',
        tenMauChinh: 'Lục ngọc',
        tenMauPhu: 'Đen huyền',
        tenCacPhuKien: ['Nón lá'],
      };
    }
    return {
      tieuDe: 'Trời mưa và se lạnh',
      lyDo: 'Áo tứ thân nhiều lớp (yếm, áo, váy) giữ ấm tốt hơn; tông nâu và đen ít lộ vết ẩm; kèm nón lá che mưa.',
      tenTrangPhuc: 'Áo tứ thân',
      tenMauChinh: 'Nâu non',
      tenMauPhu: 'Đen huyền',
      tenCacPhuKien: ['Nón lá'],
    };
  }

  if (nhiet >= 33) {
    return {
      tieuDe: 'Trời nóng',
      lyDo: 'Áo bà ba không cổ, vải mềm, xẻ tà thoáng; chọn màu sáng để đỡ hấp nhiệt, mang theo nón lá và quạt giấy.',
      tenTrangPhuc: 'Áo bà ba',
      tenMauChinh: 'Trắng ngà',
      tenMauPhu: 'Đen huyền',
      tenCacPhuKien: ['Nón lá', 'Quạt giấy'],
    };
  }
  if (nhiet >= 28) {
    return {
      tieuDe: 'Trời ấm',
      lyDo: 'Áo dài lụa mỏng tông hồng nhạt hợp ngày ấm; kèm nón lá che nắng khi dạo phố.',
      tenTrangPhuc: 'Áo dài',
      tenMauChinh: 'Hồng đào',
      tenMauPhu: 'Trắng ngà',
      tenCacPhuKien: ['Nón lá'],
    };
  }
  if (nhiet >= 22) {
    return {
      tieuDe: 'Thời tiết mát mẻ',
      lyDo: 'Nhiệt độ dễ chịu, hợp áo dài tay chẽn tông lam chàm trang nhã cho một ngày dạo phố nhẹ nhàng.',
      tenTrangPhuc: 'Áo dài',
      tenMauChinh: 'Lam chàm',
      tenMauPhu: 'Trắng ngà',
      tenCacPhuKien: ['Trâm cài', 'Quạt giấy'],
    };
  }
  if (nhiet >= 16) {
    return {
      tieuDe: 'Trời se lạnh',
      lyDo: 'Áo tứ thân nhiều lớp (yếm đào bên trong, áo, váy) vừa ấm vừa duyên dáng; tông nâu và đen ấm áp.',
      tenTrangPhuc: 'Áo tứ thân',
      tenMauChinh: 'Nâu non',
      tenMauPhu: 'Đen huyền',
      tenCacPhuKien: ['Khăn mỏ quạ', 'Yếm đào'],
    };
  }
  return {
    tieuDe: 'Trời lạnh',
    lyDo: 'Áo tứ thân tông lam chàm đậm, mặc thêm lớp áo ấm bên trong; khăn mỏ quạ giúp giữ ấm vùng đầu.',
    tenTrangPhuc: 'Áo tứ thân',
    tenMauChinh: 'Lam chàm',
    tenMauPhu: 'Đen huyền',
    tenCacPhuKien: ['Khăn mỏ quạ'],
  };
}