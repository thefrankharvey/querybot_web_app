import React, { useEffect, useState } from "react";
import { Input } from "@/app/ui-primitives/input";
import { Button } from "@/app/ui-primitives/button";

const CustomInput = ({
  label,
  closeInput,
  handleAdd,
}: {
  label: string;
  closeInput: boolean;
  handleAdd: (value: string) => void;
}) => {
  const [value, setValue] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

  useEffect(() => {
    if (closeInput) {
      setShowInput(false);
    }
  }, [closeInput]);

  return (
    <div className="flex justify-end w-full">
      {!showInput && (
        <Button
          className="text-sm shadow-lg hover:shadow-xl"
          onClick={() => setShowInput(true)}
        >
          Add custom {label}
        </Button>
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
              className="text-sm shadow-lg hover:shadow-xl"
              onClick={() => {
                handleAdd(value);
                setValue("");
              }}
            >
              Add {label}
            </Button>
            <Button
              className="text-sm shadow-lg hover:shadow-xl"
              onClick={() => setShowInput(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomInput;
