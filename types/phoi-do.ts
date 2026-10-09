export interface TrangPhuc {
  id: string;
  ten: string;
  vungMien: string;
  doiTuong: string;
}

export interface SuKien {
  id: string;
  ten: string;
}

export interface MauSac {
  id: string;
  ten: string;
  maHex: string;
  gocHue: number;
  laTrungTinh: boolean;
}

export interface PhuKien {
  id: string;
  ten: string;
  vungMien: string;
}
export interface KetQuaHaiHoaMau {
  mucDo: 'tuong_dong' | 'bo_tuc' | 'trung_tinh' | 'lech_tong';
  goiY: string;
  /** Lý do ngắn vì sao ra mức này (không có ở bộ phối đã lưu từ trước). */
  lyDo?: string;
  khoangCachHue: number;
}

/** Mức độ phù hợp văn hoá (khớp với lib/rules/quyTacVanHoa.ts). */
export type MucDoVanHoa =
  | 'phu_hop'
  | 'khong_phu_hop'
  | 'tuy_dip'
  | 'chua_co_du_lieu'
  | 'khong_co_phu_kien';

export type NguonQuyTac = 'rieng_theo_su_kien' | 'chung' | 'khong_co';

/** Kết quả riêng cho từng phụ kiện. */
export interface KetQuaVanHoaMotPhuKien {
  phuKien: { id: string; ten: string };
  mucDo: MucDoVanHoa;
  lyDo: string | null;
  nguonQuyTac: NguonQuyTac;
}

export interface KetQuaPhuHopVanHoa {
  canhBao: boolean;
  mucDo: MucDoVanHoa;
  lyDo: string | null;
  canChonDip: boolean;
  goiYThayThe: string[];
  // Các trường dưới đây là tuỳ chọn vì bộ phối đã lưu trong Lookbook từ trước không có.
  nguonQuyTac?: NguonQuyTac;
  trangPhuc?: { id: string; ten: string };
  phuKien?: { id: string; ten: string } | null;
  cacPhuKien?: { id: string; ten: string }[];
  chiTietPhuKien?: KetQuaVanHoaMotPhuKien[];
}

export interface KetQuaKiemTra {
  haiHoaMau: KetQuaHaiHoaMau;
  phuHopVanHoa: KetQuaPhuHopVanHoa;
}

/** Một quy tắc (trang phục + phụ kiện [+ dịp]) do GET /api/quy-tac-van-hoa trả về. */
export interface QuyTacVanHoa {
  phuKienId: string;
  /** null = quy tắc chung (áp dụng mọi dịp). */
  suKienId: string | null;
  mucDo: 'phu_hop' | 'khong_phu_hop' | 'tuy_dip';
  ghiChu: string | null;
}

/** Bản ghi tổ hợp đã sinh ảnh AI (bảng ToHopDuocDuyet) — phần client cần dùng. */
export interface ToHopAI {
  id: string;
  comboKey: string;
  imageUrl: string | null;
  /** 'draft' = chờ duyệt, 'approved' = đã duyệt, 'rejected' = không duyệt */
  status: string;
  aiAssessment: { nhanXetAI: string | null } | null;
}