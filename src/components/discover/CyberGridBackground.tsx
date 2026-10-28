"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface CyberGridBackgroundProps {
  gridSize?: number;
  dotSize?: number;
  glowRadius?: number;
  highlightColor?: string;
  className?: string;
}

export function CyberGridBackground({
  gridSize = 80,
  dotSize = 2.2,
  glowRadius = 180,
  highlightColor = "#00e5ff", // Neon Electric Cyan
  className = "",
}: CyberGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({
    width: 1920,
    height: 1800,
  });

  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
  });

  // Track dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || window.innerWidth,
          height: containerRef.current.clientHeight || window.innerHeight,
        });
      } else {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { cols, rows, prominentCol } = useMemo(() => {
    const c = Math.ceil(dimensions.width / gridSize) + 1;
    const r = Math.ceil(dimensions.height / gridSize) + 1;
    // Prominent glowing column (like column 2 from the reference photo)
    const pCol = c > 6 ? 2 : 1;
    return {
      cols: c,
      rows: r,
      prominentCol: pCol,
    };
  }, [dimensions, gridSize]);

  useEffect(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const hLines = svg.querySelectorAll<SVGLineElement>("[data-h]");
    const vLines = svg.querySelectorAll<SVGLineElement>("[data-v]");
    const dots = svg.querySelectorAll<SVGCircleElement>("[data-dot]");

    const hOffsets = new Float32Array(hLines.length);
    const vOffsets = new Float32Array(vLines.length);
    let time = 0;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const baseStroke = "rgba(0, 229, 255, 0.16)";
    const prominentStroke = "rgba(0, 229, 255, 0.75)";
    const baseDotFill = "rgba(0, 229, 255, 0.40)";

    const animate = () => {
      time += 0.02;
      const mouse = mouseRef.current;
      mouse.x = lerp(mouse.x, mouse.targetX, 0.14);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.14);

      const mx = mouse.x;
      const my = mouse.y;

      // 1. Animate horizontal lines with fluid sine wave deflection
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(my - y) / glowRadius);
        // Liquid deflection + subtle ambient breathing wave
        const ambient = Math.sin(time + idx * 0.4) * 0.8;
        const deflection =
          Math.sin((mx / gridSize) * Math.PI) * proximity * 5.2 + ambient;
        hOffsets[idx] = deflection;

        line.setAttribute("y1", String(y + deflection));
        line.setAttribute("y2", String(y + deflection));

        const pct = Math.round(proximity * 100);
        line.style.stroke = `color-mix(in srgb, ${baseStroke}, ${highlightColor} ${pct}%)`;
      });

      // 2. Animate vertical lines
      vLines.forEach((line, idx) => {
        const isProminent = idx === prominentCol;
        const x = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(mx - x) / glowRadius);
        const ambient = Math.cos(time + idx * 0.4) * 0.8;
        const deflection =
          Math.sin((my / gridSize) * Math.PI) * proximity * 5.2 + ambient;
        vOffsets[idx] = deflection;

        line.setAttribute("x1", String(x + deflection));
        line.setAttribute("x2", String(x + deflection));

        const curBase = isProminent ? prominentStroke : baseStroke;
        const pct = Math.round(proximity * 100);
        line.style.stroke = `color-mix(in srgb, ${curBase}, ${highlightColor} ${pct}%)`;
      });

      // 3. Animate intersection dots
      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        const isProminent = col === prominentCol;

        const baseCx = col * gridSize + gridSize / 2;
        const baseCy = row * gridSize + gridSize / 2;

        const currentCx = baseCx + (vOffsets[col] || 0);
        const currentCy = baseCy + (hOffsets[row] || 0);

        dot.setAttribute("cx", String(currentCx));
        dot.setAttribute("cy", String(currentCy));

        const distToMouse = Math.hypot(mx - currentCx, my - currentCy);
        const proximity = Math.max(0, 1 - distToMouse / (glowRadius * 1.15));

        if (proximity > 0) {
          const pct = Math.round(proximity * 100);
          dot.style.fill = `color-mix(in srgb, ${isProminent ? "#7df9ff" : baseDotFill}, #ffffff ${pct}%)`;
          dot.setAttribute(
            "r",
            String((isProminent ? dotSize + 1.2 : dotSize) + proximity * 1.8)
          );
        } else {
          dot.style.fill = isProminent ? "#a5f3fc" : baseDotFill;
          dot.setAttribute("r", String(isProminent ? dotSize + 1 : dotSize));
        }
      });

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Continuous smooth animation loop
    animFrameRef.current = requestAnimationFrame(animate);

    // Track mouse globally across window
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ("touches" in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const rect = container.getBoundingClientRect();
      mouseRef.current.targetX = clientX - rect.left;
      mouseRef.current.targetY = clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gridSize, dotSize, glowRadius, highlightColor, cols, rows, prominentCol]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden bg-[#020508] ${className}`}
      aria-hidden="true"
    >
      {/* Dark vignette backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,5,8,0.7)_80%,rgba(2,5,8,0.98)_100%)]" />

      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan Glow Filters */}
          <filter id="discoverCyanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="prominentNodeHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#00E5FF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Horizontal Lines */}
        {Array.from({ length: rows }).map((_, r) => {
          const y = r * gridSize + gridSize / 2;
          return (
            <line
              key={`h-${r}`}
              data-h={r}
              x1="0"
              y1={y}
              x2="100%"
              y2={y}
              stroke="rgba(0, 229, 255, 0.16)"
              strokeWidth="1"
            />
          );
        })}

        {/* 2. Vertical Lines */}
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
                  strokeWidth="5"
                  strokeOpacity="0.25"
                  filter="url(#discoverCyanGlow)"
                />
              )}
              <line
                data-v={c}
                x1={x}
                y1="0"
                x2={x}
                y2="100%"
                stroke={isProminent ? "rgba(0, 229, 255, 0.75)" : "rgba(0, 229, 255, 0.16)"}
                strokeWidth={isProminent ? "1.8" : "1"}
              />
            </g>
          );
        })}

        {/* 3. Intersection Dots */}
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: rows }).map((_, r) => {
            const isProminent = c === prominentCol;
            const cx = c * gridSize + gridSize / 2;
            const cy = r * gridSize + gridSize / 2;

            return (
              <g key={`dot-group-${c}-${r}`}>
                {/* Glowing halo for prominent column dots (matches user image) */}
                {isProminent && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="11"
                    fill="url(#prominentNodeHalo)"
                  />
                )}
                <circle
                  data-dot=""
                  data-col={c}
                  data-row={r}
                  cx={cx}
                  cy={cy}
                  r={isProminent ? dotSize + 1 : dotSize}
                  fill={isProminent ? "#a5f3fc" : "rgba(0, 229, 255, 0.40)"}
                />
              </g>
            );
          })
        )}
      </svg>

      {/* Atmospheric Fades */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020508] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020508] to-transparent" />
    </div>
  );
}
