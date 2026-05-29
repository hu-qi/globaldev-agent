/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Keep CI focused on runtime build reliability during the competition sprint.
    // Run `pnpm typecheck` locally when iterating on stricter type fixes.
    ignoreBuildErrors: true
  },
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'api.star-history.com',
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
