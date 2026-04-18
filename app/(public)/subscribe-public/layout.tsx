import type { Metadata } from "next";
import type { ReactNode } from "react";

import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  JsonLdScript,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildSpeakableJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

const PAGE_PATH = "/subscribe-public";
const PAGE_URL = absoluteUrl(PAGE_PATH);
const PAGE_TITLE = "Subscribe to Write Query Hook — Pricing & Plans";
const PAGE_DESCRIPTION =
  "See plans and pricing for Write Query Hook. Unlock Smart Match, the Query Dashboard, Dispatch, and daily agent intel for writers querying literary agents.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "website",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: DEFAULT_OG_IMAGE_WIDTH,
        height: DEFAULT_OG_IMAGE_HEIGHT,
        alt: DEFAULT_OG_IMAGE_ALT,
        type: DEFAULT_OG_IMAGE_TYPE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function SubscribePublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <JsonLdScript
        id="jsonld-webpage"
        data={buildWebPageJsonLd({
          title: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          url: PAGE_URL,
        })}
      />
      <JsonLdScript
        id="jsonld-organization"
        data={buildOrganizationJsonLd()}
      />
      <JsonLdScript
        id="jsonld-breadcrumb"
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: SITE_URL },
          { name: "Subscribe", url: PAGE_URL },
        ])}
      />
      <JsonLdScript
        id="jsonld-speakable"
        data={buildSpeakableJsonLd(PAGE_URL)}
      />
      {children}
    </>
  );
}
