"use client";

// import { useState } from "react";
// import { Button } from "../ui-primitives/button";
// import TypeAnimationBlock from "./components/type-animation-block";
// import ProductsBlock from "./components/products-block";
// import SmartMatchBlock from "./components/smart-match-block";
// import SlushwireDispatchBlock from "./components/slushwire-dispatch-block";
// import SlushwireProBlock from "./components/slushwire-pro-block";
// import Link from "next/link";

const Home = () => {
  // const [showSecondAnimation, setShowSecondAnimation] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 justify-center items-center h-screen">
        <div className="text-[60px]">🚧 🏗️</div>
        <h1 className="text-3xl font-semibold text-center">
          We’re currently making big improvements to Slushwire
        </h1>
        <span className="text-2xl font-normal">Please check back soon!</span>
      </div>
      {/* <div className="w-full flex flex-col md:block">
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
      <SmartMatchBlock />
      <SlushwireDispatchBlock />
      <SlushwireProBlock /> */}
    </div>
  );
};

export default Home;
