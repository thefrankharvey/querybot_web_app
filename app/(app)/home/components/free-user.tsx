import Link from "next/link";
import { Button } from "@/app/ui-primitives/button";
import { Check } from "lucide-react";

const freeTierFeatures = [
  "Save up to 6 agent matches in your Query Dashboard",
  "Read the weekly Slushwire newsletter and publishing blog",
  "Use the free query spreadsheet as your starter system",
] as const;

const subscriberFeatures = [
  "Save unlimited matches and organize them by submission stage",
  "Download the full query spreadsheet and track long-term outreach",
  "Get the Dispatch feed alongside the full subscriber toolkit",
] as const;

export default function FreeUser() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-serif text-3xl leading-tight text-accent md:text-[40px]">
          Start with the essentials. Upgrade when you want the full system.
        </h2>
      </div>

      <div className="mt-7 grid gap-6 xl:gap-8 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#d8dde2] bg-[linear-gradient(180deg,rgba(244,246,247,0.96),rgba(235,239,242,0.88))] p-5 shadow-[0_18px_40px_rgba(24,44,69,0.06)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/54">
                Free
              </p>
              <h3 className="mt-2 font-serif text-[28px] leading-tight text-accent">
                Keep your setup simple.
              </h3>
            </div>
            <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-accent/72">
              Included
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {freeTierFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-[20px] border border-white/70 bg-white/54 px-4 py-3 text-sm leading-6 text-accent/70 sm:text-[15px]"
              >
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-accent shadow-sm">
                  <Check className="size-4" />
                </span>
                <p>{feature}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,249,250,0.94))] p-5 shadow-[0_22px_52px_rgba(24,44,69,0.12)] ring-1 ring-accent/8 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/54">
                Subscriber
              </p>
              <h3 className="mt-2 font-serif text-[28px] leading-tight text-accent">
                Turn matches into a trackable workflow.
              </h3>
            </div>
            <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(56,88,116,0.18)]">
              Upgrade
            </span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {subscriberFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-[20px] border border-white/90 bg-white/86 px-4 py-3 text-sm leading-6 text-accent/78 shadow-[0_14px_34px_rgba(24,44,69,0.08)] sm:text-[15px]"
              >
                <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                  <Check className="size-4" />
                </span>
                <p>{feature}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-sm text-sm leading-6 text-accent/68">
              Get the full dashboard experience when you are ready to manage more projects and submissions in one place.
            </p>
            <Link href="/subscribe" className="w-full sm:w-auto">
              <Button className="h-11 w-full rounded-full px-5 text-sm font-semibold shadow-[0_18px_36px_rgba(56,88,116,0.18)] sm:w-auto">
                Explore subscriber access
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
