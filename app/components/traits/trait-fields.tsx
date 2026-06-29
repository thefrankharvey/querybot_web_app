"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Plus, X } from "lucide-react";

import Combobox from "@/app/ui-primitives/combobox";
import InfiniteMultiSelect from "@/app/ui-primitives/infinite-multi-select";
import { Button } from "@/app/ui-primitives/button";
import { Input } from "@/app/ui-primitives/input";
import { Spinner } from "@/app/ui-primitives/spinner";
import { cn } from "@/app/utils";
import type { CreateOrSelectTrait } from "@/app/hooks/use-manuscript-traits";
import {
  formatTraitLabel,
  mergeTraitOptions,
  type TraitOption,
  type TraitType,
} from "@/lib/traits";

type SharedTraitFieldProps = {
  addLabel?: string;
  contentClassName?: string;
  createOrSelectTrait: CreateOrSelectTrait;
  customAddClassName?: string;
  id: string;
  isCreatingTrait: boolean;
  label: string;
  options: TraitOption[];
  optionTitle?: string;
  triggerClassName?: string;
  traitType: TraitType;
};

type TraitSingleSelectFieldProps = SharedTraitFieldProps & {
  onValueChange: (value: string) => void;
  value: string;
};

type TraitMultiSelectFieldProps = SharedTraitFieldProps & {
  onValueChange: (value: string[]) => void;
  selectedBadgeClassName?: string;
  value: string[];
};

function normalizeSelectionKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

function uniqueTraitValues(values: string[]) {
  const seen = new Set<string>();
  const uniqueValues: string[] = [];

  for (const value of values) {
    const trimmedValue = value.trim();
    const key = normalizeSelectionKey(trimmedValue);

    if (!trimmedValue || seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueValues.push(trimmedValue);
  }

  return uniqueValues;
}

function singularizeLabel(label: string) {
  return label.endsWith("s") ? label.slice(0, -1) : label;
}

function TraitFieldShell({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error: string;
  id: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className="text-xs font-semibold uppercase tracking-[0.16em] text-accent/58"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="flex flex-col gap-3">{children}</div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function TraitCustomAddRow({
  addLabel,
  className,
  customValue,
  isCreatingTrait,
  onAdd,
  onCustomValueChange,
}: {
  addLabel: string;
  className?: string;
  customValue: string;
  isCreatingTrait: boolean;
  onAdd: () => void;
  onCustomValueChange: (value: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 md:w-1/2 md:flex-row",
        className,
      )}
    >
      <Input
        onChange={(event) => onCustomValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onAdd();
          }
        }}
        placeholder={`Add custom ${addLabel.toLocaleLowerCase()}`}
        value={customValue}
      />
      <Button
        className="md:w-fit"
        disabled={isCreatingTrait}
        onClick={onAdd}
        type="button"
        variant="outline"
      >
        {isCreatingTrait ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <Plus data-icon="inline-start" />
        )}
        {isCreatingTrait ? "Adding" : "Add"}
      </Button>
    </div>
  );
}

export function TraitSingleSelectField({
  addLabel,
  contentClassName,
  createOrSelectTrait,
  customAddClassName,
  id,
  isCreatingTrait,
  label,
  onValueChange,
  options,
  optionTitle,
  triggerClassName,
  traitType,
  value,
}: TraitSingleSelectFieldProps) {
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState("");
  const singleAddLabel = addLabel ?? singularizeLabel(label);
  const mergedOptions = useMemo(
    () => mergeTraitOptions(options, value ? [value] : []),
    [options, value],
  );

  const handleAddCustom = async () => {
    const trimmedValue = customValue.trim();

    if (!trimmedValue) {
      setError(`Enter a ${singleAddLabel.toLocaleLowerCase()}`);
      return;
    }

    try {
      const result = await createOrSelectTrait(traitType, trimmedValue);

      if (normalizeSelectionKey(result.value) === normalizeSelectionKey(value)) {
        setError(`${singleAddLabel} already selected`);
        return;
      }

      onValueChange(result.value);
      setCustomValue("");
      setError("");
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : `Failed to add ${singleAddLabel.toLocaleLowerCase()}`,
      );
    }
  };

  return (
    <TraitFieldShell error={error} id={id} label={label}>
      <Combobox
        contentClassName={contentClassName}
        handleChange={(nextValue) => {
          onValueChange(nextValue);
          setError("");
        }}
        id={id}
        options={mergedOptions}
        optionTitle={optionTitle ?? label.toLocaleLowerCase()}
        triggerClassName={triggerClassName}
        value={value}
      />
      <TraitCustomAddRow
        addLabel={singleAddLabel}
        className={customAddClassName}
        customValue={customValue}
        isCreatingTrait={isCreatingTrait}
        onAdd={() => void handleAddCustom()}
        onCustomValueChange={(nextValue) => {
          setCustomValue(nextValue);
          setError("");
        }}
      />
    </TraitFieldShell>
  );
}

