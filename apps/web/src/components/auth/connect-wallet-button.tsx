'use client';

import { useAuth } from '@/context/auth-context';
import { useWallet } from '@/hooks/use-wallet';

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const { isAuthenticated, founder, isLoading } = useAuth();
  const { statusLabel, error, isBusy, connect, disconnect } = useWallet();

  if (isLoading) {
    return <div className="h-8 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-[#1A2640]" />;
  }

  if (compact) {
    return isAuthenticated ? (
      <button
        onClick={disconnect}
        className="flex w-full items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 transition hover:text-red-500 dark:hover:text-red-400"
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Disconnect wallet
      </button>
    ) : (
      <button onClick={connect} disabled={isBusy} className="btn-brand w-full justify-center py-2 text-xs disabled:cursor-wait">
        {isBusy ? 'Connecting…' : 'Connect Wallet'}
      </button>
    );
  }

  if (isAuthenticated && founder) {
    const display = founder.name ?? `${founder.publicKey.slice(0, 4)}…${founder.publicKey.slice(-4)}`;
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#00C2A8,#00a891)' }}>
          {display.slice(0, 2).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:block">{display}</span>
        <button onClick={disconnect}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button onClick={connect} disabled={isBusy} className="btn-brand disabled:cursor-wait">
        {isBusy && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        )}
        {statusLabel}
      </button>
      {error && <p className="max-w-[220px] text-right text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
