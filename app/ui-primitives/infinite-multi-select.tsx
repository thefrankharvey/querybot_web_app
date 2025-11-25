"use client";

import { Check, ChevronDownIcon } from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";
import { FixedSizeList as List } from "react-window";
import { cn } from "../utils";
import { Button } from "./button";
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
      className="group flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
      onClick={() => onItemSelect(option.value)}
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4 group-hover:text-white",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      />
      <span className="truncate group-hover:text-white">{option.label}</span>
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`flex-1 md:w-[495px] justify-between bg-white h-fit hover:text-white`}
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
      <PopoverContent className={`w-[280px] md:w-[495px] p-0`}>
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
          <div className="flex-1">
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
