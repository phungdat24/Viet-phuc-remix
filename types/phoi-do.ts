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
  khoangCachHue: number;
}

export interface KetQuaPhuHopVanHoa {
  canhBao: boolean;
  mucDo: 'phu_hop' | 'khong_phu_hop' | 'tuy_dip' | 'chua_co_du_lieu' | 'khong_co_phu_kien';
  lyDo: string | null;
  canChonDip: boolean;
  goiYThayThe: string[];
}

export interface KetQuaKiemTra {
  haiHoaMau: KetQuaHaiHoaMau;
  phuHopVanHoa: KetQuaPhuHopVanHoa;
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
