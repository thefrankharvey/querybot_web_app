"use client";

import React, { useState } from "react";
import { FormState } from "../page";
import { subgenreOptions } from "../../constants";
import MultiSelect from "../../ui-primitives/multi-select";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";

const Subgenres = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValues, setCustomValues] = useState<string[]>([]);
  const handleSubgenreChange = (subgenres: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        subgenres: subgenres,
      };
    });
  };

  const handleAddCustomSubgenre = (value: string) => {
    setForm((prev) => ({ ...prev, subgenres: [...prev.subgenres, value] }));
    setCustomValues((prev) => [...prev, value]);
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Subgenres<span className="text-accent text-xl font-bold">*</span>
      </label>
      <MultiSelect
        options={subgenreOptions}
        optionTitle="subgenre"
        handleChange={handleSubgenreChange}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {customValues.map((value) => (
          <SelectedMetric
            key={value}
            value={value}
            handleRemove={() =>
              setCustomValues(customValues.filter((v) => v !== value))
            }
          />
        ))}
      </div>
      <CustomInput
        label="subgenres"
        handleAdd={handleAddCustomSubgenre}
        closeInput={customValues.length > 0}
      />
    </div>
  );
};

export default Subgenres;
