import { formatOptions } from "@/app/constants";
import Combobox from "@/app/ui-primitives/combobox";
import React from "react";
import { FormState } from "../page";

const Format = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Format<span className="text-accent text-xl font-bold">*</span>
      </label>
      <Combobox
        options={formatOptions}
        optionTitle="format"
        handleChange={(value) =>
          setForm((prev) => ({ ...prev, format: value }))
        }
      />
    </div>
  );
};

export default Format;
