import React, { useState } from "react";
import { FormState } from "../page";
import { themeOptions } from "@/app/constants";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";
import { cn } from "@/app/utils";

const Themes = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const handleThemeChange = (themes: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        themes: themes,
      };
    });
  };

  const handleAddCustomTheme = (value: string) => {
    if (
      customValues.map((v) => v.toLowerCase()).includes(value.toLowerCase()) ||
      value.trim() === ""
    ) {
      setError("Theme already exists");
      return;
    }
    setForm((prev) => ({ ...prev, themes: [...prev.themes, value] }));
    setCustomValues((prev) => [...prev, value]);
    setError("");
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Themes</label>
      <InfiniteMultiSelect
        options={themeOptions}
        optionTitle="themes"
        handleChange={handleThemeChange}
      />
      <div
        className={cn(
          "flex flex-wrap gap-2 mt-2",
          customValues.length === 0 && "hidden"
        )}
      >
        {customValues.map((value, index) => (
          <SelectedMetric
            key={index}
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
        setError={setError}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Themes;
