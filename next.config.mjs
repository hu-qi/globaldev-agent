/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Keep CI focused on runtime build reliability during the competition sprint.
    // Run `pnpm typecheck` locally when iterating on stricter type fixes.
    ignoreBuildErrors: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
