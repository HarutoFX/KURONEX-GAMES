import React from "react";

export function LargeLibraryCardSkeleton() {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-[#07080A]/80 p-7 backdrop-blur-2xl animate-pulse">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <div className="h-3 w-28 rounded bg-white/10" />
        </div>
        <div className="h-4 w-16 rounded-full bg-white/10" />
      </div>

      {/* Art Chamber Skeleton */}
      <div className="relative my-6 aspect-[16/10] w-full rounded-2xl bg-white/5" />

      {/* Info Details */}
      <div className="space-y-3">
        <div className="h-6 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
      </div>

      {/* Footer Bar */}
      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="h-3 w-24 rounded bg-white/10" />
        <div className="h-7 w-20 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}
