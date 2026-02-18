"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { useEffect, useState } from "react";
import {
  MARKETING_CONSENT_EVENT,
  MARKETING_CONSENT_KEY,
  getMarketingConsent,
  type MarketingConsent,
} from "@/lib/marketing-consent";
import { MetaPixelPageView } from "./meta-pixel-pageview";

const googleAdsTagId = process.env.NEXT_PUBLIC_GOOGLE_ADS_TAG_ID;
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MarketingTracking() {
  const [consent, setConsent] = useState<MarketingConsent>("unset");

  useEffect(() => {
    const syncConsent = () => {
      setConsent(getMarketingConsent());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === MARKETING_CONSENT_KEY) {
        syncConsent();
      }
    };

    syncConsent();
    window.addEventListener(MARKETING_CONSENT_EVENT, syncConsent);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(MARKETING_CONSENT_EVENT, syncConsent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (consent !== "granted") {
    return null;
  }

  if (!googleAdsTagId && !metaPixelId) {
    return null;
  }

  return (
    <>
      {googleAdsTagId ? <GoogleAnalytics gaId={googleAdsTagId} /> : null}
      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', ${JSON.stringify(metaPixelId)});
              fbq('track', 'PageView');
            `}
          </Script>
          <MetaPixelPageView />
        </>
      ) : null}
    </>
  );
}
