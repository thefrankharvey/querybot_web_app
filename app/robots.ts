import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/blog"],
      disallow: [
        "/api/",
        "/preview/",
        "/sign-in",
        "/sign-up",
        "/home",
        "/account",
        "/subscribe",
        "/smart-match",
        "/dispatch",
        "/query-dashboard",
        "/agent-matches",
        "/saved-agents",
      ],
    },
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
