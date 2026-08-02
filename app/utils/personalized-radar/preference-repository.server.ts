import "server-only";

import { createServerSupabase } from "@/app/api/supabase/server";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  normalizeNotificationPreferences,
  type NotificationPreferences,
  type NotificationPreferencesRow,
} from "@/app/utils/personalized-radar/preferences";
import { RadarPersistenceError } from "@/app/utils/personalized-radar/repository.server";

function unavailable() {
  return new RadarPersistenceError(
    500,
    "NOTIFICATION_PREFERENCE_STORAGE_UNAVAILABLE",
    "Notification preferences are temporarily unavailable",
  );
}

export async function getOwnedNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("user_notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw unavailable();
  return data
    ? normalizeNotificationPreferences(data as NotificationPreferencesRow)
    : DEFAULT_NOTIFICATION_PREFERENCES;
}

export async function upsertOwnedNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("user_notification_preferences")
    .upsert(
      {
        user_id: userId,
        timezone: preferences.timezone,
        digest_frequency: preferences.digestFrequency,
        digest_hour_local: preferences.digestHourLocal,
        email_enabled: preferences.emailEnabled,
        watch_in_app_enabled: preferences.watchInAppEnabled,
        reminder_in_app_enabled: preferences.reminderInAppEnabled,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();
  if (error) throw unavailable();
  return normalizeNotificationPreferences(data as NotificationPreferencesRow);
}

