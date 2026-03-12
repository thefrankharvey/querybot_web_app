import Image from "next/image";
import Link from "next/link";

import { cn } from "@/app/utils";

type BrandLockupProps = {
  href?: string;
  imageClassName?: string;
  labelClassName?: string;
  className?: string;
  stacked?: boolean;
};

export function BrandLockup({
  href = "/",
  imageClassName,
  labelClassName,
  className,
  stacked = false,
}: BrandLockupProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 text-sm font-medium tracking-[0.08em] text-accent",
        stacked && "flex-col items-start gap-4",
        className
      )}
    >
      <Image
        src="/wqh-logo.png"
        alt="Write Query Hook"
        width={60}
        height={60}
        className={cn("h-[60px] w-[60px] rounded-full", imageClassName)}
      />
      <span className={cn("hidden sm:inline", labelClassName)}>
        WRITE QUERY HOOK
      </span>
    </Link>
  );
}
