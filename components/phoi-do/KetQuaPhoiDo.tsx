'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { KetQuaKiemTra, MucDoVanHoa, PhuKien } from '@/types/phoi-do';
import SinhAnhAI, { type AnhAIProps } from './SinhAnhAI';
import CanhBaoVanHoa, { GIAO_DIEN_MUC_DO, type MucCanhBaoVanHoa } from './CanhBaoVanHoa';
import { CAU_NHAC_CHON_DIP, LY_DO_HOP_CO_DIEU_KIEN, mucVanHoaDeHienThi } from '@/lib/canhBaoVanHoa';

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

/** Món cần chú ý xếp trước, món phù hợp xếp sau. */
const THU_TU_MUC: Record<MucDoVanHoa, number> = {
  khong_phu_hop: 0,
  tuy_dip: 1,
  chua_co_du_lieu: 2,
  phu_hop: 3,
  khong_co_phu_kien: 4,
};

/** Chuyển kết quả từng món (chiTietPhuKien) thành các thẻ; null nếu không có (dữ liệu cũ). Bỏ món "chưa có dữ liệu". */
function taoCacMuc(
  pv: KetQuaKiemTra['phuHopVanHoa'],
  cacPhuKien: PhuKien[],
): MucCanhBaoVanHoa[] | null {
  const chiTiet = (pv.chiTietPhuKien ?? []).filter((c) => c.mucDo !== 'chua_co_du_lieu');
  if (chiTiet.length === 0) return null;

  const vungTheoId = new Map(cacPhuKien.map((p) => [p.id, p.vungMien]));
  const tenTrangPhuc = pv.trangPhuc?.ten ?? 'trang phục này';

  return [...chiTiet]
    .sort((a, b) => THU_TU_MUC[a.mucDo] - THU_TU_MUC[b.mucDo])
    .map((c) => {
      let lyDo = c.lyDo;
      if (c.mucDo === 'khong_phu_hop' && !lyDo) {
        lyDo = `Nét này có thể làm lệch đặc trưng gốc của ${tenTrangPhuc}. Bạn vẫn có thể giữ lại nếu muốn.`;
      }
      if (c.mucDo === 'tuy_dip' && pv.canChonDip && !lyDo?.includes(CAU_NHAC_CHON_DIP)) {
        lyDo = `${lyDo ?? LY_DO_HOP_CO_DIEU_KIEN} ${CAU_NHAC_CHON_DIP}`;
      }
      return {
        id: c.phuKien.id,
        ten: c.phuKien.ten,
        vungMien: vungTheoId.get(c.phuKien.id) ?? null,
        mucDo: c.mucDo,
        lyDo,
      };
    });
}

interface Props {
  ketQua: KetQuaKiemTra;
  daLuu: boolean;
  daSaoChep: boolean;
  onLuu: () => void;
  onChiaSe: () => void;
  /** Chỉ sao chép link mở lại bộ phối; trả về true nếu chép được. */
  onSaoChepLink: () => Promise<boolean>;
  anhAI: AnhAIProps;
  /** true = người dùng chưa chọn dịp (kết quả văn hoá kém tin cậy hơn). */
  chuaChonDip: boolean;
  /** Các phụ kiện đang chọn, để lấy vùng miền hiển thị trong thẻ. */
  cacPhuKien: PhuKien[];
}

