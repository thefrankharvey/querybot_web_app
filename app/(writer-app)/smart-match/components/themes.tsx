import React, { useState } from "react";
import { FormState } from "../page";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import CustomInput from "./custom-metrics/custom-input";
import { Button } from "@/app/ui-primitives/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import TooltipComponent from "@/app/components/tooltip";
import { mergeTraitOptions, TraitOption } from "@/lib/traits";
import { CreateOrSelectTrait } from "../hooks/use-smart-match-traits";

// light gray: #F9F9F9 gray-50
// green: #1A4A56 teal-900 teal-800 emerald-900
// white: #FFFFFF

const Themes = ({
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
  const mergedOptions = mergeTraitOptions(options, form.themes);

  const handleThemeChange = (themes: string[]) => {
    setForm((prev) => {
      return {
        ...prev,
        themes: themes,
      };
    });
  };

  const handleAddCustomTheme = async (value: string) => {
    try {
      const result = await createOrSelectTrait("theme", value);

      setForm((prev) => ({
        ...prev,
        themes: prev.themes.includes(result.value)
          ? prev.themes
          : [...prev.themes, result.value],
      }));
      setError("");
      setShowInput(false);
    } catch (addError) {
      setError(
        addError instanceof Error ? addError.message : "Failed to add theme",
      );
    }
  };
  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block text-accent">Themes<span className="text-accent text-xl font-bold">*</span></label>
      <div className="flex items-start gap-2 w-full">
        <InfiniteMultiSelect
          options={mergedOptions}
          optionTitle="themes"
          handleChange={handleThemeChange}
          value={form.themes}
        />
        <TooltipComponent
          className="text-center"
          content="Your theme not in our list? Click here to add it."
          contentClass="w-[250px]"
          asChild
        >
          <Button
            type="button"
            className="relative flex size-10 shrink-0 items-center justify-center rounded-md p-0 text-sm shadow-lg hover:shadow-xl has-[>svg]:px-0"
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
        label="theme"
        handleAdd={handleAddCustomTheme}
        setError={setError}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default Themes;
