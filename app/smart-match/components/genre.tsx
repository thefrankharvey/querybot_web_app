"use client";

import { genreOptions } from "@/app/constants";
import Combobox, { ComboboxRef } from "@/app/ui-primitives/combobox";
import React, { useRef, useState } from "react";
import { FormState } from "../page";
import CustomInput from "./custom-metrics/custom-input";
import SelectedMetric from "./custom-metrics/selected-metric";
import { cn } from "@/app/utils";

const Genre = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const comboboxRef = useRef<ComboboxRef>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleAddGenre = (value: string) => {
    if (
      customValue.toLowerCase() === value.toLowerCase() ||
      value.trim() === ""
    ) {
      setError("Genre already exists");
      return;
    }
    comboboxRef.current?.clear();
    setForm((prev) => ({ ...prev, genre: value }));
    setCustomValue(value);
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, genre: value }));
    setCustomValue("");
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Genre<span className="text-accent text-xl font-bold">*</span>
      </label>
      <Combobox
        ref={comboboxRef}
        options={genreOptions}
        optionTitle="genre"
        handleChange={handleSelectChange}
      />
      <div
        className={cn(
          "flex flex-wrap gap-2 mt-2",
          customValue === "" && "hidden"
        )}
      >
        {customValue && (
          <SelectedMetric
            value={customValue}
            handleRemove={() => setCustomValue("")}
          />
        )}
      </div>
      <CustomInput
        label="genre"
        handleAdd={handleAddGenre}
        closeInput={!!customValue}
        setError={setError}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Genre;
