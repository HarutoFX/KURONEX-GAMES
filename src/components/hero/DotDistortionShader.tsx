"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

interface AnimatedGridWithDotsProps {
  gridSize?: number;
  dotSize?: number;
  glowRadius?: number;
  highlightColor?: string;
  className?: string;
}

export function DotDistortionShader({
  gridSize = 80,
  dotSize = 2,
  glowRadius = 160,
  highlightColor = "#38f5ff", // KURONEX electric cyan
  className = "",
}: AnimatedGridWithDotsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({
    width: 1920,
    height: 1080,
  });

  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
  });

  // Track window dimensions on client
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const { cols, rows } = useMemo(() => {
    return {
      cols: Math.ceil(dimensions.width / gridSize) + 1,
      rows: Math.ceil(dimensions.height / gridSize) + 1,
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
    let isRunning = false;

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const baseStroke = "rgba(255, 255, 255, 0.07)";
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
      });
    };

    const animate = () => {
      const mouse = mouseRef.current;
      mouse.x = lerp(mouse.x, mouse.targetX, 0.15);
      mouse.y = lerp(mouse.y, mouse.targetY, 0.15);

      const mx = mouse.x;
      const my = mouse.y;

      // When cursor leaves, smoothly settle back to original positions
      if (mx < -500 && my < -500 && Math.abs(mouse.x - mouse.targetX) < 1) {
        isRunning = false;
        resetToOriginal();
        return;
      }

      // 1. Animate horizontal lines
      hLines.forEach((line, idx) => {
        const y = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(my - y) / glowRadius);
        // Aceternity sine wave deflection
        const deflection = Math.sin((mx / gridSize) * Math.PI) * proximity * 4.5;
        hOffsets[idx] = deflection;

        line.setAttribute("y1", String(y + deflection));
        line.setAttribute("y2", String(y + deflection));

        const pct = Math.round(proximity * 100);
        line.style.stroke = `color-mix(in srgb, ${baseStroke}, ${highlightColor} ${pct}%)`;
      });

      // 2. Animate vertical lines
      vLines.forEach((line, idx) => {
        const x = idx * gridSize + gridSize / 2;
        const proximity = Math.max(0, 1 - Math.abs(mx - x) / glowRadius);
        const deflection = Math.sin((my / gridSize) * Math.PI) * proximity * 4.5;
        vOffsets[idx] = deflection;

        line.setAttribute("x1", String(x + deflection));
        line.setAttribute("x2", String(x + deflection));

        const pct = Math.round(proximity * 100);
        line.style.stroke = `color-mix(in srgb, ${baseStroke}, ${highlightColor} ${pct}%)`;
      });

      // 3. Animate intersection dots
      dots.forEach((dot) => {
        const col = Number(dot.dataset.col);
        const row = Number(dot.dataset.row);
        const baseCx = col * gridSize + gridSize / 2;
        const baseCy = row * gridSize + gridSize / 2;

        const currentCx = baseCx + (vOffsets[col] || 0);
        const currentCy = baseCy + (hOffsets[row] || 0);

        dot.setAttribute("cx", String(currentCx));
        dot.setAttribute("cy", String(currentCy));

        const distToMouse = Math.hypot(mx - currentCx, my - currentCy);
        const proximity = Math.max(0, 1 - distToMouse / (glowRadius * 1.1));

        if (proximity > 0) {
          const pct = Math.round(proximity * 100);
          dot.style.fill = `color-mix(in srgb, ${baseDotFill}, #ffffff ${pct}%)`;
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

    // Track mouse anywhere across window for seamless responsiveness
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
      startAnimation();
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
  }, [gridSize, dotSize, glowRadius, highlightColor, cols, rows]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-hidden ${className}`}
      style={{
        zIndex: 1,
        maskImage:
          "radial-gradient(ellipse at 50% 50%, black 45%, rgba(0, 0, 0, 0.4) 75%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at 50% 50%, black 45%, rgba(0, 0, 0, 0.4) 75%, transparent 100%)",
      }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Horizontal Lines */}
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
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="1"
            />
          );
        })}

        {/* Vertical Lines */}
        {Array.from({ length: cols }).map((_, c) => {
          const x = c * gridSize + gridSize / 2;
          return (
            <line
              key={`v-${c}`}
              data-v={c}
              x1={x}
              y1="0"
              x2={x}
              y2="100%"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="1"
            />
          );
        })}

        {/* Intersection Dots */}
        {Array.from({ length: cols }).map((_, c) =>
          Array.from({ length: rows }).map((_, r) => {
            const cx = c * gridSize + gridSize / 2;
            const cy = r * gridSize + gridSize / 2;
            return (
              <circle
                key={`dot-${c}-${r}`}
                data-dot=""
                data-col={c}
                data-row={r}
                cx={cx}
                cy={cy}
                r={dotSize}
                fill="rgba(255, 255, 255, 0.28)"
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

// Named alias for convenience
export const AnimatedGridWithDots = DotDistortionShader;
