'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import type { TrangPhuc, MauSac, PhuKien } from '@/types/phoi-do';

interface Props {
  trangPhuc: TrangPhuc | null;
  mauChinh: MauSac | null;
  mauPhu: MauSac | null;
  /** Tất cả phụ kiện đang chọn (mảng rỗng = không dùng). */
  cacPhuKien: PhuKien[];
}

interface Diem {
  x: number;
  y: number;
}

interface SvgProps {
  mauChinh: string;
  mauPhu: string;
  ten: Set<string>;
  uid: string;
}

const DA = '#E2C7A3';
const DA_TOI = '#CFAE86';
const TOC = '#2A2118';
const VANG = '#C9A227';
const VANG_TOI = '#9C7A1E';
const SON = '#8E2F3A';

/** t > 0: sáng hơn (trộn trắng), t < 0: tối hơn (trộn đen). */
function phaMau(hex: string, t: number): string {
  const so = parseInt(hex.replace('#', ''), 16);
  const goc = t >= 0 ? 255 : 0;
  const kenh = [(so >> 16) & 255, (so >> 8) & 255, so & 255].map((v) =>
    Math.round(v + (goc - v) * Math.abs(t)),
  );
  return `#${kenh.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/* ========== Khung chung ========== */

/** Khung nhìn cao tới y=422 để thấy trọn bàn chân, giày/guốc và bóng đổ. */
function Khung({ uid, children }: { uid: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 -44 200 466"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label="Hình minh hoạ bộ trang phục đang phối"
    >
      <defs>
        <radialGradient id={`${uid}-bong`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#2A2118" stopOpacity="0.3" />
          <stop offset="1" stopColor="#2A2118" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="411" rx="64" ry="6" fill={`url(#${uid}-bong)`} />
      {children}
    </svg>
  );
}

function VaiGradient({ id, mau }: { id: string; mau: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" className="tm" style={{ stopColor: phaMau(mau, 0.14) }} />
      <stop offset="0.5" className="tm" style={{ stopColor: mau }} />
      <stop offset="1" className="tm" style={{ stopColor: phaMau(mau, -0.16) }} />
    </linearGradient>
  );
}

/* ========== Cơ thể ========== */

function Co() {
  return <rect x="92" y="44" width="16" height="18" rx="4" fill={DA_TOI} />;
}

function BanTay({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6.5" fill={DA} />;
}

function DauNguoi() {
  return (
    <>
      {/* búi tóc */}
      <ellipse cx="100" cy="-4" rx="13" ry="9" fill={TOC} />
      {/* khuôn mặt */}
      <ellipse cx="100" cy="30" rx="17" ry="20" fill={DA} />
      <path
        d="M80,24 C80,9 90,-2 100,-2 C110,-2 120,9 120,24 C120,17 112,12 100,12 C88,12 80,17 80,24 Z"
        fill={TOC}
      />
      {/* má hồng + môi */}
      <ellipse cx="90" cy="37" rx="4" ry="2.5" fill="#E9A59A" opacity="0.45" />
      <ellipse cx="110" cy="37" rx="4" ry="2.5" fill="#E9A59A" opacity="0.45" />
      <path d="M96,43 Q100,46.5 104,43" stroke="#B5584B" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* khuyên tai */}
      <circle cx="83" cy="36" r="2" fill={VANG} />
    </>
  );
}

