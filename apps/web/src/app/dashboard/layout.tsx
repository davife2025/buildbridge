import { DashboardShell } from '@/components/layout/dashboard-shell';

/**
 * This layout wraps every route under /dashboard with the sidebar shell.
 * Next.js App Router applies it to /dashboard and all child routes.
 *
 * To extend sidebar coverage to /pitch-builder, /milestones etc.,
 * either move this layout up to src/app/(app)/layout.tsx using a route group,
 * OR duplicate the DashboardShell wrapper in each section's layout.tsx.
 *
 * Example route group approach (recommended for full coverage):
 *   src/app/(app)/layout.tsx  ← this file
 *   src/app/(app)/dashboard/page.tsx
 *   src/app/(app)/pitch-builder/page.tsx
 *   src/app/(app)/milestones/page.tsx
 *   etc.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
