import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent text-white",
        secondary: "border-accent/10 bg-accent/8 text-accent",
        destructive:
          "border-destructive/20 bg-destructive/8 text-destructive",
        outline: "border-accent/16 bg-transparent text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
