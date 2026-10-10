import type { KetQuaKiemTra, MauSac, PhuKien, SuKien, TrangPhuc } from '@/types/phoi-do';
import { taoLinkChiaSe, taoNoiDungChiaSe } from '@/lib/chiaSe';
import { mucVanHoaDeHienThi } from '@/lib/canhBaoVanHoa';

/** Ngăn so sánh giữ tối đa 2 bộ (Bộ A, Bộ B). */
export const TOI_DA_BO_SO_SANH = 2;

/** Dịp dùng để lấy ảnh AI khi chưa chọn dịp — phải khớp TEN_DIP_MAC_DINH trong ThuNghiemPhoiDoClient. */
export const TEN_DIP_MAC_DINH = 'Tết';

const TOI_DA_PHU_KIEN = 10;
const KEY = 'viet-phuc-remix-so-sanh';
/** Phát khi ngăn so sánh đổi để các component cập nhật ngay, không cần tải lại trang. */
export const SU_KIEN_SO_SANH = 'viet-phuc-so-sanh-doi';

/** Một bộ phối được chụp lại để so sánh (chỉ lưu id; tên/màu tra lại từ danh mục khi hiển thị). */
export interface BoSoSanh {
  id: string;
  trangPhucId: string;
  mauChinhId: string;
  mauPhuId: string;
  phuKienIds: string[];
  /** Dịp do người dùng chọn lúc thêm (null = chưa chọn). Trang so sánh dùng 1 dịp chung cho cả hai bộ. */
  suKienId: string | null;
  taoLuc: number;
}

export type BoMoi = Omit<BoSoSanh, 'id' | 'taoLuc'>;

// ---------- Lưu trữ (localStorage) ----------

function phatSuKien(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(SU_KIEN_SO_SANH));
}

function hopLe(x: unknown): x is BoSoSanh {
  if (!x || typeof x !== 'object') return false;
  const b = x as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    typeof b.trangPhucId === 'string' &&
    typeof b.mauChinhId === 'string' &&
    typeof b.mauPhuId === 'string' &&
    Array.isArray(b.phuKienIds) &&
    b.phuKienIds.every((i) => typeof i === 'string') &&
    (b.suKienId === null || typeof b.suKienId === 'string')
  );
}

export function docNgan(): BoSoSanh[] {
  try {
    const raw = localStorage.getItem(KEY);
    const ds: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(ds) ? ds.filter(hopLe).slice(0, TOI_DA_BO_SO_SANH) : [];
  } catch {
    return [];
  }
}

function ghiNgan(ds: BoSoSanh[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ds));
  } catch {
    // Trình duyệt chặn lưu trữ (chế độ riêng tư...): bỏ qua, ngăn sẽ trống ở lần sau.
  }
  phatSuKien();
}

/** Khoá nhận diện một bộ, KHÔNG phụ thuộc thứ tự phụ kiện và dịp. */
export function khoaBo(b: Pick<BoSoSanh, 'trangPhucId' | 'mauChinhId' | 'mauPhuId' | 'phuKienIds'>): string {
  return [b.trangPhucId, b.mauChinhId, b.mauPhuId, [...b.phuKienIds].sort().join('+')].join('|');
}

export type KetQuaThem = { ok: true; bo: BoSoSanh } | { ok: false; lyDo: 'day' | 'trung' };

export function themBo(moi: BoMoi): KetQuaThem {
  const ds = docNgan();
  if (ds.some((b) => khoaBo(b) === khoaBo(moi))) return { ok: false, lyDo: 'trung' };
  if (ds.length >= TOI_DA_BO_SO_SANH) return { ok: false, lyDo: 'day' };
  const bo: BoSoSanh = { ...moi, id: crypto.randomUUID(), taoLuc: Date.now() };
  ghiNgan([...ds, bo]);
  return { ok: true, bo };
}

export function xoaBo(id: string): void {
  ghiNgan(docNgan().filter((b) => b.id !== id));
}

export function thayBo(id: string, capNhat: Partial<BoMoi>): void {
  ghiNgan(docNgan().map((b) => (b.id === id ? { ...b, ...capNhat } : b)));
}

export function xoaHetNgan(): void {
  ghiNgan([]);
}

/** Thay toàn bộ ngăn bằng các bộ mới (dùng khi mở link so sánh được chia sẻ). Bỏ bộ trùng, tối đa 2 bộ. */
export function datNgan(cacBo: BoMoi[]): BoSoSanh[] {
  const ketQua: BoSoSanh[] = [];
  for (const moi of cacBo) {
    if (ketQua.length >= TOI_DA_BO_SO_SANH) break;
    if (ketQua.some((b) => khoaBo(b) === khoaBo(moi))) continue;
    ketQua.push({ ...moi, id: crypto.randomUUID(), taoLuc: Date.now() });
  }
  ghiNgan(ketQua);
  return ketQua;
}

// ---------- Link so sánh ----------

const TIEN_TO_BO = ['a', 'b'] as const;

