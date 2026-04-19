# BuildBridge — Sidebar Fix

Two bugs fixed:
1. **Settings tab missing** from the sidebar nav
2. **Sidebar disappearing** when navigating to Pitches / Milestones / Investors / Settings

---

## Why the sidebar was disappearing

The previous zip only added `DashboardShell` to `/dashboard/layout.tsx`.
When Next.js navigated to `/pitch-builder`, it used that route's layout — which had no shell — so the sidebar unmounted.

**The fix: add a `layout.tsx` to every app section.**

---

## Files to copy into your project

### 1. Updated sidebar (Settings tab added)
```
src/components/layout/sidebar.tsx      ← Settings icon + nav item added
src/components/layout/topbar.tsx       ← unchanged
src/components/layout/dashboard-shell.tsx ← unchanged
```

### 2. Layout files — one per section (THE KEY FIX)
Copy all of these:

```
src/app/dashboard/layout.tsx
src/app/pitch-builder/layout.tsx
src/app/milestones/layout.tsx
src/app/investors/layout.tsx
src/app/profile/layout.tsx
src/app/settings/layout.tsx
```

Every one of them contains exactly this:
```tsx
import { DashboardShell } from '@/components/layout/dashboard-shell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
```

### 3. Other updated files
```
src/app/layout.tsx                          ← root (no pt-14, ThemeProvider wraps all)
src/app/globals.css                         ← design system
src/components/auth/connect-wallet-button.tsx ← compact prop for sidebar user card
src/context/theme-context.tsx               ← unchanged
```

---

## How Next.js layout nesting works

```
src/app/layout.tsx              ← Root: ThemeProvider + AuthProvider
  └── src/app/dashboard/layout.tsx     ← DashboardShell (sidebar + topbar)
        └── src/app/dashboard/page.tsx ← just the page content

  └── src/app/pitch-builder/layout.tsx ← DashboardShell (sidebar + topbar)
        └── src/app/pitch-builder/page.tsx

  └── src/app/milestones/layout.tsx    ← DashboardShell (sidebar + topbar)
  └── src/app/investors/layout.tsx     ← DashboardShell (sidebar + topbar)
  └── src/app/profile/layout.tsx       ← DashboardShell (sidebar + topbar)
  └── src/app/settings/layout.tsx      ← DashboardShell (sidebar + topbar)
```

Because `DashboardShell` is mounted at each section's layout level, Next.js keeps the sidebar alive across navigation — only `{children}` (the page content) re-renders.

---

## Sidebar nav structure

```
MAIN
  Dashboard
  Pitches
  Milestones
  Investors

ACCOUNT
  Settings        ← new

PUBLIC
  My Profile      ← only shown when authenticated
```

Active state: black pill (light mode) / white pill (dark mode).
Dark mode toggle and user card are pinned to the bottom of the sidebar.
