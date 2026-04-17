import { prisma } from '../db/client';

const INVESTORS = [
  {
    name: 'Kola Adeola',
    firm: 'Lagos Ventures',
    email: 'kola@lagosventures.vc',
    bio: 'Pre-seed and seed investor focused on African fintech and infrastructure. Former investment banker at Stanbic.',
    twitterHandle: 'kolaadeola',
    websiteUrl: 'https://lagosventures.vc',
    sectors: ['fintech', 'infrastructure', 'web3', 'africa'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa', 'West Africa', 'Nigeria'],
    minCheck: 25000,
    maxCheck: 150000,
  },
  {
    name: 'Amara Diallo',
    firm: 'Dakar Capital',
    email: 'amara@dakarcapital.com',
    bio: 'Investing in founders building the financial stack for Sub-Saharan Africa. Ex-Wave Mobile Money.',
    twitterHandle: 'amaradiallo',
    sectors: ['fintech', 'payments', 'africa', 'mobile'],
    stages: ['seed', 'series_a'],
    geography: ['Africa', 'West Africa', 'Francophone Africa'],
    minCheck: 100000,
    maxCheck: 500000,
  },
  {
    name: 'James Osei',
    firm: 'Accra Angels',
    email: 'james@accraangels.com',
    bio: 'Angel investor and operator. Backing mission-driven founders across Ghana and beyond.',
    sectors: ['healthtech', 'edtech', 'africa', 'saas'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa', 'East Africa', 'West Africa'],
    minCheck: 10000,
    maxCheck: 75000,
  },
  {
    name: 'Lena Müller',
    firm: 'Berlin Web3 Fund',
    email: 'lena@berlinweb3.fund',
    bio: 'Thesis: decentralised infrastructure and emerging market applications of Web3. Former Ethereum Foundation researcher.',
    twitterHandle: 'lenamuller_eth',
    websiteUrl: 'https://berlinweb3.fund',
    sectors: ['web3', 'defi', 'blockchain', 'infrastructure'],
    stages: ['seed', 'series_a'],
    geography: ['Global', 'Europe', 'Africa'],
    minCheck: 200000,
    maxCheck: 1000000,
  },
  {
    name: 'Yemi Adeyemi',
    firm: 'Stellar Ecosystem Fund',
    email: 'yemi@stellarfund.io',
    bio: 'Investing in projects building on Stellar and Soroban. Particularly excited about payments, identity, and DeFi.',
    twitterHandle: 'yemiadeyemi',
    websiteUrl: 'https://stellarfund.io',
    sectors: ['stellar', 'web3', 'defi', 'payments', 'blockchain'],
    stages: ['pre_seed', 'seed', 'series_a'],
    geography: ['Global'],
    minCheck: 50000,
    maxCheck: 300000,
  },
  {
    name: 'Sofia Andersen',
    firm: 'Nordic Impact Capital',
    email: 'sofia@nordicimpact.vc',
    bio: 'Impact-first investor. Backing companies solving real problems in underserved markets with sustainable business models.',
    twitterHandle: 'sofiaandersen_vc',
    sectors: ['impact', 'fintech', 'africa', 'sustainability'],
    stages: ['seed', 'series_a'],
    geography: ['Global', 'Africa', 'Southeast Asia'],
    minCheck: 150000,
    maxCheck: 750000,
  },
  {
    name: 'Taiwo Bankole',
    firm: 'Pan-African Growth Fund',
    email: 'taiwo@pagfund.com',
    bio: 'Series A specialist across pan-African markets. Portfolio includes 3 unicorns. Focused on businesses with network effects.',
    sectors: ['fintech', 'logistics', 'saas', 'africa', 'marketplace'],
    stages: ['series_a', 'series_b'],
    geography: ['Africa'],
    minCheck: 500000,
    maxCheck: 5000000,
  },
  {
    name: 'Priya Nair',
    firm: 'Emerging Markets Ventures',
    email: 'priya@emv.capital',
    bio: 'Investing in the best founders across Africa, Southeast Asia, and LatAm. Deep operator experience in payments and logistics.',
    twitterHandle: 'priyanair_vc',
    websiteUrl: 'https://emv.capital',
    sectors: ['fintech', 'logistics', 'saas', 'marketplace'],
    stages: ['seed', 'series_a'],
    geography: ['Africa', 'Southeast Asia', 'LatAm', 'Global'],
    minCheck: 250000,
    maxCheck: 2000000,
  },
  {
    name: 'Chidi Eze',
    firm: 'Nairobi Tech Angels',
    email: 'chidi@nairobiangels.ke',
    bio: 'Angel syndicate lead. Early backer of 12 African startups. Focus on B2B SaaS and developer tools.',
    sectors: ['saas', 'devtools', 'b2b', 'africa'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa', 'East Africa', 'Nigeria', 'Kenya'],
    minCheck: 15000,
    maxCheck: 100000,
  },
  {
    name: 'Marcus Webb',
    firm: 'DeFi Capital Partners',
    email: 'marcus@deficapital.io',
    bio: 'DeFi protocol investor and advisor. Led investments in 20+ DeFi projects. Building the decentralised financial system.',
    twitterHandle: 'marcuswebb_defi',
    sectors: ['defi', 'web3', 'crypto', 'blockchain', 'stellar'],
    stages: ['seed', 'series_a'],
    geography: ['Global'],
    minCheck: 100000,
    maxCheck: 1000000,
  },
  {
    name: 'Fatima Al-Hassan',
    firm: 'Cairo Innovation Fund',
    email: 'fatima@cairoinnovation.vc',
    bio: 'Backing founders building for the MENA and African markets. Passionate about financial inclusion and women-led startups.',
    sectors: ['fintech', 'africa', 'inclusion', 'edtech', 'healthtech'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa', 'MENA', 'North Africa'],
    minCheck: 30000,
    maxCheck: 200000,
  },
  {
    name: 'David Chen',
    firm: 'SV Blockchain Fund',
    email: 'david@svblockchain.fund',
    bio: 'Silicon Valley fund focused exclusively on blockchain infrastructure and Layer 1/Layer 2 ecosystems.',
    twitterHandle: 'davidchen_sv',
    websiteUrl: 'https://svblockchain.fund',
    sectors: ['blockchain', 'infrastructure', 'web3', 'stellar', 'defi'],
    stages: ['seed', 'series_a', 'series_b'],
    geography: ['Global', 'US'],
    minCheck: 500000,
    maxCheck: 5000000,
  },
  {
    name: 'Aiko Tanaka',
    firm: 'Tokyo Web3 Accelerator',
    email: 'aiko@tokyoweb3.co',
    bio: 'Operator-investor. Runs the largest Web3 accelerator in Asia. Deep network of institutional investors in Japan and Korea.',
    sectors: ['web3', 'gaming', 'nft', 'defi', 'blockchain'],
    stages: ['pre_seed', 'seed'],
    geography: ['Asia', 'Global'],
    minCheck: 50000,
    maxCheck: 250000,
  },
  {
    name: 'Olumide Soyombo',
    firm: 'Voltron Capital',
    email: 'olumide@voltron.africa',
    bio: 'Nigeria\'s most active angel investor. 60+ portfolio companies. Obsessed with founders who solve real African problems.',
    twitterHandle: 'olumide_s',
    websiteUrl: 'https://voltron.africa',
    sectors: ['fintech', 'africa', 'saas', 'edtech', 'healthtech'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa', 'Nigeria', 'West Africa'],
    minCheck: 25000,
    maxCheck: 100000,
  },
  {
    name: 'Elena Popova',
    firm: 'East Europe Crypto Fund',
    email: 'elena@eecf.io',
    bio: 'Investing in crypto infrastructure projects with a focus on privacy, scalability, and real-world utility.',
    sectors: ['crypto', 'blockchain', 'privacy', 'infrastructure'],
    stages: ['seed', 'series_a'],
    geography: ['Global', 'Europe'],
    minCheck: 100000,
    maxCheck: 500000,
  },
  {
    name: 'Babatunde Irukera',
    firm: 'Abuja Growth Capital',
    email: 'babatunde@agcapital.ng',
    bio: 'Growth equity investor across Nigerian and West African markets. Former regulator turned founder-friendly VC.',
    sectors: ['fintech', 'healthcare', 'logistics', 'africa'],
    stages: ['series_a', 'series_b'],
    geography: ['Africa', 'Nigeria', 'West Africa'],
    minCheck: 1000000,
    maxCheck: 10000000,
  },
  {
    name: 'Natasha Ivanova',
    firm: 'Blockchain Builders Fund',
    email: 'natasha@bbfund.io',
    bio: 'Technical investor. Former smart contract auditor. Looking for founders who deeply understand blockchain primitives.',
    twitterHandle: 'natasha_bb',
    sectors: ['blockchain', 'defi', 'stellar', 'soroban', 'web3', 'infrastructure'],
    stages: ['pre_seed', 'seed'],
    geography: ['Global'],
    minCheck: 25000,
    maxCheck: 200000,
  },
  {
    name: 'Emmanuel Quartey',
    firm: 'Accra-based Angel',
    email: 'emmanuel@quartey.com',
    bio: 'Individual angel. Ghostwriter turned investor. Helping founders communicate their vision clearly to the world.',
    twitterHandle: 'equartey',
    sectors: ['saas', 'media', 'africa', 'edtech', 'productivity'],
    stages: ['pre_seed'],
    geography: ['Africa', 'Ghana', 'West Africa'],
    minCheck: 5000,
    maxCheck: 50000,
  },
  {
    name: 'Rajesh Patel',
    firm: 'Mumbai Fintech Ventures',
    email: 'rajesh@mumbaifintech.vc',
    bio: 'Cross-border fintech specialist. Building bridges between African and Indian payment ecosystems. Ex-Razorpay.',
    sectors: ['fintech', 'payments', 'cross-border', 'africa'],
    stages: ['seed', 'series_a'],
    geography: ['Africa', 'South Asia', 'India', 'Global'],
    minCheck: 100000,
    maxCheck: 500000,
  },
  {
    name: 'Grace Nwosu',
    firm: 'Women in Tech Africa Fund',
    email: 'grace@witafund.com',
    bio: 'Investing exclusively in women-led or women-cofounded startups across Africa. 100% impact-aligned portfolio.',
    sectors: ['any', 'africa', 'inclusion'],
    stages: ['pre_seed', 'seed'],
    geography: ['Africa'],
    minCheck: 20000,
    maxCheck: 150000,
  },
];

export async function seedInvestors() {
  console.log('🌱 Seeding investors...');

  let created = 0;
  let skipped = 0;

  for (const investor of INVESTORS) {
    const existing = await prisma.investor.findUnique({
      where: { email: investor.email },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.investor.create({
      data: {
        ...investor,
        stages: investor.stages as string[],
      },
    });
    created++;
  }

  console.log(`✅ Investors seeded: ${created} created, ${skipped} skipped`);
}

// Run directly: ts-node src/db/seed.ts
if (require.main === module) {
  seedInvestors()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
