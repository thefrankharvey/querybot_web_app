"use client";

import { useCallback, useEffect, useState } from "react";
import { Ellipsis } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui-primitives/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import {
  FIT_RATING_CONFIG,
  type FitRating,
} from "@/app/components/fit-rating-badge";

export type PrepQueryLetterFilter = "all" | "done" | "not_done";

interface KanbanColumnFiltersProps {
  fitRatingFilter: "all" | FitRating;
  onFitRatingChange: (value: "all" | FitRating) => void;
  prepQueryLetterFilter: PrepQueryLetterFilter;
  onPrepQueryLetterChange: (value: PrepQueryLetterFilter) => void;
  tourForceOpen?: boolean;
  tourTargetsEnabled?: boolean;
}

export function KanbanColumnFilters({
  fitRatingFilter,
  onFitRatingChange,
  prepQueryLetterFilter,
  onPrepQueryLetterChange,
  tourForceOpen,
  tourTargetsEnabled = false,
}: KanbanColumnFiltersProps) {
  const [userOpen, setUserOpen] = useState(false);
  const showDot = fitRatingFilter !== "all" || prepQueryLetterFilter !== "all";
  const isTourControlled = tourForceOpen !== undefined;
  const open = isTourControlled ? tourForceOpen : userOpen;

  useEffect(() => {
    if (tourForceOpen !== false) return;

    setUserOpen(false);
  }, [tourForceOpen]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (tourForceOpen === true && !nextOpen) return;
      if (isTourControlled) return;

      setUserOpen(nextOpen);
    },
    [isTourControlled, tourForceOpen],
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="flex flex-col items-end">
          {showDot ? <div className="w-2.5 h-2.5 bg-blue-accent rounded-full mb-[-6px]" /> : <div className="w-2.5 h-2.5 bg-transparent rounded-full mb-[-6px]" />}
          <button aria-label="Filter column" className="p-1 hover:bg-accent/20 rounded">
            <Ellipsis className="w-6 h-6" />
          </button>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" surface="solid" className="w-56">
        <div className="flex flex-col gap-4">
          {/* Fit Rating Filter */}
          <div
            className="flex flex-col gap-2"
            data-tour-target={
              tourTargetsEnabled ? "query-dashboard-filter-fit-rating" : undefined
            }
          >
            <label className="text-sm font-medium">Filter by Fit Rating</label>
            <Select
              value={fitRatingFilter}
              onValueChange={(value: "all" | FitRating) => onFitRatingChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent surface="solid">
                <SelectItem value="all">All</SelectItem>
                {(Object.keys(FIT_RATING_CONFIG) as FitRating[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: FIT_RATING_CONFIG[key].color }}
                      />
                      {FIT_RATING_CONFIG[key].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prep Query Letter Filter */}
          <div
            className="flex flex-col gap-2"
            data-tour-target={
              tourTargetsEnabled
                ? "query-dashboard-filter-query-letter"
                : undefined
            }
          >
            <label className="text-sm font-medium">Filter by Query Letter</label>
            <Select
              value={prepQueryLetterFilter}
              onValueChange={(value: PrepQueryLetterFilter) => onPrepQueryLetterChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent surface="solid">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="done">Ready</SelectItem>
                <SelectItem value="not_done">Not Ready</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default KanbanColumnFilters;
