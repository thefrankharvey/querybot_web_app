import React from "react";
import { motion } from "framer-motion";
import { DatabaseZap, MailCheck, Newspaper, ScanSearch } from "lucide-react";

const ProductsBlock = ({
  showSecondAnimation,
}: {
  showSecondAnimation: boolean;
}) => {
  return (
    <div className="w-full flex items-center justify-end relative">
      <div
        className="mt-10 w-full md:mt-[-150px] md:w-[50%] flex flex-col gap-4 bg-white rounded-xl p-4 md:p-8 shadow-lg"
        id="content"
      >
        <p className="text-xl md:text-2xl font-normal mt-4 flex items-center gap-3">
          <ScanSearch className="w-16 h-16" />{" "}
          <span>
            <span className="font-semibold">Smart Match</span>, finds agents
            tailored specifically to your work.
          </span>
        </p>
        <p className="text-xl md:text-2xl font-normal mt-4 flex items-center gap-3">
          <Newspaper className="w-14 h-14" />
          <span>
            <span className="font-semibold">Dispatch</span>, provides a real
            time industry news feed.
          </span>
        </p>
        <p className="text-xl md:text-2xl font-normal mt-4 flex items-center gap-3">
          <DatabaseZap className="w-14 h-14" /> The largest data base of
          literary agents in the industry.
        </p>
        <p className="text-xl md:text-2xl font-normal mt-4 mb-4 flex items-center gap-3">
          <MailCheck className="w-14 h-14" /> Weekly email newsletter of curated
          industry intel.
        </p>
      </div>
      {showSecondAnimation && (
        <div
          id="animation"
          className="absolute top-[-400px] right-[-320px] w-full hidden justify-center pointer-events-none lg:flex"
        >
          <svg
            width="1050"
            height="900"
            viewBox="0 0 1050 900"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
              d="M694 220
   C944 366, 944 641, 629 732
   C355 823, 144 641, 175 407
   C207 174, 551 133, 826 319"
              fill="none"
              stroke="#1c4a4e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProductsBlock;
