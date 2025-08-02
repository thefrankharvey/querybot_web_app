"use client";

import { formatOptions } from "@/app/constants";
import Combobox, { ComboboxRef } from "@/app/ui-primitives/combobox";
import React, { useRef, useState } from "react";
import { FormState } from "../page";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";
import { cn } from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import TooltipComponent from "@/app/components/tooltip";

const Format = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValue, setCustomValue] = useState<string>("");
  const comboboxRef = useRef<ComboboxRef>(null);
  const [error, setError] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

  const handleAddFormat = (value: string) => {
    if (
      customValue.toLowerCase() === value.toLowerCase() ||
      value.trim() === ""
    ) {
      setError("Format already exists");
      return;
    }
    comboboxRef.current?.clear();
    setForm((prev) => ({ ...prev, format: value }));
    setCustomValue(value);
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, format: value }));
    setCustomValue("");
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Format<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex items-center gap-2 w-full">
        <Combobox
          ref={comboboxRef}
          options={formatOptions}
          optionTitle="format"
          handleChange={handleSelectChange}
        />
        <TooltipComponent
          className="text-center"
          content="Your format not in our list? Click here to add it."
          contentClass="w-[250px]"
          asChild
        >
          <Button
            type="button"
            className="relative text-sm shadow-lg hover:shadow-xl rounded-md flex items-center justify-center w-10"
            onClick={() => setShowInput((prev) => !prev)}
          >
            {showInput ? (
              <MinusIcon className="w-24 h-24" />
            ) : (
              <PlusIcon className="w-24 h-24" />
            )}
          </Button>
        </TooltipComponent>
      </div>
      <div
        className={cn(
          "flex flex-wrap gap-2 mt-2",
          customValue === "" && "hidden"
        )}
      >
        {customValue && (
          <SelectedMetric
            value={customValue}
            handleRemove={() => setCustomValue("")}
          />
        )}
      </div>
      <CustomInput
        label="format"
        handleAdd={handleAddFormat}
        closeInput={!!customValue}
        setError={setError}
        showInput={showInput}
        setShowInput={setShowInput}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Format;