/**
 * Link tuyệt đối tới trang so sánh: /phoi-do/so-sanh?aTp=..&aMc=..&aMp=..&aPk=x,y&bTp=...&dip=..
 * Chỉ gọi ở trình duyệt. `suKienId` chỉ nên là dịp do NGƯỜI DÙNG chọn (null nếu chưa chọn).
 * Trả '' nếu không có bộ nào.
 */
export function taoLinkSoSanh(
  cacBo: Pick<BoSoSanh, 'trangPhucId' | 'mauChinhId' | 'mauPhuId' | 'phuKienIds'>[],
  suKienId: string | null,
): string {
  if (typeof window === 'undefined' || cacBo.length === 0) return '';
  const p = new URLSearchParams();
  cacBo.slice(0, TOI_DA_BO_SO_SANH).forEach((bo, i) => {
    const t = TIEN_TO_BO[i];
    p.set(`${t}Tp`, bo.trangPhucId);
    p.set(`${t}Mc`, bo.mauChinhId);
    p.set(`${t}Mp`, bo.mauPhuId);
    if (bo.phuKienIds.length > 0) p.set(`${t}Pk`, bo.phuKienIds.join(','));
  });
  if (suKienId) p.set('dip', suKienId);
  return `${window.location.origin}/phoi-do/so-sanh?${p.toString().replace(/%2C/g, ',')}`;
}

/** Đọc các bộ từ URL của trang so sánh. null = URL không có bộ hợp lệ nào. */
export function docSoSanhTuUrl(params: URLSearchParams): { cacBo: BoMoi[]; suKienId: string | null } | null {
  const suKienId = params.get('dip') || null;
  const cacBo: BoMoi[] = [];
  for (const t of TIEN_TO_BO) {
    const tp = params.get(`${t}Tp`);
    const mc = params.get(`${t}Mc`);
    const mp = params.get(`${t}Mp`);
    if (!tp || !mc || !mp) continue;
    const pk = (params.get(`${t}Pk`) ?? '').split(',').filter(Boolean).slice(0, TOI_DA_PHU_KIEN);
    cacBo.push({
      trangPhucId: tp,
      mauChinhId: mc,
      mauPhuId: mp,
      phuKienIds: Array.from(new Set(pk)),
      suKienId,
    });
  }
  return cacBo.length > 0 ? { cacBo, suKienId } : null;
}

// ---------- So sánh (hàm thuần, không đụng trình duyệt) ----------

export interface BoDaGiai {
  bo: BoSoSanh;
  trangPhuc: TrangPhuc | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  cacPhuKien: PhuKien[];
  /** null = đang tải hoặc lỗi. */
  ketQua: KetQuaKiemTra | null;
}

export interface KhacBiet {
  trangPhuc: boolean;
  mau: boolean;
  haiHoaMau: boolean;
  phuKien: boolean;
  vanHoa: boolean;
}

export const NHAN_MUC_MAU: Record<string, string> = {
  tuong_dong: 'Tương đồng',
  bo_tuc: 'Bổ túc',
  trung_tinh: 'Trung tính',
  lech_tong: 'Lệch tông',
};

/** Các món cần chú ý (cần lưu ý / hợp có điều kiện) của một bộ, dạng "Tên|mức" đã sắp xếp. */
function chuKyVanHoa(kq: KetQuaKiemTra | null): string {
  if (!kq) return '';
  const mon = (kq.phuHopVanHoa.chiTietPhuKien ?? [])
    .filter((c) => c.mucDo === 'khong_phu_hop' || c.mucDo === 'tuy_dip')
    .map((c) => `${c.phuKien.ten}|${c.mucDo}`)
    .sort();
  return `${mucVanHoaDeHienThi(kq.phuHopVanHoa) ?? ''};${mon.join(',')}`;
}

export function tinhKhacBiet(a: BoDaGiai, b: BoDaGiai): KhacBiet {
  const coKetQua = Boolean(a.ketQua && b.ketQua);
  return {
    trangPhuc: a.bo.trangPhucId !== b.bo.trangPhucId,
    mau: a.bo.mauChinhId !== b.bo.mauChinhId || a.bo.mauPhuId !== b.bo.mauPhuId,
    haiHoaMau: coKetQua && a.ketQua!.haiHoaMau.mucDo !== b.ketQua!.haiHoaMau.mucDo,
    phuKien: [...a.bo.phuKienIds].sort().join('+') !== [...b.bo.phuKienIds].sort().join('+'),
    vanHoa: coKetQua && chuKyVanHoa(a.ketQua) !== chuKyVanHoa(b.ketQua),
  };
}

function noiTen(ten: string[]): string {
  if (ten.length <= 1) return ten[0] ?? '';
  return `${ten.slice(0, -1).join(', ')} và ${ten[ten.length - 1]}`;
}

function tenCap(b: BoDaGiai): string {
  return `${b.mauChinh?.ten ?? '?'} / ${b.mauPhu?.ten ?? '?'}`;
}

