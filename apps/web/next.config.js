/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@buildbridge/ui', '@buildbridge/stellar', '@buildbridge/ai'],
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.stellar.org' },
    ],
  },
};

module.exports = nextConfig;
