"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { RadarWatchCapabilities } from "@/app/utils/personalized-radar/contracts";
import type { NotificationPreferences } from "@/app/utils/personalized-radar/preferences";

type NotificationPreferencePatch = Pick<
  NotificationPreferences,
  | "timezone"
  | "digestFrequency"
  | "digestHourLocal"
  | "emailEnabled"
  | "watchInAppEnabled"
  | "reminderInAppEnabled"
>;

const preferencesKey = ["notification-preferences"] as const;

async function preferenceJson<T>(init?: RequestInit): Promise<T> {
  const response = await fetch("/api/notification-preferences", {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;
  if (!response.ok || !payload) {
    throw new Error(payload?.message ?? "Notification preferences could not be updated");
  }
  return payload;
}

export function useRadarPreferences() {
  return useQuery({
    queryKey: preferencesKey,
    queryFn: () =>
      preferenceJson<{
        preferences: NotificationPreferences;
        capabilities: RadarWatchCapabilities;
      }>(),
    staleTime: 60_000,
  });
}

export function useUpdateRadarPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (preferences: NotificationPreferencePatch) =>
      preferenceJson<{
        preferences: NotificationPreferences;
        capabilities: RadarWatchCapabilities;
      }>({
        method: "PATCH",
        body: JSON.stringify({
          timezone: preferences.timezone,
          digestFrequency: preferences.digestFrequency,
          digestHourLocal: preferences.digestHourLocal,
          emailEnabled: preferences.emailEnabled,
          watchInAppEnabled: preferences.watchInAppEnabled,
          reminderInAppEnabled: preferences.reminderInAppEnabled,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: preferencesKey });
    },
  });
}
