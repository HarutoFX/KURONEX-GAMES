"use client";

/**
 * KURONEX GAMES — Spotlight Background Component
 *
 * A premium, shader-based Spotlight Background inspired by Aceternity UI.
 * Implemented using high-performance raw WebGL with custom volumetric GLSL shaders.
 *
 * Features:
 *  - Volumetric conical spotlights with organic breathing and sway.
 *  - Primary Electric Cyan (#00D1FF) dominant beam + Secondary KURONEX Red (#FF263D) accent.
 *  - Ambient deep teal counter-glow.
 *  - High-frequency triangular dither to eliminate 8-bit dark banding.
 *  - Page-specific intensity with butter-smooth lerping between route transitions.
 *  - Device pixel ratio cap (1.5x) for 60fps/120fps performance on mobile & Retina displays.
 *  - Reduced-motion detection (freezes animation loop to 0% GPU load).
 *  - Page visibility handling (pauses when tab is hidden).
 *  - WebGL context loss handling and robust CSS fallback.
 *  - position: fixed, z-index: 0, pointer-events: none.
 */

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SPOTLIGHT_CONFIG, getIntensityForRoute } from "./spotlight-config";

export interface SpotlightBackgroundProps {
  /** Optional override for lighting intensity (0.0 to 1.0). Defaults to route-based config. */
  intensity?: number;
  /** Custom class name for the wrapper */
  className?: string;
}

// ── Vertex Shader ─────────────────────────────────────────────────────────────
const VERTEX_SHADER_SOURCE = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

// ── Fragment Shader ───────────────────────────────────────────────────────────
const FRAGMENT_SHADER_SOURCE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;
uniform vec3 uBaseColor;

// Primary Cyan Spotlight
uniform vec3 uBeam1Color;
uniform vec2 uBeam1Origin;
uniform float uBeam1Angle;
uniform float uBeam1Spread;
uniform float uBeam1Radius;
uniform float uBeam1Intensity;
uniform float uBeam1Decay;

// Secondary Red Spotlight
uniform vec3 uBeam2Color;
uniform vec2 uBeam2Origin;
uniform float uBeam2Angle;
uniform float uBeam2Spread;
uniform float uBeam2Radius;
uniform float uBeam2Intensity;
uniform float uBeam2Decay;

// Ambient Counter-Glow
uniform vec3 uBeam3Color;
uniform vec2 uBeam3Origin;
uniform float uBeam3Angle;
uniform float uBeam3Spread;
uniform float uBeam3Radius;
uniform float uBeam3Intensity;
uniform float uBeam3Decay;

// Volumetric spotlight calculation with soft exponential falloff and localized directional cone
float calculateSpotlight(
  vec2 p,
  vec2 origin,
  float angle,
  float spread,
  float baseRadius,
  float decay
) {
  vec2 dir = vec2(cos(angle), sin(angle));
  vec2 toPoint = p - origin;

  // Longitudinal distance along beam direction
  float distAlong = dot(toPoint, dir);

  // Soft envelope behind the light source origin
  float behindFactor = smoothstep(-0.08, 0.05, distAlong);
  if (behindFactor <= 0.0) return 0.0;

  // Perpendicular distance from beam central axis
  float distPerp = length(toPoint - dir * distAlong);

  // Beam cone radius expands smoothly with distance traveled
  float currentRadius = baseRadius + max(0.0, distAlong) * tan(spread);

  // Cross-sectional exponential falloff with soft outer envelope (no harsh edges)
  float normPerp = distPerp / max(0.001, currentRadius);
  float crossProfile = exp(-pow(normPerp, 2.4) * 3.0) * smoothstep(1.1, 0.0, normPerp);

  // Longitudinal exponential attenuation: naturally cuts off to deep black in center/lower screen
  float distanceDecay = exp(-distAlong * decay * 1.8) * smoothstep(1.35, 0.15, distAlong);

  return crossProfile * distanceDecay * behindFactor;
}

