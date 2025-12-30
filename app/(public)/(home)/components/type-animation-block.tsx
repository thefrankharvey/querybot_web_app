import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { TypeAnimation } from "react-type-animation";

const TypeAnimationBlock = () => {
  return (
    <div className="pt-15 md:pt-26 sm:w-[90%] md:w-[80%] mx-auto text-left">
      <h1 className="text-4xl md:text-[40px] font-normal leading-tight text-accent">
        <TypeAnimation
          className="block h-[50px] md:h-[60px] whitespace-pre-line"
          speed={50}
          sequence={[`Write Query Hook`]}
          repeat={0}
          style={{ fontWeight: "600" }}
          omitDeletionAnimation={true}
          cursor={false}
        />
        <TypeAnimation
          className="block h-[220px] md:h-[80px] whitespace-pre-line"
          speed={50}
          sequence={[
            1000,
            `Purpose-driven tools to help writers \n query smart, find agents and get signed.`,
          ]}
          repeat={0}
          omitDeletionAnimation={true}
          cursor={false}
        />
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 5 }}
      >
        <div className="flex justify-start w-full">
          <Link href="/sign-up" className="w-full md:w-fit">
            <Button className="cursor-pointer w-full md:w-fit md:text-3xl text-2xl p-8 font-semibold mt-12 shadow-lg hover:shadow-xl">
              SIGN UP FREE
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default TypeAnimationBlock;
