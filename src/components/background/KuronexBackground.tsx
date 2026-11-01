"use client";

/**
 * KuronexBackground — Global fixed interactive cyber background for KURONEX GAMES.
 *
 * Visual:
 *   - Dark void space (#020408) with high-contrast cyber grid
 *   - Signature prominent cyan vertical guide line (as seen in original design)
 *   - Dynamic electric cyan (#00E5FF) cursor spotlight aura tracking mouse coordinates
 *   - SVG bloom filter and illuminated intersection nodes that glow neon cyan near the cursor
 *   - Fluid sine-wave deflection with ambient breathing wave
 *
 * Architecture:
 *   - Mounted ONCE in src/app/layout.tsx
 *   - position: fixed, z-index: 0, pointer-events: none (never blocks UI clicks)
 *   - Window-level passive event listeners for butter-smooth tracking
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

export interface KuronexBackgroundProps {
  gridSize?: number;       // px between grid lines  — default 80
  dotSize?: number;        // base dot radius px     — default 2.2
  glowRadius?: number;     // mouse influence radius — default 180
  highlightColor?: string; // glow colour            — default #00e5ff
}

export type VyomeraBackgroundProps = KuronexBackgroundProps;

export function KuronexBackground({
  gridSize = 80,
  dotSize = 2.2,
  glowRadius = 180,
  highlightColor = "#00e5ff",
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

  const { cols, rows, prominentCol } = useMemo(() => {
    const c = Math.ceil(dimensions.width / gridSize) + 1;
    const r = Math.ceil(dimensions.height / gridSize) + 1;
    // Prominent guide column (column 2 on desktop, matches original aesthetic)
    const pCol = c > 6 ? 2 : 1;
    return {
      cols: c,
      rows: r,
      prominentCol: pCol,
    };
  }, [dimensions, gridSize]);

  // Animation loop + mouse listeners
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const hLines = svg.querySelectorAll<SVGLineElement>("[data-h]");
    const vLines = svg.querySelectorAll<SVGLineElement>("[data-v]");
    const dots   = svg.querySelectorAll<SVGCircleElement>("[data-dot]");
    const spotlight = svg.querySelector<SVGCircleElement>("[data-spotlight]");

    const hOffsets = new Float32Array(hLines.length);
    const vOffsets = new Float32Array(vLines.length);
    let isRunning = false;
    let time = 0;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const baseStroke = "rgba(0, 229, 255, 0.12)";
    const prominentStroke = "rgba(0, 229, 255, 0.70)";
    const baseDotFill = "rgba(0, 229, 255, 0.35)";

    const resetToOriginal = () => {
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        line.setAttribute("y1", String(y));
        line.setAttribute("y2", String(y));
        line.style.stroke = baseStroke;
        hOffsets[idx] = 0;
      });

      vLines.forEach((line, idx) => {
        const isProminent = idx === prominentCol;
        const x = idx * gridSize + gridSize / 2;
        line.setAttribute("x1", String(x));
        line.setAttribute("x2", String(x));
        line.style.stroke = isProminent ? prominentStroke : baseStroke;
        vOffsets[idx] = 0;
      });

      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        const isProminent = col === prominentCol;
        dot.setAttribute("cx", String(col * gridSize + gridSize / 2));
        dot.setAttribute("cy", String(row * gridSize + gridSize / 2));
        dot.style.fill = isProminent ? "#a5f3fc" : baseDotFill;
        dot.setAttribute("r", String(isProminent ? dotSize + 1 : dotSize));
        dot.removeAttribute("filter");
      });

      if (spotlight) {
        spotlight.setAttribute("opacity", "0");
      }
    };

    const animate = () => {
      time += 0.02;
      const m = mouseRef.current;
      m.x = lerp(m.x, m.targetX, 0.16);
      m.y = lerp(m.y, m.targetY, 0.16);
      const mx = m.x;
      const my = m.y;

      // When cursor has left and settled, stop the rAF loop
      if (mx < -500 && my < -500 && Math.abs(m.x - m.targetX) < 1) {
        isRunning = false;
        resetToOriginal();
        return;
      }

      // Update Cursor Spotlight Aura position
      if (spotlight) {
        if (mx > -200 && my > -200) {
          spotlight.setAttribute("cx", String(mx));
          spotlight.setAttribute("cy", String(my));
          spotlight.setAttribute("opacity", "1");
        } else {
          spotlight.setAttribute("opacity", "0");
        }
      }

      // 1. Horizontal lines — fluid sine deflection + breathing wave
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(my - y) / glowRadius);
        const ambient = Math.sin(time + idx * 0.4) * 0.8;
        const deflection = Math.sin((mx / gridSize) * Math.PI) * proximity * 5.6 + (proximity > 0.05 ? ambient : 0);
        hOffsets[idx] = deflection;

        line.setAttribute("y1", String(y + deflection));
        line.setAttribute("y2", String(y + deflection));

        if (proximity > 0) {
          const alpha = 0.12 + proximity * 0.65;
          line.style.stroke = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
        } else {
          line.style.stroke = baseStroke;
        }
      });

      // 2. Vertical lines
      vLines.forEach((line, idx) => {
        const isProminent = idx === prominentCol;
        const x = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(mx - x) / glowRadius);
        const ambient = Math.cos(time + idx * 0.4) * 0.8;
        const deflection = Math.sin((my / gridSize) * Math.PI) * proximity * 5.6 + (proximity > 0.05 ? ambient : 0);
        vOffsets[idx] = deflection;

        line.setAttribute("x1", String(x + deflection));
        line.setAttribute("x2", String(x + deflection));

        if (isProminent) {
          const alpha = 0.70 + proximity * 0.25;
          line.style.stroke = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
        } else if (proximity > 0) {
          const alpha = 0.12 + proximity * 0.65;
          line.style.stroke = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
        } else {
          line.style.stroke = baseStroke;
        }
      });

      // 3. Intersection dots — follow deflected grid + illuminate with neon cyan bloom
      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        const isProminent = col === prominentCol;

        const cx = col * gridSize + gridSize / 2 + (vOffsets[col] || 0);
        const cy = row * gridSize + gridSize / 2 + (hOffsets[row] || 0);
        dot.setAttribute("cx", String(cx));
        dot.setAttribute("cy", String(cy));

        const dist = Math.hypot(mx - cx, my - cy);
        const proximity = Math.max(0, 1 - dist / (glowRadius * 1.15));

        if (proximity > 0) {
          const r = (isProminent ? dotSize + 1.2 : dotSize) + proximity * 2.4;
          dot.setAttribute("r", String(r.toFixed(2)));
          dot.style.fill = isProminent ? "#d5faff" : "#00E5FF";

          if (proximity > 0.35) {
            dot.setAttribute("filter", "url(#kuronexCyanGlow)");
          } else {
            dot.removeAttribute("filter");
          }
        } else {
          dot.setAttribute("r", String(isProminent ? dotSize + 1 : dotSize));
          dot.style.fill = isProminent ? "#a5f3fc" : baseDotFill;
          dot.removeAttribute("filter");
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

    // Window-level passive mouse & touch tracking
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
  }, [gridSize, dotSize, glowRadius, highlightColor, cols, rows, prominentCol]);

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
        <defs>
          {/* Neon Cyan Glow Filter */}
          <filter id="kuronexCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Prominent Guide Column Node Halo */}
          <radialGradient id="kuronexProminentHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#00E5FF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>

          {/* Dynamic Ambient Cursor Spotlight */}
          <radialGradient id="kuronexCursorSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.32" />
            <stop offset="30%" stopColor="#00E5FF" stopOpacity="0.12" />
            <stop offset="65%" stopColor="#00E5FF" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Cursor Spotlight Circle */}
        <circle
          data-spotlight=""
          cx={-1000}
          cy={-1000}
          r="260"
          fill="url(#kuronexCursorSpotlight)"
          opacity="0"
          style={{ transition: "opacity 0.25s ease-out" }}
        />

        {/* Horizontal lines */}
        {Array.from({ length: rows }).map((_, r) => {
          const y = r * gridSize + gridSize / 2;
          return (
            <line
              key={`h-${r}`}
              data-h={r}
              x1="0" y1={y} x2="100%" y2={y}
              stroke="rgba(0, 229, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical lines */}
        {Array.from({ length: cols }).map((_, c) => {
          const x = c * gridSize + gridSize / 2;
          const isProminent = c === prominentCol;
          return (
            <g key={`v-group-${c}`}>
              {isProminent && (
                <line
                  x1={x}
                  y1="0"
                  x2={x}
                  y2="100%"
                  stroke="#00E5FF"
                  strokeWidth="4"
                  strokeOpacity="0.25"
                  filter="url(#kuronexCyanGlow)"
                />
              )}
              <line
                key={`v-${c}`}
                data-v={c}
                x1={x} y1="0" x2={x} y2="100%"
                stroke={isProminent ? "rgba(0, 229, 255, 0.70)" : "rgba(0, 229, 255, 0.12)"}
                strokeWidth={isProminent ? "1.8" : "1"}
              />
            </g>
          );
        })}

        {/* Intersection dots */}
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: rows }).map((_, r) => {
            const isProminent = c === prominentCol;
            const cx = c * gridSize + gridSize / 2;
            const cy = r * gridSize + gridSize / 2;
            return (
              <g key={`dot-group-${c}-${r}`}>
                {isProminent && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="11"
                    fill="url(#kuronexProminentHalo)"
                  />
                )}
                <circle
                  key={`dot-${c}-${r}`}
                  data-dot=""
                  data-col={c}
                  data-row={r}
                  cx={cx}
                  cy={cy}
                  r={isProminent ? dotSize + 1 : dotSize}
                  fill={isProminent ? "#a5f3fc" : "rgba(0, 229, 255, 0.35)"}
                />
              </g>
            );
          })
        )}
      </svg>

      {/* Atmospheric vignette — keeps cyber grid vibrant in center */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(2,4,8,0.50) 75%, rgba(2,4,8,0.88) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// Backward-compatibility alias
export const VyomeraBackground = KuronexBackground;
