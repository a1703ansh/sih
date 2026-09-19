/** @type {import('next').NextConfig} */
// Backend origin for the /api rewrite. Defaults to same-host (single-VM deploy);
// set BACKEND_INTERNAL_URL when frontend and backend live on different hosts.
const backendInternalUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

const nextConfig = {
  reactStrictMode: true,
  // Standalone output (used by frontend/Dockerfile.prod): vendors the server-
  // side deps into .next/standalone/, so the slim runtime image needs no
  // node_modules. Only affects `next build`; `next dev` is unaffected.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendInternalUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
