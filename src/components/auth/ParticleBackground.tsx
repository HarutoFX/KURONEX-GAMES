"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  color: string;
  depth: number;
  oscSpeed: number;
  oscRadius: number;
  phase: number;
}

// Curated palette of red, crimson, and subtle dark-grey tones
const PARTICLE_COLORS = [
  "255, 38, 61",   // #FF263D - Signature brand red
  "255, 64, 84",   // #FF4054 - Vibrant flame red
  "179, 24, 40",   // #B31828 - Deep crimson
  "140, 18, 32",   // #8C1220 - Subtle dark red
  "75, 75, 82",    // Subtle dark-grey / charcoal
  "55, 55, 62",    // Deep muted grey
];

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let isPaused = false;
    let isReducedMotion = false;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        cancelAnimationFrame(animationFrameId);
        renderStatic();
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    mediaQuery.addEventListener?.("change", handleMotionChange);

    // Mouse tracking with gentle decay
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 130, // displacement influence distance
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    // Calculate particle count based on screen size
    const getParticleCount = (w: number) => {
      if (w < 640) return 36;       // mobile
      if (w < 1024) return 64;      // tablet
      return 100;                   // desktop
    };

    // Resize handler with DPR clamping
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initParticles();

      if (isReducedMotion) {
        renderStatic();
      }
    };

    // Initialize particle field
    const initParticles = () => {
      const count = getParticleCount(width);
      particles = [];

      for (let i = 0; i < count; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const depth = 0.4 + Math.random() * 0.6; // 0.4 (far) to 1.0 (near)
        const radius = 1.0 + depth * 1.6;        // 1.0px to 2.6px
        const baseAlpha = 0.2 + depth * 0.45;    // 0.2 to 0.65
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        particles.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: 0,
          vy: 0,
          radius,
          baseAlpha,
          alpha: baseAlpha,
          color,
          depth,
          oscSpeed: 0.0006 + Math.random() * 0.0012,
          oscRadius: 15 + Math.random() * 30,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    // Static render for prefers-reduced-motion
    const renderStatic = () => {
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.baseX, p.baseY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.baseAlpha})`;
        ctx.fill();
      }
    };

    // Animation loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (isPaused || isReducedMotion) return;

      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // Fill solid background #080808
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, width, height);

      const time = currentTime;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Organic ambient drift
        const targetX = p.baseX + Math.sin(time * p.oscSpeed + p.phase) * p.oscRadius;
        const targetY = p.baseY + Math.cos(time * p.oscSpeed * 0.8 + p.phase) * (p.oscRadius * 0.7);

        // 2. Mouse displacement calculation
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 180 * p.depth;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * dt;
          p.vy += Math.sin(angle) * force * dt;
        }

        // 3. Spring / Damping return to organic target
        const returnForceX = (targetX - p.x) * 3.5;
        const returnForceY = (targetY - p.y) * 3.5;

        p.vx += returnForceX * dt;
        p.vy += returnForceY * dt;

        // Friction damping
        p.vx *= 0.92;
        p.vy *= 0.92;

        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;

        // Keep smoothly within bounds
        if (p.x < -40) p.x = width + 40;
        if (p.x > width + 40) p.x = -40;
        if (p.y < -40) p.y = height + 40;
        if (p.y > height + 40) p.y = -40;

        // Subtle alpha breathing
        p.alpha = p.baseAlpha + Math.sin(time * 0.001 + p.phase) * 0.08;

        // 4. Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.08, p.alpha)})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Pause on tab hide
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        lastTime = performance.now();
        if (!isReducedMotion) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial setup
    handleResize();

    if (!isReducedMotion) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(animate);
    } else {
      renderStatic();
    }

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      mediaQuery.removeEventListener?.("change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
