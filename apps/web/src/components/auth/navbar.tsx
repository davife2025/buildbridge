'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/pitch-builder', label: 'Pitch Builder' },
  { href: '/milestones', label: 'Milestones' },
  { href: '/investors', label: 'Investors' },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-navy-900/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          Build<span className="text-brand-400">Bridge</span>
        </Link>

        {/* Nav links — only show when authenticated */}
        {isAuthenticated && (
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={[
                  'rounded-md px-3 py-1.5 text-sm transition',
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* Wallet connect */}
        <ConnectWalletButton />
      </div>
    </nav>
  );
}
