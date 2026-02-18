import type { Metadata } from "next";
import { buildCanonical, buildOpenGraph, buildTwitter } from "@/lib/seo";

import TypeAnimationBlock from "./components/type-animation-block";
import ProductsBlock from "./components/products-block";
import SmartMatchBlock from "./components/smart-match-block";
import SlushwireDispatchBlock from "./components/slushwire-dispatch-block";
import { CtaCard } from "./components/cta-card";
import { BottomCta } from "./components/bottom-cta";

const title = "Query Smarter, Find Literary Agents";
const description =
  "Purpose driven tools to help writers query smarter, find literary agents, and get signed.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: buildCanonical("/"),
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: buildOpenGraph({
    title,
    description,
    path: "/",
  }),
  twitter: buildTwitter({
    title,
    description,
  }),
};

const Home = () => {
  return (
    <>
      <section className="sr-only">
        <h1>
          Write Query Hook
        </h1>
        <p>
          Purpose driven tools to help writers query smart, find agents, and
          get signed.
        </p>
      </section>
      <div className="w-full flex flex-col md:block">
        <TypeAnimationBlock />
      </div>
      <div className="bg-accent relative left-1/2 right-1/2 w-screen max-w-none -ml-[50vw] -mr-[50vw]">
        <CtaCard />
      </div>
      <SmartMatchBlock />
      <SlushwireDispatchBlock />
      <div className="bg-accent relative left-1/2 right-1/2 w-screen max-w-none -ml-[50vw] -mr-[50vw] py-36 mt-40">
        <ProductsBlock />
      </div>
      <BottomCta />
    </>
  );
};

export default Home;
