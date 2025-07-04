import { agentDemoData } from "@/app/constants";
import React from "react";
import { motion } from "framer-motion";
import DisplayAgentCards from "./display-agent-cards";
import { Button } from "@/app/ui-primitives/button";
import Link from "next/link";

const SmartQueryBlock = () => {
  return (
    <div>
      <div className="pt-40 md:pt-60 pb-20 w-full md:w-[85%] mx-auto text-left md:text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal">
            <span className="font-semibold">Smart Query</span> finds the right
            agents for{" "}
            <span className="bg-accent p-1 px-3 rounded-xl font-semibold">
              your writing
            </span>{" "}
            <br />
            Ranking agents by how well they match your work so you can query
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
        <Link href="/query-form" className="w-full md:w-fit">
          <Button className="cursor-pointer w-full md:w-fit text-xl p-8 font-semibold mt-12 hover:border-accent border-2 border-transparent shadow-lg hover:shadow-xl">
            TRY SMART QUERY
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default SmartQueryBlock;
