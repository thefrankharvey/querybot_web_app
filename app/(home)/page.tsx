"use client";

import { useState } from "react";
import { Button } from "../ui-primitives/button";
import TypeAnimationBlock from "./components/type-animation-block";
import ProductsBlock from "./components/products-block";
import SmartQueryBlock from "./components/smart-query-block";
import SlushwireDispatchBlock from "./components/slushwire-dispatch-block";
import SlushwireProBlock from "./components/slushwire-pro-block";
import Link from "next/link";

const Home = () => {
  const [showSecondAnimation, setShowSecondAnimation] = useState(false);

  return (
    <div className="w-full">
      <div className="w-full flex flex-col md:block">
        <TypeAnimationBlock
          setShowSecondAnimation={setShowSecondAnimation}
          showSecondAnimation={showSecondAnimation}
        />
        <div className="flex flex-col-reverse md:block">
          <Link href="/subscription">
            <Button className="cursor-pointer w-full md:w-fit text-xl p-8 font-semibold mt-12 hover:border-accent border-2 border-transparent shadow-lg hover:shadow-xl">
              GET SLUSHWIRE PRO
            </Button>
          </Link>
          <ProductsBlock showSecondAnimation={showSecondAnimation} />
        </div>
      </div>
      <SmartQueryBlock />
      <SlushwireDispatchBlock />
      <SlushwireProBlock />
    </div>
  );
};

export default Home;
