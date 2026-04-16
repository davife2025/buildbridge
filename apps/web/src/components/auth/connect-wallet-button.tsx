'use client';

import { useAuth } from '@/context/auth-context';
import { useWallet } from '@/hooks/use-wallet';

const STATUS_LABELS = {
  idle: 'Connect Wallet',
  connecting: 'Connecting…',
  signing: 'Sign in Freighter…',
  verifying: 'Verifying…',
  error: 'Try again',
};

export function ConnectWalletButton() {
  const { isAuthenticated, founder, isLoading } = useAuth();
  const { status, error, connect, disconnect } = useWallet();

  const isBusy = ['connecting', 'signing', 'verifying'].includes(status);

  if (isLoading) {
    return (
      <div className="h-10 w-36 animate-pulse rounded-lg bg-white/10" aria-label="Loading…" />
    );
  }

  if (isAuthenticated && founder) {
    return (
      <div className="flex items-center gap-3">
        {/* Avatar / initials */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400/20 text-xs font-semibold text-brand-400">
          {founder.name
            ? founder.name.slice(0, 2).toUpperCase()
            : founder.publicKey.slice(0, 2).toUpperCase()}
        </div>

        <span className="hidden text-sm text-white/70 sm:block">
          {founder.name ?? `${founder.publicKey.slice(0, 6)}…${founder.publicKey.slice(-4)}`}
        </span>

        <button
          onClick={disconnect}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:text-white/80"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={connect}
        disabled={isBusy}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-4 py-2 text-sm font-medium text-navy-900 transition hover:bg-brand-300 disabled:cursor-wait disabled:opacity-70"
      >
        {isBusy && (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {STATUS_LABELS[status]}
      </button>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
