import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/blog-posts";

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

  // Only published (non-future) posts — getPublishedPosts already applies the gate.
  const posts = await getPublishedPosts(now);
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.modifiedDate ? new Date(post.modifiedDate) : post.publishAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
