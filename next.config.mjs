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
};

export default nextConfig;
