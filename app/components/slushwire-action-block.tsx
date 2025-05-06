import React from "react";
import { Button } from "../ui-primitives/button";

const SlushwireActionBlock = () => {
  return (
    <div className="bg-dark rounded-xl p-8 md:p-16 lg:p-16 mt-8 md:mt-20 w-full text-white">
      <div>
        <h1 className="text-2xl md:text-[40px] lg:text-[40px] font-extrabold leading-tight">
          SlushWire does the heavy lifting so you spend less time frantically
          researching and more time writing.
        </h1>
        <p className="text-base mt-4 text-center">
          Join SlushWire now and be the first to access exclusive tools for
          smarter querying.
        </p>
      </div>
      <a
        href="https://subscribe.writequeryhook.com/products/slush-wire-pro-direct?step=checkout&_gl=1*1o0mzku*_ga*MTczNjM3NTEyMC4xNzQ2MjEwNTg0*_ga_4C1NS70GTD*czE3NDY0ODEyMTAkbzckZzAkdDE3NDY0ODEyMTAkajAkbDAkaDA."
        target="_blank"
        className="flex justify-center items-center"
      >
        <Button className="cursor-pointer text-xl p-8 font-semibold mt-10 hover:border-accent border-2 border-transparent">
          GET DAILY ALERTS
        </Button>
      </a>
    </div>
  );
};

export default SlushwireActionBlock;
