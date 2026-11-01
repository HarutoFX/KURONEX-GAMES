"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF263D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080808] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "rounded-full bg-gradient-to-r from-[#FF4054] to-[#FF263D] text-white shadow-[0_4px_20px_rgba(255,38,61,0.35)] hover:shadow-[0_6px_30px_rgba(255,38,61,0.55)] hover:brightness-110 border border-transparent",
      secondary:
        "rounded-full bg-[#181818] text-[#FFFFFF] border border-[#292929] hover:border-[#FF263D]/40 hover:bg-[#202020]",
      outline:
        "rounded-full bg-transparent text-[#FFFFFF] border border-[#292929] hover:border-[#FF263D] hover:text-[#FF4054] hover:bg-[#FF263D]/5",
      ghost:
        "rounded-full bg-transparent text-[#929292] hover:text-[#FFFFFF] hover:bg-[#181818]",
      danger:
        "rounded-full bg-rose-600/10 text-rose-400 border border-rose-500/30 hover:bg-rose-600/20 hover:border-rose-500/50",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 gap-1.5",
      md: "text-xs sm:text-sm px-5 py-2.5 gap-2",
      lg: "text-sm sm:text-base px-6 py-3.5 gap-2.5",
      icon: "h-9 w-9 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

