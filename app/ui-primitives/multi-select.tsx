import { Check, ChevronDownIcon } from "lucide-react";

import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { CommandEmpty } from "./command";
import { Command } from "./command";
import { useId, useState } from "react";
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
  const listboxId = useId();

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
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className="glass-input inline-flex h-auto min-h-11 min-w-0 flex-1 items-start justify-between gap-2 rounded-[1.75rem] bg-white px-4 py-3 text-sm font-medium text-accent whitespace-normal shadow-none transition-[border-color,box-shadow,background-color] outline-none hover:border-accent/22 hover:bg-white/88 focus-visible:border-accent/20 focus-visible:ring-ring/30 focus-visible:ring-[4px] md:w-[555px]"
        >
          <div className="flex min-w-0 flex-1 flex-wrap justify-start gap-2 text-left">
            {value?.length
              ? value.map((val, i) => (
                  <div
                    key={i}
                    className="min-w-0 max-w-full rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium"
                  >
                    <span className="block max-w-full truncate">
                      {options.find((option) => option.value === val)?.label}
                    </span>
                  </div>
                ))
              : `Select ${optionTitle}...`}
          </div>
          <ChevronDownIcon className="mt-1 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className={`w-[280px] md:w-[555px] p-0`}>
        <Command>
          <CommandInput placeholder={`Search ${optionTitle}...`} />
          <CommandEmpty>No {optionTitle} found.</CommandEmpty>
          <CommandGroup>
            <CommandList id={listboxId}>
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
