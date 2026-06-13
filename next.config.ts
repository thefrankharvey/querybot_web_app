import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The blog ingests bulk-generated posts. A single post's type/lint quirk must
  // not fail the whole production deploy — correctness is gated in CI instead.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      // Blog hero / inline images are served from ImageKit by the generator.
      { protocol: "https", hostname: "ik.imagekit.io" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/slushwire",
        destination: "/",
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;
