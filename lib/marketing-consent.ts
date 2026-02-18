export type MarketingConsent = "granted" | "denied" | "unset";

export const MARKETING_CONSENT_KEY = "marketing_consent_v1";
export const MARKETING_CONSENT_EVENT = "marketing-consent-changed";

export function getMarketingConsent(): MarketingConsent {
  if (typeof window === "undefined") {
    return "unset";
  }

  const consent = window.localStorage.getItem(MARKETING_CONSENT_KEY);
  if (consent === "granted" || consent === "denied") {
    return consent;
  }

  return "unset";
}

export function setMarketingConsent(
  consent: Exclude<MarketingConsent, "unset">
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MARKETING_CONSENT_KEY, consent);
  window.dispatchEvent(new Event(MARKETING_CONSENT_EVENT));
}
