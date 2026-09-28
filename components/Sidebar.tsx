'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU = [
  { href: '/', ten: 'Trang chủ' },
  { href: '/phoi-do', ten: 'Thử nghiệm phối đồ' },
  { href: '/lookbook', ten: 'Lookbook của tôi' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-ink-soft/15 min-h-screen p-6">
      <div className="font-display text-lg font-semibold mb-8">
        Việt Phục <span className="text-lacquer">Studio</span>
      </div>
      <nav className="space-y-1">
        {MENU.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className={`block px-3 py-2 rounded-md text-sm transition ${
              pathname === m.href
                ? 'bg-paper-raised text-ink font-medium'
                : 'text-ink-soft hover:bg-paper-raised/50'
            }`}
          >
            {m.ten}
          </Link>
        ))}
      </nav>
    </aside>
  );
}