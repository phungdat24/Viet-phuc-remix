'use client';

import type { KetQuaKiemTra } from '@/types/phoi-do';

const NHAN_MAU: Record<string, string> = {
  tuong_dong: 'Tương đồng',
  bo_tuc: 'Bổ túc',
  trung_tinh: 'Trung tính',
  lech_tong: 'Lệch tông',
};

type MucDoDong = 'ok' | 'warn' | 'info';

function DongKetQua({
  mucDo,
  tieuDe,
  noiDung,
  children,
}: {
  mucDo: MucDoDong;
  tieuDe: string;
  noiDung: string;
  children?: React.ReactNode;
}) {
  const mauCham = mucDo === 'ok' ? 'bg-jade' : mucDo === 'warn' ? 'bg-lacquer' : 'bg-ink-soft';

  return (
    <div className="flex gap-3 items-start py-3 border-t border-ink-soft/15 first:border-t-0">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${mauCham}`} />
      <div>
        <p className="text-sm font-medium">{tieuDe}</p>
        <p className="text-sm text-ink-soft">{noiDung}</p>
        {children}
      </div>
    </div>
  );
}

function dongVanHoa(phuHopVanHoa: KetQuaKiemTra['phuHopVanHoa']) {
  switch (phuHopVanHoa.mucDo) {
    case 'phu_hop':
      return {
        mucDo: 'ok' as const,
        noiDung: phuHopVanHoa.lyDo ?? 'Trang phục và phụ kiện phù hợp về mặt văn hoá.',
      };
    case 'khong_phu_hop':
      return {
        mucDo: 'warn' as const,
        noiDung: phuHopVanHoa.lyDo ?? 'Tổ hợp này có thể làm sai lệch đặc trưng văn hoá gốc.',
      };
    case 'tuy_dip':
      return {
        mucDo: 'info' as const,
        noiDung: phuHopVanHoa.canChonDip
          ? 'Sự phù hợp còn tuỳ dịp — hãy chọn thêm dịp sử dụng ở khung bên trái để có kết quả chính xác hơn.'
          : (phuHopVanHoa.lyDo ?? 'Sự phù hợp còn tuỳ theo bối cảnh sử dụng.'),
      };
    case 'khong_co_phu_kien':
      return {
        mucDo: 'info' as const,
        noiDung: 'Chưa chọn phụ kiện nên chưa có gì để đối chiếu về mặt văn hoá.',
      };
    default:
      return {
        mucDo: 'info' as const,
        noiDung: phuHopVanHoa.lyDo ?? 'Chưa có dữ liệu quy tắc cho tổ hợp này.',
      };
  }
}

interface Props {
  ketQua: KetQuaKiemTra;
  daLuu: boolean;
  daSaoChep: boolean;
  onLuu: () => void;
  onChiaSe: () => void;
}

export default function KetQuaPhoiDo({ ketQua, daLuu, daSaoChep, onLuu, onChiaSe }: Props) {
  const { haiHoaMau, phuHopVanHoa } = ketQua;
  const dongVH = dongVanHoa(phuHopVanHoa);

  return (
    <div className="p-4 border-t border-ink-soft/15">
      <h3 className="font-display text-base font-semibold mb-1">Kết quả thẩm định</h3>

      <DongKetQua
        mucDo={haiHoaMau.mucDo === 'lech_tong' ? 'warn' : 'ok'}
        tieuDe={`Hài hoà màu sắc: ${NHAN_MAU[haiHoaMau.mucDo] ?? haiHoaMau.mucDo}`}
        noiDung={haiHoaMau.goiY}
      />

      <DongKetQua mucDo={dongVH.mucDo} tieuDe="Chuẩn mực văn hoá" noiDung={dongVH.noiDung}>
        {phuHopVanHoa.goiYThayThe.length > 0 && (
          <p className="text-xs text-ink-soft mt-1">
            Gợi ý thay thế: {phuHopVanHoa.goiYThayThe.join(', ')}
          </p>
        )}
      </DongKetQua>

      <div className="flex gap-2 mt-3">
        <button
          onClick={onLuu}
          disabled={daLuu}
          className="flex-1 bg-lacquer text-white font-medium py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-60"
        >
          {daLuu ? 'Đã lưu vào Lookbook ✓' : 'Lưu Lookbook'}
        </button>
        <button
          onClick={onChiaSe}
          className="flex-1 border border-ink-soft/30 font-medium py-2.5 rounded-md hover:border-gold transition"
        >
          {daSaoChep ? 'Đã sao chép ✓' : 'Chia sẻ'}
        </button>
      </div>
    </div>
  );
}