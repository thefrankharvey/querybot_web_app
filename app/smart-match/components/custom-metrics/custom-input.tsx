import React, { useEffect, useState } from "react";
import { Input } from "@/app/ui-primitives/input";
import { Button } from "@/app/ui-primitives/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/app/utils";

const CustomInput = ({
  label,
  closeInput,
  handleAdd,
  setError,
}: {
  label: string;
  closeInput?: boolean;
  handleAdd: (value: string) => void;
  setError?: (error: string) => void;
}) => {
  const [value, setValue] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (closeInput) {
      setShowInput(false);
    }
  }, [closeInput]);

  return (
    <div className="flex justify-end w-full mt-2">
      {!showInput && (
        <motion.div
          className="relative overflow-hidden"
          animate={{ width: isHovered ? "auto" : 40 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Button
            type="button"
            className="relative text-sm shadow-lg hover:shadow-xl h-10 rounded-md text-black hover:text-black flex items-center justify-center w-full px-3"
            onClick={() => setShowInput(true)}
          >
            {/* Plus icon */}
            <Plus
              className={cn(
                "w-24 h-24 flex-shrink-0 transition-all duration-300 ease-in-out",
                isHovered ? "mr-[-2px]" : "mr-[-8px]"
              )}
            />

            {/* Text that slides in */}
            <motion.span
              className="whitespace-nowrap text-sm overflow-hidden"
              animate={{
                width: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              Add custom {label}
            </motion.span>
          </Button>
        </motion.div>
      )}
      {showInput && (
        <div className="w-full">
          <label className="mb-2 block text-sm font-semibold">
            Add your own {label}
          </label>
          <div className="flex gap-2 items-center w-full">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
            />
            <Button
              type="button"
              className="text-sm shadow-lg hover:shadow-xl"
              onClick={() => {
                handleAdd(value);
                setValue("");
              }}
            >
              Add {label}
            </Button>
            <Button
              type="button"
              className="text-sm shadow-lg hover:shadow-xl"
              onClick={() => {
                setShowInput(false);
                setError?.("");
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomInput;
