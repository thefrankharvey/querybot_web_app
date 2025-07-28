import React, { useState } from "react";
import { FormState } from "../page";
import { themeOptions } from "@/app/constants";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";

const Themes = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValues, setCustomValues] = useState<string[]>([]);
  const handleThemeChange = (themes: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        themes: themes,
      };
    });
  };

  const handleAddCustomTheme = (value: string) => {
    setForm((prev) => ({ ...prev, themes: [...prev.themes, value] }));
    setCustomValues((prev) => [...prev, value]);
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Themes</label>
      <InfiniteMultiSelect
        options={themeOptions}
        optionTitle="themes"
        handleChange={handleThemeChange}
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
        label="themes"
        handleAdd={handleAddCustomTheme}
        closeInput={customValues.length > 0}
      />
    </div>
  );
};

export default Themes;
