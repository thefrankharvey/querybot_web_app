import { PopupButton } from "@typeform/embed-react";
import { motion } from "framer-motion";

type TypeFormProps = {
  id: string;
  headline?: string;
  description?: string;
};

const TypeForm = ({
  id,
  headline = "Hey! 👋",
  description = "We'd love your feedback!",
}: TypeFormProps) => {
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
        id={id}
        style={{ fontSize: 16 }}
        className="my-button glass-panel h-[80px] w-[120px] border border-accent/14 bg-white/82 px-2 py-2 font-semibold text-accent md:h-[120px] md:w-[150px] rounded-[2rem] flex flex-col items-center justify-center gap-1 md:gap-2 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_52px_rgba(24,44,69,0.12)]"
      >
        <div className="text-sm md:text-xl font-bold">{headline}</div>
        <div className="text-xs md:text-base">{description}</div>
      </PopupButton>
    </motion.div>
  );
};

export default TypeForm;
