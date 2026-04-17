// Sentry error tracking — Session 8
// Install: npm install @sentry/node @sentry/nextjs

import * as Sentry from '@sentry/node';

export function initSentry() {
  const dsn = process.env['SENTRY_DSN'];
  if (!dsn) {
    if (process.env['NODE_ENV'] === 'production') {
      console.warn('[Sentry] SENTRY_DSN not set — error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env['NODE_ENV'] ?? 'development',
    tracesSampleRate: process.env['NODE_ENV'] === 'production' ? 0.2 : 1.0,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
  });

  console.log('[Sentry] Error tracking initialised');
}

/**
 * Captures an exception and adds founder context if available.
 */
export function captureError(
  error: unknown,
  context?: { founderId?: string; route?: string },
) {
  Sentry.withScope((scope) => {
    if (context?.founderId) {
      scope.setUser({ id: context.founderId });
    }
    if (context?.route) {
      scope.setTag('route', context.route);
    }
    Sentry.captureException(error);
  });
}
