import Link from 'next/link';

const FEATURES = [
  { icon: '🤖', title: 'AI Pitch Builder', body: 'Claude guides you section by section — problem, solution, traction, team, market, ask.' },
  { icon: '⛓️', title: 'On-Chain Milestones', body: 'Record achievements via Soroban smart contracts — immutably verifiable by investors.' },
  { icon: '🎯', title: 'Investor Matching', body: 'Get matched with VCs and angels based on your sector, stage, and geography.' },
  { icon: '📊', title: 'Founder Profile', body: 'A public, investor-ready profile with verified on-chain traction as your proof.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="flex flex-col items-center px-6 pb-16 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-4 py-1.5 text-sm text-brand-400">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
          Built on Stellar · Agentic AI Track · SCF
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
          Build<span className="text-brand-400">Bridge</span>
        </h1>
        <p className="mb-3 text-xl font-medium text-white/90 md:text-2xl">Where builders meet capital</p>
        <p className="mb-10 max-w-xl text-base text-white/50 md:text-lg">
          An Agentic AI platform on Stellar that helps founders craft investor-ready pitches,
          verify traction on-chain, and connect with the right investors.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard" className="btn-primary px-8 py-3 text-base">Launch app →</Link>
          <a href="https://github.com/buildbridge" target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3 text-base">GitHub</a>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, title, body }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-navy-800 p-5">
              <span className="mb-3 block text-2xl">{icon}</span>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/40">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-white/5 py-16 text-center">
        <p className="text-sm text-white/30">🌍 Built for founders in Africa and emerging markets — democratising access to global capital.</p>
      </section>
    </main>
  );
}
