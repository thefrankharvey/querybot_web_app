"use client";

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
import { FitRating, FIT_RATING_CONFIG } from "./kanban-card";

export type PrepQueryLetterFilter = "all" | "done" | "not_done";

interface KanbanColumnFiltersProps {
  fitRatingFilter: "all" | FitRating;
  onFitRatingChange: (value: "all" | FitRating) => void;
  prepQueryLetterFilter: PrepQueryLetterFilter;
  onPrepQueryLetterChange: (value: PrepQueryLetterFilter) => void;
}

export function KanbanColumnFilters({
  fitRatingFilter,
  onFitRatingChange,
  prepQueryLetterFilter,
  onPrepQueryLetterChange,
}: KanbanColumnFiltersProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1 hover:bg-accent/20 rounded">
          <Ellipsis className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <div className="flex flex-col gap-4">
          {/* Fit Rating Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Filter by Fit Rating</label>
            <Select
              value={fitRatingFilter}
              onValueChange={(value: "all" | FitRating) => onFitRatingChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Filter by Query Letter</label>
            <Select
              value={prepQueryLetterFilter}
              onValueChange={(value: PrepQueryLetterFilter) => onPrepQueryLetterChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
