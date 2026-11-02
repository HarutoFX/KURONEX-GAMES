/**
 * KURONEX GAMES — Spotlight Shader Configuration
 *
 * Defines the shared configuration for the WebGL Spotlight Background system,
 * including brand color tokens, beam geometry, animation parameters, and
 * page-specific intensity levels.
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
  // Dominant cinematic beam shining diagonally down-right across the canvas
  primaryBeam: {
    id: "beam-cyan",
    name: "Primary Electric Cyan",
    color: [0.0, 0.8196, 1.0], // #00D1FF
    origin: [-0.08, 1.08],     // Top-left just outside viewport
    baseAngle: -0.64,          // ~ -37 degrees (down and right)
    spread: 0.52,              // Broad cinematic cone (~30 deg half-angle)
    baseRadius: 0.12,          // Soft source diameter
    intensity: 0.95,           // Dominant light source
    decay: 0.42,               // Gentle atmospheric falloff
    oscillationSpeed: 0.35,    // Slow, stately breathing
    swayAmplitude: 0.08,       // Subtle angular sway (~4.5 degrees)
  },

  // ── Secondary Spotlight: KURONEX Red #FF263D ────────────────────────────────
  // Restrained secondary beam accentuating from the upper-right
  secondaryBeam: {
    id: "beam-red",
    name: "Secondary KURONEX Red",
    color: [1.0, 0.149, 0.2392], // #FF263D
    origin: [1.08, 1.04],        // Top-right just outside viewport
    baseAngle: -2.48,            // ~ -142 degrees (down and left)
    spread: 0.40,                // Focused accent cone (~23 deg half-angle)
    baseRadius: 0.08,            // Tighter source
    intensity: 0.42,             // Restrained secondary intensity
    decay: 0.55,                 // Fades cleanly into the dark void
    oscillationSpeed: 0.45,      // Slightly offset harmonic
    swayAmplitude: 0.06,         // Controlled sway
  },

  // ── Ambient Counter-Glow: Deep Cyan Wash ─────────────────────────────────────
  // Soft ambient ground light to prevent deep shadows from feeling dead
  ambientBeam: {
    id: "beam-ambient-cyan",
    name: "Ambient Deep Cyan",
    color: [0.0, 0.28, 0.40],  // Deep teal/cyan wash
    origin: [-0.05, -0.10],    // Bottom-left corner
    baseAngle: 0.88,           // Points softly up-right (~50 degrees)
    spread: 0.95,              // Very wide diffuse wash
    baseRadius: 0.25,          // Broad soft source
    intensity: 0.22,           // Soft ambient fill
    decay: 0.80,               // Rapid decay away from corner
    oscillationSpeed: 0.20,    // Very slow drift
    swayAmplitude: 0.04,       // Minimal sway
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
