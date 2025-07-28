"use client";

import { formatOptions } from "@/app/constants";
import Combobox, { ComboboxRef } from "@/app/ui-primitives/combobox";
import React, { useRef, useState } from "react";
import { FormState } from "../page";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";

const Format = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValue, setCustomValue] = useState<string>("");
  const comboboxRef = useRef<ComboboxRef>(null);

  const handleAddFormat = (value: string) => {
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
      <div className="flex flex-wrap gap-2 mt-2">
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
      />
    </div>
  );
};

export default Format;
