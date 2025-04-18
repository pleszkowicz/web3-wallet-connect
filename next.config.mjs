/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Wildcard hostname to allow any remote images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverPlugins: {
      serverPlugins: ['@prisma/nextjs-monorepo-workaround-plugin'],
    },
  },
};

export default nextConfig;
