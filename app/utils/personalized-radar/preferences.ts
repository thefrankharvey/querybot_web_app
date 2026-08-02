export type NotificationPreferencesRow = {
  user_id: string;
  timezone: string;
  digest_frequency: "off" | "daily";
  digest_hour_local: number;
  email_enabled: boolean;
  watch_in_app_enabled: boolean;
  reminder_in_app_enabled: boolean;
  email_unsubscribed_at: string | null;
  updated_at: string;
};

export type NotificationPreferences = {
  timezone: string;
  digestFrequency: "off" | "daily";
  digestHourLocal: number;
  emailEnabled: boolean;
  watchInAppEnabled: boolean;
  reminderInAppEnabled: boolean;
  emailUnsubscribedAt: string | null;
  updatedAt: string | null;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  timezone: "America/New_York",
  digestFrequency: "off",
  digestHourLocal: 8,
  emailEnabled: false,
  watchInAppEnabled: true,
  reminderInAppEnabled: true,
  emailUnsubscribedAt: null,
  updatedAt: null,
};

export function normalizeNotificationPreferences(
  row: NotificationPreferencesRow,
): NotificationPreferences {
  return {
    timezone: row.timezone,
    digestFrequency: row.digest_frequency,
    digestHourLocal: row.digest_hour_local,
    emailEnabled: row.email_enabled,
    watchInAppEnabled: row.watch_in_app_enabled,
    reminderInAppEnabled: row.reminder_in_app_enabled,
    emailUnsubscribedAt: row.email_unsubscribed_at,
    updatedAt: row.updated_at,
  };
}