/** Bàn chân + giày vải mặc định, hoặc guốc mộc khi đã chọn. */
function Chan({ x, coGuoc }: { x: number; coGuoc: boolean }) {
  return (
    <g>
      <rect x={x - 4} y={380} width={8} height={18} rx={3} fill={DA_TOI} />
      {coGuoc ? (
        <g className="pk-vao">
          <ellipse cx={x} cy={396} rx={7} ry={3} fill={DA} />
          <rect x={x - 11} y={398} width={22} height={6} rx={3} fill="#B27B45" />
          <rect x={x - 11} y={402} width={22} height={2.5} rx={1.2} fill="#8A5A2E" />
          <rect x={x - 8} y={404} width={4} height={4} rx={1} fill="#7A4F28" />
          <rect x={x + 4} y={404} width={4} height={4} rx={1} fill="#7A4F28" />
          <path
            d={`M${x - 9},399 Q${x},389 ${x + 9},399`}
            stroke={SON}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      ) : (
        <>
          <ellipse cx={x} cy={400} rx={10} ry={5} fill="#5C4632" />
          <ellipse cx={x - 2} cy={398} rx={4} ry={1.5} fill="#8A6A4C" opacity={0.6} />
        </>
      )}
    </g>
  );
}

/* ========== Phụ kiện ========== */

function NonLa({ uid }: { uid: string }) {
  const id = `${uid}-nonla`;
  // Gân nón: các điểm chia đều trên đường cong đáy nón.
  const gan = Array.from({ length: 8 }, (_, i) => {
    const t = (i + 1) / 9;
    return {
      x: (1 - t) * (1 - t) * 158 + 2 * (1 - t) * t * 100 + t * t * 42,
      y: (1 - t) * (1 - t) * 12 + 2 * (1 - t) * t * 26 + t * t * 12,
    };
  });
  return (
    <g className="pk-vao">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F1DDA6" />
          <stop offset="0.5" stopColor="#E3C887" />
          <stop offset="1" stopColor="#CDAB68" />
        </linearGradient>
      </defs>
      {/* bóng nón đổ xuống trán */}
      <ellipse cx="100" cy="24" rx="22" ry="4" fill="#2A2118" opacity="0.14" />
      <path d="M100,-28 L158,12 Q100,26 42,12 Z" fill={`url(#${id})`} stroke="#B8975A" strokeWidth="0.8" strokeLinejoin="round" />
      {gan.map((p, i) => (
        <line key={i} x1="100" y1="-28" x2={p.x} y2={p.y} stroke="#B8975A" strokeWidth="0.6" opacity="0.6" />
      ))}
      <path d="M44,12.5 Q100,25 156,12.5" stroke="#A98648" strokeWidth="1.2" fill="none" />
      {/* quai nón */}
      <path d="M62,14 Q68,40 93,50" stroke={SON} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M138,14 Q132,40 107,50" stroke={SON} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </g>
  );
}

