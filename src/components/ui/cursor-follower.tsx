"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * CursorFollower — Sleek, GPU-accelerated cyber cursor follower.
 *
 * Features:
 *  - Precision electric-cyan (#00E5FF) focal core
 *  - Smooth lerped ambient trailing aura ring
 *  - Magnetic expansion and crimson (#FF263D) shift when hovering interactive elements
 *  - Fully disabled on touch screens / coarse pointer devices
 *  - pointer-events: none — zero disruption to clicks, drag, or text selection
 */
export function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only activate on fine pointer devices (desktop mouse/trackpad)
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
      }

      // Position pinpoint dot directly with hardware transform
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Detect hover over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest(
          "button, a, input, select, textarea, [role='button'], .cursor-pointer"
        );
        setIsHovered(interactive);
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      setIsHovered(false);
    };

    // Smooth fluid lerp for outer aura
    const render = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animId = requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.25s ease-out",
      }}
    >
      {/* Outer fluid trailing aura ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border transition-[width,height,margin,border-color,background-color,box-shadow] duration-200 ease-out will-change-transform"
        style={{
          width: isHovered ? "44px" : "28px",
          height: isHovered ? "44px" : "28px",
          marginLeft: isHovered ? "-22px" : "-14px",
          marginTop: isHovered ? "-22px" : "-14px",
          borderColor: isHovered ? "rgba(255, 38, 61, 0.75)" : "rgba(0, 229, 255, 0.65)",
          backgroundColor: isHovered ? "rgba(255, 38, 61, 0.08)" : "rgba(0, 229, 255, 0.05)",
          boxShadow: isHovered
            ? "0 0 22px rgba(255, 38, 61, 0.40)"
            : "0 0 16px rgba(0, 229, 255, 0.30)",
        }}
      />

      {/* Pinpoint precision electric focal core */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full will-change-transform transition-colors duration-200"
        style={{
          backgroundColor: isHovered ? "#FF263D" : "#00E5FF",
          boxShadow: isHovered
            ? "0 0 8px #FF263D, 0 0 14px #FF263D"
            : "0 0 8px #00E5FF, 0 0 14px #00E5FF",
        }}
      />
    </div>
  );
}

export default CursorFollower;
