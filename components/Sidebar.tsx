'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSoLookbook } from '@/hooks/useSoLookbook';

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const MENU: { href: string; ten: string; ngan: string; icon: ReactNode }[] = [
  { href: '/', ten: 'Trang chủ', ngan: 'Trang chủ', icon: <Icon><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon> },
  { href: '/van-hoa', ten: 'Khám phá văn hoá', ngan: 'Văn hoá', icon: <Icon><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z" /><path d="M4 19V5" /><path d="M9 7h6" /></Icon> },
  { href: '/phoi-do', ten: 'Thử nghiệm phối đồ', ngan: 'Phối đồ', icon: <Icon><path d="M9 3l-6 4 2 4 3-1v10h8V10l3 1 2-4-6-4a3 3 0 01-6 0z" /></Icon> },
  { href: '/lookbook', ten: 'Lookbook của tôi', ngan: 'Lookbook', icon: <Icon><path d="M6 3h12v18l-6-4-6 4z" /></Icon> },
];

function dangO(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

function HuyHieuSo({ so }: { so: number }) {
  if (so <= 0) return null;
  return (
    <span
      aria-label={`${so} bộ phối đã lưu`}
      className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-lacquer px-1.5 text-[11px] font-semibold leading-5 text-white"
    >
      {so}
    </span>
  );
}

/** Thanh tiêu đề gọn cho điện thoại (màn hình nhỏ không có sidebar). */
export function TieuDeDiDong() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-soft/15 bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
      <p className="font-display text-base font-semibold">
        Việt Phục <span className="text-lacquer">Studio</span>
      </p>
    </header>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const soLookbook = useSoLookbook();

  return (
    <>
      {/* Máy tính: sidebar bên trái, đứng yên khi cuộn */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-ink-soft/15 p-6 lg:block">
        <div className="mb-8 font-display text-lg font-semibold">
          Việt Phục <span className="text-lacquer">Studio</span>
        </div>
        <nav aria-label="Điều hướng chính" className="space-y-1">
          {MENU.map((m) => {
            const dang = dangO(pathname, m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                aria-current={dang ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  dang ? 'bg-paper-raised font-medium text-ink' : 'text-ink-soft hover:bg-paper-raised/50'
                }`}
              >
                {m.icon}
                {m.ten}
                {m.href === '/lookbook' && <HuyHieuSo so={soLookbook} />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Điện thoại: thanh tab dưới cùng, ngón cái chạm tới được */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-soft/15 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {MENU.map((m) => {
            const dang = dangO(pathname, m.href);
            return (
              <li key={m.href}>
                <Link
                  href={m.href}
                  aria-current={dang ? 'page' : undefined}
                  className={`relative flex flex-col items-center gap-0.5 py-2 text-[11px] transition ${
                    dang ? 'font-semibold text-lacquer' : 'text-ink-soft'
                  }`}
                >
                  {m.icon}
                  {m.ngan}
                  {m.href === '/lookbook' && soLookbook > 0 && (
                    <span className="absolute right-[calc(50%-1.4rem)] top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-lacquer px-1 text-[10px] font-semibold leading-4 text-white">
                      {soLookbook}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
