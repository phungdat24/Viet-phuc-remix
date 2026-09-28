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