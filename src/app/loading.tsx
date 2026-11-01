import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808]/90 backdrop-blur-md">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#111111] shadow-[0_0_30px_rgba(255,38,61,0.25)]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pulse"
        >
          <defs>
            <linearGradient id="loadKGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF4054" />
              <stop offset="100%" stopColor="#FF263D" />
            </linearGradient>
          </defs>
          <path d="M4 4H8V20H4V4Z" fill="url(#loadKGrad)" />
          <path d="M9.5 12.2L16.2 4H20.5L13.2 12.2L20.8 20H16.5L9.5 12.2Z" fill="url(#loadKGrad)" />
        </svg>
        <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-[#FF263D] shadow-[0_0_8px_#FF263D] animate-ping" />
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#FFFFFF] uppercase">
          KURONEX GAMES
        </span>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-[#181818]">
          <div className="h-full w-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-[#FF263D] to-transparent" />
        </div>
      </div>
    </div>
  );
}
