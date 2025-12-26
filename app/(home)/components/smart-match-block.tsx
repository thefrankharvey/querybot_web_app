import { agentDemoData } from "@/app/constants";
import React from "react";
import { motion } from "framer-motion";
import DisplayAgentCards from "./display-agent-cards";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const SmartMatchBlock = () => {
  return (
    <div>
      <div className="pt-40 pb-10 md:pt-60 md:pb-20 w-full md:w-[85%] mx-auto text-left md:text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal text-accent">
            Find the best agents for
            <br className="md:hidden visible" />{" "}
            <span className="bg-accent text-white p-1 px-3 rounded-xl font-semibold">
              your writing
            </span>{" "}
            <br className="md:visible hidden" />
            We rank agents by how well they match your work so you can query
            smarter, not harder.
          </h1>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agentDemoData.map((match, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              delay: index * 0.15,
              ease: "easeOut",
            }}
          >
            <DisplayAgentCards agent={match} id={`agent-${index}`} />
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center w-full">
        <Link href="/sign-up" className="w-full md:w-fit">
          <Button className="cursor-pointer w-full md:w-fit md:text-3xl text-2xl p-8 font-semibold mt-12 shadow-lg hover:shadow-xl">
            TRY FOR FREE
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SmartMatchBlock;
