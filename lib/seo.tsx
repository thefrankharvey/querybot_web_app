import type { ReactElement } from "react";

/**
 * Site-wide SEO constants. Single source of truth for metadata, sitemap,
 * manifest, and JSON-LD builders.
 */
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

// Fallback keeps builders working in local dev when env is unset.
// Canonical URLs will still use whatever NEXT_PUBLIC_SITE_URL is set to in prod.
export const SITE_URL = RAW_SITE_URL || "https://writequeryhook.com";
export const SITE_NAME = "Write Query Hook";
export const SITE_DESCRIPTION = "The modern way to query literary agents";
export const SITE_LOGO = `${SITE_URL}/wqh-logo.png`;
export const DEFAULT_OG_IMAGE = `${SITE_URL}/meta-img.jpg`;
export const DEFAULT_OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_DESCRIPTION}`;
export const DEFAULT_OG_IMAGE_WIDTH = 1024;
export const DEFAULT_OG_IMAGE_HEIGHT = 576;
export const DEFAULT_OG_IMAGE_TYPE = "image/jpeg";
export const SITE_TWITTER = "@writequeryhook";
export const SITE_LOCALE = "en_US";

export const SOCIAL_LINKS: string[] = [
  "https://x.com/writequeryhook",
  "https://www.instagram.com/writequeryhook",
  "https://www.tiktok.com/@write.query.hook",
  "https://bsky.app/profile/writequeryhook.bsky.social",
  "https://www.threads.com/@writequeryhook",
];

/**
 * Absolute URL helper. Accepts paths with or without leading slash.
 */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
}

/**
 * JSON-LD <script> with a stable data-testid for validation. Server-rendered
 * so crawlers see the payload on first paint.
 */
export function JsonLdScript({
  data,
  id,
}: {
  data: Record<string, unknown>;
  id?: string;
}): ReactElement {
  return (
    <script
      type="application/ld+json"
      data-testid={id ?? "json-ld"}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── Schema builders ──────────────────────────────────────────────────────

export function buildOrganizationJsonLd(opts?: {
  includeAddress?: boolean;
}): Record<string, unknown> {
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: SITE_LOGO,
    },
    description: SITE_DESCRIPTION,
  };

  if (SOCIAL_LINKS.length > 0) {
    base.sameAs = SOCIAL_LINKS;
  }

  if (opts?.includeAddress) {
    base.address = {
      "@type": "PostalAddress",
      addressCountry: "US",
    };
  }

  return base;
}

export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

export function buildWebPageJsonLd(page: {
  title: string;
  description: string;
  url: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: page.url,
    inLanguage: "en-US",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbJsonLd(
  items: BreadcrumbItem[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function buildFaqJsonLd(faqs: FaqItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

const DEFAULT_SPEAKABLE_SELECTORS = [
  "h1",
  "h2",
  ".tldr-section",
  ".speakable-tldr",
  ".ai-summary",
  ".key-fact",
  ".summary-section",
  "blockquote",
  ".direct-answer",
  ".quick-answer",
];

export function buildSpeakableJsonLd(
  url: string,
  cssSelectors?: string[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: cssSelectors ?? DEFAULT_SPEAKABLE_SELECTORS,
    },
  };
}

export interface BlogPostJsonLdInput {
  title: string;
  description?: string;
  canonicalUrl: string;
  imageUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageAlt?: string | null;
  publishedDate: string;
  modifiedDate?: string | null;
  authorName?: string | null;
  articleSection?: string | null;
  keywords?: string[];
}

export function buildBlogPostingJsonLd(
  post: BlogPostJsonLdInput,
): Record<string, unknown> {
  const resolvedImageUrl = post.imageUrl || DEFAULT_OG_IMAGE;
  const resolvedImageWidth = post.imageWidth ?? DEFAULT_OG_IMAGE_WIDTH;
  const resolvedImageHeight = post.imageHeight ?? DEFAULT_OG_IMAGE_HEIGHT;
  const resolvedImageAlt = post.imageAlt || post.title;

  const author = post.authorName
    ? { "@type": "Person", name: post.authorName }
    : { "@id": `${SITE_URL}/#organization` };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: post.canonicalUrl,
    datePublished: post.publishedDate,
    dateModified: post.modifiedDate ?? post.publishedDate,
    image: {
      "@type": "ImageObject",
      url: resolvedImageUrl,
      width: resolvedImageWidth,
      height: resolvedImageHeight,
      caption: resolvedImageAlt,
    },
    author,
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": post.canonicalUrl },
    isAccessibleForFree: true,
    inLanguage: "en-US",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: DEFAULT_SPEAKABLE_SELECTORS,
    },
  };

  if (post.articleSection) {
    jsonLd.articleSection = post.articleSection;
  }
  if (post.keywords && post.keywords.length > 0) {
    jsonLd.keywords = post.keywords.join(", ");
  }

  return jsonLd;
}
