'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { ConnectWalletButton } from '@/components/auth/connect-wallet-button';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Shows children only when authenticated.
 * Instead of redirecting (which caused the landing-page loop),
 * renders an inline "connect wallet" prompt so the user stays on the page.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="rounded-full bg-brand-400/10 p-5">
          <svg className="h-10 w-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6" />
          </svg>
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-bold text-white">Connect your wallet</h2>
          <p className="mb-6 max-w-sm text-white/50">
            Connect your Stellar wallet via the Freighter extension to access BuildBridge.
          </p>
          <ConnectWalletButton />
        </div>
        <div className="mt-4 rounded-xl border border-white/5 bg-white/2 px-6 py-4 text-sm text-white/30">
          <p className="mb-1 font-medium text-white/50">Don't have Freighter?</p>
          <a
            href="https://freighter.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            Install from freighter.app →
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
