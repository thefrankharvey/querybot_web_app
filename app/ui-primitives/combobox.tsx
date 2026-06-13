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
  forceOpen?: boolean;
  options: { value: string; label: string }[];
  optionTitle: string;
  handleChange: (value: string) => void;
  tourTarget?: string;
};

export interface ComboboxRef {
  clear: () => void;
}

const Combobox = React.forwardRef<ComboboxRef | null, ComboboxProps>(
  ({ forceOpen, options, optionTitle, handleChange, tourTarget }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const isOpen = forceOpen ? true : open;

    React.useImperativeHandle(ref, () => ({
      clear: () => {
        setValue("");
        handleChange("");
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
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="flex-1 md:w-[555px] justify-between bg-white"
          >
            {value
              ? options.find((option) => option.value === value)?.label
              : `Select ${optionTitle}...`}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] md:w-[555px] p-0">
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
                    value={option.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      handleChange(currentValue);
                      if (!forceOpen) {
                        setOpen(false);
                      }
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0"
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
