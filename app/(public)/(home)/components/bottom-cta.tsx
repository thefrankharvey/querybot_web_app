import { Button } from "@/app/ui-primitives/button";
import { motion } from "framer-motion";
import Link from "next/link";

export const BottomCta = () => {
  return (
    <div className="w-full md:w-[65%] mx-auto mt-60">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl md:text-[40px] font-normal leading-tight text-accent md:text-center text-left">
          Ready to <span className="font-semibold">stop</span> querying blind
          and <span className="font-semibold">start</span> querying the agents
          who actually match <span className="font-semibold">your book?</span>
        </h1>
      </motion.div>
      <div className="flex justify-center w-full">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        >
          <Link href="/sign-up" className="w-full flex justify-center">
            <Button className="cursor-pointer md:w-fit w-full md:text-3xl text-2xl p-8 font-semibold mt-12 shadow-lg hover:shadow-xl">
              SIGN UP FREE
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
