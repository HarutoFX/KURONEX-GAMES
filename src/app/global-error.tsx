"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CRITICAL ROOT FAULT]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-6 bg-[#080808] text-white font-sans antialiased">
        <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-[#111111] p-8 text-center shadow-[0_20px_60px_rgba(255,38,61,0.2)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 mb-6">
            <svg
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          <span className="font-mono text-xs font-bold tracking-widest text-[#FF4054] uppercase">
            ROOT APPLICATION SUBSYSTEM FAULT
          </span>

          <h1 className="mt-2 text-2xl font-extrabold text-white">
            Core Service Interrupted
          </h1>

          <p className="mt-3 text-xs text-[#929292] leading-relaxed">
            The platform root layout encountered an unhandled exception. Security boundaries and session stores remain fully intact.
          </p>

          <div className="mt-5 rounded-xl border border-[#292929] bg-[#080808] p-3 text-left font-mono text-[11px] text-rose-300">
            {process.env.NODE_ENV === "production"
              ? error.digest
                ? `Incident Ref: ${error.digest}`
                : "Safe fallback engaged."
              : error.message || "Root layout error"}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-xl px-5 py-2.5 bg-[#FF263D] text-white font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#FF4054] shadow-[0_0_20px_rgba(255,38,61,0.4)] cursor-pointer"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
