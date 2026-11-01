import React from "react";
import { FolderX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#292929] bg-[#111111]/40 p-8 sm:p-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#292929] bg-[#181818] text-[#929292] mb-4">
        {icon || <FolderX className="h-6 w-6 text-[#FF263D]" />}
      </div>

      <h4 className="text-sm sm:text-base font-bold text-[#FFFFFF] mb-1.5">
        {title}
      </h4>

      <p className="max-w-md text-xs sm:text-sm text-[#929292] leading-relaxed mb-5">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
}
