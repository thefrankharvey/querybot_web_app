import type { MetadataRoute } from "next";
import { getRecentPosts, buildCanonicalUrlForPost } from "@/lib/wp";

export const revalidate = 1800; // 30 min

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const base: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: new Date() },
    { url: `${site}/blog/`, lastModified: new Date() },
  ];

  const posts = await getRecentPosts(200);
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: buildCanonicalUrlForPost(p.slug),
    lastModified: new Date(p.modified || p.date),
  }));

  return [...base, ...postEntries];
}
