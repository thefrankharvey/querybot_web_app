"use client";

import { formatOptions } from "@/app/constants";
import Combobox, { ComboboxRef } from "@/app/ui-primitives/combobox";
import React, { useRef, useState } from "react";
import { FormState } from "../page";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";
import { cn } from "@/app/utils";

const Format = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValue, setCustomValue] = useState<string>("");
  const comboboxRef = useRef<ComboboxRef>(null);
  const [error, setError] = useState<string>("");

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

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Format<span className="text-accent text-xl font-bold">*</span>
      </label>
      <Combobox
        ref={comboboxRef}
        options={formatOptions}
        optionTitle="format"
        handleChange={(value) =>
          setForm((prev) => ({ ...prev, format: value }))
        }
      />
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
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Format;
