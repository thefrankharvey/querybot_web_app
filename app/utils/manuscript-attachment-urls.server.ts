import "server-only";

function addConfiguredHost(hosts: Set<string>, value: string | undefined) {
  const configuredUrl = value?.trim();
  if (!configuredUrl) return;

  try {
    const { hostname } = new URL(
      configuredUrl.includes("://")
        ? configuredUrl
        : `https://${configuredUrl}`,
    );
    const normalizedHostname = hostname.toLowerCase();
    if (!normalizedHostname) return;

    hosts.add(normalizedHostname);

    if (
      normalizedHostname.endsWith(".supabase.co") &&
      !normalizedHostname.endsWith(".storage.supabase.co")
    ) {
      const projectRef = normalizedHostname.slice(0, -".supabase.co".length);
      if (projectRef) hosts.add(`${projectRef}.storage.supabase.co`);
    }
  } catch {
    // Invalid deployment configuration is handled as a rejected URL below.
  }
}

export function getConfiguredSupabaseHosts() {
  const hosts = new Set<string>();
  addConfiguredHost(hosts, process.env.SUPABASE_DIRECT_STORAGE_URL);
  addConfiguredHost(hosts, process.env.SUPABASE_URL);
  return hosts;
}

export function getValidatedSupabaseStorageUrl(
  value: string,
  requiredPathPrefix = "/storage/v1/",
) {
  try {
    const candidate = new URL(value);
    const allowedHosts = getConfiguredSupabaseHosts();

    if (
      candidate.protocol !== "https:" ||
      candidate.username ||
      candidate.password ||
      candidate.port ||
      !allowedHosts.has(candidate.hostname.toLowerCase()) ||
      !candidate.pathname.startsWith(requiredPathPrefix)
    ) {
      return null;
    }

    return candidate;
  } catch {
    return null;
  }
}

export function isManuscriptAttachmentsEnabled() {
  return (
    process.env.MANUSCRIPT_ATTACHMENTS_ENABLED?.trim().toLowerCase() !== "false"
  );
}
