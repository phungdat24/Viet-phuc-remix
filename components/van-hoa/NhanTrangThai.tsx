import { NHAN_TRANG_THAI, type TrangThaiXacMinh } from '@/lib/vanHoa/duLieu';

export default function NhanTrangThai({ trangThai, ganMoTa = false }: { trangThai: TrangThaiXacMinh; ganMoTa?: boolean }) {
  const t = NHAN_TRANG_THAI[trangThai];
  return (
    <span
      title={t.moTa}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${t.mau}`}
    >
      {t.ten}
      {ganMoTa && <span className="sr-only">. {t.moTa}</span>}
    </span>
  );
}
