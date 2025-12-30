"use client";

import TypeAnimationBlock from "./components/type-animation-block";
import ProductsBlock from "./components/products-block";
import SmartMatchBlock from "./components/smart-match-block";
import SlushwireDispatchBlock from "./components/slushwire-dispatch-block";
import { CtaCard } from "./components/cta-card";
import { BottomCta } from "./components/bottom-cta";

const Home = () => {
  return (
    <>
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