function NonQuaiThao() {
  return (
    <g className="pk-vao">
      <ellipse cx="100" cy="4" rx="64" ry="14" fill="#2B2118" />
      <ellipse cx="100" cy="0" rx="64" ry="14" fill="#4A3A2C" stroke={VANG_TOI} strokeWidth="1.2" />
      <ellipse cx="100" cy="-5" rx="30" ry="8" fill="#3A2D22" />
      <ellipse cx="94" cy="-7" rx="12" ry="2.5" fill="#6B5642" opacity="0.6" />
      {/* hai dải lụa (quai thao) buông xuống ngực */}
      <path d="M66,10 Q58,44 76,68" stroke={SON} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M134,10 Q142,44 124,68" stroke={SON} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M76,68 l-3,11 M76,68 l0,12 M76,68 l3,11" stroke={SON} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M124,68 l-3,11 M124,68 l0,12 M124,68 l3,11" stroke={SON} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

function KhanDong() {
  const mau = '#2D2A4A';
  return (
    <g className="pk-vao">
      <path d="M74,20 C70,0 84,-16 100,-16 C116,-16 130,0 126,20 C118,13 82,13 74,20 Z" fill={mau} />
      <path d="M78,12 Q100,0 122,12" stroke={phaMau(mau, 0.3)} strokeWidth="1.2" fill="none" />
      <path d="M80,3 Q100,-8 120,3" stroke={phaMau(mau, 0.3)} strokeWidth="1.2" fill="none" />
      <path d="M86,-6 Q100,-14 114,-6" stroke={phaMau(mau, 0.3)} strokeWidth="1" fill="none" />
    </g>
  );
}

function KhanMoQua() {
  const mau = '#231E1A';
  return (
    <g className="pk-vao">
      <path d="M78,26 C76,6 88,-8 100,-8 C112,-8 124,6 122,26 C116,16 84,16 78,26 Z" fill={mau} />
      {/* "mỏ quạ": góc khăn nhô ra phía trước */}
      <path d="M102,-6 L134,-18 L114,10 Z" fill={mau} />
      <path d="M104,-4 L128,-14" stroke={phaMau(mau, 0.35)} strokeWidth="0.8" fill="none" />
      <path d="M84,12 Q100,2 118,12" stroke={phaMau(mau, 0.35)} strokeWidth="0.8" fill="none" />
    </g>
  );
}

function KhanRan({ uid }: { uid: string }) {
  const id = `${uid}-ran`;
  return (
    <g className="pk-vao">
      <defs>
        <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill="#F4ECD8" />
          <rect width="3" height="3" fill="#3B3A36" />
          <rect x="3" y="3" width="3" height="3" fill="#3B3A36" />
        </pattern>
      </defs>
      {/* vòng quấn quanh cổ */}
      <path d="M85,50 Q100,62 115,50 L117,59 Q100,71 83,59 Z" fill={`url(#${id})`} stroke="#2C2A27" strokeWidth="0.6" />
      {/* hai đầu khăn buông trước ngực */}
      <path d="M104,62 Q121,66 124,92 Q126,110 118,126 L106,120 Q112,96 102,72 Z" fill={`url(#${id})`} stroke="#2C2A27" strokeWidth="0.6" />
      <path d="M96,64 Q85,72 85,94 L96,98 Q98,82 100,68 Z" fill={`url(#${id})`} stroke="#2C2A27" strokeWidth="0.6" />
      <circle cx="101" cy="62" r="3" fill={`url(#${id})`} stroke="#2C2A27" strokeWidth="0.6" />
    </g>
  );
}

function TramCai({ coDauChe }: { coDauChe: boolean }) {
  // Có nón/khăn che đầu: cài ngang bên búi tóc. Không có: cài xuyên qua búi tóc.
  const [x1, y1, x2, y2] = coDauChe ? [116, 30, 144, 22] : [84, -2, 124, -17];
  const canh = [0, 72, 144, 216, 288].map((a) => {
    const r = (a * Math.PI) / 180;
    return { x: x2 + 3.6 * Math.cos(r), y: y2 + 3.6 * Math.sin(r) };
  });
  return (
    <g className="pk-vao">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={VANG} strokeWidth="2.4" strokeLinecap="round" />
      <line x1={x1} y1={y1 - 0.8} x2={x2} y2={y2 - 0.8} stroke="#F3DC8A" strokeWidth="0.7" strokeLinecap="round" />
      {canh.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="#E8B84A" stroke={VANG_TOI} strokeWidth="0.4" />
      ))}
      <circle cx={x2} cy={y2} r="1.9" fill={SON} />
      {/* chuỗi hạt rủ */}
      <path d={`M${x2},${y2 + 4} q2,6 0,11`} stroke={VANG} strokeWidth="0.8" fill="none" />
      <circle cx={x2} cy={y2 + 16} r="1.4" fill="#E8B84A" />
    </g>
  );
}

