"use client";

import { useEffect, useState } from "react";
import {
  getMarketingConsent,
  setMarketingConsent,
  type MarketingConsent,
} from "@/lib/marketing-consent";

export function MarketingConsentBanner() {
  const [consent, setConsent] = useState<MarketingConsent>("unset");

  useEffect(() => {
    setConsent(getMarketingConsent());
  }, []);

  if (consent !== "unset") {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-10 z-50 px-4 pb-4">
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-xl md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-700 font-semibold">
          We use cookies to ensure the site works, analyze usage, and support marketing. Could you do us a solid and accept?
        </p>

        <div className="flex items-center justify-center md:justify-end gap-2">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setMarketingConsent("denied");
              setConsent("denied");
            }}
          >
            Decline
          </button>
          <button
            type="button"
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            onClick={() => {
              setMarketingConsent("granted");
              setConsent("granted");
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
