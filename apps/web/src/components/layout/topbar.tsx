'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':        'Dashboard',
  '/pitch-builder':    'Pitch Builder',
  '/milestones':       'Milestones',
  '/investors':        'Investors',
  '/profile':          'Profile',
  '/settings':         'Settings',
  '/settings/profile': 'Profile Settings',
};

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5a5 5 0 015 5v3l1 1.5H2L3 9.5v-3a5 5 0 015-5zM6.5 13.5a1.5 1.5 0 003 0"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const { founder } = useAuth();

  const title =
    Object.entries(ROUTE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([route]) => pathname.startsWith(route))?.[1] ?? 'BuildBridge';

  const initials = founder?.name
    ? founder.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : founder?.publicKey.slice(0, 2).toUpperCase() ?? '';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-100 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] px-6">
      <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Stellar network pill */}
        <div className="hidden items-center gap-1.5 rounded-full border border-gray-200 dark:border-[#1E3050] bg-gray-50 dark:bg-[#1A2640] px-3 py-1 sm:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#00C2A8' }} />
          <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
            Stellar {founder?.network ?? 'testnet'}
          </span>
        </div>

        {/* Bell */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-[#1E3050] text-gray-400 transition hover:border-gray-300 dark:hover:border-[#2A3F64] hover:text-gray-700 dark:hover:text-gray-200">
          <BellIcon />
        </button>

        {/* Avatar */}
        {initials && (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00C2A8,#00a891)' }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
