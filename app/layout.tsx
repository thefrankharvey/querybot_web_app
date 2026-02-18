import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// import Nav from "./components/nav";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui-primitives/sonner";
import { Providers } from "./providers";
import { MarketingConsentBanner } from "./components/marketing-consent-banner";
import { MarketingTracking } from "./components/tracking/marketing-tracking";
import { buildOpenGraph, buildTwitter, getCanonicalSiteUrl } from "@/lib/seo";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalSiteUrl()),
  title: {
    default: "Write Query Hook",
    template: "%s | Write Query Hook",
  },
  description:
    "Purpose driven tools to help writers query smarter, find literary agents, and get signed.",
  openGraph: buildOpenGraph({
    title: "Write Query Hook",
    description:
      "Purpose driven tools to help writers query smarter, find literary agents, and get signed.",
    path: "/",
  }),
  twitter: buildTwitter({
    title: "Write Query Hook",
    description:
      "Purpose driven tools to help writers query smarter, find literary agents, and get signed.",
  }),
  icons: {
    icon: [
      {
        url: "/book-open-text.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/book-open-text-white.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/favicon.ico", // Fallback for browsers that don't support SVG
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.className} antialiased`}>
          <MarketingTracking />
          <Providers>
            {children}
            <Toaster />
            <MarketingConsentBanner />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
