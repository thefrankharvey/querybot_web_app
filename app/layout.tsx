
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// import Nav from "./components/nav";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui-primitives/sonner";
import { Providers } from "./providers";
import { MarketingConsentBanner } from "./components/marketing-consent-banner";
import { MarketingTracking } from "./components/tracking/marketing-tracking";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const metaTitle = "Write Query Hook";
const metaDescription = "The modern way to query literary agents";
const metaImage = "/meta-img.png";

export const metadata: Metadata = {
  title: metaTitle,
  description: metaDescription,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    title: metaTitle,
    description: metaDescription,
    type: "website",
    images: [metaImage],
  },
  twitter: {
    card: "summary_large_image",
    title: metaTitle,
    description: metaDescription,
    images: [metaImage],
  },
};

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

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
