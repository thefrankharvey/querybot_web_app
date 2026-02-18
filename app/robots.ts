import type { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const site = getCanonicalSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/preview/"],
    },
    sitemap: site ? [`${site}/sitemap.xml`] : undefined,
  };
}
