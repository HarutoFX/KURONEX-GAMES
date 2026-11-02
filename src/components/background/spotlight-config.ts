/**
 * KURONEX GAMES — Spotlight Shader Configuration
 *
 * Defines the shared configuration for the WebGL Spotlight Background system,
 * including brand color tokens, beam geometry, animation parameters, and
 * page-specific intensity levels inspired by Aceternity UI.
 */

export interface SpotlightBeamDefinition {
  id: string;
  name: string;
  /** Normalized RGB [r, g, b] in range [0, 1] */
  color: [number, number, number];
  /** Normalized origin [x, y] in UV space (0..1, can be slightly outside) */
  origin: [number, number];
  /** Base direction angle in radians (0 = right, pi/2 = up, -pi/2 = down) */
  baseAngle: number;
  /** Cone spread angle in radians (beam width) */
  spread: number;
  /** Initial beam radius at origin in UV units */
  baseRadius: number;
  /** Beam intensity multiplier */
  intensity: number;
  /** Distance attenuation coefficient */
  decay: number;
  /** Speed of organic oscillation */
  oscillationSpeed: number;
  /** Amplitude of angular sway in radians */
  swayAmplitude: number;
}

export interface SpotlightSystemConfig {
  /** Base background color (#080808) */
  baseColor: [number, number, number];
  /** Device pixel ratio cap (prevents mobile/high-DPI GPU exhaustion) */
  maxDpr: number;
  /** Primary beam (Electric Cyan) */
  primaryBeam: SpotlightBeamDefinition;
  /** Secondary beam (KURONEX Red) */
  secondaryBeam: SpotlightBeamDefinition;
  /** Ambient counter-glow beam (Deep Cyan Wash) */
  ambientBeam: SpotlightBeamDefinition;
  /** Recommended intensity levels by route prefix */
  routeIntensities: Record<string, number>;
}

export const SPOTLIGHT_CONFIG: SpotlightSystemConfig = {
  // Deep Void Base: #080808 -> 8 / 255 = 0.03137
  baseColor: [0.03137, 0.03137, 0.03137],

  // Cap DPR at 1.5 for optimal performance and battery efficiency
  maxDpr: 1.5,

  // ── Primary Spotlight: Electric Cyan #00D1FF ────────────────────────────────
  // Dominant cinematic beam shining from upper-right down-left across the hero
  primaryBeam: {
    id: "beam-cyan",
    name: "Primary Electric Cyan",
    color: [0.0, 0.8196, 1.0], // #00D1FF
    origin: [1.12, 1.12],      // Upper-right corner outside viewport
    baseAngle: -2.45,          // ~ -140 degrees (down-left towards center)
    spread: 0.58,              // Broad cinematic theatrical cone
    baseRadius: 0.16,          // Soft luminous source
    intensity: 0.90,           // Dominant ambient lighting
    decay: 0.38,               // Smooth distance falloff
    oscillationSpeed: 0.32,    // Slow breathing
    swayAmplitude: 0.07,       // Subtle organic sway
  },

  // ── Secondary Spotlight: KURONEX Red #FF263D ────────────────────────────────
  // Restrained secondary beam accentuating from upper-left behind "Build Your" & CTA
  secondaryBeam: {
    id: "beam-red",
    name: "Secondary KURONEX Red",
    color: [1.0, 0.149, 0.2392], // #FF263D
    origin: [-0.10, 0.95],       // Upper-left corner outside viewport
    baseAngle: -0.55,            // ~ -31 degrees (down-right towards center)
    spread: 0.50,                // Soft cone
    baseRadius: 0.14,            // Soft source
    intensity: 0.55,             // Restrained crimson illumination
    decay: 0.45,                 // Fades cleanly into deep void
    oscillationSpeed: 0.40,      // Slow harmonic
    swayAmplitude: 0.06,         // Controlled sway
  },

  // ── Ambient Counter-Glow: Deep Cyan Wash ─────────────────────────────────────
  // Soft ambient ground light to prevent deep shadows from feeling dead
  ambientBeam: {
    id: "beam-ambient-cyan",
    name: "Ambient Deep Cyan",
    color: [0.0, 0.28, 0.40],   // Deep teal/cyan wash
    origin: [0.50, -0.15],      // Center-bottom
    baseAngle: 1.57,            // Points straight up (~90 degrees)
    spread: 1.10,               // Very wide diffuse wash
    baseRadius: 0.30,           // Broad soft source
    intensity: 0.20,            // Subtle ambient fill
    decay: 0.85,                // Fades out before top
    oscillationSpeed: 0.25,     // Gentle drift
    swayAmplitude: 0.05,        // Minimal sway
  },

  // ── Page-Specific Intensity Table ───────────────────────────────────────────
  routeIntensities: {
    "/": 1.0,           // Homepage: 100%
    "/discover": 0.55,  // Discover: 55%
    "/library": 0.45,   // Library: 45%
    "/developers": 0.50,// Developers: 50%
    "/login": 0.65,     // Login: 65%
    "/register": 0.65,  // Register: 65%
    "/admin": 0.12,     // Admin Portal: 12% (10–15% range)
    "/download": 0.50,  // Download Page: 50%
  },
};

/**
 * Resolves the recommended spotlight intensity for any given pathname.
 * Prefers exact matches, then route prefixes, defaulting to 0.50.
 */
export function getIntensityForRoute(pathname: string | null): number {
  if (!pathname) return 1.0;
  if (pathname === "/") return SPOTLIGHT_CONFIG.routeIntensities["/"] ?? 1.0;

  for (const [route, intensity] of Object.entries(SPOTLIGHT_CONFIG.routeIntensities)) {
    if (route !== "/" && pathname.startsWith(route)) {
      return intensity;
    }
  }

  return 0.50;
}
