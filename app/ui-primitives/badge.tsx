import type { ComponentProps } from "react";
import { cn } from "@/app/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex max-w-full items-center rounded-full border border-accent/10 bg-accent/5 px-3 py-1 text-sm text-accent break-words",
        className,
      )}
      {...props}
    />
  );
}
