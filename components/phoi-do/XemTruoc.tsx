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
const KEM = '#F1E7D2';

/** t > 0: sáng hơn (trộn trắng), t < 0: tối hơn (trộn đen). */
function phaMau(hex: string, t: number): string {
  const so = parseInt(hex.replace('#', ''), 16);
  const goc = t >= 0 ? 255 : 0;
  const kenh = [(so >> 16) & 255, (so >> 8) & 255, so & 255].map((v) =>
    Math.round(v + (goc - v) * Math.abs(t)),
  );
  return `#${kenh.map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/** Thu nhỏ/phóng to quanh điểm cằm (100, 50) để đầu vẫn khớp với cổ. */
const phepTiLeDau = (s: number) => `translate(100 50) scale(${s}) translate(-100 -50)`;

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
  // userSpaceOnUse: dải màu chạy liền cả người, chỗ nối vai/tay không bị lệch tông.
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="46" y1="0" x2="154" y2="0">
      <stop offset="0" className="tm" style={{ stopColor: phaMau(mau, 0.14) }} />
      <stop offset="0.5" className="tm" style={{ stopColor: mau }} />
      <stop offset="1" className="tm" style={{ stopColor: phaMau(mau, -0.16) }} />
    </linearGradient>
  );
}

/* ========== Cơ thể ========== */

function Co() {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <defs>
        {/* dưới cằm tối hơn, xuống thấp sáng dần */}
        <linearGradient id={`${id}-co`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B58E67" />
          <stop offset="0.45" stopColor="#D5B78F" />
          <stop offset="1" stopColor="#DCC09B" />
        </linearGradient>
      </defs>
      <rect x="92" y="44" width="16" height="18" rx="4" fill={`url(#${id}-co)`} />
    </>
  );
}

