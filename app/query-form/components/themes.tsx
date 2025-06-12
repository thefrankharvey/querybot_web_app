import React from "react";
import { FormState } from "../page";
import { themeOptions } from "@/app/constants";
import MultiSelect from "@/app/ui-primitives/multi-select";

const Themes = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const handleThemeChange = (themes: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        themes: themes,
      };
    });
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">Themes</label>
      <MultiSelect
        options={themeOptions}
        optionTitle="themes"
        handleChange={handleThemeChange}
      />
    </div>
  );
};

export default Themes;