void main() {
  // Aspect ratio correction so beams maintain geometry on wide or mobile screens
  float aspect = uResolution.x / max(1.0, uResolution.y);
  vec2 p = vUv;
  p.x *= aspect;

  // Aspect-corrected beam origins
  vec2 o1 = vec2(uBeam1Origin.x * aspect, uBeam1Origin.y);
  vec2 o2 = vec2(uBeam2Origin.x * aspect, uBeam2Origin.y);
  vec2 o3 = vec2(uBeam3Origin.x * aspect, uBeam3Origin.y);

  // Subtle organic harmonic sway (slow breathing periods ~18-35 seconds)
  float angle1 = uBeam1Angle + sin(uTime * 0.28) * 0.045 + cos(uTime * 0.14) * 0.02;
  float angle2 = uBeam2Angle + sin(uTime * 0.32 + 1.2) * 0.035 + cos(uTime * 0.18) * 0.02;
  float angle3 = uBeam3Angle + sin(uTime * 0.16 + 2.5) * 0.02;

  // Atmospheric micro-haze texture for realistic light-shaft feeling
  float haze = 1.0 + 0.025 * sin(p.x * 2.8 + p.y * 2.0 + uTime * 0.18)
                   + 0.02 * cos(p.x * 2.0 - p.y * 3.0 - uTime * 0.12);

  // Calculate individual spotlight contributions
  float light1 = calculateSpotlight(p, o1, angle1, uBeam1Spread, uBeam1Radius, uBeam1Decay) * uBeam1Intensity;
  float light2 = calculateSpotlight(p, o2, angle2, uBeam2Spread, uBeam2Radius, uBeam2Decay) * uBeam2Intensity;
  float light3 = calculateSpotlight(p, o3, angle3, uBeam3Spread, uBeam3Radius, uBeam3Decay) * uBeam3Intensity;

  // Modulate by haze and global page intensity
  light1 *= haze * uIntensity;
  light2 *= haze * uIntensity;
  light3 *= haze * uIntensity;

  // Blend onto deep #080808 void base
  vec3 color = uBaseColor;

  // Primary Electric Cyan (#00D1FF) - dominant
  color += uBeam1Color * light1;

  // Secondary KURONEX Red (#FF263D) - restrained accent
  color += uBeam2Color * light2;

  // Ambient Deep Cyan/Teal - soft shadow wash
  color += uBeam3Color * light3;

  // Subtle theatrical corner vignette to anchor dark contrast
  vec2 uvNorm = vUv * 2.0 - 1.0;
  float vignette = 1.0 - dot(uvNorm, uvNorm) * 0.22;
  color *= max(0.0, vignette);

  // High-frequency triangular dither to eliminate 8-bit color banding in dark gradients
  float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (1.5 / 255.0);
  color += vec3(dither);

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("SpotlightBackground shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertShader: WebGLShader,
  fragShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("SpotlightBackground program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function SpotlightBackground({ intensity: intensityProp, className = "" }: SpotlightBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();
  const [hasWebGL, setHasWebGL] = useState(true);

  // Target intensity resolved from prop or current pathname
  const targetIntensity = intensityProp ?? getIntensityForRoute(pathname);
  const targetIntensityRef = useRef(targetIntensity);

  useEffect(() => {
    targetIntensityRef.current = targetIntensity;
  }, [targetIntensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = mediaQuery.matches;

    // Try WebGL2 first, then WebGL1
    const gl = (canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "low-power",
    }) ||
      canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
        powerPreference: "low-power",
      }) ||
      canvas.getContext("experimental-webgl", {
        alpha: false,
        depth: false,
        stencil: false,
        antialias: false,
      })) as WebGLRenderingContext | null;

    if (!gl) {
      console.warn("WebGL not supported for SpotlightBackground. Falling back to CSS atmosphere.");
      setHasWebGL(false);
      return;
    }

    // Compile shaders
    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vertShader || !fragShader) {
      setHasWebGL(false);
      return;
    }

    const program = createProgram(gl, vertShader, fragShader);
    if (!program) {
      setHasWebGL(false);
      return;
    }

    gl.useProgram(program);

    // Full-screen quad (2 triangles covering clip space -1..1)
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    // Cache Uniform Locations
    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");
    const uIntensityLoc = gl.getUniformLocation(program, "uIntensity");
    const uBaseColorLoc = gl.getUniformLocation(program, "uBaseColor");

    // Beam 1
    const uBeam1ColorLoc = gl.getUniformLocation(program, "uBeam1Color");
    const uBeam1OriginLoc = gl.getUniformLocation(program, "uBeam1Origin");
    const uBeam1AngleLoc = gl.getUniformLocation(program, "uBeam1Angle");
    const uBeam1SpreadLoc = gl.getUniformLocation(program, "uBeam1Spread");
    const uBeam1RadiusLoc = gl.getUniformLocation(program, "uBeam1Radius");
    const uBeam1IntensityLoc = gl.getUniformLocation(program, "uBeam1Intensity");
    const uBeam1DecayLoc = gl.getUniformLocation(program, "uBeam1Decay");

    // Beam 2
    const uBeam2ColorLoc = gl.getUniformLocation(program, "uBeam2Color");
    const uBeam2OriginLoc = gl.getUniformLocation(program, "uBeam2Origin");
    const uBeam2AngleLoc = gl.getUniformLocation(program, "uBeam2Angle");
    const uBeam2SpreadLoc = gl.getUniformLocation(program, "uBeam2Spread");
    const uBeam2RadiusLoc = gl.getUniformLocation(program, "uBeam2Radius");
    const uBeam2IntensityLoc = gl.getUniformLocation(program, "uBeam2Intensity");
    const uBeam2DecayLoc = gl.getUniformLocation(program, "uBeam2Decay");

    // Beam 3
    const uBeam3ColorLoc = gl.getUniformLocation(program, "uBeam3Color");
    const uBeam3OriginLoc = gl.getUniformLocation(program, "uBeam3Origin");
    const uBeam3AngleLoc = gl.getUniformLocation(program, "uBeam3Angle");
    const uBeam3SpreadLoc = gl.getUniformLocation(program, "uBeam3Spread");
    const uBeam3RadiusLoc = gl.getUniformLocation(program, "uBeam3Radius");
    const uBeam3IntensityLoc = gl.getUniformLocation(program, "uBeam3Intensity");
    const uBeam3DecayLoc = gl.getUniformLocation(program, "uBeam3Decay");

    // Upload static uniforms
    const cfg = SPOTLIGHT_CONFIG;
    gl.uniform3fv(uBaseColorLoc, cfg.baseColor);

    // Primary Cyan
    gl.uniform3fv(uBeam1ColorLoc, cfg.primaryBeam.color);
    gl.uniform2fv(uBeam1OriginLoc, cfg.primaryBeam.origin);
    gl.uniform1f(uBeam1AngleLoc, cfg.primaryBeam.baseAngle);
    gl.uniform1f(uBeam1SpreadLoc, cfg.primaryBeam.spread);
    gl.uniform1f(uBeam1RadiusLoc, cfg.primaryBeam.baseRadius);
    gl.uniform1f(uBeam1IntensityLoc, cfg.primaryBeam.intensity);
    gl.uniform1f(uBeam1DecayLoc, cfg.primaryBeam.decay);

    // Secondary Red
    gl.uniform3fv(uBeam2ColorLoc, cfg.secondaryBeam.color);
    gl.uniform2fv(uBeam2OriginLoc, cfg.secondaryBeam.origin);
    gl.uniform1f(uBeam2AngleLoc, cfg.secondaryBeam.baseAngle);
    gl.uniform1f(uBeam2SpreadLoc, cfg.secondaryBeam.spread);
    gl.uniform1f(uBeam2RadiusLoc, cfg.secondaryBeam.baseRadius);
    gl.uniform1f(uBeam2IntensityLoc, cfg.secondaryBeam.intensity);
    gl.uniform1f(uBeam2DecayLoc, cfg.secondaryBeam.decay);

    // Ambient Cyan
    gl.uniform3fv(uBeam3ColorLoc, cfg.ambientBeam.color);
    gl.uniform2fv(uBeam3OriginLoc, cfg.ambientBeam.origin);
    gl.uniform1f(uBeam3AngleLoc, cfg.ambientBeam.baseAngle);
    gl.uniform1f(uBeam3SpreadLoc, cfg.ambientBeam.spread);
    gl.uniform1f(uBeam3RadiusLoc, cfg.ambientBeam.baseRadius);
    gl.uniform1f(uBeam3IntensityLoc, cfg.ambientBeam.intensity);
    gl.uniform1f(uBeam3DecayLoc, cfg.ambientBeam.decay);

    // Viewport & DPR Sizing
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, cfg.maxDpr);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const displayWidth = Math.floor(width * dpr);
      const displayHeight = Math.floor(height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
        gl.uniform2f(uResolutionLoc, displayWidth, displayHeight);
      }
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Animation & Smooth Intensity State
    let animationFrameId: number;
    let startTime = performance.now();
    let currentIntensity = targetIntensityRef.current;
    let isPaused = false;

    const renderFrame = (now: number) => {
      const elapsed = isReducedMotion ? 0 : (now - startTime) * 0.001;

      // Smooth buttery lerp between route intensity transitions
      const target = targetIntensityRef.current;
      currentIntensity += (target - currentIntensity) * 0.06;

      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1f(uIntensityLoc, currentIntensity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!isReducedMotion && !isPaused) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    // Start initial frame
    animationFrameId = requestAnimationFrame(renderFrame);

    // Visibility Listener: Pause animation when tab is inactive to preserve 100% CPU/GPU
    const onVisibilityChange = () => {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isPaused = false;
        if (!isReducedMotion) {
          animationFrameId = requestAnimationFrame(renderFrame);
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    // Reduced motion media query change
    const onMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion) {
        cancelAnimationFrame(animationFrameId);
        gl.uniform1f(uTimeLoc, 0.0);
        gl.uniform1f(uIntensityLoc, targetIntensityRef.current);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        startTime = performance.now();
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    mediaQuery.addEventListener?.("change", onMotionChange);

    // Context loss recovery
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
      setHasWebGL(false);
    };

    canvas.addEventListener("webglcontextlost", onContextLost);

    // Cleanup resources cleanly on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mediaQuery.removeEventListener?.("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#080808] ${className}`}
      style={{ isolation: "isolate" }}
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ display: "block" }}
        />
      ) : (
        /* Graceful CSS Fallback if WebGL is unavailable */
        <div
          className="absolute inset-0 h-full w-full bg-[#080808]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 700px 500px at 75% 15%, rgba(0, 209, 255, 0.12), transparent 70%),
              radial-gradient(ellipse 600px 450px at 20% 18%, rgba(255, 38, 61, 0.08), transparent 65%)
            `,
            opacity: targetIntensity,
            transition: "opacity 0.6s ease-out",
          }}
        />
      )}
    </div>
  );
}

export default SpotlightBackground;
