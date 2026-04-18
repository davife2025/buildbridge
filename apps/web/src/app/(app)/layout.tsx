/**
 * RECOMMENDED SETUP — Route Group Layout
 *
 * Create a folder: src/app/(app)/
 * Move this file to: src/app/(app)/layout.tsx
 * Move these folders inside (app)/:
 *   dashboard/, pitch-builder/, milestones/, investors/,
 *   profile/, settings/
 *
 * The (app) folder name is ignored in URLs — routes stay the same.
 * All pages inside get the sidebar + topbar automatically.
 *
 * Your landing page stays at: src/app/page.tsx (outside the group)
 */

import { DashboardShell } from '@/components/layout/dashboard-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
