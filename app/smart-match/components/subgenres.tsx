"use client";

import React, { useState } from "react";
import { FormState } from "../page";
import { subgenreOptions } from "../../constants";
import MultiSelect from "../../ui-primitives/multi-select";
import SelectedMetric from "./custom-metrics/selected-metric";
import CustomInput from "./custom-metrics/custom-input";
import { cn } from "@/app/utils";
import { Button } from "@/app/ui-primitives/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import TooltipComponent from "@/app/components/tooltip";

const Subgenres = ({
  setForm,
}: {
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [customValues, setCustomValues] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);

  const handleSubgenreChange = (subgenres: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        subgenres: subgenres,
      };
    });
  };

  const handleAddCustomSubgenre = (value: string) => {
    if (
      customValues.map((v) => v.toLowerCase()).includes(value.toLowerCase()) ||
      value.trim() === ""
    ) {
      setError("Subgenre already exists");
      return;
    }
    setForm((prev) => ({ ...prev, subgenres: [...prev.subgenres, value] }));
    setCustomValues((prev) => [...prev, value]);
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block">
        Subgenres<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex items-center gap-2 w-full">
        <MultiSelect
          options={subgenreOptions}
          optionTitle="subgenre"
          handleChange={handleSubgenreChange}
        />
        <TooltipComponent
          className="text-center"
          content="Your subgenre not in our list? Click here to add it."
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
        label="subgenre"
        handleAdd={handleAddCustomSubgenre}
        setError={setError}
        showInput={showInput}
        setShowInput={setShowInput}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Subgenres;
