"use client";

import { useState } from "react";
import Combobox from "@/app/ui-primitives/combobox";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Field, FieldLabel, FieldError } from "@/app/ui-primitives/field";
import {
  mergeTraitOptions,
  type TraitOption,
  type TraitType,
} from "@/lib/traits";
import type { CreateOrSelectTrait } from "@/app/hooks/use-manuscript-traits";

export function ProjectTraitField({
  type,
  label,
  options,
  value,
  multiple,
  onChange,
  createTrait,
  onBusyChange,
}: {
  type: TraitType;
  label: string;
  options: TraitOption[];
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  createTrait: CreateOrSelectTrait;
  onBusyChange: (busy: boolean) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const id = `profile-${type}`;
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const merged = mergeTraitOptions(options, values);

  async function add() {
    setError("");
    onBusyChange(true);
    try {
      const result = await createTrait(type, custom);
      onChange(
        multiple ? [...new Set([...values, result.value])] : result.value,
      );
      setCustom("");
      setIsAdding(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to add this trait. Try again.",
      );
    } finally {
      onBusyChange(false);
    }
  }

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {multiple ? (
        <InfiniteMultiSelect
          id={id}
          options={merged}
          optionTitle={label.toLowerCase()}
          triggerClassName="w-full md:w-full"
          contentClassName="max-w-[calc(100vw-2rem)]"
          value={values}
          handleChange={onChange}
        />
      ) : (
        <Combobox
          id={id}
          options={merged}
          optionTitle={label.toLowerCase()}
          triggerClassName="w-full md:w-full"
          contentClassName="max-w-[calc(100vw-2rem)]"
          value={typeof value === "string" ? value : ""}
          handleChange={onChange}
        />
      )}
      {isAdding ? (
        <Field>
          <FieldLabel htmlFor={`${id}-custom`}>Custom {type}</FieldLabel>
          <Input
            id={`${id}-custom`}
            name={`custom_${type}`}
            autoComplete="off"
            maxLength={200}
            value={custom}
            onChange={(event) => setCustom(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void add()}
            >
              Add {type}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </Field>
      ) : (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="self-start px-0"
          onClick={() => setIsAdding(true)}
        >
          Add a custom {type}
        </Button>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}
