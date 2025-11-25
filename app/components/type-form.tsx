import { PopupButton } from "@typeform/embed-react";
import { motion } from "framer-motion";

const TypeForm = () => {
  return (
    <motion.div
      className="fixed bottom-0 right-0 mr-4 mb-4 md:mr-10 md:mb-10"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
      }}
    >
      <PopupButton
        id="j2aZKNOn"
        style={{ fontSize: 16 }}
        className="h-[80px] w-[120px] my-button bg-accent text-white font-semibold px-2 py-2 rounded-4xl md:h-[120px] md:w-[150px] flex flex-col items-center justify-center gap-1 md:gap-2 hover:bg-white hover:text-accent transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <div className="text-sm md:text-2xl font-bold">Hey! 👋</div>
        <div className="text-xs md:text-base">
          We&apos;d love your feedback!
        </div>
      </PopupButton>
    </motion.div>
  );
};

export default TypeForm;
