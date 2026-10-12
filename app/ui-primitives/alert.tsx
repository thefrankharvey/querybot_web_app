import type { ComponentProps } from "react";
import { cn } from "@/app/utils";

export function Alert({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}
export function AlertTitle(props: ComponentProps<"p">) {
  return <p data-slot="alert-title" className="font-semibold" {...props} />;
}
export function AlertDescription(props: ComponentProps<"div">) {
  return (
    <div data-slot="alert-description" className="leading-relaxed" {...props} />
  );
}
