"use client";

import { cn } from "@/app/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import HomeContentShell from "./home-content-shell";

const steps = [
  {
    step: "Step 1",
    label: "Smart Match",
    title: "Find the right agents with Smart Match",
    description:
      "Surface the strongest agent fits fast with highlighted filters, ranked results, and a clear match score.",
    chip: "Match score + Highlighted filters",
    imageSrc: "/smart-match-ss.png",
    imageAlt:
      "Smart Match interface showing ranked literary agent results, fit indicators, and filtering controls.",
    imageClassName: "object-cover object-left-top",
    align: "left",
  },
  {
    step: "Step 2",
    label: "Query Dashboard",
    title: "Save and track everything in the Query Dashboard",
    description:
      "Turn promising matches into an organized submission pipeline with saved agents, statuses, and next actions in one place.",
    chip: "Saved agents + statuses",
    imageSrc: "/query-dashboard-ss.png",
    imageAlt:
      "Query Dashboard showing saved agents, submission statuses, and project tracking.",
    imageClassName: "object-cover object-center-top",
    align: "right",
  },
  {
    step: "Step 3",
    label: "Dispatch",
    title: "Stay current with Dispatch",
    description:
      "Keep agent openings, MSWLs, AMAs, and publishing intel in view without leaving the workflow.",
    chip: "Live updates + intel feed",
    imageSrc: "/dispatch-ss.png",
    imageAlt:
      "Dispatch feed with publishing updates, submission openings, and industry intelligence.",
    imageClassName: "object-cover object-left-top",
    align: "left",
  },
] as const;

type ProductStepProps = (typeof steps)[number] & {
  isLast: boolean;
};

const BrowserFrame = ({
  className,
  imageClassName,
  imageAlt,
  imageSrc,
}: {
  className?: string;
  imageClassName?: string;
  imageAlt: string;
  imageSrc: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex h-full min-w-0 w-full flex-col overflow-hidden rounded-[28px] border border-white/65 bg-white/88 shadow-[0_24px_80px_rgba(24,44,69,0.16)] ring-1 ring-accent/8 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-accent/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,248,250,0.92))] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff605c]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd44]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00ca4e]" />
        </div>
        <div className="hidden rounded-full border border-accent/8 bg-white/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-accent/55 sm:block">
          Write Query Hook
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#f7fafb]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 767px) 92vw, (max-width: 1279px) 80vw, 860px"
          className={cn("select-none", imageClassName)}
          priority={false}
        />
      </div>
    </div>
  );
};

const StepConnector = ({ flip = false }: { flip?: boolean }) => {
  return (
    <div className="relative mx-auto hidden h-24 w-full max-w-5xl lg:block">
      <svg
        viewBox="0 0 600 120"
        className={cn(
          "absolute inset-0 h-full w-full text-accent/20",
          flip && "-scale-x-100"
        )}
        aria-hidden
      >
        <path
          d="M30 18 C 180 18, 190 102, 300 102 S 430 18, 570 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="8 10"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/70 shadow-[0_0_0_8px_rgba(56,88,116,0.08)]" />
    </div>
  );
};

const ProductStep = ({
  step,
  label,
  title,
  description,
  chip,
  imageAlt,
  imageSrc,
  imageClassName,
  align,
  isLast,
}: ProductStepProps) => {
  const isRightAligned = align === "right";

  return (
    <>
      <motion.article
        className={cn(
          "grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-12",
          isRightAligned && "lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]"
        )}
        initial={{ opacity: 0, y: 48 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      >
        <div className={cn("order-1 min-w-0", isRightAligned && "lg:order-2")}>
          <div className="w-full max-w-none rounded-[28px] border border-white/90 bg-white/92 p-5 shadow-[0_20px_56px_rgba(24,44,69,0.12)] backdrop-blur-sm sm:max-w-md sm:p-7">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-accent/12 bg-accent/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent/60">
                {step}
              </span>
              <span className="text-sm font-medium text-accent/55">{label}</span>
            </div>
            <h3 className="mt-4 font-serif text-3xl leading-tight text-accent sm:text-[34px]">
              {title}
            </h3>
            <p className="mt-4 text-base leading-8 text-accent/78">
              {description}
            </p>
            <div className="mt-5 inline-flex max-w-full rounded-full border border-accent/10 bg-[#f5f8fa] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent/58">
              {chip}
            </div>
          </div>
        </div>

        <div className={cn("order-2 min-w-0", isRightAligned && "lg:order-1")}>
          <BrowserFrame
            className="aspect-[1.7/1] min-h-[240px] sm:min-h-[320px] lg:min-h-[430px]"
            imageAlt={imageAlt}
            imageSrc={imageSrc}
            imageClassName={imageClassName}
          />
        </div>
      </motion.article>
      {!isLast ? <StepConnector flip={isRightAligned} /> : null}
    </>
  );
};

const ProductEcosystemSection = () => {
  return (
    <section className="relative w-full overflow-hidden py-24 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-14 -z-10 mx-auto h-[760px] w-[min(1220px,96vw)] rounded-[999px] bg-[radial-gradient(circle_at_20%_18%,rgba(112,193,202,0.18),transparent_34%),radial-gradient(circle_at_80%_26%,rgba(56,88,116,0.12),transparent_28%),radial-gradient(circle_at_50%_62%,rgba(255,255,255,0.84),transparent_42%)] blur-3xl" />

      <HomeContentShell>
        <div className="mx-auto w-full">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-serif text-4xl leading-tight text-accent md:text-[52px]">
              One workflow for the entire query process.
            </h2>
            <p className="mt-6 text-base leading-8 text-accent/78 md:text-lg">
              Write Query Hook helps writers move from finding agents to tracking submissions to staying current - all inside one modern platform.
            </p>
          </motion.div>

          <div className="relative mt-14 flex flex-col gap-8 lg:mt-20 lg:gap-0">
            {steps.map((step, index) => (
              <ProductStep key={step.step} {...step} isLast={index === steps.length - 1} />
            ))}
          </div>
        </div>
      </HomeContentShell>
    </section>
  );
};

export default ProductEcosystemSection;
