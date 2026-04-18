import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';

export const metadata: Metadata = {
  title: {
    default: 'BuildBridge — Where builders meet capital',
    template: '%s | BuildBridge',
  },
  description:
    'An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain, and connect with the right investors.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{
          __html: `try{const s=localStorage.getItem('bb_theme');const p=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.classList.toggle('dark',(s??p)==='dark')}catch(e){}`
        }} />
      </head>
      <body className="bg-[#F8FAFC] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
