# BuildBridge — Sidebar Dashboard Layout

A professional SaaS-style sidebar + topbar layout replacing the old top-only navbar.

---

## What Changed

| Before | After |
|--------|-------|
| Fixed top navbar on all pages | Sidebar nav on all app pages |
| No page titles | Topbar with dynamic page title |
| Dark mode toggle in navbar | Dark mode toggle in sidebar bottom |
| Disconnect button in navbar | Disconnect link in sidebar user card |
| All routes share same layout | Landing page has its own public navbar |

---

## Quickest Setup (Route Group)

The cleanest approach — create an `(app)` route group so every app page shares the sidebar:

```
src/app/
├── page.tsx                ← Landing page (public, own navbar)
├── layout.tsx              ← Root layout (ThemeProvider, AuthProvider)
├── globals.css
│
└── (app)/                  ← Route group — parentheses = invisible in URL
    ├── layout.tsx          ← DashboardShell (sidebar + topbar)  ← use app/(app)/layout.tsx
    ├── dashboard/
    │   └── page.tsx
    ├── pitch-builder/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── milestones/
    │   └── page.tsx
    ├── investors/
    │   └── page.tsx
    ├── profile/
    │   └── [id]/page.tsx
    └── settings/
        └── profile/page.tsx
```

URLs stay exactly the same: `/dashboard`, `/pitch-builder`, etc.

---

## Alternative: Per-Section layout.tsx

If you can't reorganise into a route group, add a `layout.tsx` to each section:

```tsx
// src/app/pitch-builder/layout.tsx
import { DashboardShell } from '@/components/layout/dashboard-shell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
```

Repeat for `/milestones`, `/investors`, `/profile`, `/settings`.

---

## New Files

```
src/components/layout/sidebar.tsx          ← Main sidebar (nav + user card + dark toggle)
src/components/layout/topbar.tsx           ← Slim top bar (page title + avatar)
src/components/layout/dashboard-shell.tsx  ← Flexbox wrapper: sidebar + topbar + main

src/components/auth/connect-wallet-button.tsx  ← Updated: accepts compact prop for sidebar
src/components/auth/navbar.tsx                 ← Now only used on landing page
src/context/theme-context.tsx                  ← Unchanged from previous zip
src/app/(app)/layout.tsx                       ← Route group layout (copy to your (app) folder)
src/app/globals.css                            ← Updated design system
tailwind.config.js                             ← darkMode: 'class' (required)
```

---

## Sidebar Structure

```
┌─────────────────────┐
│  Build [Bridge]     │  ← Logo
├─────────────────────┤
│  MAIN               │
│  › Dashboard        │  ← Active = black pill (light) / white pill (dark)
│    Pitches          │
│    Milestones       │
│    Investors        │
│  ACCOUNT            │
│    Profile          │
│  PUBLIC             │
│    My Public Profile│
├─────────────────────┤
│  [moon] Dark mode ○│  ← Animated toggle
│  ┌─────────────────┐│
│  │ AO  Ada Okonkwo ││  ← User card
│  │     Disconnect  ││
│  └─────────────────┘│
└─────────────────────┘
```

---

## Topbar

- Left: dynamic page title (auto-detected from pathname)  
- Right: Stellar network badge + notification bell + avatar

---

## Required Tailwind Config

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // ← required
  content: [...],
};
```
