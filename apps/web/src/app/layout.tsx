import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { Navbar } from '@/components/auth/navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BuildBridge — Where builders meet capital',
    template: '%s | BuildBridge',
  },
  description:
    'An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain, and connect with the right investors.',
  openGraph: {
    type: 'website',
    url: 'https://buildbridge.xyz',
    siteName: 'BuildBridge',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-navy-900 text-white antialiased">
        <AuthProvider>
          <Navbar />
          <div className="pt-14">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
