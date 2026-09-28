'use client';

import type { TrangPhuc, MauSac, PhuKien } from '@/types/phoi-do';

interface Props {
  trangPhuc: TrangPhuc | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  phuKien: PhuKien | null;
}

const MAU_PHU_KIEN_CO_DINH = '#3E3226';

function LopPhuKien({ tenPhuKien }: { tenPhuKien: string | undefined }) {
  if (!tenPhuKien) return null;

  if (tenPhuKien === 'Nón lá') {
    return <polygon fill={MAU_PHU_KIEN_CO_DINH} points="50,8 100,-26 150,8 130,17 70,17" />;
  }
  if (tenPhuKien === 'Khăn mỏ quạ') {
    return <polygon fill={MAU_PHU_KIEN_CO_DINH} points="72,8 100,-20 100,30" />;
  }
  if (tenPhuKien === 'Nón quai thao') {
    return (
      <>
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="6" rx="58" ry="15" />
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="0" rx="17" ry="9" />
      </>
    );
  }
  if (tenPhuKien === 'Khăn đóng') {
    return (
      <>
        <ellipse fill={MAU_PHU_KIEN_CO_DINH} cx="100" cy="18" rx="27" ry="11" />
        <polygon fill={MAU_PHU_KIEN_CO_DINH} points="90,10 110,10 100,-6" />
      </>
    );
  }
  if (tenPhuKien === 'Khăn rằn') {
    return <polygon fill={MAU_PHU_KIEN_CO_DINH} points="62,58 84,58 128,220 106,220" />;
  }
  return null;
}

function DauNguoi() {
  return <circle cx="100" cy="34" r="20" fill="#D9C3A0" />;
}

function AoDaiSvg({ mauChinh, mauPhu, tenPhuKien }: { mauChinh: string; mauPhu: string; tenPhuKien?: string }) {
  return (
    <svg viewBox="0 -30 200 400" className="h-full w-auto">
      <polygon fill={mauChinh} points="70,62 55,150 68,156 78,65" />
      <polygon fill={mauChinh} points="130,62 145,150 132,156 122,65" />
      <polygon fill={mauPhu} points="88,195 112,195 108,375 92,375" />
      <polygon fill={mauChinh} points="78,190 96,190 90,370 60,370" />
      <polygon fill={mauChinh} points="122,190 104,190 110,370 140,370" />
      <polygon fill={mauChinh} points="70,60 130,60 122,190 78,190" />
      <rect fill={mauChinh} x="92" y="50" width="16" height="12" rx="1" />
      <DauNguoi />
      <LopPhuKien tenPhuKien={tenPhuKien} />
    </svg>
  );
}

function AoTuThanSvg({ mauChinh, mauPhu, tenPhuKien }: { mauChinh: string; mauPhu: string; tenPhuKien?: string }) {
  return (
    <svg viewBox="0 -30 200 400" className="h-full w-auto">
      <polygon fill={mauChinh} points="62,60 44,140 60,148 76,64" />
      <polygon fill={mauChinh} points="138,60 156,140 140,148 124,64" />
      <polygon fill={mauChinh} points="60,150 140,150 168,372 32,372" />
      <polygon fill={mauChinh} points="65,58 135,58 128,150 72,150" />
      <polygon fill={mauPhu} points="88,58 112,58 100,112" />
      <rect fill="#B3822F" x="68" y="147" width="64" height="7" />
      <rect fill={mauChinh} x="92" y="50" width="16" height="10" rx="1" />
      <DauNguoi />
      <LopPhuKien tenPhuKien={tenPhuKien} />
    </svg>
  );
}

function AoBaBaSvg({ mauChinh, mauPhu, tenPhuKien }: { mauChinh: string; mauPhu: string; tenPhuKien?: string }) {
  return (
    <svg viewBox="0 -30 200 400" className="h-full w-auto">
      <polygon fill={mauChinh} points="66,60 52,140 66,146 78,64" />
      <polygon fill={mauChinh} points="134,60 148,140 134,146 122,64" />
      <polygon fill={mauChinh} points="68,58 132,58 138,230 62,230" />
      <polygon fill={mauPhu} points="70,225 130,225 122,372 78,372" />
      <rect fill={mauChinh} x="92" y="50" width="16" height="10" rx="1" />
      <DauNguoi />
      <LopPhuKien tenPhuKien={tenPhuKien} />
    </svg>
  );
}

export default function XemTruoc({ trangPhuc, mauChinh, mauPhu, phuKien }: Props) {
  if (!trangPhuc) {
    return (
      <div className="flex items-center justify-center h-full text-ink-soft text-sm text-center px-6">
        Chọn một trang phục ở bên trái để bắt đầu xem trước
      </div>
    );
  }

  const mauChinhHex = mauChinh?.maHex ?? '#E4D3B4';
  const mauPhuHex = mauPhu?.maHex ?? '#E4D3B4';
  const tenPhuKien = phuKien?.ten;

  return (
    <div className="flex items-center justify-center h-full py-6">
      {trangPhuc.ten === 'Áo dài' && (
        <AoDaiSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenPhuKien={tenPhuKien} />
      )}
      {trangPhuc.ten === 'Áo tứ thân' && (
        <AoTuThanSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenPhuKien={tenPhuKien} />
      )}
      {trangPhuc.ten === 'Áo bà ba' && (
        <AoBaBaSvg mauChinh={mauChinhHex} mauPhu={mauPhuHex} tenPhuKien={tenPhuKien} />
      )}
    </div>
  );
}