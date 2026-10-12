"use client";

import { Columns3, Table2 } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/app/ui-primitives/segmented-control";
import { useQueryDashContext } from "../context/query-dash-context";

export function QueryDashboardViewToggle() {
  const { dashboardView, setDashboardView } = useQueryDashContext();
  return (
    <ToggleGroup.Root
      type="single"
      value={dashboardView}
      onValueChange={(value) => {
        if (value === "table" || value === "board") setDashboardView(value);
      }}
      orientation="horizontal"
      aria-label="Dashboard display"
      asChild
    >
      <SegmentedControl
        activeIndex={dashboardView === "board" ? 1 : 0}
        className="md:w-[200px] md:shrink-0"
      >
        <ToggleGroup.Item value="table" asChild>
          <SegmentedControlItem
            active={dashboardView === "table"}
            type="button"
          >
            <Table2 data-icon="inline-start" aria-hidden="true" />
            Table
          </SegmentedControlItem>
        </ToggleGroup.Item>
        <ToggleGroup.Item value="board" asChild>
          <SegmentedControlItem
            active={dashboardView === "board"}
            type="button"
          >
            <Columns3 data-icon="inline-start" aria-hidden="true" />
            Board
          </SegmentedControlItem>
        </ToggleGroup.Item>
      </SegmentedControl>
    </ToggleGroup.Root>
  );
}