function BanTay({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="6.5" fill={DA} />;
}

/** Một con mắt hạnh nhân: tròng trắng, mống mắt, mí trên bán nguyệt. */
function Mat({ cx, id }: { cx: number; id: string }) {
  const x0 = cx - 4.2;
  const x1 = cx + 4.2;
  const hinh = `M${x0},28.6 Q${cx},24 ${x1},28.6 Q${cx},32 ${x0},28.6 Z`;
  return (
    <g>
      <clipPath id={id}>
        <path d={hinh} />
      </clipPath>
      {/* tròng trắng */}
      <path d={hinh} fill="#FBF6EE" />
      <g clipPath={`url(#${id})`}>
        {/* bóng mí mắt trên đổ xuống tròng trắng */}
        <rect x={x0} y="25" width="9" height="2.6" fill="#B58E67" opacity="0.28" />
        {/* mống mắt, đồng tử, điểm sáng */}
        <circle cx={cx} cy="28.4" r="1.9" fill="#4A3426" />
        <circle cx={cx} cy="28.4" r="1.05" fill="#14100D" />
        <circle cx={cx + 0.75} cy="27.6" r="0.55" fill="#FFFFFF" />
      </g>
      {/* mí trên: chỉ một cung bán nguyệt */}
      <path
        d={`M${x0 - 0.4},28.9 Q${cx},23.7 ${x1 + 0.4},28.9`}
        stroke="#1E1612"
        strokeWidth="1.15"
        fill="none"
        strokeLinecap="round"
      />
      {/* lằn mi dưới */}
      <path
        d={`M${x0 + 0.6},29.6 Q${cx},31.6 ${x1 - 0.6},29.6`}
        stroke="#B58E67"
        strokeWidth="0.4"
        fill="none"
        opacity="0.55"
      />
    </g>
  );
}

function DauNguoiGoc({ ten }: { ten: Set<string> }) {
  const id = useId().replace(/:/g, '');
  const mat = `${id}-da`;
  const toc = `${id}-toc`;

  return (
    <>
      <defs>
        {/* da: sáng ở trán/gò má, tối dần ra hai bên hàm */}
        <radialGradient id={mat} cx="0.42" cy="0.36" r="0.78">
          <stop offset="0" stopColor="#F1DBBA" />
          <stop offset="0.6" stopColor="#E2C7A3" />
          <stop offset="1" stopColor="#CBA880" />
        </radialGradient>
        {/* tóc: đen ánh nâu, tối ở chân tóc */}
        <linearGradient id={toc} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#3C2E25" />
          <stop offset="1" stopColor="#1A1410" />
        </linearGradient>
      </defs>

      {/* ----- Trâm cài: vẽ TRƯỚC lớp tóc nên nằm dưới tóc, chỉ lộ hai đầu ----- */}
      {ten.has('Trâm cài') && (
        <TramCai
          coDauChe={
            ten.has('Nón lá') ||
            ten.has('Nón quai thao') ||
            ten.has('Khăn đóng') ||
            ten.has('Khăn mỏ quạ')
          }
        />
      )}

      {/* ----- Tóc phía sau + búi tóc ----- */}
      <ellipse cx="100" cy="22" rx="19.5" ry="21.5" fill={`url(#${toc})`} />
      <ellipse cx="100" cy="-5" rx="12.5" ry="9" fill={`url(#${toc})`} />
      <path d="M91.5,-6 Q100,-12.5 108.5,-6" stroke="#5A4638" strokeWidth="0.6" fill="none" opacity="0.8" />
      <path d="M92.5,-1 Q100,-7 107.5,-1" stroke="#5A4638" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M95,3 Q100,-2 105,3" stroke="#5A4638" strokeWidth="0.5" fill="none" opacity="0.6" />
      {/* dây buộc tóc */}
      <path d="M90.5,2 Q100,6.5 109.5,2" stroke={SON} strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ----- Tai (nằm sau khuôn mặt) + khuyên ----- */}
      <ellipse cx="82.8" cy="31" rx="2.6" ry="4.2" fill="#D3B38B" />
      <ellipse cx="117.2" cy="31" rx="2.6" ry="4.2" fill="#D3B38B" />
      <path d="M82,28.5 Q83.5,31 82,33.5" stroke="#B58E67" strokeWidth="0.5" fill="none" opacity="0.8" />
      <path d="M118,28.5 Q116.5,31 118,33.5" stroke="#B58E67" strokeWidth="0.5" fill="none" opacity="0.8" />
      <circle cx="82.6" cy="36.2" r="1.8" fill={VANG} />
      <circle cx="117.4" cy="36.2" r="1.8" fill={VANG} />
      <circle cx="82.2" cy="35.7" r="0.5" fill="#FFF3C4" />
      <circle cx="116.9" cy="35.7" r="0.5" fill="#FFF3C4" />

      {/* ----- Khuôn mặt: cằm thon dần ----- */}
      <path
        d="M83,28 C83,14 91,9 100,9 C109,9 117,14 117,28 C117,38 112,47 106,50 C103,52 97,52 94,50 C88,47 83,38 83,28 Z"
        fill={`url(#${mat})`}
      />
      {/* bóng dưới cằm + đường quai hàm */}
      <path d="M92,50.5 Q100,54.5 108,50.5" stroke="#A98258" strokeWidth="1.6" fill="none" opacity="0.28" strokeLinecap="round" />
      <path d="M85,36 Q87,45 94,49.5" stroke="#B58E67" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M115,36 Q113,45 106,49.5" stroke="#B58E67" strokeWidth="0.5" fill="none" opacity="0.5" />

      {/* ----- Mắt (không vẽ lông mày) ----- */}
      <Mat cx={92} id={`${id}-el`} />
      <Mat cx={108} id={`${id}-er`} />

      {/* ----- Mũi ----- */}
      <path d="M100.4,27 Q100.5,32 100.1,35" stroke="#F6E6CC" strokeWidth="0.9" fill="none" opacity="0.55" strokeLinecap="round" />
      <path d="M99.4,28 Q98.6,34 97.6,36.2 Q100,38.2 102.4,36.2" stroke="#A98258" strokeWidth="0.75" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <ellipse cx="98.4" cy="36.6" rx="0.9" ry="0.5" fill="#8E6A47" opacity="0.5" />
      <ellipse cx="101.6" cy="36.6" rx="0.9" ry="0.5" fill="#8E6A47" opacity="0.5" />

      {/* ----- Má hồng ----- */}
      <ellipse cx="90" cy="37" rx="4.6" ry="2.8" fill="#E8998C" opacity="0.34" />
      <ellipse cx="110" cy="37" rx="4.6" ry="2.8" fill="#E8998C" opacity="0.34" />

      {/* ----- Môi: môi trên + môi dưới ----- */}
      <path d="M95.5,43.2 Q97.8,41.7 100,42.8 Q102.2,41.7 104.5,43.2 Q100,44.3 95.5,43.2 Z" fill="#A9483F" />
      <path d="M96,43.5 Q100,47.6 104,43.5 Q100,44.6 96,43.5 Z" fill="#C9695C" />
      <ellipse cx="100" cy="45.4" rx="1.8" ry="0.5" fill="#F2B3A8" opacity="0.55" />
      <path d="M95.2,43.1 Q94.6,43.2 94.3,42.7" stroke="#A9483F" strokeWidth="0.5" fill="none" strokeLinecap="round" />
      <path d="M104.8,43.1 Q105.4,43.2 105.7,42.7" stroke="#A9483F" strokeWidth="0.5" fill="none" strokeLinecap="round" />

      {/* ----- Tóc phía trước: rẽ ngôi giữa, ôm thái dương ----- */}
      <path
        d="M82.5,32 C80,22 82,8 100,3 C118,8 120,22 117.5,32 C116.5,26 115,21 111,17.5 C107,14.5 103.5,13 100,12.5 C96.5,13 93,14.5 89,17.5 C85,21 83.5,26 82.5,32 Z"
        fill={`url(#${toc})`}
      />
      <path d="M100,4 L100,12.4" stroke="#C4A27A" strokeWidth="0.8" strokeLinecap="round" />
      {/* sợi tóc + ánh bóng */}
      <path d="M100,5 C92,6 86,12 84,22" stroke="#5A4638" strokeWidth="0.55" fill="none" opacity="0.65" />
      <path d="M100,5 C108,6 114,12 116,22" stroke="#5A4638" strokeWidth="0.55" fill="none" opacity="0.65" />
      <path d="M100,7.5 C94,9 89.5,13.5 87.5,21" stroke="#5A4638" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M100,7.5 C106,9 110.5,13.5 112.5,21" stroke="#5A4638" strokeWidth="0.5" fill="none" opacity="0.5" />
      <path d="M90,9 C94,5.8 100,4.8 106,6" stroke="#7A6454" strokeWidth="1.3" fill="none" opacity="0.5" strokeLinecap="round" />
      {/* vài sợi tóc con mềm ở thái dương */}
      <path d="M86,24 Q86.6,28 87.4,31" stroke="#2A2118" strokeWidth="0.5" fill="none" opacity="0.7" />
      <path d="M114,24 Q113.4,28 112.6,31" stroke="#2A2118" strokeWidth="0.5" fill="none" opacity="0.7" />
    </>
  );
}

