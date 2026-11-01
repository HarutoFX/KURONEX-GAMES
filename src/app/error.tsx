"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js root page error:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-[#080808] text-[#FFFFFF]">
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-rose-500/30 bg-[#111111] p-8 sm:p-10 text-center shadow-[0_20px_60px_rgba(255,38,61,0.15)] backdrop-blur-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-6 shadow-[0_0_24px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <span className="font-mono text-xs font-bold tracking-widest text-[#FF4054] uppercase">
          APPLICATION SUBSYSTEM INTERRUPTED
        </span>

        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#FFFFFF]">
          Temporary Experience Disruption
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-[#929292] leading-relaxed">
          The requested interface encountered an unhandled condition. The platform state and user sessions remain secure.
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#292929] bg-[#080808] p-3 text-left font-mono text-[11px] text-rose-300 scrollbar-none">
          {process.env.NODE_ENV === "production"
            ? error.digest
              ? `Reference: ${error.digest}`
              : "System fault captured safely. Administrators notified."
            : error.message || "Unknown error occurred"}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Reload Interface
          </Button>

          <Link href="/">
            <Button
              variant="secondary"
              leftIcon={<Home className="h-4 w-4" />}
            >
              Return to Hub
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

