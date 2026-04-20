'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { InvestorCard } from '@/components/investors/investor-card';
import { InvestorFilters } from '@/components/investors/investor-filters';
import { useInvestors } from '@/hooks/use-investors';

type Tab = 'matched' | 'all' | 'connections';

export function InvestorsContent() {
  const { isAuthenticated } = useAuth();
  const { matches, allInvestors, connections, isLoadingMatches, isLoadingAll, isConnecting, connectedIds, error, connectToInvestor } = useInvestors();
  const [tab, setTab] = useState<Tab>(isAuthenticated ? 'matched' : 'all');
  const [sector, setSector] = useState('');
  const [stage, setStage] = useState('');
  const [geography, setGeography] = useState('');
  const [search, setSearch] = useState('');

  const filteredAll = useMemo(() => {
    let list = allInvestors;
    if (sector) list = list.filter(i => i.sectors.includes(sector));
    if (stage) list = list.filter(i => i.stages.includes(stage));
    if (geography) list = list.filter(i => i.geography.includes(geography));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || (i.firm ?? '').toLowerCase().includes(q) || i.sectors.some(s => s.includes(q)));
    }
    return list;
  }, [allInvestors, sector, stage, geography, search]);

  const TABS: { key: Tab; label: string; count?: number; authRequired?: boolean }[] = [
    { key: 'matched', label: 'Matched for you', count: matches.length, authRequired: true },
    { key: 'all',     label: 'All investors',   count: allInvestors.length },
    { key: 'connections', label: 'My connections', count: connections.length, authRequired: true },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Investor Discovery</h1>
        <p className="mt-1 text-sm text-white/40">
          {isAuthenticated ? 'Matched based on your pitch, milestones, and profile.' : 'Browse 20+ investors across Africa and global Web3.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-navy-800 p-1">
        {TABS.filter(t => !t.authRequired || isAuthenticated).map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={['flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm transition',
              tab === key ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white/70',
            ].join(' ')}>
            {label}
            {count !== undefined && count > 0 && (
              <span className={['rounded-full px-1.5 py-0.5 text-xs font-medium',
                tab === key ? 'bg-brand-400 text-navy-900' : 'bg-white/10 text-white/40',
              ].join(' ')}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}

      {/* Matched tab */}
      {tab === 'matched' && isAuthenticated && (
        isLoadingMatches ? (
          <div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3].map(i => <div key={i} className="h-52 animate-pulse rounded-xl bg-white/5" />)}</div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className="mb-2 text-3xl"></p>
            <p className="mb-1 font-medium text-white/40">No matches yet</p>
            <p className="text-sm text-white/20">Complete your pitch and profile to get personalised investor matches.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {matches.map(match => (
              <InvestorCard key={match.investor.id} investor={match.investor} match={match}
                isConnected={connectedIds.has(match.investor.id)} isConnecting={isConnecting} onConnect={connectToInvestor} />
            ))}
          </div>
        )
      )}

      {/* All investors tab — visible to everyone */}
      {tab === 'all' && (
        <>
          <div className="mb-4 flex flex-col gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search investors…" className="input" />
            <InvestorFilters sector={sector} stage={stage} geography={geography}
              onSectorChange={setSector} onStageChange={setStage} onGeographyChange={setGeography}
              onClear={() => { setSector(''); setStage(''); setGeography(''); }} />
          </div>
          {!isAuthenticated && (
            <div className="mb-4 rounded-lg border border-brand-400/20 bg-brand-400/5 px-4 py-3 text-sm text-white/50">
               Connect your wallet to get personalised matches and send connection requests.
            </div>
          )}
          {isLoadingAll ? (
            <div className="grid gap-4 sm:grid-cols-2">{[0,1,2,3].map(i => <div key={i} className="h-52 animate-pulse rounded-xl bg-white/5" />)}</div>
          ) : filteredAll.length === 0 ? (
            <div className="py-10 text-center text-white/30">No investors match your filters.</div>
          ) : (
            <>
              <p className="mb-3 text-sm text-white/30">{filteredAll.length} investor{filteredAll.length !== 1 ? 's' : ''}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAll.map(investor => {
                  const match = matches.find(m => m.investor.id === investor.id);
                  return (
                    <InvestorCard key={investor.id} investor={investor} match={match}
                      isConnected={connectedIds.has(investor.id)} isConnecting={isConnecting} onConnect={connectToInvestor} />
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Connections tab */}
      {tab === 'connections' && isAuthenticated && (
        connections.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
            <p className="mb-2 text-3xl"></p>
            <p className="mb-1 font-medium text-white/40">No connections yet</p>
            <p className="text-sm text-white/20">Request a connection from the Matched or All investors tabs.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map(conn => (
              <div key={conn.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-navy-800 p-4">
                <div>
                  <p className="font-medium text-white">{conn.investor.name}</p>
                  {conn.investor.firm && <p className="text-xs text-white/40">{conn.investor.firm}</p>}
                  {conn.message && <p className="mt-1 text-xs text-white/30">&ldquo;{conn.message.slice(0, 80)}{conn.message.length > 80 ? '…' : ''}&rdquo;</p>}
                </div>
                <div className="text-right">
                  <span className={['rounded-full px-2.5 py-0.5 text-xs font-medium',
                    conn.status === 'accepted' ? 'bg-brand-400/15 text-brand-400' : conn.status === 'declined' ? 'bg-red-500/15 text-red-400' : 'bg-white/10 text-white/40',
                  ].join(' ')}>{conn.status}</span>
                  <p className="mt-1 text-xs text-white/20">{new Date(conn.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </main>
  );
}