function DauNguoi({ tiLe = 1, ten }: { tiLe?: number; ten: Set<string> }) {
  return (
    <g transform={phepTiLeDau(tiLe)}>
      <DauNguoiGoc ten={ten} />
    </g>
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

function LopPhuKien({
  ten,
  tayPhai,
  uid,
  yemTrong = false,
  tiLeDau = 1,
}: {
  ten: Set<string>;
  tayPhai: Diem;
  uid: string;
  /** true = trang phục tự vẽ yếm ở lớp trong (áo tứ thân), không vẽ đè lên ngoài. */
  yemTrong?: boolean;
  /** Cùng tỉ lệ với <DauNguoi tiLe=...> để đồ đội đầu khớp với đầu. */
  tiLeDau?: number;
}) {
  return (
    <>
      {ten.has('Yếm đào') && !yemTrong && <YemDao />}
      {ten.has('Khăn rằn') && <KhanRan uid={uid} />}

      {/* Trâm cài không vẽ ở đây: nó nằm trong <DauNguoi> để ở dưới lớp tóc. */}
      <g transform={phepTiLeDau(tiLeDau)}>
        {ten.has('Khăn đóng') && <KhanDong />}
        {ten.has('Khăn mỏ quạ') && <KhanMoQua />}
        {ten.has('Nón quai thao') && <NonQuaiThao />}
        {ten.has('Nón lá') && <NonLa uid={uid} />}
      </g>

      {ten.has('Quạt giấy') && <QuatGiay tay={tayPhai} />}
    </>
  );
}

/* ========== Ba bộ trang phục ========== */

function AoDaiSvg({ mauChinh, mauPhu, ten, uid }: SvgProps) {
  const chinh = `url(#${uid}-chinh)`;
  const phu = `url(#${uid}-phu)`;
  const toi = phaMau(mauChinh, -0.25);
  const toiPhu = phaMau(mauPhu, -0.2);
  const taSau = phaMau(mauChinh, -0.14);
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

      {/* quần ống rộng: chỉ lộ từ hông xuống (hai bên tà áo) và dưới gấu áo */}
      <polygon fill={phu} points="80,186 120,186 134,388 101,388 100,240 99,388 66,388" />
      <line x1="86" y1="200" x2="82" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="114" y1="200" x2="118" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />

      {/* tà sau thấp thoáng hai bên */}
      <polygon fill={taSau} points="74,188 78,188 66,350 59,350" />
      <polygon fill={taSau} points="126,188 122,188 134,350 141,350" />

      {/* tay áo: vai tròn, thon dần ra cổ tay */}
      <path
        fill={chinh}
        d="M91,56 C84,56 76,57 70,62 C60,68 55,92 53,122 C52,134 53,144 56,150 Q58,155 66,155 L69,154 C70,144 72,130 75,118 C77,104 79,92 80,80 Z"
      />
      <path
        fill={chinh}
        d="M109,56 C116,56 124,57 130,62 C140,68 145,92 147,122 C148,134 147,144 144,150 Q142,155 134,155 L131,154 C130,144 128,130 125,118 C123,104 121,92 120,80 Z"
      />

      {/* thân áo + tà trước, vai dốc liền với tay áo */}
      <path
        className="tm"
        fill={chinh}
        d="M91,56 C84,56 76,57 70,62 L75,86 L83,112 L80,136 L77,188 L66,352 L134,352 L123,188 L120,136 L117,112 L125,86 L130,62 C124,57 116,56 109,56 Z"
      />
      <path
        d="M75,86 L83,112 L80,136 L77,188 L66,352 L134,352 L123,188 L120,136 L117,112 L125,86"
        fill="none"
        stroke={toi}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <polygon fill={toi} opacity="0.45" points="66.6,344 133.4,344 134,352 66,352" />
      <line x1="92" y1="100" x2="90" y2="186" stroke={toi} strokeWidth="1" strokeOpacity="0.45" />
      <line x1="108" y1="100" x2="110" y2="186" stroke={toi} strokeWidth="1" strokeOpacity="0.45" />
      <line x1="100" y1="196" x2="100" y2="344" stroke={toi} strokeWidth="1" strokeOpacity="0.3" />

      {/* hàng khuy cài chéo từ cổ xuống nách phải */}
      <path d="M108,58 Q121,70 123,96" stroke={toi} strokeWidth="1" fill="none" strokeOpacity="0.7" />
      {[
        [113.8, 64.9],
        [118.3, 73.5],
        [121.3, 83.9],
      ].map(([x, y]) => (
        <circle key={y} cx={x} cy={y} r="1.4" fill={VANG} />
      ))}

      {/* cổ đứng */}
      <path d="M91,47 C91,41 109,41 109,47 L108,59 L92,59 Z" fill={chinh} stroke={toi} strokeWidth="0.6" />

      <BanTay x={61} y={154} />
      <BanTay x={139} y={154} />

      <DauNguoi tiLe={0.86} ten={ten} />
      <LopPhuKien ten={ten} tayPhai={{ x: 139, y: 154 }} uid={uid} tiLeDau={0.86} />
    </Khung>
  );
}

function AoTuThanSvg({ mauChinh, mauPhu, ten, uid }: SvgProps) {
  const chinh = `url(#${uid}-chinh)`;
  const phu = `url(#${uid}-phu)`;
  const toi = phaMau(mauChinh, -0.25);
  const toiPhu = phaMau(mauPhu, -0.2);
  const coGuoc = ten.has('Guốc mộc');
  const coYem = ten.has('Yếm đào');
  return (
    <Khung uid={uid}>
      <defs>
        <VaiGradient id={`${uid}-chinh`} mau={mauChinh} />
        <VaiGradient id={`${uid}-phu`} mau={mauPhu} />
      </defs>

      <Co />
      <Chan x={84} coGuoc={coGuoc} />
      <Chan x={116} coGuoc={coGuoc} />

      {/* váy (màu phụ), gấu váy lộ ra dưới gấu áo choàng */}
      <polygon
        className="tm"
        fill={phu}
        stroke={toiPhu}
        strokeWidth="1.2"
        strokeLinejoin="round"
        points="79,136 121,136 142,386 58,386"
      />
      <line x1="90" y1="150" x2="77" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="100" y1="150" x2="100" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.3" />
      <line x1="110" y1="150" x2="123" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />

      {/* LỚP TRONG (nằm dưới hai vạt áo choàng): yếm đào nếu đã chọn, không thì áo lót trắng */}
      {coYem ? (
        <g className="pk-vao">
          <path d="M93,58 L95,45" stroke="#E8A0A0" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M107,58 L105,45" stroke="#E8A0A0" strokeWidth="1.6" strokeLinecap="round" />
          <polygon points="91,58 109,58 114,96 100,138 86,96" fill="#E8A0A0" stroke="#C97A7A" strokeWidth="1" strokeLinejoin="round" />
          <path d="M94,63 L106,63 L109,96 L100,130 L91,96 Z" fill="none" stroke={VANG} strokeWidth="0.8" opacity="0.85" />
          <path d="M91,58 Q100,66 109,58" stroke="#C97A7A" strokeWidth="1.2" fill="none" />
        </g>
      ) : (
        <>
          <polygon fill={KEM} points="90,58 110,58 116,140 84,140" />
          <polygon fill={DA} points="93,58 107,58 100,72" />
          <path d="M93,58 L100,72 L107,58" stroke="#D8C9AA" strokeWidth="0.8" fill="none" />
        </>
      )}

      {/* hai vạt áo choàng mở phía trước, liền với tay áo, vai dốc tròn */}
      <path
        className="tm"
        fill={chinh}
        stroke={toi}
        strokeWidth="1"
        strokeLinejoin="round"
        d="M95,56 C88,56 76,56 68,62 C58,68 50,88 46,116 C44,130 43,140 44,148 Q46,153 54,152 L60,151 C61,138 62,124 65,110 C67,100 69,94 70,90 L71,140 L68,200 L64,372 L85,372 L84,140 L89,94 L95,58 Z"
      />
      <path
        className="tm"
        fill={chinh}
        stroke={toi}
        strokeWidth="1"
        strokeLinejoin="round"
        d="M105,56 C112,56 124,56 132,62 C142,68 150,88 154,116 C156,130 157,140 156,148 Q154,153 146,152 L140,151 C139,138 138,124 135,110 C133,100 131,94 130,90 L129,140 L132,200 L136,372 L115,372 L116,140 L111,94 L105,58 Z"
      />
      <line x1="78" y1="150" x2="75" y2="368" stroke={toi} strokeWidth="1" strokeOpacity="0.4" />
      <line x1="122" y1="150" x2="125" y2="368" stroke={toi} strokeWidth="1" strokeOpacity="0.4" />

      {/* thắt lưng lụa thắt nút, buông hai đầu */}
      <rect fill={VANG} x="70" y="136" width="60" height="8" rx="1.5" />
      <rect fill="#F3DC8A" x="70" y="136" width="60" height="2.2" rx="1" opacity="0.5" />
      <path d="M98,144 Q92,170 94,198" stroke={VANG} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M102,144 Q111,168 108,190" stroke={VANG_TOI} strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="140" r="5" fill={VANG} stroke={VANG_TOI} strokeWidth="0.8" />

      <BanTay x={51} y={154} />
      <BanTay x={149} y={154} />

      <DauNguoi ten={ten} />
      <LopPhuKien ten={ten} tayPhai={{ x: 149, y: 154 }} uid={uid} yemTrong />
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
      <Chan x={86} coGuoc={coGuoc} />
      <Chan x={114} coGuoc={coGuoc} />

      {/* quần ống rộng vừa phải */}
      <polygon fill={phu} points="80,170 120,170 126,386 102,386 100,246 98,386 74,386" />
      <line x1="88" y1="190" x2="86" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />
      <line x1="112" y1="190" x2="114" y2="384" stroke={toiPhu} strokeWidth="1" strokeOpacity="0.35" />

      {/* tay áo ôm, vai tròn */}
      <path
        fill={chinh}
        d="M92,56 C86,56 80,56 74,60 C65,64 59,86 56,112 C54,126 54,138 55,145 Q57,150 63,150 L67,149 C68,138 69,124 71,112 C73,100 75,90 77,78 Z"
      />
      <path
        fill={chinh}
        d="M108,56 C114,56 120,56 126,60 C135,64 141,86 144,112 C146,126 146,138 145,145 Q143,150 137,150 L133,149 C132,138 131,124 129,112 C127,100 125,90 123,78 Z"
      />
      <line x1="54.6" y1="141" x2="68" y2="142.5" stroke={toiChinh} strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="145.4" y1="141" x2="132" y2="142.5" stroke={toiChinh} strokeWidth="0.8" strokeOpacity="0.6" />

      {/* áo ôm, dài tới hông, vai dốc */}
      <path
        className="tm"
        fill={chinh}
        d="M92,56 C86,56 80,56 74,60 L76,84 L82,108 L80,134 L76,176 L124,176 L120,134 L118,108 L124,84 L126,60 C120,56 114,56 108,56 Z"
      />
      <path
        d="M76,84 L82,108 L80,134 L76,176 L124,176 L120,134 L118,108 L124,84"
        fill="none"
        stroke={toiChinh}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <polygon fill={toiChinh} opacity="0.4" points="76.2,170 123.8,170 124,176 76,176" />

      {/* cổ chữ V (áo bà ba không có cổ đứng) */}
      <polygon fill={DA} points="92,56 108,56 100,70" />
      <path d="M92,56 L100,70 L108,56" stroke={toiChinh} strokeWidth="0.8" fill="none" />

      {/* hàng khuy giữa */}
      <line x1="100" y1="70" x2="100" y2="174" stroke={toiChinh} strokeWidth="0.8" strokeOpacity="0.6" />
      {[82, 98, 114, 130, 146, 162].map((y) => (
        <circle key={y} cx="100" cy={y} r="1.3" fill={toiChinh} />
      ))}

      {/* hai túi trước */}
      <path d="M82,146 h10 v16 h-10 z" stroke={toiChinh} strokeWidth="0.8" fill="none" />
      <path d="M108,146 h10 v16 h-10 z" stroke={toiChinh} strokeWidth="0.8" fill="none" />
      <line x1="82" y1="149" x2="92" y2="149" stroke={toiChinh} strokeWidth="0.6" />
      <line x1="108" y1="149" x2="118" y2="149" stroke={toiChinh} strokeWidth="0.6" />

      <BanTay x={60} y={152} />
      <BanTay x={140} y={152} />

      <DauNguoi tiLe={0.84} ten={ten} />
      <LopPhuKien ten={ten} tayPhai={{ x: 140, y: 152 }} uid={uid} tiLeDau={0.84} />
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