export function TraitMultiSelectField({
  addLabel,
  contentClassName,
  createOrSelectTrait,
  customAddClassName,
  id,
  isCreatingTrait,
  label,
  onValueChange,
  options,
  optionTitle,
  selectedBadgeClassName,
  triggerClassName,
  traitType,
  value,
}: TraitMultiSelectFieldProps) {
  const [customValue, setCustomValue] = useState("");
  const [error, setError] = useState("");
  const singleAddLabel = addLabel ?? singularizeLabel(label);
  const mergedOptions = useMemo(
    () => mergeTraitOptions(options, value),
    [options, value],
  );
  const selectedKeys = useMemo(
    () => new Set(value.map(normalizeSelectionKey)),
    [value],
  );
  const optionLabelsByValue = useMemo(
    () => new Map(mergedOptions.map((option) => [option.value, option.label])),
    [mergedOptions],
  );

  const setUniqueValues = (values: string[]) => {
    onValueChange(uniqueTraitValues(values));
  };

  const handleAddCustom = async () => {
    const trimmedValue = customValue.trim();

    if (!trimmedValue) {
      setError(`Enter a ${singleAddLabel.toLocaleLowerCase()}`);
      return;
    }

    try {
      const result = await createOrSelectTrait(traitType, trimmedValue);

      if (selectedKeys.has(normalizeSelectionKey(result.value))) {
        setError(`${singleAddLabel} already selected`);
        return;
      }

      setUniqueValues([...value, result.value]);
      setCustomValue("");
      setError("");
    } catch (addError) {
      setError(
        addError instanceof Error
          ? addError.message
          : `Failed to add ${singleAddLabel.toLocaleLowerCase()}`,
      );
    }
  };

  return (
    <TraitFieldShell error={error} id={id} label={label}>
      <InfiniteMultiSelect
        contentClassName={contentClassName}
        handleChange={(nextValues) => {
          setUniqueValues(nextValues);
          setError("");
        }}
        id={id}
        optionTitle={optionTitle ?? label.toLocaleLowerCase()}
        options={mergedOptions}
        selectedBadgeClassName={selectedBadgeClassName}
        triggerClassName={triggerClassName}
        value={value}
      />

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((selectedValue) => (
            <button
              className="flex w-fit items-center gap-1 rounded-full bg-[#E2E8F1] p-2 text-xs font-medium text-accent transition hover:bg-accent/12"
              key={selectedValue}
              onClick={() =>
                setUniqueValues(
                  value.filter((item) => item !== selectedValue),
                )
              }
              type="button"
            >
              <span>
                {optionLabelsByValue.get(selectedValue) ??
                  formatTraitLabel(selectedValue)}
              </span>
              <X className="size-4" />
            </button>
          ))}
        </div>
      ) : null}

      <TraitCustomAddRow
        addLabel={singleAddLabel}
        className={customAddClassName}
        customValue={customValue}
        isCreatingTrait={isCreatingTrait}
        onAdd={() => void handleAddCustom()}
        onCustomValueChange={(nextValue) => {
          setCustomValue(nextValue);
          setError("");
        }}
      />
    </TraitFieldShell>
  );
}
