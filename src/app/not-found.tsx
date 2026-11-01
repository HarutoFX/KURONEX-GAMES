import React from "react";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 text-[#FFFFFF]">
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-[#111111]/90 p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(255,38,61,0.12)] backdrop-blur-2xl">
        <span className="font-mono text-xs font-bold tracking-widest text-[#FF4054] uppercase">
          SECTOR NOT LOCATED // KX-404
        </span>

        <h1 className="mt-3 text-5xl sm:text-6xl font-extrabold tracking-tight text-[#FFFFFF]">
          404
        </h1>

        <h2 className="mt-2 text-xl font-bold text-[#FFFFFF]">
          Cartridge Slot Not Found
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-[#929292] leading-relaxed">
          The quadrant or game cartridge address you requested does not exist or has been relocated to another vault.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button
              variant="primary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Home
            </Button>
          </Link>

          <Link href="/library">
            <Button
              variant="secondary"
              leftIcon={<Layers className="h-4 w-4" />}
            >
              Browse Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
