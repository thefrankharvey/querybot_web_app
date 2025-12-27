import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// import Nav from "./components/nav";
import Footer from "./components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui-primitives/sonner";
import { Providers } from "./providers";
import { SideBarNav } from "./components/side-bar-nav";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Write Query Hook",
  description: "Write Query Hook",
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
          <Providers>
            {/* SideBarNav */}
            <div className="flex gap-8 w-full">
              <SideBarNav />
              <div className="max-w-screen-xl px-4 py-0 min-h-screen">
                {children}
              </div>
            </div>
            <Footer />
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
