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

const Genre = ({
  createOrSelectTrait,
  form,
  isWalkthroughGenreDropdownOpen,
  options,
  setForm,
}: {
  createOrSelectTrait: CreateOrSelectTrait;
  form: FormState;
  isWalkthroughGenreDropdownOpen?: boolean;
  options: TraitOption[];
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const [showInput, setShowInput] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const mergedOptions = mergeTraitOptions(options, [form.genre]);

  const handleAddGenre = async (value: string) => {
    try {
      const result = await createOrSelectTrait("genre", value);

      setForm((prev) => ({ ...prev, genre: result.value }));
      setError("");
      setShowInput(false);
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add genre",
      );
    }
  };

  const handleSelectChange = (value: string) => {
    setForm((prev) => ({ ...prev, genre: value }));
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block text-accent">
        Genre<span className="text-accent text-xl font-bold">*</span>
      </label>
      <div className="flex items-center w-full">
        <Combobox
          forceOpen={isWalkthroughGenreDropdownOpen}
          options={mergedOptions}
          optionTitle="genre"
          handleChange={handleSelectChange}
          tourTarget="smart-match-genre-dropdown"
          value={form.genre}
        />
        <TooltipComponent
          className="text-center"
          content="Your genre not in our list? Click here to add it."
          contentClass="w-[250px]"
          asChild
        >
          <Button
            data-tour-target="smart-match-genre-plus"
            type="button"
            className="relative text-sm shadow-lg hover:shadow-xl rounded-md flex items-center justify-center w-10 ml-2"
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
        showInput={showInput}
        setShowInput={setShowInput}
        label="genre"
        handleAdd={handleAddGenre}
        closeInput={!!form.genre}
        setError={setError}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Genre;
