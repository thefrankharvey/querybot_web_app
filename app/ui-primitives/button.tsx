import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[4px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-accent bg-accent text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)] hover:-translate-y-0.5 hover:bg-[#163b3e] hover:shadow-[0_22px_44px_rgba(28,74,78,0.22)]",
        destructive:
          "border border-destructive bg-destructive text-white shadow-[0_18px_36px_rgba(168,56,46,0.18)] hover:-translate-y-0.5 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "glass-input text-accent hover:-translate-y-0.5 hover:border-accent/22 hover:bg-white/88",
        secondary:
          "border border-accent/12 bg-white/78 text-accent shadow-[0_16px_34px_rgba(24,44,69,0.07)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-accent/20 hover:bg-white",
        solid:
          "border border-accent bg-accent text-white shadow-[0_18px_36px_rgba(28,74,78,0.18)] hover:-translate-y-0.5 hover:bg-[#163b3e]",
        ghost:
          "text-accent hover:bg-white/68 hover:text-accent",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 px-6 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
