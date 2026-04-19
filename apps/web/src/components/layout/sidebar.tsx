'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

/* ── Icons ── */
function Icon({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
      <path d={d} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      {d2 && <path d={d2} stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

const DashIcon    = () => <Icon d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />;
const PitchIcon   = () => <Icon d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" d2="M5 6h6M5 9h4" />;
const ChainIcon   = () => <Icon d="M6.5 9.5l3-3M5.5 7l-1.5 1.5a2.121 2.121 0 003 3L8.5 10M10.5 9l1.5-1.5a2.121 2.121 0 00-3-3L7.5 6" />;
const InvestIcon  = () => <Icon d="M2 13c0-2.761 2.239-4 4-4s4 1.239 4 4M6 6a2 2 0 100-4 2 2 0 000 4M11 8l1.5 1.5L14 8" />;
const ProfileIcon = () => <Icon d="M8 7a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM2.5 14c0-3.038 2.462-4.5 5.5-4.5s5.5 1.462 5.5 4.5" />;
const SettingsIcon= () => <Icon d="M8 10a2 2 0 100-4 2 2 0 000 4z" d2="M13.3 8a5.3 5.3 0 00-.1-1l1.4-1.1-1.3-2.3-1.7.7a5 5 0 00-1.7-1L9.6 2h-3l-.3 1.3a5 5 0 00-1.7 1l-1.7-.7L1.6 5.9 3 7a5.3 5.3 0 000 2L1.6 10.1l1.3 2.3 1.7-.7a5 5 0 001.7 1L6.6 14h3l.3-1.3a5 5 0 001.7-1l1.7.7 1.3-2.3L13.3 9" />;
const SunIcon     = () => <Icon d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.2 3.2l1.06 1.06M11.74 11.74l1.06 1.06M3.2 12.8l1.06-1.06M11.74 4.26l1.06-1.06M8 11a3 3 0 100-6 3 3 0 000 6z" />;
const MoonIcon    = () => <Icon d="M12.5 10.5A5.5 5.5 0 015.5 3.5a5.5 5.5 0 000 9 5.5 5.5 0 007-2z" />;

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard',     label: 'Dashboard',  Icon: DashIcon    },
      { href: '/pitch-builder', label: 'Pitches',    Icon: PitchIcon   },
      { href: '/milestones',    label: 'Milestones', Icon: ChainIcon   },
      { href: '/investors',     label: 'Investors',  Icon: InvestIcon  },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/settings/profile', label: 'Settings',       Icon: SettingsIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { founder, isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const displayName = founder?.name
    ?? (founder ? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}` : null);
  const initials = displayName ? displayName.slice(0, 2).toUpperCase() : '??';

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E]">

      {/* ── Logo ── */}
      <div className="flex h-14 shrink-0 items-center border-b border-gray-100 dark:border-[#1E3050] px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Build
          <span
            className="rounded-md px-1.5 py-0.5 text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#00C2A8,#00a891)' }}
          >
            Bridge
          </span>
        </Link>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, Icon }) => {
                // Active if pathname starts with href (but /settings shouldn't match /settings AND /settings/profile separately)
                const active =
                  href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
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

        {/* Public profile link */}
        {isAuthenticated && founder && (
          <div>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
              Public
            </p>
            <ul>
              <li>
                <Link
                  href={`/profile/${founder.id}`}
                  className={[
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    pathname.startsWith('/profile')
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white',
                  ].join(' ')}
                >
                  <ProfileIcon />
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* ── Bottom: dark toggle + user card ── */}
      <div className="shrink-0 border-t border-gray-100 dark:border-[#1E3050] p-3 space-y-2">

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-[#1A2640] hover:text-gray-900 dark:hover:text-white"
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
          {/* Pill toggle */}
          <span className={[
            'ml-auto flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-300',
            isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-100',
          ].join(' ')}>
            <span className={[
              'mx-0.5 h-3.5 w-3.5 rounded-full transition-all duration-300',
              isDark ? 'translate-x-4 bg-white' : 'translate-x-0 bg-gray-900',
            ].join(' ')} />
          </span>
        </button>

        {/* User card */}
        {isAuthenticated && founder ? (
          <div className="rounded-xl border border-gray-100 dark:border-[#1E3050] bg-gray-50 dark:bg-[#1A2640] p-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#00C2A8,#00a891)' }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: '#00C2A8' }} />
                  Stellar {founder.network ?? 'testnet'}
                </p>
              </div>
            </div>
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
