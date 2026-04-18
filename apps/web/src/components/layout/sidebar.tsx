'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard',     label: 'Dashboard',     icon: DashIcon     },
      { href: '/pitch-builder', label: 'Pitches',       icon: PitchIcon    },
      { href: '/milestones',    label: 'Milestones',    icon: ChainIcon    },
      { href: '/investors',     label: 'Investors',     icon: InvestIcon   },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings/profile', label: 'Profile',   icon: ProfileIcon  },
    ],
  },
];

/* ── SVG icon components (16×16) ── */
function DashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.25"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.25"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.25"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.25"/>
    </svg>
  );
}
function PitchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M3 2h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M5 5.5h6M5 8h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );
}
function ChainIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M6.5 9.5l3-3M5.5 7l-1.5 1.5a2.121 2.121 0 003 3L8.5 10M10.5 9l1.5-1.5a2.121 2.121 0 00-3-3L7.5 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );
}
function InvestIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M1.5 13c0-2.485 2.015-4 4.5-4s4.5 1.515 4.5 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <path d="M11 7.5l1.5 1.5L14 7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M2.5 13.5c0-3.038 2.462-5 5.5-5s5.5 1.962 5.5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.414 1.414M11.536 11.536l1.414 1.414M3.05 12.95l1.414-1.414M11.536 4.464l1.414-1.414" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M13.5 10A6 6 0 016 2.5a6 6 0 000 11A6 6 0 0013.5 10z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round"/>
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { founder, isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const displayName = founder?.name ?? (founder ? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}` : null);
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';

  return (
    <aside className="flex h-full w-56 flex-col border-r border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E]">

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-100 dark:border-[#1E3050] px-5">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
          Build
          <span className="rounded-md px-1.5 py-0.5 text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #00C2A8, #00a891)' }}>
            Bridge
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white',
                      ].join(' ')}
                    >
                      <Icon />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Profile quick link */}
        {isAuthenticated && founder && (
          <div className="mb-4">
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Public
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href={`/profile/${founder.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white"
                >
                  <ProfileIcon />
                  My Public Profile
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom: user + dark mode toggle */}
      <div className="shrink-0 border-t border-gray-100 dark:border-[#1E3050] p-3 space-y-3">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white"
        >
          <span className="flex h-5 w-5 items-center justify-center">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </span>
          {isDark ? 'Light mode' : 'Dark mode'}
          {/* Animated pill */}
          <span className={[
            'ml-auto flex h-5 w-9 items-center rounded-full border transition-all duration-300',
            isDark ? 'border-gray-600 bg-gray-700 justify-end' : 'border-gray-200 bg-gray-100 justify-start',
          ].join(' ')}>
            <span className={[
              'mx-0.5 h-3.5 w-3.5 rounded-full transition-all duration-300',
              isDark ? 'bg-white' : 'bg-gray-900',
            ].join(' ')} />
          </span>
        </button>

        {/* User card */}
        {isAuthenticated && founder ? (
          <div className="rounded-xl border border-gray-100 dark:border-[#1E3050] bg-gray-50 dark:bg-[#1A2640] p-3">
            <div className="flex items-center gap-2.5 mb-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #00C2A8, #00a891)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                  {displayName}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Stellar {founder.network ?? 'testnet'}
                </p>
              </div>
            </div>
            {/* Disconnect inline */}
            <ConnectWalletButton compact />
          </div>
        ) : (
          <div className="px-1">
            <ConnectWalletButton compact />
          </div>
        )}
      </div>
    </aside>
  );
}
