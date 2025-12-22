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
        "peer data-[state=checked]:bg-[#1d4a4e] data-[state=unchecked]:bg-accent/30 focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=checked]:bg-[#1d4a4e] dark:data-[state=unchecked]:bg-accent/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
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
          "bg-white dark:bg-white pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
