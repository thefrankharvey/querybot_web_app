import { PopupButton } from "@typeform/embed-react";
import { motion } from "framer-motion";

const TypeForm = () => {
  return (
    <motion.div
      className="fixed bottom-0 right-0 mr-10 mb-10"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
    >
      <PopupButton
        id="hGcc2J5v"
        style={{ fontSize: 16 }}
        className="my-button bg-accent text-black font-semibold px-2 py-2 rounded-4xl h-[150px] w-[150px] flex flex-col items-center justify-center gap-2 hover:bg-purple-950 hover:text-white transition-all duration-300"
      >
        <div className="text-2xl font-bold">Hey! 👋</div>
        <div className="text-base">We&apos;d love your feedback!</div>
      </PopupButton>
    </motion.div>
  );
};

export default TypeForm;
