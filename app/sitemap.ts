import type { MetadataRoute } from "next";
import { getRecentPosts, buildCanonicalUrlForPost } from "@/lib/wp";
import { buildCanonical, getCanonicalSiteUrl } from "@/lib/seo";

export const revalidate = 1800; // 30 min

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getCanonicalSiteUrl();
  if (!site) return [];

  const base: MetadataRoute.Sitemap = [
    { url: buildCanonical("/"), lastModified: new Date() },
    { url: buildCanonical("/about"), lastModified: new Date() },
    { url: buildCanonical("/blog"), lastModified: new Date() },
  ];

  const posts = await getRecentPosts(200);
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: buildCanonicalUrlForPost(p.slug),
    lastModified: new Date(p.modified || p.date),
  }));

  return [...base, ...postEntries];
}
