export const AGENT_HOME_PATH = "/literary-agents/home";
export const AGENT_COMPLETE_AUTH_PATH = "/literary-agents/complete-auth";
export const AGENT_ACCOUNT_MISMATCH_PATH =
  "/literary-agents/account-type-mismatch";

function getFirstParamValue(value?: string | string[] | null) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function serializeRelativeUrl(url: URL) {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSafeAgentRedirectPath(value?: string | string[] | null) {
  const candidate = getFirstParamValue(value);

  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//")
  ) {
    return null;
  }

  const url = new URL(candidate, "https://writequeryhook.local");

  if (url.pathname === AGENT_COMPLETE_AUTH_PATH) {
    return getSafeAgentRedirectPath(url.searchParams.get("redirect_url"));
  }

  if (
    url.pathname.startsWith(`${AGENT_COMPLETE_AUTH_PATH}/`) ||
    url.pathname.startsWith("/literary-agents/sign-in") ||
    url.pathname.startsWith("/literary-agents/sign-up") ||
    url.pathname === AGENT_ACCOUNT_MISMATCH_PATH ||
    url.pathname.startsWith(`${AGENT_ACCOUNT_MISMATCH_PATH}/`)
  ) {
    return null;
  }

  if (
    url.pathname === "/literary-agents" ||
    url.pathname.startsWith("/literary-agents/")
  ) {
    return serializeRelativeUrl(url);
  }

  return null;
}

export function buildAgentCompleteAuthPath(
  redirectPath: string | null = AGENT_HOME_PATH,
) {
  const target = getSafeAgentRedirectPath(redirectPath) ?? AGENT_HOME_PATH;
  const params = new URLSearchParams({ redirect_url: target });

  return `${AGENT_COMPLETE_AUTH_PATH}?${params.toString()}`;
}
