/**
 * ProtectedRoute — now a pass-through.
 *
 * The connect wallet button lives exclusively in the navbar.
 * Pages render their own content and handle unauthenticated state
 * inline (e.g. show empty state, disable actions, prompt to connect
 * inside the relevant section — not as a full-page gate).
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
