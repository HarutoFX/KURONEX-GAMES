"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * KURONEX Typography Gradient Color Tokens
 *
 * Ice White:      #F4F7FB (luminous clarity)
 * Arctic Cyan:    #78DFFF (subtle atmospheric transition)
 * Electric Cyan:  #00D1FF (dominant platform cyber light)
 * KURONEX Crimson: #FF263D (signature platform brand accent)
 */
export const KURONEX_GRADIENT_PALETTES = {
  default: [
    "#F4F7FB", // Ice White
    "#78DFFF", // Arctic Cyan
    "#00D1FF", // Electric Cyan
    "#FF263D", // KURONEX Crimson
    "#00D1FF", // Electric Cyan
    "#78DFFF", // Arctic Cyan
    "#F4F7FB", // Ice White
  ],
  cyan: [
    "#F4F7FB", // Ice White
    "#78DFFF", // Arctic Cyan
    "#00D1FF", // Electric Cyan
    "#78DFFF", // Arctic Cyan
    "#F4F7FB", // Ice White
  ],
  crimson: [
    "#F4F7FB", // Ice White
    "#FF6B7D", // Soft Coral
    "#FF263D", // KURONEX Crimson
    "#FF6B7D", // Soft Coral
    "#F4F7FB", // Ice White
  ],
  subtle: [
    "#F4F7FB", // Ice White
    "#A5EDFF", // Pale Arctic Cyan
    "#66DEFF", // Soft Cyan
    "#FF808F", // Pale Crimson
    "#F4F7FB", // Ice White
  ],
} as const;

export type GradientVariant = keyof typeof KURONEX_GRADIENT_PALETTES;
export type GradientElementTag = "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div";

export interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  /** The semantic HTML element to render. Defaults to "span". */
  as?: GradientElementTag;
  /** Children text or nested nodes */
  children: React.ReactNode;
  /** Optional class name for typography styles (text size, tracking, leading, etc.) */
  className?: string;
  /** Optional custom array of CSS color strings. If omitted, uses the selected variant. */
  colors?: string[];
  /** Named KURONEX gradient palette variant */
  variant?: GradientVariant;
  /** Speed multiplier: 1 = standard slow cinematic (8s), 0.5 = 16s, 2 = 4s */
  speed?: number;
  /** Whether the gradient continuously shifts. Defaults to true. */
  animate?: boolean;
}

/**
 * GradientText — Centralized KURONEX Gradient Typography Component
 *
 * Implements the official KURONEX typography identity (Ice White → Arctic Cyan →
 * Electric Cyan → Restrained Crimson) with smooth continuous motion and full
 * accessibility support (semantic DOM, zero duplicate text, prefers-reduced-motion).
 */
export const GradientText = memo(function GradientText({
  as: Component = "span",
  children,
  className,
  colors,
  variant = "default",
  speed = 1,
  animate = true,
  style,
  ...props
}: GradientTextProps) {
  const palette = colors ?? KURONEX_GRADIENT_PALETTES[variant] ?? KURONEX_GRADIENT_PALETTES.default;
  const gradient = `linear-gradient(90deg, ${palette.join(", ")})`;

  const gradientStyle: React.CSSProperties = {
    backgroundImage: gradient,
    backgroundSize: "250% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    ...(animate && {
      animationDuration: `${Math.max(1, 8 / Math.max(0.1, speed))}s`,
    }),
    ...style,
  };

  return (
    <Component
      className={cn(
        "inline-block bg-clip-text text-transparent select-auto",
        animate && "animate-kuronex-gradient",
        className
      )}
      style={gradientStyle}
      {...props}
    >
      {children}
    </Component>
  );
});

GradientText.displayName = "GradientText";

/**
 * Drop-in backward-compatible alias for existing imports
 */
export const AuroraText = GradientText;

export default GradientText;
