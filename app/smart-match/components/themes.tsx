import React, { useState } from "react";
import { FormState } from "../page";
import { themeOptions } from "@/app/constants";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";
import { cn } from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import TooltipComponent from "@/app/components/tooltip";

// light gray: #F9F9F9 gray-50
// green: #1A4A56 teal-900 teal-800 emerald-900
// white: #FFFFFF

const Themes = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

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
      <div className="flex items-center gap-2 w-full">
        <InfiniteMultiSelect
          options={themeOptions}
          optionTitle="themes"
          handleChange={handleThemeChange}
        />
        <TooltipComponent
          className="text-center"
          content="Your theme not in our list? Click here to add it."
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
        showInput={showInput}
        setShowInput={setShowInput}
        label="theme"
        handleAdd={handleAddCustomTheme}
        setError={setError}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Themes;
