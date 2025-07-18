import React from "react";
import { FormState } from "../page";
import { subgenreOptions } from "../../constants";
import MultiSelect from "../../ui-primitives/multi-select";

const Subgenres = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const handleSubgenreChange = (subgenres: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        subgenres: subgenres,
      };
    });
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
    </div>
  );
};

export default Subgenres;
