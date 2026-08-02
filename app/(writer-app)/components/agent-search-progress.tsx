"use client";

import ProgressBar from "../smart-match/components/progress-bar";

export function AgentSearchProgress({
  isSuccess,
  onComplete,
}: {
  isSuccess: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="mt-40 flex h-[700px] flex-col items-center md:mx-auto md:w-[700px]">
      <ProgressBar isSuccess={isSuccess} onComplete={onComplete} />
    </div>
  );
}