function QuatGiay({ tay }: { tay: Diem }) {
  const R = 42;
  const diem = (doGoc: number, ban: number) => {
    const r = (doGoc * Math.PI) / 180;
    return { x: tay.x + ban * Math.cos(r), y: tay.y + ban * Math.sin(r) };
  };
  const a = diem(-112, R);
  const b = diem(-18, R);
  const a2 = diem(-112, 12);
  const b2 = diem(-18, 12);
  const nan = Array.from({ length: 7 }, (_, i) => diem(-112 + (i * 94) / 6, R));
  return (
    <g className="pk-vao">
      <path d={`M${tay.x},${tay.y} L${a.x},${a.y} A${R},${R} 0 0 1 ${b.x},${b.y} Z`} fill="#EFD08A" stroke="#B5483A" strokeWidth="0.8" />
      <path d={`M${tay.x},${tay.y} L${a2.x},${a2.y} A12,12 0 0 1 ${b2.x},${b2.y} Z`} fill="#8A5A2B" />
      {nan.map((p, i) => (
        <line key={i} x1={tay.x} y1={tay.y} x2={p.x} y2={p.y} stroke="#8A5A2B" strokeWidth="0.8" />
      ))}
      <path d={`M${a.x},${a.y} A${R},${R} 0 0 1 ${b.x},${b.y}`} stroke="#B5483A" strokeWidth="1.8" fill="none" />
      <circle cx={tay.x} cy={tay.y} r="6.5" fill={DA} />
    </g>
  );
}

