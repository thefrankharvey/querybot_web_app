"use client";

import { cn } from "@/app/utils";

interface DotIndicatorsProps {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}

export function DotIndicators({ total, current, onDotClick }: DotIndicatorsProps) {
  return (
    <div className="flex justify-center items-center gap-2 py-4">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          aria-label={`Go to column ${index + 1}`}
          aria-current={index === current ? "true" : undefined}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-200",
            index === current
              ? "bg-accent scale-125"
              : "bg-gray-300 hover:bg-gray-400"
          )}
        />
      ))}
    </div>
  );
}

export default DotIndicators;
