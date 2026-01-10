"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui-primitives/select";

export const StatusFilter = () => {
  return (
    <Select defaultValue="all">
      <SelectTrigger className="bg-white">
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