export default function KetQuaPhoiDo({
  ketQua,
  daLuu,
  daSaoChep,
  onLuu,
  onChiaSe,
  onSaoChepLink,
  anhAI,
  chuaChonDip,
  cacPhuKien,
}: Props) {
  const [daChepLink, setDaChepLink] = useState(false);

  async function xuLySaoChepLink() {
    const thanhCong = await onSaoChepLink();
    setDaChepLink(thanhCong);
    if (thanhCong) setTimeout(() => setDaChepLink(false), 2000);
  }

  const { haiHoaMau, phuHopVanHoa } = ketQua;
  const cacMuc = taoCacMuc(phuHopVanHoa, cacPhuKien);
  // null = mọi món đều chưa có dữ liệu -> không hiện khối "Chuẩn mực văn hoá" nữa.
  const mucTong = mucVanHoaDeHienThi(phuHopVanHoa);
  const gdChung = mucTong ? GIAO_DIEN_MUC_DO[mucTong] : null;
  const coPhuKien = phuHopVanHoa.mucDo !== 'khong_co_phu_kien';

  const tenMonCanLuuY = (phuHopVanHoa.chiTietPhuKien ?? [])
    .filter((c) => c.mucDo === 'khong_phu_hop')
    .map((c) => c.phuKien.ten);
  const canhBaoDuoiAnh = phuHopVanHoa.canhBao
    ? tenMonCanLuuY.length > 0
      ? `Bộ phối này có món ít phù hợp với trang phục: ${tenMonCanLuuY.join(', ')}. Xem chi tiết ở mục "Chuẩn mực văn hoá" phía trên.`
      : (phuHopVanHoa.lyDo ?? 'Tổ hợp này có thể làm lệch đặc trưng văn hoá gốc.')
    : null;

  return (
    <div className="p-4 border-t border-ink-soft/15">
      <h3 className="font-display text-base font-semibold mb-1">Kết quả thẩm định</h3>

      <DongKetQua
        mucDo={haiHoaMau.mucDo === 'lech_tong' ? 'warn' : 'ok'}
        tieuDe={`Hài hoà màu sắc: ${NHAN_MAU[haiHoaMau.mucDo] ?? haiHoaMau.mucDo}`}
        noiDung={haiHoaMau.goiY}
      >
        {haiHoaMau.lyDo && (
          <p className="mt-1 text-xs text-ink-soft">
            <span className="font-medium text-ink">Giải thích: </span>
            {haiHoaMau.lyDo}
          </p>
        )}
      </DongKetQua>

      {gdChung && (
      <div className="py-3 border-t border-ink-soft/15">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${gdChung.tron}`}
          >
            {gdChung.bieuTuong}
          </span>
          <p className="text-sm font-medium">Chuẩn mực văn hoá: {gdChung.nhan}</p>
        </div>

        {!coPhuKien && (
          <p className="mt-2 text-sm text-ink-soft">
            Chưa chọn phụ kiện nên chưa có gì để đối chiếu về mặt văn hoá.
          </p>
        )}

        {coPhuKien && chuaChonDip && (
          <p className="mt-2 rounded-md bg-paper p-2.5 text-xs text-ink-soft">
            <span aria-hidden>ⓘ </span>
            Bạn chưa chọn dịp sử dụng nên nhận định văn hoá dưới đây có độ tin cậy thấp hơn. Chọn dịp ở khung
            bên trái rồi xem lại kết quả để chính xác hơn.
          </p>
        )}

        {coPhuKien && (
          <div className="mt-2">
            {cacMuc ? (
              <CanhBaoVanHoa cacMuc={cacMuc} />
            ) : (
              phuHopVanHoa.lyDo && <p className="text-sm text-ink-soft">{phuHopVanHoa.lyDo}</p>
            )}
          </div>
        )}

        {phuHopVanHoa.goiYThayThe.length > 0 && (
          <p className="mt-2 text-xs text-ink-soft">
            Món có thể hợp hơn với trang phục này: {phuHopVanHoa.goiYThayThe.join(', ')}. Muốn đổi món, hãy
            chỉnh ở khung Phụ kiện rồi xem lại kết quả.
          </p>
        )}
      </div>
      )}

      <SinhAnhAI {...anhAI} canhBaoVanHoa={canhBaoDuoiAnh} />

      {daLuu && (anhAI.thieuThongTin || (anhAI.loi && !anhAI.toHop && !anhAI.dangSinh)) && (
        <p className="mt-3 text-center text-sm" role="status">
          <Link href="/lookbook" className="font-medium text-lacquer hover:underline">
            Xem Lookbook của tôi →
          </Link>
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {/* Khi có ảnh AI thì việc lưu Lookbook đi qua bước duyệt ở trên;
            nút này chỉ còn dùng khi không sinh được ảnh (thiếu dịp hoặc AI bị lỗi). */}
        {(anhAI.thieuThongTin || (anhAI.loi && !anhAI.toHop && !anhAI.dangSinh)) && (
          <button
            onClick={onLuu}
            disabled={daLuu}
            className="min-w-32 flex-1 bg-lacquer text-white font-medium py-2.5 rounded-md hover:opacity-90 transition disabled:opacity-60"
          >
            {daLuu ? 'Đã lưu vào Lookbook ✓' : 'Lưu Lookbook'}
          </button>
        )}
        <button
          onClick={onChiaSe}
          className="min-w-32 flex-1 border border-ink-soft/30 font-medium py-2.5 rounded-md hover:border-gold transition"
        >
          {daSaoChep ? 'Đã sao chép ✓' : 'Chia sẻ'}
        </button>
        <button
          onClick={xuLySaoChepLink}
          className="min-w-32 flex-1 border border-ink-soft/30 font-medium py-2.5 rounded-md hover:border-gold transition"
        >
          {daChepLink ? 'Đã chép link ✓' : 'Sao chép link'}
        </button>
      </div>
    </div>
  );
}
