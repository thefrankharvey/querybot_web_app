import { motion } from "framer-motion";

export const CtaCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mt-60 md:w-[90%] w-full mx-auto flex flex-col gap-4 p-8 py-16 md:p-36">
        <h1 className="text-2xl md:text-[40px] leading-normal text-white md:text-center text-left">
          The query process is broken. Months of searching, dead ends, and
          missed opportunities.
          <br />
          <div className="mt-4">
            <span className="bg-white text-accent p-1 px-3 rounded-xl font-semibold">
              Write Query Hook
            </span>{" "}
            is the solution.
          </div>
        </h1>
      </div>
    </motion.div>
  );
};
