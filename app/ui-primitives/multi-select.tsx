import { Check, ChevronDownIcon } from "lucide-react";

import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CommandEmpty } from "./command";
import { Command } from "./command";
import { useState } from "react";
import { cn } from "../utils";

type MultipleSelectorProps = {
  options: { value: string; label: string }[];
  optionTitle: string;
  handleChange: (value: string[]) => void;
  width?: string;
};

export default function MultiSelect({
  options,
  optionTitle,
  handleChange,
}: MultipleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>([]);

  const handleSetValue = (val: string) => {
    if (value.includes(val)) {
      value.splice(value.indexOf(val), 1);
      const newValues = value.filter((item) => item !== val);
      setValue(newValues);
      handleChange(newValues);
    } else {
      setValue((prevValue) => [...prevValue, val]);
      handleChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`flex-1 md:w-[555px] justify-between bg-white h-fit`}
        >
          <div className="flex gap-2 justify-start flex-wrap">
            {value?.length
              ? value.map((val, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 rounded-xl border bg-slate-200 text-xs font-medium"
                  >
                    {options.find((option) => option.value === val)?.label}
                  </div>
                ))
              : `Select ${optionTitle}...`}
          </div>
          <ChevronDownIcon className="size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={`w-[280px] md:w-[555px] p-0`}>
        <Command>
          <CommandInput placeholder={`Search ${optionTitle}...`} />
          <CommandEmpty>No {optionTitle} found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    handleSetValue(option.value);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
