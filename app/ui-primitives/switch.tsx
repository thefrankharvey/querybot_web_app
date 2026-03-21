"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "../utils";

type SwitchProps = Omit<
  React.ComponentProps<typeof SwitchPrimitive.Root>,
  "onToggle"
> & {
  onToggle?: (checked: boolean) => void;
};

function Switch({
  className,
  onCheckedChange,
  onToggle,
  ...props
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-white/70 bg-white/60 p-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] transition-all outline-none data-[state=checked]:border-accent/15 data-[state=checked]:bg-accent data-[state=unchecked]:bg-accent/18 focus-visible:ring-[4px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onCheckedChange={(checked) => {
        onCheckedChange?.(checked);
        onToggle?.(checked);
      }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white ring-0 shadow-[0_6px_18px_rgba(24,44,69,0.16)] transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
