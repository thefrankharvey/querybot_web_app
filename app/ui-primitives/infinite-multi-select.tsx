"use client";

import { Check, ChevronDownIcon } from "lucide-react";
import {
  useState,
  useMemo,
  useCallback,
  useRef,
  useId,
  useDeferredValue,
} from "react";
import { FixedSizeList as List } from "react-window";
import { cn } from "../utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Input } from "./input";

type SearchableOption = {
  value: string;
  label: string;
  keywords?: string[];
};

type MultipleSelectorProps = {
  options: SearchableOption[];
  optionTitle: string;
  handleChange: (value: string[]) => void;
  id?: string;
  width?: string;
  value?: string[];
  contentClassName?: string;
  listHeight?: number;
  selectedBadgeClassName?: string;
  triggerClassName?: string;
};

type ItemData = {
  items: SearchableOption[];
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
      className="px-1 py-0.5"
    >
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        className="flex size-full items-center rounded-xl px-2 text-left text-sm transition-colors hover:bg-accent/8 focus-visible:bg-accent/8 focus-visible:outline-none"
        onClick={() => onItemSelect(option.value)}
      >
        <Check
          className={cn(
            "mr-2 size-4",
            isSelected ? "opacity-100" : "opacity-0"
          )}
        />
        <span className="truncate">{option.label}</span>
      </button>
    </div>
  );
};

export default function InfiniteMultiSelect({
  contentClassName,
  id,
  listHeight = 300,
  options,
  optionTitle,
  handleChange,
  selectedBadgeClassName,
  triggerClassName,
  value,
}: MultipleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const selectedValues = value ?? internalValue;
  const deferredSearchValue = useDeferredValue(searchValue);
  const searchableOptions = useMemo(
    () =>
      options.map((option) => ({
        option,
        searchText: [
          option.label,
          option.value,
          ...(option.keywords ?? []),
        ]
          .join(" ")
          .toLocaleLowerCase(),
      })),
    [options]
  );
  const optionLabelsByValue = useMemo(
    () =>
      new Map(
        options.map((option) => [option.value, option.label] as const)
      ),
    [options]
  );

  const filteredOptions = useMemo(() => {
    const searchTerm = deferredSearchValue.trim().toLocaleLowerCase();

    if (!searchTerm) {
      return options;
    }

    return searchableOptions
      .filter(({ searchText }) => searchText.includes(searchTerm))
      .map(({ option }) => option);
  }, [deferredSearchValue, options, searchableOptions]);

  const handleSetValue = useCallback(
    (val: string) => {
      if (selectedValues.includes(val)) {
        const newValues = selectedValues.filter((item) => item !== val);

        if (value === undefined) {
          setInternalValue(newValues);
        }

        handleChange(newValues);
      } else {
        const newValues = [...selectedValues, val];

        if (value === undefined) {
          setInternalValue(newValues);
        }

        handleChange(newValues);
      }
    },
    [handleChange, selectedValues, value]
  );

  const handleSearch = useCallback((search: string) => {
    setSearchValue(search);
  }, []);

  const itemData: ItemData = useMemo(
    () => ({
      items: filteredOptions,
      selectedValues,
      onItemSelect: handleSetValue,
    }),
    [filteredOptions, selectedValues, handleSetValue]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "glass-input inline-flex h-auto min-h-11 min-w-0 flex-1 items-start justify-between gap-2 rounded-[1.75rem] bg-white px-4 py-3 text-sm font-medium whitespace-normal text-accent shadow-none outline-none transition-[border-color,box-shadow,background-color] hover:border-accent/22 hover:bg-white/88 focus-visible:border-accent/20 focus-visible:ring-[4px] focus-visible:ring-ring/30 md:w-[555px]",
            triggerClassName
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap justify-start gap-2 text-left">
            {selectedValues?.length
              ? selectedValues.map((val, i) => (
                  <div
                    key={i}
                    className={cn(
                      "min-w-0 max-w-full rounded-xl border bg-slate-200 px-2 py-1 text-xs font-medium",
                      selectedBadgeClassName
                    )}
                  >
                    <span className="block max-w-full truncate">
                      {optionLabelsByValue.get(val) ?? val}
                    </span>
                  </div>
                ))
              : `Select ${optionTitle}...`}
          </div>
          <ChevronDownIcon className="mt-1 size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[280px] p-0 !bg-white !backdrop-blur-none md:w-[555px]",
          contentClassName
        )}
      >
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
                height={Math.min(listHeight, filteredOptions.length * 40)}
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
