import type { MetadataRoute } from "next";

import { SITE_URL, absoluteUrl } from "@/lib/seo";
import { buildCanonicalUrlForPost, getRecentPosts } from "@/lib/wp";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

type StaticEntry = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
};

const STATIC_ENTRIES: StaticEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/creator-resources", changeFrequency: "monthly", priority: 0.6 },
  { path: "/subscribe-public", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/legal/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/terms-of-service", changeFrequency: "yearly", priority: 0.3 },
  { path: "/legal/refund-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ENTRIES.map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getRecentPosts(200);
    blogEntries = posts
      .filter((post) => Boolean(post.slug))
      .map((post) => ({
        url: buildCanonicalUrlForPost(post.slug) || absoluteUrl(`/blog/${post.slug}`),
        lastModified: post.modified ? new Date(post.modified) : now,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
      .filter((entry) => entry.url.startsWith(SITE_URL));
  } catch {
    // WPGRAPHQL_ENDPOINT may be missing in a given environment; leaving the
    // sitemap with static entries only is preferable to a build failure.
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
