import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#181818]",
        shimmer && "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function KuronexSpinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-white/10 border-t-[#FF263D]",
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading content"
    />
  );
}

export function LoadingState({
  message = "Loading platform data...",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "my-16 flex flex-col items-center justify-center text-center p-8",
        className
      )}
      role="status"
    >
      <KuronexSpinner size="md" />
      <span className="mt-4 font-mono text-xs tracking-wider text-[#929292] uppercase">
        {message}
      </span>
    </div>
  );
}

