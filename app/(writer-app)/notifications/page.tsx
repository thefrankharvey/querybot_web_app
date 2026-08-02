import { Bell } from "lucide-react";
import { notFound } from "next/navigation";

import { NotificationCenter } from "@/app/components/personalized-radar/notification-center";
import { getRadarFeatureFlags } from "@/app/utils/personalized-radar/feature-flags.server";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  if (!getRadarFeatureFlags().notificationCenter) notFound();
  return (
    <div className="ambient-page px-4 pb-12 pt-8 md:px-6 md:pt-10">
      <div className="ambient-orb-top" />
      <div className="ambient-orb-bottom" />
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <div className="mb-7">
          <h1 className="flex items-center gap-2 font-serif text-4xl font-semibold text-accent">
            <Bell aria-hidden />
            Notifications
          </h1>
          <p className="mt-2 text-sm text-accent/68">
            Durable Radar alerts and query reminders, ordered by when they happened.
          </p>
        </div>
        <NotificationCenter />
      </div>
    </div>
  );
}
