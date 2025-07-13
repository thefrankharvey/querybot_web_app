import { motion } from "framer-motion";
import React from "react";
import SlushwireProCard from "./slushwire-pro-card";

const SlushwireProBlock = () => {
  return (
    <div>
      <div className="pt-20 pb-10 md:pb-20 w-full md:w-[85%] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
        >
          <h1 className="text-2xl md:text-[40px] leading-normal text-left md:text-center">
            The submission process is broken.{" "}
            <span className="bg-accent p-1 px-3 rounded-xl font-semibold">
              Slushwire Pro
            </span>{" "}
            tools are the solution. Built to empower authors.
          </h1>
        </motion.div>
      </div>
      <SlushwireProCard />
    </div>
  );
};

export default SlushwireProBlock;
