import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/utils";

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 rounded-[1.25rem] border px-4 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 [&>svg]:mt-0.5 [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "border-accent/10 bg-white/72 text-accent",
        destructive:
          "border-destructive/20 bg-destructive/6 text-destructive [&_[data-slot=alert-description]]:text-destructive/80",
        muted: "border-accent/10 bg-accent/6 text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 flex flex-col gap-2 text-sm leading-6 text-accent/72",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
