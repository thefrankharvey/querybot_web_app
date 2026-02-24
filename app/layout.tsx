
import { Poppins } from "next/font/google";
import "./globals.css";
// import Nav from "./components/nav";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui-primitives/sonner";
import { Providers } from "./providers";
import { MarketingConsentBanner } from "./components/marketing-consent-banner";
import { MarketingTracking } from "./components/tracking/marketing-tracking";

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
