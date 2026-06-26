import fs from "node:fs";
import path from "node:path";

import { getPublishAt, isBlogPublished } from "@/lib/blog-seo";

/**
 * Server-only filesystem index of the static blog. Reads every folder under
 * `app/blog/` and returns the published ones, sorted newest-first. Used by the
 * listing page, the sitemap, and the RSS feed so they share one definition of
 * "published".
 *
 * IMPORTANT: this must NOT `import()` the post modules. With ~1000+ posts that
 * loads every (large) page module into the require cache and OOMs the server.
 * Instead we read only the head of each page.tsx and pull the few fields we
 * need by regex — bounded, GC-friendly memory regardless of post count.
 */

const BLOG_DIR = path.join(process.cwd(), "app", "blog");
const EXCLUDED = new Set(["template"]);
const HEAD_BYTES = 16 * 1024; // config block lives at the top of every post

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

/** Read only the first chunk of a file (where BLOG_CONFIG / PAGE_DATA lives). */
function readHead(file: string): string {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(HEAD_BYTES);
    const bytes = fs.readSync(fd, buf, 0, HEAD_BYTES, 0);
    return buf.toString("utf8", 0, bytes);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Pull a quoted `key: "value"` / `"key": "value"` field from source text.
 * Matches the closing quote of the SAME type as the opener, so apostrophes
 * inside double-quoted values (e.g. "the slush pile isn't…") aren't truncated.
 */
function field(text: string, key: string): string | undefined {
  const m =
    text.match(new RegExp(`["']?${key}["']?\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`)) ??
    text.match(new RegExp(`["']?${key}["']?\\s*:\\s*'((?:\\\\.|[^'\\\\])*)'`));
  if (!m) return undefined;
  const value = m[1]
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
      String.fromCharCode(parseInt(h, 16)),
    )
    .replace(/\\(["'\\/])/g, "$1")
    .trim();
  return value || undefined;
}

export async function getPublishedPosts(
  now: Date = new Date(),
): Promise<PublishedPost[]> {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const posts: PublishedPost[] = [];

  for (const entry of entries) {
    if (
      !entry.isDirectory() ||
      EXCLUDED.has(entry.name) ||
      entry.name.startsWith(".") ||
      entry.name.startsWith("_") ||
      entry.name.includes(" ")
    ) {
      continue;
    }

    const slug = entry.name;
    let head: string;
    try {
      head = readHead(path.join(BLOG_DIR, slug, "page.tsx"));
    } catch {
      continue; // no page.tsx — not a post
    }

    // Minimal config shape for the gate: respect drafts + config-date fallback.
    const status = field(head, "status") === "draft" ? "draft" : undefined;
    const publishedDate = field(head, "publishedDate");
    const config = { status, publishedDate } as const;

    if (!isBlogPublished(slug, config, now)) continue;
    const publishAt = getPublishAt(slug, config);
    if (!publishAt) continue;

    posts.push({
      slug,
      title: field(head, "title") ?? slug,
      description: field(head, "description") ?? "",
      date:
        field(head, "date") ??
        publishAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/New_York",
        }),
      publishAt,
      modifiedDate: field(head, "modifiedDate"),
      scheduled: publishAt.getTime() > now.getTime(),
    });
  }

  return posts.sort((a, b) => b.publishAt.getTime() - a.publishAt.getTime());
}
