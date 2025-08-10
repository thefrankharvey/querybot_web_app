import type { NextConfig } from "next";

const wpDomains: string[] = [];
if (process.env.WP_MEDIA_HOST) wpDomains.push(process.env.WP_MEDIA_HOST);
if (process.env.WP_SITE_URL) {
  try {
    const host = new URL(process.env.WP_SITE_URL).hostname;
    if (host) wpDomains.push(host);
  } catch {}
}
const uniqueWpDomains = Array.from(new Set(wpDomains));

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.wp.com" },
      { protocol: "https", hostname: "*.wordpress.com" },
      { protocol: "https", hostname: "*.wordpress.org" },
    ],
    // Also allow configured WP hosts directly
    domains: uniqueWpDomains.length ? uniqueWpDomains : undefined,
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
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
