import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "interactive";
}

export function Card({ className, variant = "default", children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-[#111111] border-[#292929]",
    secondary: "bg-[#181818] border-[#292929]",
    outline: "bg-transparent border-[#292929]",
    interactive:
      "bg-[#111111] border-[#292929] hover:border-[#FF263D]/40 hover:shadow-[0_8px_30px_rgba(255,38,61,0.12)] transition-all duration-300 cursor-pointer",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6 text-left relative overflow-hidden",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base sm:text-lg font-bold tracking-tight text-[#FFFFFF]", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[#929292] leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-xs sm:text-sm text-[#FFFFFF]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-4 flex items-center justify-between border-t border-[#292929] text-xs", className)} {...props}>
      {children}
    </div>
  );
}

