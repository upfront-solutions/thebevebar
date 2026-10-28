import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const libreBaskerville = localFont({
  variable: "--font-display",
  src: [
    { path: "../../public/fonts/libre-baskerville-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/libre-baskerville-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/libre-baskerville-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
});

const openSans = localFont({
  variable: "--font-body",
  src: [
    { path: "../../public/fonts/open-sans-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/open-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/open-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "The BeveBar | Mobile Boba Cart Catering",
  description:
    "Premium mobile boba tea cart catering for weddings, corporate events, and celebrations across Orange County, Los Angeles, and San Diego.",
  keywords: [
    "boba catering",
    "mobile boba cart",
    "bubble tea catering",
    "Orange County boba",
    "LA boba catering",
    "San Diego boba",
    "wedding boba bar",
    "corporate event boba",
  ],
  openGraph: {
    title: "The BeveBar | Mobile Boba Cart Catering",
    description:
      "Premium mobile boba tea cart catering for weddings, corporate events, and celebrations.",
    url: "https://thebevebar.com",
    siteName: "The BeveBar",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${openSans.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
