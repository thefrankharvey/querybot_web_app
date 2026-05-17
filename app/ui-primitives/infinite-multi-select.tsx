"use client";

import { Check, ChevronDownIcon } from "lucide-react";
import { useState, useMemo, useCallback, useRef, useId } from "react";
import { FixedSizeList as List } from "react-window";
import { cn } from "../utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

type MultipleSelectorProps = {
  options: { value: string; label: string }[];
  optionTitle: string;
  handleChange: (value: string[]) => void;
  width?: string;
};

type ItemData = {
  items: { value: string; label: string }[];
  selectedValues: string[];
  onItemSelect: (value: string) => void;
};

const ListItem = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: ItemData;
}) => {
  const { items, selectedValues, onItemSelect } = data;
  const option = items[index];

  if (!option) return null;

  const isSelected = selectedValues.includes(option.value);

  return (
    <div
      style={style}
      className="group flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent/10"
      onClick={() => onItemSelect(option.value)}
    >
      <Check
        className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")}
      />
      <span className="truncate">{option.label}</span>
    </div>
  );
};

export default function InfiniteMultiSelect({
  options,
  optionTitle,
  handleChange,
}: MultipleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Filter options based on search with performance optimization
  const filteredOptions = useMemo(() => {
    if (!searchValue.trim()) {
      return options;
    }

    const searchTerm = searchValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchTerm) ||
        option.value.toLowerCase().includes(searchTerm)
    );
  }, [options, searchValue]);

  const handleSetValue = useCallback(
    (val: string) => {
      if (value.includes(val)) {
        const newValues = value.filter((item) => item !== val);
        setValue(newValues);
        handleChange(newValues);
      } else {
        const newValues = [...value, val];
        setValue(newValues);
        handleChange(newValues);
      }
    },
    [value, handleChange]
  );

  const handleSearch = useCallback((search: string) => {
    setSearchValue(search);
  }, []);

  const itemData: ItemData = useMemo(
    () => ({
      items: filteredOptions,
      selectedValues: value,
      onItemSelect: handleSetValue,
    }),
    [filteredOptions, value, handleSetValue]
  );

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
      <PopoverContent className={`w-[280px] md:w-[555px] p-0 !bg-white !backdrop-blur-none`}>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              ref={searchInputRef}
              placeholder={`Search ${optionTitle}...`}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Results */}
          <div id={listboxId} role="listbox" className="flex-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchValue.trim()
                  ? `No ${optionTitle} found.`
                  : `Type to search ${optionTitle}...`}
              </div>
            ) : (
              <List
                height={Math.min(300, filteredOptions.length * 40)} // Max 300px height
                width="100%"
                itemCount={filteredOptions.length}
                itemSize={40}
                itemData={itemData}
                className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
              >
                {ListItem}
              </List>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
