import fs from "node:fs";
import path from "node:path";

import {
  getPublishAt,
  isBlogPublished,
  parsePublishInfo,
  type BlogConfig,
} from "@/lib/blog-seo";

/**
 * Server-only filesystem index of the static blog. Reads every folder under
 * `app/blog/`, dynamically imports its module, and returns the published ones.
 * Used by the listing page, the sitemap, and the RSS feed so they share one
 * definition of "published".
 */

const BLOG_DIR = path.join(process.cwd(), "app", "blog");
const EXCLUDED = new Set(["template"]);

export interface PublishedPost {
  /** Folder name = URL slug. */
  slug: string;
  title: string;
  description: string;
  /** Human-readable byline date. */
  date: string;
  publishAt: Date;
  modifiedDate?: string;
  /** True when publishAt is still in the future (only surfaces in preview mode). */
  scheduled: boolean;
}

interface PostModule {
  BLOG_CONFIG?: BlogConfig;
  metadata?: { title?: unknown; description?: unknown };
}

function listPostDirs(): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !EXCLUDED.has(entry.name) &&
        !entry.name.startsWith(".") &&
        !entry.name.startsWith("_") &&
        !entry.name.includes(" "),
    )
    .map((entry) => entry.name);
}

export async function getPublishedPosts(
  now: Date = new Date(),
): Promise<PublishedPost[]> {
  const posts: PublishedPost[] = [];

  for (const slug of listPostDirs()) {
    try {
      // Template-literal dynamic import lets webpack build a context over every
      // app/blog/*/page module at build time.
      const mod: PostModule = await import(`../app/blog/${slug}/page`);
      const config = mod.BLOG_CONFIG;

      if (!isBlogPublished(slug, config, now)) continue;

      const publishAt = getPublishAt(slug, config);
      if (!publishAt) continue;

      // Prefer BLOG_CONFIG; fall back to the Next metadata export so posts in
      // other formats still surface in the index.
      const title =
        config?.title ??
        (typeof mod.metadata?.title === "string"
          ? mod.metadata.title
          : parsePublishInfo(slug).cleanSlug);
      const description =
        config?.description ??
        (typeof mod.metadata?.description === "string"
          ? mod.metadata.description
          : "");

      posts.push({
        slug,
        title,
        description,
        date:
          config?.date ??
          publishAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "America/New_York",
          }),
        publishAt,
        modifiedDate: config?.modifiedDate,
        scheduled: publishAt.getTime() > now.getTime(),
      });
    } catch (error) {
      // A broken post must not take down the whole index — log loudly and skip.
      console.error(`[blog] failed to load post "${slug}":`, error);
    }
  }

  return posts.sort((a, b) => b.publishAt.getTime() - a.publishAt.getTime());
}
