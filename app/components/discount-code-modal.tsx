"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogTitle,
} from "@/app/ui-primitives/dialog";
import { Spinner } from "@/app/ui-primitives/spinner";
import { cn } from "@/app/utils";

type Plan = "monthly" | "yearly";

type DiscountCodeModalProps = {
  checkoutError?: string | null;
  discountCode: string;
  isSubscribing?: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: Plan) => void;
  open: boolean;
};

const planCards = [
  {
    badge: "Save 30%",
    billingLabel: "/ month",
    discountedPrice: "$4.90",
    originalPrice: "$7 / month",
    plan: "monthly",
    title: "Monthly",
  },
  {
    badge: "Save $9",
    billingLabel: "/ year",
    discountedPrice: "$21",
    originalPrice: "$30 / year",
    plan: "yearly",
    title: "Yearly",
  },
] as const;

export function DiscountCodeModal({
  checkoutError,
  discountCode,
  isSubscribing = false,
  onOpenChange,
  onSelectPlan,
  open,
}: DiscountCodeModalProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (!hasCopied) return;

    const timeoutId = window.setTimeout(() => setHasCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [hasCopied]);

  // const handleCopyCode = async () => {
  //   try {
  //     await navigator.clipboard.writeText(discountCode);
  //     setHasCopied(true);
  //   } catch {
  //     setHasCopied(false);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] max-w-[calc(100%-1rem)] overflow-y-auto rounded-[24px] border border-white/80 bg-white p-4 shadow-[0_28px_72px_rgba(24,44,69,0.22)] sm:max-w-[680px] sm:p-6 md:p-7"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-accent/58 shadow-[0_10px_24px_rgba(24,44,69,0.06)]">
              <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Sparkles className="size-3" data-icon="inline-start" />
              </span>
              Limited-time offer
            </span>

            <DialogTitle className="mt-4 max-w-[520px] font-serif text-2xl font-bold leading-tight text-accent sm:text-3xl md:text-4xl">
              Hey friend! Interested in <em>30% off?</em>
            </DialogTitle>
            {/* <DialogDescription className="mt-3 max-w-[540px] text-sm font-medium leading-6 text-accent/72 sm:text-base sm:leading-7">
              Querying is hard enough - the tools shouldn&apos;t be. Apply the code
              at checkout and unlock full access to Smart Match, Query
              Dashboard, and Dispatch.
            </DialogDescription> */}
          </div>

          {/* <div className="flex flex-col gap-3 rounded-[18px] border border-dashed border-accent/18 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-accent/52">
                Your code
              </p>
              <p className="mt-1 text-xl font-extrabold uppercase tracking-[0.08em] text-accent sm:text-2xl">
                {discountCode}
              </p>
            </div>
            <Button
              className="h-11 rounded-[14px] px-4 text-sm font-bold sm:min-w-[150px]"
              onClick={handleCopyCode}
              type="button"
              variant="default"
            >
              {hasCopied ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {hasCopied ? "Copied" : "Copy code"}
            </Button>
          </div> */}

          {checkoutError && (
            <div className="flex items-start gap-2 rounded-[14px] border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm font-medium leading-5 text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {planCards.map((card) => {
              const isYearly = card.plan === "yearly";

              return (
                <button
                  className={cn(
                    "relative flex min-h-[135px] flex-col items-start justify-between rounded-[18px] border p-4 text-left shadow-[0_14px_34px_rgba(24,44,69,0.08)] transition hover:-translate-y-0.5 focus:outline-hidden focus:ring-4 focus:ring-accent/18 disabled:pointer-events-none disabled:opacity-60",
                    isYearly
                      ? "border-accent bg-accent text-white"
                      : "border-accent/10 bg-white text-accent",
                  )}
                  disabled={isSubscribing}
                  key={card.plan}
                  onClick={() => onSelectPlan(card.plan)}
                  type="button"
                >
                  {isYearly && (
                    <span className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/18 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                      Best value
                    </span>
                  )}

                  <div>
                    <p
                      className={cn(
                        "text-[11px] font-extrabold uppercase tracking-[0.24em]",
                        isYearly ? "text-white/72" : "text-accent/58",
                      )}
                    >
                      {card.title}
                    </p>
                    <p
                      className={cn(
                        "mt-4 text-sm font-bold line-through",
                        isYearly ? "text-white/48" : "text-accent/48",
                      )}
                    >
                      {card.originalPrice}
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="text-3xl font-extrabold leading-none">
                        {card.discountedPrice}
                      </span>
                      <span
                        className={cn(
                          "pb-0.5 text-sm font-semibold",
                          isYearly ? "text-white/70" : "text-accent/58",
                        )}
                      >
                        {card.billingLabel}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "mt-4 inline-flex min-h-7 items-center rounded-full px-3 text-xs font-extrabold",
                      isYearly
                        ? "bg-white/18 text-white"
                        : "bg-accent/8 text-accent",
                    )}
                  >
                    {isSubscribing ? (
                      <Spinner className="mr-2 size-3.5" />
                    ) : null}
                    {card.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs font-semibold leading-5 text-accent/60 sm:text-sm">
            Code <span className="font-extrabold text-accent">{discountCode}</span>{" "}
            is applied automatically at checkout. Cancel anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
