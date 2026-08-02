import { Radar } from "lucide-react";

import { RadarSettings } from "@/app/components/personalized-radar/radar-settings";

export const dynamic = "force-dynamic";

export default function RadarPage() {
  return (
    <div className="ambient-page px-4 pb-12 pt-8 md:px-6 md:pt-10">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <div className="mb-7">
          <h1 className="flex items-center gap-2 font-serif text-4xl font-semibold text-accent">
            <Radar aria-hidden />
            Radar settings
          </h1>
          <p className="mt-2 text-sm text-accent/68">
            Manage every watched agent and in-app delivery preference in one place.
          </p>
        </div>
        <RadarSettings />
      </div>
    </div>
  );
}

