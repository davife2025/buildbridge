import Link from 'next/link';
import { Navbar } from '@/components/auth/navbar';
const FEATURES = [
  { icon: '', title: 'AI Pitch Builder',    body: 'Kimi K2 guides you section by section — problem, solution, traction, team, market, ask.' },
  { icon: '', title: 'On-Chain Milestones', body: 'Record achievements via Soroban smart contracts — immutably verifiable by investors.' },
  { icon: '', title: 'Investor Matching',   body: 'Get matched with VCs and angels based on your sector, stage, and geography.' },
  { icon: '', title: 'Founder Profile',     body: 'A public, investor-ready profile with verified on-chain traction as your proof.' },
];
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-14">
        <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,194,168,0.08) 0%, transparent 70%)' }} />
          <div className="relative mx-auto max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] px-4 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 shadow-sm">
              <span className="h-2 w-2 rounded-full" style={{ background: '#00C2A8' }} />
              Built on Stellar · Agentic AI Track · SCF
            </div>
            <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-7xl">
              Build<span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg,#00C2A8,#00927C)' }}>Bridge</span>
            </h1>
            <p className="mb-3 text-xl font-semibold text-gray-700 dark:text-gray-300 md:text-2xl">Where builders meet capital</p>
            <p className="mb-10 text-base text-gray-500 dark:text-gray-400">An Agentic AI platform on Stellar that helps founders craft investor-ready pitches, verify traction on-chain, and connect with the right investors.</p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard" className="btn-primary px-8 py-3 text-base shadow-md">Launch app →</Link>
              <a href="https://github.com/davife2025/buildbridge.git" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3 text-base">GitHub</a>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] p-6 shadow-sm transition-all hover:border-gray-300 dark:hover:border-[#2A3F64] hover:shadow-md">
                <span className="mb-4 block text-3xl">{icon}</span>
                <h3 className="mb-2 font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-gray-100 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] py-14 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500"> Built for founders in Africa and emerging markets — democratising access to global capital.</p>
        </section>
      </main>
    </>
  );
}