/** Mô tả ngắn phần lưu ý văn hoá của một bộ, hoặc null nếu không có gì đáng nói. */
function luuYVanHoa(b: BoDaGiai): { mucDo: 'khong_phu_hop' | 'tuy_dip'; ten: string[] } | null {
  const ct = b.ketQua?.phuHopVanHoa.chiTietPhuKien ?? [];
  const canLuuY = ct.filter((c) => c.mucDo === 'khong_phu_hop').map((c) => c.phuKien.ten);
  if (canLuuY.length > 0) return { mucDo: 'khong_phu_hop', ten: canLuuY };
  const coDieuKien = ct.filter((c) => c.mucDo === 'tuy_dip').map((c) => c.phuKien.ten);
  return coDieuKien.length > 0 ? { mucDo: 'tuy_dip', ten: coDieuKien } : null;
}

/** Câu tóm tắt "Khác biệt chính" — dựng từ dữ liệu, không dùng AI, và không xếp hạng bộ nào hơn. */
export function taoTomTat(a: BoDaGiai, b: BoDaGiai, kb: KhacBiet): string {
  const phan: string[] = [];

  if (kb.trangPhuc) {
    phan.push(`trang phục là ${a.trangPhuc?.ten ?? '?'} (Bộ A) và ${b.trangPhuc?.ten ?? '?'} (Bộ B)`);
  }
  if (kb.mau) phan.push(`cặp màu là ${tenCap(a)} (Bộ A) và ${tenCap(b)} (Bộ B)`);
  if (kb.phuKien) {
    const idA = new Set(a.bo.phuKienIds);
    const idB = new Set(b.bo.phuKienIds);
    const chiA = a.cacPhuKien.filter((p) => !idB.has(p.id)).map((p) => p.ten);
    const chiB = b.cacPhuKien.filter((p) => !idA.has(p.id)).map((p) => p.ten);
    const mo: string[] = [];
    if (chiA.length > 0) mo.push(`chỉ Bộ A có ${noiTen(chiA)}`);
    if (chiB.length > 0) mo.push(`chỉ Bộ B có ${noiTen(chiB)}`);
    phan.push(`phụ kiện (${mo.join('; ')})`);
  }
  if (kb.haiHoaMau && a.ketQua && b.ketQua) {
    phan.push(
      `hài hoà màu là ${NHAN_MUC_MAU[a.ketQua.haiHoaMau.mucDo] ?? '?'} (Bộ A) và ${NHAN_MUC_MAU[b.ketQua.haiHoaMau.mucDo] ?? '?'} (Bộ B)`,
    );
  }
  if (kb.vanHoa) {
    const la = luuYVanHoa(a);
    const lb = luuYVanHoa(b);
    const mot = (ten: string, l: NonNullable<ReturnType<typeof luuYVanHoa>>) =>
      `${ten} ${l.mucDo === 'khong_phu_hop' ? 'cần lưu ý' : 'hợp có điều kiện'} ở ${noiTen(l.ten)}`;
    if (la && lb) phan.push(`về văn hoá, ${mot('Bộ A', la)}, còn ${mot('Bộ B', lb)}`);
    else if (la) phan.push(`về văn hoá, ${mot('Bộ A', la)}, Bộ B không có lưu ý`);
    else if (lb) phan.push(`về văn hoá, ${mot('Bộ B', lb)}, Bộ A không có lưu ý`);
    else phan.push('mức phù hợp văn hoá tổng thể');
  }

  if (phan.length === 0) return 'Hai bộ giống nhau ở mọi tiêu chí đang so sánh.';
  return `Hai bộ khác nhau ở: ${phan.join('; ')}.`;
}

/**
 * Nội dung sao chép khi chia sẻ bảng so sánh.
 * Có `linkSoSanh` thì chỉ kèm MỘT link mở lại trang so sánh; không có thì kèm link từng bộ (cách cũ).
 */
export function taoNoiDungChiaSeSoSanh(
  a: BoDaGiai,
  b: BoDaGiai,
  suKien: SuKien | null,
  tomTat: string,
  linkSoSanh?: string,
): string {
  const mot = (x: BoDaGiai) => {
    const mota = taoNoiDungChiaSe({
      trangPhuc: x.trangPhuc,
      suKien,
      mauChinh: x.mauChinh,
      mauPhu: x.mauPhu,
      cacPhuKien: x.cacPhuKien,
    }).replace(/^Việt Phục Remix:\s*/, '');
    if (linkSoSanh) return mota;
    // Link mở lại đúng bộ này ở trang phối đồ (chỉ mang dịp do người dùng chọn).
    const link = taoLinkChiaSe({
      trangPhucId: x.bo.trangPhucId,
      suKienId: suKien?.id ?? null,
      mauChinhId: x.bo.mauChinhId,
      mauPhuId: x.bo.mauPhuId,
      phuKienIds: x.bo.phuKienIds,
    });
    return link ? `${mota}\n   Thử phối: ${link}` : mota;
  };
  const dau = `So sánh 2 bộ phối trên Việt Phục Remix\nBộ A: ${mot(a)}\nBộ B: ${mot(b)}\n${tomTat}`;
  return linkSoSanh ? `${dau}\nXem so sánh: ${linkSoSanh}` : dau;
}