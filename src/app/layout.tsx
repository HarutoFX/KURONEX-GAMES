import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SpotlightBackground } from "@/components/background";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "KURONEX GAMES — Build Your Own Library",
  description:
    "KURONEX GAMES is a next-generation gaming platform built around your personal game library.",
  openGraph: {
    title: "KURONEX GAMES — Build Your Own Library",
    description:
      "KURONEX GAMES is a next-generation gaming platform built around your personal game library.",
    siteName: "KURONEX GAMES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KURONEX GAMES — Build Your Own Library",
    description:
      "KURONEX GAMES is a next-generation gaming platform built around your personal game library.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="antialiased selection:bg-[#FF263D]/25 selection:text-white">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {/*
          SpotlightBackground is position:fixed, z-index:0, pointer-events:none.
          It sits behind all page content on every route with route-specific intensity.
          Mounted once here — never duplicated per-page.
        */}
        <SpotlightBackground />
        {/*
          Page content sits above the background via relative positioning.
          All pages must have a transparent (or semi-transparent) background
          so the global animated grid shows through.
        */}
        <AuthProvider>
          <ToastProvider>
            <div id="main-content" className="relative z-10 min-h-screen flex flex-col justify-between">
              {children}
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}