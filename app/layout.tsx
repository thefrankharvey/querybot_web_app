import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Nav from "./components/nav";
import Footer from "./components/footer";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Write Query Hook",
  description: "Write Query Hook",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <Nav />
        <div className="max-w-screen-xl mx-auto px-4 py-0">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
