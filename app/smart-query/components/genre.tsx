import { genreOptions } from "@/app/constants";
import Combobox from "@/app/ui-primitives/combobox";
import React from "react";
import { FormState } from "../page";

const Genre = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Genre<span className="text-accent text-xl font-bold">*</span>
      </label>
      <Combobox
        options={genreOptions}
        optionTitle="genre"
        handleChange={(value) => setForm((prev) => ({ ...prev, genre: value }))}
      />
    </div>
  );
};

export default Genre;
