import React from "react";
import { FormState } from "../page";
import { themeOptions } from "@/app/constants";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";

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
      <InfiniteMultiSelect
        options={themeOptions}
        optionTitle="themes"
        handleChange={handleThemeChange}
      />
    </div>
  );
};

export default Themes;
