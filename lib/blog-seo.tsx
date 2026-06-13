import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  SITE_NAME,
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_WIDTH,
  DEFAULT_OG_IMAGE_HEIGHT,
} from "@/lib/seo";
import type { AuthorMeta } from "@/constants/authors";
import {
  PUBLISH_TIMEZONE,
  parsePublishInfo,
  getPublishAt,
  isBlogPublished,
  type PublishInfo,
} from "@/lib/blog-schedule";

// Re-export the pure scheduling logic so posts/listing share one import.
export { PUBLISH_TIMEZONE, parsePublishInfo, getPublishAt, isBlogPublished };
export type { PublishInfo };

/**
 * Metadata, types, and the publish gate for the static, file-based blog system.
 *
 * Each post is a folder under `app/blog/`. The folder name doubles as the URL
 * slug AND encodes the publish schedule (see `lib/blog-schedule.ts`):
 *
 *     app/blog/<clean-slug>-MM-DD-YYYY[-am|-pm]/page.tsx
 *
 * - `am` -> 10:00 America/New_York   (the morning slot)
 * - `pm` -> 18:00 America/New_York   (the evening slot)
 * - no slot marker -> defaults to the morning (10:00) slot
 *
 * A post is visible only once its computed publish instant is in the past.
 * Future-dated posts can sit in the repo and stay hidden until a build runs
 * after their date — see `.github/workflows/scheduled-deploy.yml`.
 */

export type BlogContentItem =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "qa"; items: { question: string; answer: string }[] };

export interface BlogSection {
  /** Empty string renders as an intro section (no <h2>). */
  heading: string;
  content: BlogContentItem[];
}

export interface BlogConfig {
  title: string;
  description: string;
  /** Human-readable date for the byline, e.g. "June 8, 2026". */
  date: string;
  /** ISO fallback used only when the folder name carries no date suffix. */
  publishedDate?: string;
  modifiedDate?: string;
  readTime: string;
  keywords: string[];
  articleSection?: string;
  wordCount?: number;
  altHeadline?: string;
  ogImageUrl?: string;
  ogImageAlt?: string;
  authorName?: string;
  author?: AuthorMeta;
  status?: "draft" | "published";
  sections: BlogSection[];
}

/** Call at the top of a post's page component. 404s unpublished/future posts. */
export function blogPublishGate(slug: string, config?: BlogConfig | null): void {
  if (!isBlogPublished(slug, config)) notFound();
}

// ── Metadata ────────────────────────────────────────────────────────────────

export function buildBlogMetadata(slug: string, config: BlogConfig): Metadata {
  const url = absoluteUrl(`/blog/${slug}`);
  const publishAt = getPublishAt(slug, config);
  const ogImage = config.ogImageUrl || DEFAULT_OG_IMAGE;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: config.authorName ? [{ name: config.authorName }] : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: config.altHeadline || config.title,
      description: config.description,
      url,
      siteName: SITE_NAME,
      publishedTime: publishAt?.toISOString(),
      modifiedTime: config.modifiedDate ?? publishAt?.toISOString(),
      section: config.articleSection,
      tags: config.keywords,
      images: [
        {
          url: ogImage,
          width: DEFAULT_OG_IMAGE_WIDTH,
          height: DEFAULT_OG_IMAGE_HEIGHT,
          alt: config.ogImageAlt || DEFAULT_OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [ogImage],
    },
  };
}
