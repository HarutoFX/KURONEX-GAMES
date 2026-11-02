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
  // Localized cone with steep exponential falloff towards center and bottom
  primaryBeam: {
    id: "beam-cyan",
    name: "Primary Electric Cyan",
    color: [0.0, 0.8196, 1.0], // #00D1FF
    origin: [1.06, 1.10],      // Upper-right corner just outside viewport
    baseAngle: -2.38,          // ~ -136 degrees (down-left towards hero headline)
    spread: 0.34,              // Focused theatrical cone (~19.5 deg)
    baseRadius: 0.09,          // Controlled luminous source
    intensity: 0.78,           // Dominant spotlight illumination
    decay: 0.75,               // Steep falloff: drops cleanly into #080808 before lower screen
    oscillationSpeed: 0.28,    // Gentle breathing
    swayAmplitude: 0.045,      // Subtle organic sway
  },

  // ── Secondary Spotlight: KURONEX Red #FF263D ────────────────────────────────
  // Restrained secondary beam accentuating from upper-left behind "Build Your" & CTA
  secondaryBeam: {
    id: "beam-red",
    name: "Secondary KURONEX Red",
    color: [1.0, 0.149, 0.2392], // #FF263D
    origin: [-0.06, 1.04],       // Upper-left corner just outside viewport
    baseAngle: -0.60,            // ~ -34 degrees (down-right towards hero title)
    spread: 0.28,                // Narrow theatrical cone (~16 deg)
    baseRadius: 0.07,            // Subtle luminous source
    intensity: 0.42,             // Restrained crimson illumination
    decay: 0.85,                 // Fades cleanly into deep void before opposite side
    oscillationSpeed: 0.34,      // Slow harmonic
    swayAmplitude: 0.040,        // Controlled sway
  },

  // ── Ambient Counter-Glow: Deep Cyan Wash ─────────────────────────────────────
  // Kept extremely minimal to preserve deep black (#080808) across the viewport
  ambientBeam: {
    id: "beam-ambient-cyan",
    name: "Ambient Deep Cyan",
    color: [0.0, 0.20, 0.28],   // Deep muted teal
    origin: [0.50, -0.20],      // Off-canvas bottom
    baseAngle: 1.57,            // Straight up
    spread: 0.60,               // Contained cone
    baseRadius: 0.10,           // Small source
    intensity: 0.02,            // Subdued to near-zero to prevent bottom wash
    decay: 1.80,                // Drops off immediately
    oscillationSpeed: 0.20,     // Gentle drift
    swayAmplitude: 0.03,        // Minimal sway
  },

  // ── Page-Specific Intensity Table ───────────────────────────────────────────
  // Visual tuning targets per specification
  routeIntensities: {
    "/": 0.68,           // Homepage: 65–70%
    "/discover": 0.28,   // Discover: 25–30%
    "/library": 0.22,    // Library: 20–25%
    "/developers": 0.28, // Developers: 25–30%
    "/download": 0.28,   // Download: 25–30%
    "/login": 0.38,      // Login: 35–40%
    "/register": 0.38,   // Register: 35–40%
    "/admin": 0.05,      // Admin Portal: 0–10%
  },
};

/**
 * Resolves the recommended spotlight intensity for any given pathname.
 * Prefers exact matches, then route prefixes, defaulting to 0.25.
 */
export function getIntensityForRoute(pathname: string | null): number {
  if (!pathname) return 0.68;
  if (pathname === "/") return SPOTLIGHT_CONFIG.routeIntensities["/"] ?? 0.68;

  for (const [route, intensity] of Object.entries(SPOTLIGHT_CONFIG.routeIntensities)) {
    if (route !== "/" && pathname.startsWith(route)) {
      return intensity;
    }
  }

  return 0.25;
}
