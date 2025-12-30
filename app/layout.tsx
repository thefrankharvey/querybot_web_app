import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
// import Nav from "./components/nav";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "./ui-primitives/sonner";
import { Providers } from "./providers";

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
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
