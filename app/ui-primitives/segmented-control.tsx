"use client";

import type { ComponentProps } from "react";
import { Slot } from "radix-ui";
import { cn } from "@/app/utils";

// Shared presentation for two-option navigation and ToggleGroup controls.
export function SegmentedControl({
  activeIndex,
  asChild = false,
  className,
  ...props
}: ComponentProps<"div"> & { activeIndex: 0 | 1; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="segmented-control"
      data-active-index={activeIndex}
      className={cn(
        "relative isolate grid w-full max-w-[330px] grid-cols-2 rounded-full bg-accent/5 p-1 before:pointer-events-none before:absolute before:inset-y-1 before:left-1 before:w-[calc((100%_-_0.5rem)/2)] before:rounded-full before:bg-accent before:shadow-sm before:transition-transform before:duration-200 before:ease-in-out before:content-[''] data-[active-index=1]:before:translate-x-full motion-reduce:before:transition-none",
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedControlItem({
  active,
  asChild = false,
  className,
  ...props
}: ComponentProps<"button"> & { active: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="segmented-control-item"
      data-active={active}
      className={cn(
        "relative flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-center text-sm font-medium text-accent transition-colors duration-200 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:text-background motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}
