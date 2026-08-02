import "server-only";

function readBooleanFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === "true") return true;
  if (value === "false") return false;
  return defaultValue;
}

export type RadarFeatureFlags = {
  watchCreation: boolean;
  targetedDispatch: boolean;
  fanoutProcessor: boolean;
  notificationCenter: boolean;
  emailPreferences: boolean;
  emailScheduler: boolean;
  providerSend: boolean;
};

export function getRadarFeatureFlags(): RadarFeatureFlags {
  return {
    watchCreation: readBooleanFlag("RADAR_WATCH_CREATION_ENABLED", true),
    targetedDispatch: readBooleanFlag("RADAR_TARGETED_DISPATCH_ENABLED", true),
    fanoutProcessor: readBooleanFlag("RADAR_FANOUT_PROCESSOR_ENABLED", false),
    notificationCenter: readBooleanFlag("RADAR_NOTIFICATION_CENTER_ENABLED", true),
    emailPreferences: readBooleanFlag("RADAR_EMAIL_PREFERENCES_ENABLED", false),
    emailScheduler: readBooleanFlag("RADAR_EMAIL_SCHEDULER_ENABLED", false),
    providerSend: readBooleanFlag("RADAR_PROVIDER_SEND_ENABLED", false),
  };
}

