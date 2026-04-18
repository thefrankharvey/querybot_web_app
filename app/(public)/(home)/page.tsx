import type { Metadata } from "next";

import TypeAnimationBlock from "./components/type-animation-block";
import ProductEcosystemSection from "./components/product-ecosystem-section";
import SmartMatchSection from "./components/smart-match-section";
import QueryDashboardSection from "./components/query-dashboard-section";
import DispatchSection from "./components/dispatch-section";
import { CtaCard } from "./components/cta-card";
import ComparisonSection from "./components/comparison-section";
import TrustStatsSection from "./components/trust-stats-section";
import FinalCtaSection from "./components/final-cta-section";
import HomeContentShell from "./components/home-content-shell";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_WIDTH,
  JsonLdScript,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildSpeakableJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";

const PAGE_TITLE = `${SITE_NAME} — ${SITE_DESCRIPTION}`;
const PAGE_DESCRIPTION =
  "Query literary agents the modern way. Match to the right agents for your book, track every submission in one dashboard, and stay current on MSWLs and agent openings.";

export const metadata: Metadata = {
  title: {
    absolute: PAGE_TITLE,
  },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: SITE_URL,
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

const Home = () => {
  return (
    <>
      <JsonLdScript
        id="jsonld-website"
        data={buildWebSiteJsonLd()}
      />
      <JsonLdScript
        id="jsonld-organization"
        data={buildOrganizationJsonLd({ includeAddress: true })}
      />
      <JsonLdScript
        id="jsonld-breadcrumb"
        data={buildBreadcrumbJsonLd([{ name: "Home", url: SITE_URL }])}
      />
      <JsonLdScript
        id="jsonld-speakable"
        data={buildSpeakableJsonLd(SITE_URL)}
      />
      <section className="sr-only">
        <h1>The modern way to query literary agents.</h1>
        <p>
          Find the best for your writing agents fast, track every submission in one place, and
          stay current on agent openings, MSWLs, and publishing intel — without
          juggling spreadsheets and scattered research.
        </p>
      </section>
      <div className="flex w-full flex-col pb-24 md:block md:pb-0">
        <HomeContentShell>
          <TypeAnimationBlock />
        </HomeContentShell>
      </div>
      <CtaCard />
      <ProductEcosystemSection />
      <SmartMatchSection />
      <QueryDashboardSection />
      <DispatchSection />
      <ComparisonSection />
      <TrustStatsSection />
      <FinalCtaSection />
    </>
  );
};

export default Home;