function YemDao() {
  return (
    <g className="pk-vao">
      <path d="M91,58 L109,58 L124,98 L100,132 L76,98 Z" fill="#E8A0A0" stroke="#C97A7A" strokeWidth="1" />
      <path d="M92.5,63 L107.5,63 L119,98 L100,125 L81,98 Z" fill="none" stroke={VANG} strokeWidth="0.7" opacity="0.8" />
      <path d="M91,58 Q100,66 109,58" stroke="#C97A7A" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function LopPhuKien({ ten, tayPhai, uid }: { ten: Set<string>; tayPhai: Diem; uid: string }) {
  const coDauChe =
    ten.has('Nón lá') || ten.has('Nón quai thao') || ten.has('Khăn đóng') || ten.has('Khăn mỏ quạ');
  return (
    <>
      {ten.has('Yếm đào') && <YemDao />}
      {ten.has('Khăn rằn') && <KhanRan uid={uid} />}
      {ten.has('Khăn đóng') && <KhanDong />}
      {ten.has('Khăn mỏ quạ') && <KhanMoQua />}
      {ten.has('Nón quai thao') && <NonQuaiThao />}
      {ten.has('Nón lá') && <NonLa uid={uid} />}
      {ten.has('Trâm cài') && <TramCai coDauChe={coDauChe} />}
      {ten.has('Quạt giấy') && <QuatGiay tay={tayPhai} />}
    </>
  );
}

/* ========== Ba bộ trang phục ========== */

function AoDaiSvg({ mauChinh, mauPhu, ten, uid }: SvgProps) {
  const chinh = `url(#${uid}-chinh)`;
  const phu = `url(#${uid}-phu)`;
  const toi = phaMau(mauChinh, -0.22);
  const coGuoc = ten.has('Guốc mộc');
  return (
    <Khung uid={uid}>
      <defs>
        <VaiGradient id={`${uid}-chinh`} mau={mauChinh} />
        <VaiGradient id={`${uid}-phu`} mau={mauPhu} />
      </defs>

      <Co />
      <Chan x={84} coGuoc={coGuoc} />
      <Chan x={116} coGuoc={coGuoc} />

      {/* tay áo */}
      <polygon fill={chinh} points="78,60 66,68 58,93 53,123 56,150 69,154 73,126 78,98 82,72" />
      <polygon fill={chinh} points="122,60 134,68 142,93 147,123 144,150 131,154 127,126 122,98 118,72" />

      {/* quần ống rộng, lộ ra ở hai bên và dưới tà áo */}
      <polygon fill={phu} points="80,186 99,186 98,388 70,388" />
      <polygon fill={phu} points="101,186 120,186 130,388 102,388" />

      {/* thân + tà áo dài */}
      <polygon
        className="tm"
        fill={chinh}
        stroke={mauPhu}
        strokeWidth="2"
        strokeLinejoin="round"
        points="72,58 128,58 122,86 114,110 120,136 122,190 126,372 74,372 78,190 80,136 86,110 78,86"
      />
      <polygon fill={toi} opacity="0.5" points="74.3,364 125.7,364 126,372 74,372" />
      <line x1="100" y1="196" x2="100" y2="364" stroke={toi} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="92" y1="93" x2="90" y2="183" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="108" y1="93" x2="110" y2="183" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />

      {/* hàng khuy cài bên hông */}
      {[
        [111, 70],
        [114, 78],
        [115.5, 86],
        [116, 94],
      ].map(([x, y]) => (
        <circle key={y} cx={x} cy={y} r="1.3" fill={VANG} />
      ))}
      <circle cx="100" cy="98" r="4.5" fill="none" stroke={mauPhu} strokeWidth="1.3" />

      {/* cổ đứng */}
      <path d="M90,47 C90,42 110,42 110,47 L109,58 C104,55 96,55 91,58 Z" fill={chinh} stroke={toi} strokeWidth="0.6" />

      <BanTay x={62} y={151} />
      <BanTay x={138} y={151} />

      <DauNguoi />
      <LopPhuKien ten={ten} tayPhai={{ x: 138, y: 151 }} uid={uid} />
    </Khung>
  );
}

function AoTuThanSvg({ mauChinh, mauPhu, ten, uid }: SvgProps) {
  const chinh = `url(#${uid}-chinh)`;
  const phu = `url(#${uid}-phu)`;
  const toi = phaMau(mauChinh, -0.22);
  const coGuoc = ten.has('Guốc mộc');
  return (
    <Khung uid={uid}>
      <defs>
        <VaiGradient id={`${uid}-chinh`} mau={mauChinh} />
        <VaiGradient id={`${uid}-phu`} mau={mauPhu} />
      </defs>

      <Co />
      <Chan x={84} coGuoc={coGuoc} />
      <Chan x={116} coGuoc={coGuoc} />

      <polygon fill={chinh} points="64,58 52,70 44,98 40,133 44,146 60,148 62,118 66,90 70,66" />
      <polygon fill={chinh} points="136,58 148,70 156,98 160,133 156,146 140,148 138,118 134,90 130,66" />

      {/* váy */}
      <polygon
        className="tm"
        fill={chinh}
        stroke={phaMau(mauChinh, -0.3)}
        strokeWidth="2"
        strokeLinejoin="round"
        points="62,148 138,148 164,298 172,386 28,386 36,298"
      />
      <line x1="88" y1="150" x2="72" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="112" y1="150" x2="128" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.5" />
      <line x1="100" y1="153" x2="100" y2="384" stroke={toi} strokeWidth="1" strokeOpacity="0.35" />

      {/* thân áo */}
      <polygon fill={chinh} points="66,56 134,56 130,93 122,118 128,148 72,148 78,118 70,93" />
      <polygon fill={phu} points="88,56 112,56 100,108" />
      <rect fill={VANG} x="68" y="145" width="64" height="7" rx="1" />
      <rect fill="#F3DC8A" x="68" y="145" width="64" height="2" rx="1" opacity="0.5" />

      <path d="M90,47 C90,43 110,43 110,47 L108,56 L92,56 Z" fill={chinh} />

      <BanTay x={46} y={148} />
      <BanTay x={154} y={148} />

      <DauNguoi />
      <LopPhuKien ten={ten} tayPhai={{ x: 154, y: 148 }} uid={uid} />
    </Khung>
  );
}

function AoBaBaSvg({ mauChinh, mauPhu, ten, uid }: SvgProps) {
  const chinh = `url(#${uid}-chinh)`;
  const phu = `url(#${uid}-phu)`;
  const toiChinh = phaMau(mauChinh, -0.25);
  const toiPhu = phaMau(mauPhu, -0.2);
  const coGuoc = ten.has('Guốc mộc');
  return (
    <Khung uid={uid}>
      <defs>
        <VaiGradient id={`${uid}-chinh`} mau={mauChinh} />
        <VaiGradient id={`${uid}-phu`} mau={mauPhu} />
      </defs>

      <Co />
      <Chan x={83} coGuoc={coGuoc} />
      <Chan x={117} coGuoc={coGuoc} />

      <polygon fill={chinh} points="68,58 58,68 50,93 46,123 50,143 66,146 68,118 72,93 76,68" />
      <polygon fill={chinh} points="132,58 142,68 150,93 154,123 150,143 134,146 132,118 128,93 124,68" />

      {/* quần ống rộng */}
      <polygon
        fill={phu}
        points="74,163 126,163 133,300 131,386 103,386 100,262 97,386 69,386 67,300"
      />
      <line x1="84" y1="200" x2="83" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="116" y1="200" x2="117" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />

      {/* áo */}
      <polygon
        className="tm"
        fill={chinh}
        stroke={toiChinh}
        strokeWidth="1.5"
        strokeLinejoin="round"
        points="70,56 130,56 128,83 120,110 125,138 130,166 70,166 75,138 80,110 72,83"
      />
      {/* cổ chữ V (áo bà ba không có cổ) */}
      <polygon fill={DA} points="90,56 110,56 100,74" />
      <path d="M90,56 L100,74 L110,56" stroke={toiChinh} strokeWidth="0.8" fill="none" />
      {/* hàng khuy */}
      {[84, 98, 112, 126, 140].map((y) => (
        <circle key={y} cx="100" cy={y} r="1.3" fill={toiChinh} />
      ))}
      {/* hai túi trước */}
      <path d="M77,142 L91,142 L91,160 L77,160 Z" stroke={toiChinh} strokeWidth="0.8" fill="none" />
      <path d="M109,142 L123,142 L123,160 L109,160 Z" stroke={toiChinh} strokeWidth="0.8" fill="none" />

      <BanTay x={50} y={145} />
      <BanTay x={150} y={145} />

      <DauNguoi />
      <LopPhuKien ten={ten} tayPhai={{ x: 150, y: 145 }} uid={uid} />
    </Khung>
  );
}

/**
 * LƯU Ý: component này phủ kín khung cha (absolute inset-0),
 * nên khung cha phải có `relative` và có chiều cao.
 */
export default function XemTruoc({ trangPhuc, mauChinh, mauPhu, cacPhuKien }: Props) {
  const uid = useId().replace(/:/g, '');

  if (!trangPhuc) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-ink-soft">
        <span className="text-3xl" aria-hidden>
          👘
        </span>
        Chọn một trang phục ở bên trái để bắt đầu xem trước
      </div>
    );
  }

  const chinh = mauChinh?.maHex ?? '#E4D3B4';
  const phu = mauPhu?.maHex ?? '#E4D3B4';
  const ten = new Set(cacPhuKien.map((p) => p.ten.normalize('NFC').trim()));
  const tenTrangPhuc = trangPhuc.ten.normalize('NFC').trim();
  const props: SvgProps = { mauChinh: chinh, mauPhu: phu, ten, uid };

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3"
      style={{
        background: 'radial-gradient(ellipse at 50% 38%, rgba(255,255,255,0.55), rgba(255,255,255,0) 62%)',
      }}
    >
      {/* vầng tròn mờ phía sau người mẫu */}
      <div aria-hidden className="absolute aspect-square w-[62%] rounded-full bg-lacquer/5" />
      <div className="relative h-full w-full">
        {tenTrangPhuc === 'Áo dài' && <AoDaiSvg {...props} />}
        {tenTrangPhuc === 'Áo tứ thân' && <AoTuThanSvg {...props} />}
        {tenTrangPhuc === 'Áo bà ba' && <AoBaBaSvg {...props} />}
      </div>
    </div>
  );
}