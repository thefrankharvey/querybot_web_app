import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://writequeryhook.com";
const SITE_NAME = "Write Query Hook";

type BuildOpenGraphArgs = {
  title: string;
  description: string;
  path: string;
  images?: string[];
  type?: "website" | "article";
};

type BuildTwitterArgs = {
  title: string;
  description: string;
  images?: string[];
};

export function getCanonicalSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const site = configured && configured.length > 0 ? configured : DEFAULT_SITE_URL;
  return site.replace(/\/$/, "");
}

export function buildCanonical(path: string): string {
  const site = getCanonicalSiteUrl();
  const normalizedPath = normalizePath(path);
  return `${site}${normalizedPath}`;
}

export function buildOpenGraph(args: BuildOpenGraphArgs): Metadata["openGraph"] {
  const { title, description, path, images, type = "website" } = args;
  return {
    type,
    title,
    description,
    url: buildCanonical(path),
    siteName: SITE_NAME,
    locale: "en_US",
    images: images?.length
      ? images.map((url) => ({ url }))
      : [{ url: buildCanonical("/wqh-logo.png") }],
  };
}

export function buildTwitter(args: BuildTwitterArgs): Metadata["twitter"] {
  const { title, description, images } = args;
  return {
    card: "summary_large_image",
    title,
    description,
    images: images?.length ? images : [buildCanonical("/wqh-logo.png")],
  };
}

function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}
