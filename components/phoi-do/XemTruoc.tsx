'use client';

import type { TrangPhuc, MauSac, PhuKien } from '@/types/phoi-do';

interface Props {
  trangPhuc: TrangPhuc | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  /** Tất cả phụ kiện đang chọn (mảng rỗng = không dùng). */
  cacPhuKien: PhuKien[];
}

const MAU_PHU_KIEN_CO_DINH = '#3E3226';
const MAU_PHU_KIEN_VANG = '#B3822F';
const MAU_DA = '#D9C3A0';
const MAU_GIAY = '#5C4632';

/** Thuộc tính chung cho cả 3 hình: lấp đầy khung cha, giữ nguyên tỉ lệ, không bị méo. */
const SVG_PROPS = {
  viewBox: '0 -32 200 412',
  preserveAspectRatio: 'xMidYMid meet',
  className: 'h-full w-full',
} as const;

function lamToiMau(hex: string, phanTram = 14): string {
  const so = parseInt(hex.replace('#', ''), 16);
  const heSo = 1 - phanTram / 100;
  const r = Math.max(0, ((so >> 16) & 255) * heSo);
  const g = Math.max(0, ((so >> 8) & 255) * heSo);
  const b = Math.max(0, (so & 255) * heSo);
  const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** Vẽ MỘT phụ kiện theo tên. */
function MotPhuKien({ ten }: { ten: string }) {
  if (ten === 'Nón lá') {
    return <polygon fill={MAU_PHU_KIEN_CO_DINH} points="48,8 100,-30 152,8 132,17 68,17" />;
  }
  if (ten === 'Khăn mỏ quạ') {
    return (
      <>
        <path d="M76,16 C76,0 124,0 124,16 L118,32 C108,23 92,23 82,32 Z" fill={MAU_PHU_KIEN_CO_DINH} />
        <polygon fill={MAU_PHU_KIEN_CO_DINH} points="93,28 107,28 100,44" />
      </>
    );
  }
  if (ten === 'Nón quai thao') {
    return (
      <>
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="4" rx="60" ry="16" />
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="-2" rx="18" ry="9" />
      </>
    );
  }
  if (ten === 'Khăn đóng') {
    return (
      <>
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="14" rx="28" ry="12" />
        <polygon fill={MAU_PHU_KIEN_CO_DINH} points="89,6 111,6 100,-10" />
      </>
    );
  }
  if (ten === 'Khăn rằn') {
    return <polygon fill={MAU_PHU_KIEN_CO_DINH} points="60,58 86,58 130,224 104,224" />;
  }
  if (ten === 'Trâm cài') {
    return (
      <line x1="112" y1="14" x2="132" y2="-4" stroke={MAU_PHU_KIEN_VANG} strokeWidth="2.5" strokeLinecap="round" />
    );
  }
  if (ten === 'Quạt giấy') {
    return (
      <g>
        <path d="M148,148 L175,106 A38,38 0 0,1 180,140 Z" fill={MAU_PHU_KIEN_VANG} fillOpacity="0.9" />
        <line x1="148" y1="148" x2="178" y2="133" stroke={MAU_PHU_KIEN_CO_DINH} strokeWidth="1.5" />
      </g>
    );
  }
  if (ten === 'Guốc mộc') {
    return (
      <>
        <polygon fill={MAU_PHU_KIEN_CO_DINH} points="68,392 94,392 92,405 66,405" />
        <polygon fill={MAU_PHU_KIEN_CO_DINH} points="106,392 132,392 134,405 108,405" />
      </>
    );
  }
  return null;
}

/** Vẽ tất cả phụ kiện đang chọn (Guốc mộc thay giày mặc định). */
function LopPhuKien({ tenCacPhuKien }: { tenCacPhuKien: string[] }) {
  const coGuoc = tenCacPhuKien.includes('Guốc mộc');
  return (
    <>
      {!coGuoc && (
        <>
          <ellipse cx="82" cy="398" rx="11" ry="6" fill={MAU_GIAY} />
          <ellipse cx="118" cy="398" rx="11" ry="6" fill={MAU_GIAY} />
        </>
      )}
      {tenCacPhuKien.map((ten) => (
        <MotPhuKien key={ten} ten={ten} />
      ))}
    </>
  );
}

function BanTay({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="7" fill={MAU_DA} />;
}

function DauNguoi() {
  return (
    <>
      {/* cổ */}
      <rect x="92" y="44" width="16" height="16" fill={MAU_DA} />
      {/* khuôn mặt hình oval thay vì tròn, tự nhiên hơn */}
      <ellipse cx="100" cy="30" rx="17" ry="20" fill={MAU_DA} />
      {/* tóc */}
      <path
        d="M80,24 C80,9 90,-2 100,-2 C110,-2 120,9 120,24 C120,17 112,12 100,12 C88,12 80,17 80,24 Z"
        fill="#2A2118"
      />
      {/* khuyên tai nhỏ, chi tiết tinh tế */}
      <circle cx="83" cy="36" r="2" fill={MAU_PHU_KIEN_VANG} />
    </>
  );
}

interface SvgProps {
  mauChinh: string;
  mauPhu: string;
  tenCacPhuKien: string[];
}

function AoDaiSvg({ mauChinh, mauPhu, tenCacPhuKien }: SvgProps) {
  const toi = lamToiMau(mauChinh);
  return (
    <svg {...SVG_PROPS}>
      <polygon fill={mauChinh} points="78,60 68,68 60,93 55,123 58,148 70,153 74,126 78,98 82,72" />
      <polygon fill={mauChinh} points="122,60 132,68 140,93 145,123 142,148 130,153 126,126 122,98 118,72" />

      <polygon fill={mauPhu} points="90,193 110,193 106,388 94,388" />

      {/* 2 tà áo dài, viền ngoài tô màu phụ để tạo hiệu ứng phối 2 tông như ảnh mẫu */}
      <polygon
        fill={mauChinh} stroke={mauPhu} strokeWidth="2.5" strokeLinejoin="round"
        points="82,190 96,190 92,298 84,388 62,388 70,298"
      />
      <polygon
        fill={mauChinh} stroke={mauPhu} strokeWidth="2.5" strokeLinejoin="round"
        points="118,190 104,190 108,298 116,388 138,388 130,298"
      />
      <polygon
        fill={mauChinh} stroke={mauPhu} strokeWidth="2.5" strokeLinejoin="round"
        points="72,58 128,58 122,86 114,110 120,136 122,190 78,190 80,136 86,110 78,86"
      />

      <line x1="92" y1="93" x2="90" y2="183" stroke={toi} strokeWidth="1" strokeOpacity="0.55" />
      <line x1="108" y1="93" x2="110" y2="183" stroke={toi} strokeWidth="1" strokeOpacity="0.55" />

      {/* trâm cài/phụ kiện trang trí ngực nhỏ */}
      <circle cx="100" cy="98" r="5" fill="none" stroke={mauPhu} strokeWidth="1.5" />

      <path d="M90,48 C90,43 110,43 110,48 L108,58 C104,54 96,54 92,58 Z" fill={mauChinh} />

      <BanTay x={62} y={150} />
      <BanTay x={138} y={150} />

      <DauNguoi />
      <LopPhuKien tenCacPhuKien={tenCacPhuKien} />
    </svg>
  );
}

function AoTuThanSvg({ mauChinh, mauPhu, tenCacPhuKien }: SvgProps) {
  const toi = lamToiMau(mauChinh);
  return (
    <svg {...SVG_PROPS}>
      <polygon fill={mauChinh} points="64,58 52,70 44,98 40,133 44,146 60,148 62,118 66,90 70,66" />
      <polygon fill={mauChinh} points="136,58 148,70 156,98 160,133 156,146 140,148 138,118 134,90 130,66" />

      <polygon
        fill={mauChinh} stroke={lamToiMau(mauChinh, 22)} strokeWidth="2" strokeLinejoin="round"
        points="62,148 138,148 164,298 172,386 28,386 36,298"
      />

      <line x1="88" y1="150" x2="72" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="112" y1="150" x2="128" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="100" y1="153" x2="100" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.35" />

      <polygon fill={mauChinh} points="66,56 134,56 130,93 122,118 128,148 72,148 78,118 70,93" />
      <polygon fill={mauPhu} points="88,56 112,56 100,108" />
      <rect fill={MAU_PHU_KIEN_VANG} x="68" y="145" width="64" height="7" rx="1" />

      <path d="M90,48 C90,44 110,44 110,48 L108,56 L92,56 Z" fill={mauChinh} />

      <BanTay x={46} y={148} />
      <BanTay x={154} y={148} />

      <DauNguoi />
      <LopPhuKien tenCacPhuKien={tenCacPhuKien} />
    </svg>
  );
}

function AoBaBaSvg({ mauChinh, mauPhu, tenCacPhuKien }: SvgProps) {
  const toiPhu = lamToiMau(mauPhu);
  const toiChinh = lamToiMau(mauChinh);
  return (
    <svg {...SVG_PROPS}>
      <polygon fill={mauChinh} points="68,58 58,68 50,93 46,123 50,143 66,146 68,118 72,93 76,68" />
      <polygon fill={mauChinh} points="132,58 142,68 150,93 154,123 150,143 134,146 132,118 128,93 124,68" />

      <polygon
        fill={mauChinh} stroke={toiChinh} strokeWidth="1.5" strokeLinejoin="round"
        points="70,56 130,56 128,83 120,110 125,138 130,166 70,166 75,138 80,110 72,83"
      />

      <polygon fill={mauPhu} points="74,163 126,163 134,288 112,386 88,386 66,288" />
      <line x1="100" y1="198" x2="100" y2="386" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.4" />

      <line x1="90" y1="93" x2="86" y2="158" stroke={toiChinh} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="110" y1="93" x2="114" y2="158" stroke={toiChinh} strokeWidth="1" strokeOpacity="0.5" />

      <path d="M91,48 C91,44 109,44 109,48 L107,56 L93,56 Z" fill={mauChinh} />

      <BanTay x={50} y={145} />
      <BanTay x={150} y={145} />

      <DauNguoi />
      <LopPhuKien tenCacPhuKien={tenCacPhuKien} />
    </svg>
  );
}

/**
 * LƯU Ý: component này phủ kín khung cha (absolute inset-0),
 * nên khung cha phải có `relative` và có chiều cao (xem ThuNghiemPhoiDoClient).
 */
export default function XemTruoc({ trangPhuc, mauChinh, mauPhu, cacPhuKien }: Props) {
  if (!trangPhuc) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-ink-soft text-sm text-center px-6">
        Chọn một trang phục ở bên trái để bắt đầu xem trước
      </div>
    );
  }

  const mauChinhHex = mauChinh?.maHex ?? '#E4D3B4';
  const mauPhuHex = mauPhu?.maHex ?? '#E4D3B4';
  const tenCacPhuKien = cacPhuKien.map((p) => p.ten.normalize('NFC').trim());

  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      {trangPhuc.ten === 'Áo dài' && (
        <AoDaiSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenCacPhuKien={tenCacPhuKien} />
      )}
      {trangPhuc.ten === 'Áo tứ thân' && (
        <AoTuThanSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenCacPhuKien={tenCacPhuKien} />
      )}
      {trangPhuc.ten === 'Áo bà ba' && (
        <AoBaBaSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenCacPhuKien={tenCacPhuKien} />
      )}
    </div>
  );
}