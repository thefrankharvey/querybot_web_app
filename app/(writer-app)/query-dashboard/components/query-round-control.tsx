"use client";

import { Badge } from "@/app/ui-primitives/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";
import { cn } from "@/app/utils";
import { useQuerySafetyConfig } from "@/app/hooks/use-query-safety-config";
import {
  getQueryRoundLabel,
  getQueryRoundSelection,
  isQueryRoundFilter,
  isQueryRoundSelection,
  QUERY_ROUND_LABELS,
  QUERY_ROUND_SELECTIONS,
  type QueryRoundSelection,
  type QueryRoundFilter,
  type QueryRoundState,
} from "@/app/utils/query-rounds";

export function QueryRoundBadge({
  className,
  queryOnHold,
  queryRound,
}: QueryRoundState & { className?: string }) {
  const config = useQuerySafetyConfig();
  const selection = getQueryRoundSelection({ queryOnHold, queryRound });

  if (config.data?.features.queryRounds !== true) return null;

  return (
    <Badge
      className={cn(
        selection === "hold" &&
          "border-amber-300/70 bg-amber-50 text-amber-900",
        selection === "unassigned" && "text-accent/60",
        className,
      )}
      variant={selection === "unassigned" ? "outline" : "secondary"}
    >
      {getQueryRoundLabel({ queryOnHold, queryRound })}
    </Badge>
  );
}

export function QueryRoundFilterSelect({
  className,
  onValueChange,
  value,
}: {
  className?: string;
  onValueChange: (filter: QueryRoundFilter) => void;
  value: QueryRoundFilter;
}) {
  const config = useQuerySafetyConfig();

  if (config.data?.features.queryRounds !== true) return null;

  return (
    <Select
      value={value}
      onValueChange={(nextValue) => {
        if (isQueryRoundFilter(nextValue)) onValueChange(nextValue);
      }}
    >
      <SelectTrigger
        aria-label="Filter by Query Round"
        className={cn("w-full", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent surface="solid">
        <SelectGroup>
          <SelectLabel>Query Round</SelectLabel>
          <SelectItem value="all">All rounds</SelectItem>
          {QUERY_ROUND_SELECTIONS.map((selection) => (
            <SelectItem key={selection} value={selection}>
              {QUERY_ROUND_LABELS[selection]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function QueryRoundSelect({
  className,
  disabled = false,
  id,
  onValueChange,
  queryOnHold,
  queryRound,
}: QueryRoundState & {
  className?: string;
  disabled?: boolean;
  id?: string;
  onValueChange: (selection: QueryRoundSelection) => void;
}) {
  const config = useQuerySafetyConfig();

  if (config.data?.features.queryRounds !== true) return null;

  return (
    <Select
      disabled={disabled}
      value={getQueryRoundSelection({ queryOnHold, queryRound })}
      onValueChange={(value) => {
        if (isQueryRoundSelection(value)) onValueChange(value);
      }}
    >
      <SelectTrigger
        aria-label="Query Round"
        className={cn("w-full", className)}
        id={id}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent surface="solid">
        <SelectGroup>
          <SelectLabel>Query Round</SelectLabel>
          {QUERY_ROUND_SELECTIONS.map((selection) => (
            <SelectItem key={selection} value={selection}>
              {QUERY_ROUND_LABELS[selection]}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
