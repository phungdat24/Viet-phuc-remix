import type { KetQuaKiemTra } from '@/types/phoi-do';

export interface LookbookItem {
  id: string;
  trangPhucId: string;
  suKienId: string | null;
  /** true khi người dùng không chọn dịp và hệ thống bốc ngẫu nhiên suKienId. */
  suKienNgauNhien?: boolean;
  mauChinhId: string;
  mauPhuId: string;
  phuKienId: string | null;
  ketQuaKiemTra: KetQuaKiemTra | null;
  /** Ảnh AI đã được duyệt (nếu có). Lookbook cũ không có trường này. */
  imageUrl?: string | null;
  toHopId?: string | null;
  yeuThich: boolean;
  ngayTao: number;
}

const KEY = 'viet-phuc-remix-lookbook';

export function loadLookbook(): LookbookItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLookbook(
  item: Omit<LookbookItem, 'id' | 'ngayTao' | 'yeuThich'>
): LookbookItem {
  const existing = loadLookbook();
  const newItem: LookbookItem = {
    ...item,
    id: crypto.randomUUID(),
    ngayTao: Date.now(),
    yeuThich: false,
  };
  existing.push(newItem);
  localStorage.setItem(KEY, JSON.stringify(existing));
  return newItem;
}

export function deleteItem(id: string): void {
  const updated = loadLookbook().filter((item) => item.id !== id);
  localStorage.setItem(KEY, JSON.stringify(updated));
}

export function toggleYeuThich(id: string): void {
  const items = loadLookbook();
  const updated = items.map((item) =>
    item.id === id ? { ...item, yeuThich: !item.yeuThich } : item
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
}