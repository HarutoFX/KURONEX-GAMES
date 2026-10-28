"use client";

/**
 * KuronexBackground — Global fixed background for KURONEX GAMES.
 *
 * Visual: white dot-grid with electric-cyan (#38f5ff) mouse-deflection effect —
 * the same as the Hero's DotDistortionShader, now covering every page.
 *
 * Architecture:
 *   - Mounted ONCE in src/app/layout.tsx
 *   - position: fixed  → always covers the viewport, every route
 *   - z-index: 0       → behind all page content (content uses z-10+)
 *   - pointer-events: none → never blocks interaction
 *   - Mouse tracked via window-level listeners so the effect works even though
 *     the element itself doesn't receive pointer events.
 *
 * Animation:
 *   - Idle: static white grid + white dots (zero rAF cost)
 *   - On mouse move: starts an rAF loop — Aceternity-style sine-wave
 *     deflection on lines and dots, cyan glow on nearby elements
 *   - On mouse leave: lerps back to rest, then stops the loop
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface KuronexBackgroundProps {
  gridSize?: number;       // px between grid lines  — default 80
  dotSize?: number;        // base dot radius px     — default 2
  glowRadius?: number;     // mouse influence radius — default 160
  highlightColor?: string; // glow colour            — default #38f5ff
}

export type VyomeraBackgroundProps = KuronexBackgroundProps;

export function KuronexBackground({
  gridSize = 80,
  dotSize = 2,
  glowRadius = 160,
  highlightColor = "#38f5ff",
}: KuronexBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Dimension tracking
  useEffect(() => {
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const { cols, rows } = useMemo(
    () => ({
      cols: Math.ceil(dimensions.width / gridSize) + 1,
      rows: Math.ceil(dimensions.height / gridSize) + 1,
    }),
    [dimensions, gridSize]
  );

  // Animation loop + mouse listeners (one combined effect)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const hLines = svg.querySelectorAll<SVGLineElement>("[data-h]");
    const vLines = svg.querySelectorAll<SVGLineElement>("[data-v]");
    const dots   = svg.querySelectorAll<SVGCircleElement>("[data-dot]");

    const hOffsets = new Float32Array(hLines.length);
    const vOffsets = new Float32Array(vLines.length);
    let isRunning = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const baseStroke  = "rgba(255, 255, 255, 0.07)";
    const baseDotFill = "rgba(255, 255, 255, 0.28)";

    const resetToOriginal = () => {
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        line.setAttribute("y1", String(y));
        line.setAttribute("y2", String(y));
        line.style.stroke = baseStroke;
        hOffsets[idx] = 0;
      });
      vLines.forEach((line, idx) => {
        const x = idx * gridSize + gridSize / 2;
        line.setAttribute("x1", String(x));
        line.setAttribute("x2", String(x));
        line.style.stroke = baseStroke;
        vOffsets[idx] = 0;
      });
      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        dot.setAttribute("cx", String(col * gridSize + gridSize / 2));
        dot.setAttribute("cy", String(row * gridSize + gridSize / 2));
        dot.style.fill = baseDotFill;
        dot.setAttribute("r", String(dotSize));
      });
    };

    const animate = () => {
      const m = mouseRef.current;
      m.x = lerp(m.x, m.targetX, 0.15);
      m.y = lerp(m.y, m.targetY, 0.15);
      const mx = m.x;
      const my = m.y;

      // Mouse has fully left — settle back then stop loop
      if (mx < -500 && my < -500 && Math.abs(m.x - m.targetX) < 1) {
        isRunning = false;
        resetToOriginal();
        return;
      }

      // 1. Horizontal lines
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(my - y) / glowRadius);
        const deflection = Math.sin((mx / gridSize) * Math.PI) * proximity * 4.5;
        hOffsets[idx] = deflection;
        line.setAttribute("y1", String(y + deflection));
        line.setAttribute("y2", String(y + deflection));
        line.style.stroke = `color-mix(in srgb, ${baseStroke}, ${highlightColor} ${Math.round(proximity * 100)}%)`;
      });

      // 2. Vertical lines
      vLines.forEach((line, idx) => {
        const x = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(mx - x) / glowRadius);
        const deflection = Math.sin((my / gridSize) * Math.PI) * proximity * 4.5;
        vOffsets[idx] = deflection;
        line.setAttribute("x1", String(x + deflection));
        line.setAttribute("x2", String(x + deflection));
        line.style.stroke = `color-mix(in srgb, ${baseStroke}, ${highlightColor} ${Math.round(proximity * 100)}%)`;
      });

      // 3. Intersection dots — follow deflected grid + brighten near cursor
      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        const cx = col * gridSize + gridSize / 2 + (vOffsets[col] || 0);
        const cy = row * gridSize + gridSize / 2 + (hOffsets[row] || 0);
        dot.setAttribute("cx", String(cx));
        dot.setAttribute("cy", String(cy));
        const dist = Math.hypot(mx - cx, my - cy);
        const proximity = Math.max(0, 1 - dist / (glowRadius * 1.1));
        if (proximity > 0) {
          dot.style.fill = `color-mix(in srgb, ${baseDotFill}, #ffffff ${Math.round(proximity * 100)}%)`;
          dot.setAttribute("r", String(dotSize + proximity * 1.2));
        } else {
          dot.style.fill = baseDotFill;
          dot.setAttribute("r", String(dotSize));
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!isRunning) {
        isRunning = true;
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Mouse tracking — window-level & passive; position:fixed means no rect offset
    const onMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0, clientY = 0;
      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      mouseRef.current.targetX = clientX;
      mouseRef.current.targetY = clientY;
      startAnimation();
    };

    const onLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gridSize, dotSize, glowRadius, highlightColor, cols, rows]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundColor: "#020408",
      }}
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal lines */}
        {Array.from({ length: rows }).map((_, r) => {
          const y = r * gridSize + gridSize / 2;
          return (
            <line
              key={`h-${r}`}
              data-h={r}
              x1="0" y1={y} x2="100%" y2={y}
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical lines */}
        {Array.from({ length: cols }).map((_, c) => {
          const x = c * gridSize + gridSize / 2;
          return (
            <line
              key={`v-${c}`}
              data-v={c}
              x1={x} y1="0" x2={x} y2="100%"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="1"
            />
          );
        })}

        {/* Intersection dots */}
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: rows }).map((_, r) => (
            <circle
              key={`dot-${c}-${r}`}
              data-dot=""
              data-col={c}
              data-row={r}
              cx={c * gridSize + gridSize / 2}
              cy={r * gridSize + gridSize / 2}
              r={dotSize}
              fill="rgba(255, 255, 255, 0.28)"
            />
          ))
        )}
      </svg>

      {/* Radial vignette — matches the Hero mask, keeps centre bright */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(2,4,8,0.55) 75%, rgba(2,4,8,0.92) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Backward-compatibility alias
export const VyomeraBackground = KuronexBackground;
