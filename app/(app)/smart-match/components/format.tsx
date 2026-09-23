"use client";

import Combobox from "@/app/ui-primitives/combobox";
import React, { useState } from "react";
import { FormState } from "../page";
import CustomInput from "./custom-metrics/custom-input";
import { Button } from "@/app/ui-primitives/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import TooltipComponent from "@/app/components/tooltip";
import { mergeTraitOptions, TraitOption } from "@/lib/traits";
import { CreateOrSelectTrait } from "../hooks/use-smart-match-traits";

const Format = ({
  createOrSelectTrait,
  form,
  options,
  setForm,
}: {
  createOrSelectTrait: CreateOrSelectTrait;
  form: FormState;
  options: TraitOption[];
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [error, setError] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const mergedOptions = mergeTraitOptions(options, [form.format]);

  const handleAddFormat = async (value: string) => {
    try {
      const result = await createOrSelectTrait("format", value);

      setForm((prev) => ({ ...prev, format: result.value }));
      setError("");
      setShowInput(false);
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add format",
      );
    }
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, format: value }));
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block text-accent">
        Format<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex items-center gap-2 w-full">
        <Combobox
          options={mergedOptions}
          optionTitle="format"
          handleChange={handleSelectChange}
          value={form.format}
        />
        <TooltipComponent
          className="text-center"
          content="Your format not in our list? Click here to add it."
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
      <CustomInput
        label="format"
        handleAdd={handleAddFormat}
        closeInput={!!form.format}
        setError={setError}
        showInput={showInput}
        setShowInput={setShowInput}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Format;
