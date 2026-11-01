"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

/**
 * MagicCard — Interactive spotlight card component with mouse-tracking border
 * and ambient surface illumination inspired by Magic UI.
 */
export function MagicCard({
  children,
  className,
  gradientSize = 240,
  gradientColor = "rgba(255, 38, 61, 0.35)",
  gradientOpacity = 0.9,
  ...props
}: MagicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative flex size-full flex-col overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] text-white transition-all duration-300 shadow-[0_24px_60px_rgba(0,0,0,0.8)]",
        className
      )}
      {...props}
    >
      {/* 1. Dynamic Cursor Border Spotlight Highlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              ${gradientColor},
              transparent 75%
            )
          `,
          opacity: gradientOpacity,
        }}
      />

      {/* 2. Inner Mask to keep content background solid while border shines */}
      <div className="pointer-events-none absolute inset-[1px] rounded-[15px] bg-[#111111] z-[1]" />

      {/* 3. Surface Ambient Cursor Sheen */}
      <motion.div
        className="pointer-events-none absolute inset-[1px] rounded-[15px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-[2]"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize * 1.3}px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 38, 61, 0.07),
              transparent 70%
            )
          `,
        }}
      />

      {/* 4. Top Brand Gradient Line */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF263D]/60 to-transparent z-[3]" />

      {/* 5. Interactive Content */}
      <div className="relative z-10 size-full">{children}</div>
    </div>
  );
}

export default MagicCard;

