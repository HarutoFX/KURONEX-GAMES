import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { KuronexBackground } from "@/components/background/KuronexBackground";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

import { AuthProvider } from "@/context/AuthContext";

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
      <body className="antialiased">
        {/*
          KuronexBackground is position:fixed, z-index:0, pointer-events:none.
          It sits behind all page content on every route.
          Mounted once here — never duplicated per-page.
        */}
        <KuronexBackground />
        {/*
          Page content sits above the background via relative positioning.
          All pages must have a transparent (or semi-transparent) background
          so the global animated grid shows through.
        */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}