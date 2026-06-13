"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const StatusFilter = ({ value, onValueChange }: StatusFilterProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-white w-full">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="all">Submission Status: All</SelectItem>
        <SelectItem value="open">Open to submissions</SelectItem>
        <SelectItem value="closed">Closed to submissions</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
