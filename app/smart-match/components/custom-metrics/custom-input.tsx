import React, { useEffect, useState } from "react";
import { Input } from "@/app/ui-primitives/input";
import { Button } from "@/app/ui-primitives/button";

const CustomInput = ({
  label,
  closeInput,
  handleAdd,
  setError,
  showInput,
  setShowInput,
}: {
  label: string;
  closeInput?: boolean;
  handleAdd: (value: string) => void;
  setError?: (error: string) => void;
  showInput: boolean;
  setShowInput: (showInput: boolean) => void;
}) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (closeInput) {
      setShowInput(false);
    }
  }, [closeInput, setShowInput]);

  return (
    <div className="flex justify-end w-full mt-2">
      {showInput && (
        <div className="w-full">
          <label className="mb-2 block text-sm font-semibold">
            Add your own {label}
          </label>
          <div className="flex gap-3 md:gap-2 flex-col md:flex-row items-center w-full">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full"
            />
            <Button
              type="button"
              className="text-sm shadow-lg hover:shadow-xl w-full md:w-fit"
              onClick={() => {
                handleAdd(value);
                setValue("");
              }}
            >
              Add {label}
            </Button>
            <Button
              type="button"
              className="text-sm shadow-lg hover:shadow-xl w-full md:w-fit"
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
