"use client";

import * as React from "react";
import { Check, ChevronDownIcon } from "lucide-react";
import { cn } from "../utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type ComboboxProps = {
  contentClassName?: string;
  forceOpen?: boolean;
  id?: string;
  options: { value: string; label: string; keywords?: string[] }[];
  optionTitle: string;
  handleChange: (value: string) => void;
  tourTarget?: string;
  triggerClassName?: string;
  value?: string;
};

export interface ComboboxRef {
  clear: () => void;
}

const Combobox = React.forwardRef<ComboboxRef | null, ComboboxProps>(
  (
    {
      contentClassName,
      forceOpen,
      id,
      options,
      optionTitle,
      handleChange,
      tourTarget,
      triggerClassName,
      value,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState("");
    const isOpen = forceOpen ? true : open;
    const selectedValue = value ?? internalValue;
    const selectedOption = options.find(
      (option) => option.value === selectedValue,
    );

    const updateValue = React.useCallback(
      (nextValue: string) => {
        if (value === undefined) {
          setInternalValue(nextValue);
        }

        handleChange(nextValue);
      },
      [handleChange, value],
    );

    React.useImperativeHandle(ref, () => ({
      clear: () => {
        updateValue("");
      },
    }));

    return (
      <Popover
        open={isOpen}
        onOpenChange={(nextOpen) => {
          if (!forceOpen) {
            setOpen(nextOpen);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            data-tour-target={tourTarget}
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "flex-1 justify-between bg-white md:w-[555px]",
              triggerClassName,
            )}
          >
            {selectedValue
              ? selectedOption?.label ?? selectedValue
              : `Select ${optionTitle}...`}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-[280px] p-0 md:w-[555px]", contentClassName)}
        >
          <Command>
            <CommandInput
              placeholder={`Search ${optionTitle}...`}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No {optionTitle} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    keywords={option.keywords}
                    value={option.value}
                    onSelect={(currentValue) => {
                      updateValue(
                        currentValue === selectedValue ? "" : currentValue,
                      );
                      if (!forceOpen) {
                        setOpen(false);
                      }
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedValue === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

Combobox.displayName = "Combobox";

export default Combobox;
