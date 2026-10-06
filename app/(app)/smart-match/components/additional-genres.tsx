"use client";

import React from "react";
import { FormState } from "../page";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import { mergeTraitOptions, TraitOption } from "@/lib/traits";

// GSR-028: optional extra genres. The Genre picker above stays the primary selection;
// every selection is sent as `genres` (primary first) only when at least one extra is chosen.
const AdditionalGenres = ({
  form,
  options,
  setForm,
}: {
  form: FormState;
  options: TraitOption[];
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
}) => {
  const primary = form.genre.trim().toLocaleLowerCase();
  const mergedOptions = mergeTraitOptions(options, form.additional_genres).filter(
    (option) => option.value.toLocaleLowerCase() !== primary,
  );

  const handleChange = (genres: string[]) => {
    setForm((prev) => ({ ...prev, additional_genres: genres }));
  };

  return (
    <div className="w-full">
      <label className="font-semibold mb-2 block text-accent">
        Additional genres <span className="font-normal text-sm">(optional)</span>
      </label>
      <InfiniteMultiSelect
        options={mergedOptions}
        optionTitle="genre"
        handleChange={handleChange}
        value={form.additional_genres}
      />
    </div>
  );
};

export default AdditionalGenres;
