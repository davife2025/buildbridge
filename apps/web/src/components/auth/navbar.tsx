'use client';

import Link from 'next/link';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

/**
 * Public navbar — only visible on the landing page (/).
 * All authenticated dashboard routes use DashboardShell with Sidebar instead.
 */
export function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 glass shadow-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
          Build
          <span className="rounded-md px-1.5 py-0.5 text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #00C2A8, #00a891)' }}>
            Bridge
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
            Launch app →
          </Link>
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
}
