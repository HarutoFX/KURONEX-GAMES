"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// ─── Inner Energy Core ────────────────────────────────────────────────────────
// Primary focal point. Controlled pulsing dodecahedron with crisp faceted glints.
function InnerCore() {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (!mesh.current || !mat.current) return;
    const t = state.clock.elapsedTime;
    // Slow, deliberate rotation — feels intentional and monolithic
    mesh.current.rotation.y = t * 0.16;
    mesh.current.rotation.x = t * 0.09;
    // Gentle pulse — barely perceptible breathing rhythm
    mat.current.emissiveIntensity = 1.35 + Math.sin(t * 1.2) * 0.22;
  });

  return (
    <mesh ref={mesh}>
      <dodecahedronGeometry args={[0.56, 0]} />
      <meshPhysicalMaterial
        ref={mat}
        color="#00181c"
        emissive="#00e5f2"
        emissiveIntensity={1.35}
        metalness={0.92}
        roughness={0.06}
        clearcoat={1.0}
        clearcoatRoughness={0.08}
        flatShading={true}
      />
    </mesh>
  );
}

// ─── Middle Crystal Layer ─────────────────────────────────────────────────────
// Translucent faceted shell. Visible crystal geometry. Sharp specular highlights.
function CrystalLayer() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    // Counter-rotate against inner core for visual independence
    mesh.current.rotation.x = t * 0.05;
    mesh.current.rotation.y = -t * 0.075;
    mesh.current.rotation.z = t * 0.03;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.04, 1]} />
      <meshPhysicalMaterial
        color="#031a1e"
        emissive="#00727c"
        emissiveIntensity={0.22}
        metalness={0.25}
        roughness={0.08}
        transmission={0.62}
        thickness={0.8}
        ior={1.42}
        transparent
        opacity={0.82}
        side={THREE.DoubleSide}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        flatShading={true}
      />
    </mesh>
  );
}

// ─── Outer Shell ──────────────────────────────────────────────────────────────
// Very subtle. Adds depth. Near-transparent — reveals geometry underneath.
function OuterShell() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = -t * 0.025;
    mesh.current.rotation.y = t * 0.038;
    mesh.current.rotation.z = -t * 0.02;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.46, 1]} />
      <meshPhysicalMaterial
        color="#010e12"
        emissive="#1ab5be"
        emissiveIntensity={0.04}
        metalness={0.9}
        roughness={0.08}
        transmission={0.85}
        transparent
        opacity={0.10}
        side={THREE.FrontSide}
        flatShading={true}
      />
    </mesh>
  );
}

// ─── Wireframe Shell ──────────────────────────────────────────────────────────
// Barely visible edge silhouette. Reduced to structural accent, not a wireframe demo.
function WireShell() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = t * 0.032;
    mesh.current.rotation.y = -t * 0.025;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.48, 1]} />
      <meshBasicMaterial
        color="#3cd0d7"
        wireframe
        transparent
        opacity={0.022}
      />
    </mesh>
  );
}

// ─── Orbital Ring ─────────────────────────────────────────────────────────────
// Razor-thin, whisper-transparent rings. Frame the core without competing.
function OrbitalRing({
  radius,
  rotation,
  speed,
  opacity = 0.08,
  color = "#36edf2",
}: {
  radius: number;
  rotation: [number, number, number];
  speed: number;
  opacity?: number;
  color?: string;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * speed;
  });

  return (
    <group ref={group} rotation={rotation}>
      <mesh>
        {/* Thinner tube — aerospace precision line quality */}
        <torusGeometry args={[radius, 0.0025, 6, 180]} />
        <meshBasicMaterial color={color} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

// ─── Floating Module (game data module / cartridge) ───────────────────────────
// Sleek, dark holographic panel — evokes digital game library architecture.
function FloatingModule({
  position,
  initialRotation,
  driftSpeed,
  scale = 1,
  color,
}: {
  position: [number, number, number];
  initialRotation: [number, number, number];
  driftSpeed: number;
  scale?: number;
  color: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = initialRotation[1] + t * driftSpeed * 0.5;
    mesh.current.rotation.x =
      initialRotation[0] + Math.sin(t * driftSpeed * 0.35 + position[0]) * 0.12;
    mesh.current.position.y =
      position[1] + Math.sin(t * 0.45 * driftSpeed + position[2] * 2.1) * 0.10;
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      scale={[scale, scale, scale]}
    >
      <boxGeometry args={[0.32, 0.20, 0.012]} />
      <meshPhysicalMaterial
        color={color}
        emissive="#0ec2cd"
        emissiveIntensity={0.08}
        metalness={0.9}
        roughness={0.16}
        transmission={0.35}
        transparent
        opacity={0.38}
      />
    </mesh>
  );
}

// ─── Crystalline Fragment ──────────────────────────────────────────────────────
// Small faceted octahedron — subtle game shard orbiting with restraint.
function CrystalFragment({
  position,
  driftSpeed,
  size = 0.085,
}: {
  position: [number, number, number];
  driftSpeed: number;
  size?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * driftSpeed;
    mesh.current.rotation.z = t * 0.25;
    mesh.current.rotation.x = t * 0.16;
    mesh.current.position.y =
      position[1] + Math.cos(t * 0.45 + position[2]) * 0.08;
  });

  return (
    <mesh ref={mesh} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial
        color="#011b1f"
        emissive="#15b5be"
        emissiveIntensity={0.18}
        metalness={0.88}
        roughness={0.12}
        transparent
        opacity={0.42}
        flatShading={true}
      />
    </mesh>
  );
}

// ─── Geometric Tile ───────────────────────────────────────────────────────────
// Small tetrahedron — deep background abstract data fragment.
function GeometricTile({
  position,
  driftSpeed,
}: {
  position: [number, number, number];
  driftSpeed: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * driftSpeed;
    mesh.current.rotation.y = t * 0.20;
    mesh.current.rotation.z = t * 0.12;
    mesh.current.position.y =
      position[1] + Math.sin(t * 0.4 + position[0]) * 0.06;
  });

  return (
    <mesh ref={mesh} position={position}>
      <tetrahedronGeometry args={[0.11, 0]} />
      <meshPhysicalMaterial
        color="#011619"
        emissive="#12a8b2"
        emissiveIntensity={0.14}
        metalness={0.82}
        roughness={0.18}
        transparent
        opacity={0.35}
        flatShading={true}
      />
    </mesh>
  );
}

// ─── Particle Field — two depth layers ────────────────────────────────────────
// Sparse, spatial distribution. Framing depth without looking like a starfield.
function Particles() {
  const nearPoints = useRef<THREE.Points>(null);
  const farPoints = useRef<THREE.Points>(null);

  // Near layer — sparse, subtle glints
  const nearGeo = useMemo(() => {
    const count = 38;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const s1 = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
      const s2 = Math.abs((Math.sin(i * 78.233) * 43758.5453) % 1);
      const s3 = Math.abs((Math.sin(i * 45.164) * 43758.5453) % 1);
      const theta = s1 * Math.PI * 2;
      const phi = Math.acos(2 * s2 - 1);
      const r = 1.7 + s3 * 1.3;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75; // slightly oblate
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  // Far layer — spread out, very dim
  const farGeo = useMemo(() => {
    const count = 68;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const s1 = Math.abs((Math.sin((i + 100) * 12.9898) * 43758.5453) % 1);
      const s2 = Math.abs((Math.sin((i + 100) * 78.233) * 43758.5453) % 1);
      const s3 = Math.abs((Math.sin((i + 100) * 45.164) * 43758.5453) % 1);
      const theta = s1 * Math.PI * 2;
      const phi = Math.acos(2 * s2 - 1);
      const r = 3.2 + s3 * 2.2;
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.8;
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (nearPoints.current) {
      nearPoints.current.rotation.y = t * 0.018;
      nearPoints.current.rotation.x = t * 0.009;
    }
    if (farPoints.current) {
      farPoints.current.rotation.y = t * 0.010;
      farPoints.current.rotation.x = -t * 0.005;
    }
  });

  return (
    <>
      <points ref={nearPoints} geometry={nearGeo}>
        <pointsMaterial
          color="#68f5fb"
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.34}
          depthWrite={false}
        />
      </points>
      <points ref={farPoints} geometry={farGeo}>
        <pointsMaterial
          color="#2caec8"
          size={0.014}
          sizeAttenuation
          transparent
          opacity={0.14}
          depthWrite={false}
        />
      </points>
    </>
  );
}

// ─── Full Scene ───────────────────────────────────────────────────────────────
function Scene({ mouse }: { mouse?: { x: number; y: number } }) {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const driftRef = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    if (!camRef.current) return;
    const t = state.clock.elapsedTime;

    // Auto-drift: slow, imperceptible sine wave
    driftRef.current.x = Math.sin(t * 0.04) * 0.22;
    driftRef.current.y = Math.cos(t * 0.03) * 0.14;

    // Compose: drift + restrained mouse parallax
    const targetX = driftRef.current.x + (mouse?.x ?? 0) * 0.32;
    const targetY = driftRef.current.y + (mouse?.y ?? 0) * 0.20;

    // Smooth lerp for buttery camera follow
    camRef.current.position.x +=
      (targetX - camRef.current.position.x) * 0.032;
    camRef.current.position.y +=
      (targetY - camRef.current.position.y) * 0.032;
    camRef.current.lookAt(0, 0, 0);
  });

  return (
    <>
      <PerspectiveCamera
        ref={camRef}
        makeDefault
        position={[0, 0, 7]}
        fov={42}
      />

      {/* ── Lighting ────────────────────────────────────────────── */}

      {/* Dark ambient — preserves deep blacks */}
      <ambientLight intensity={0.08} color="#00090c" />

      {/* Cyan key — upper right, creates sharp facet highlights */}
      <pointLight
        position={[3.6, 2.8, 3.2]}
        intensity={22}
        color="#35e8ef"
        distance={16}
        decay={2}
      />

      {/* Subtle teal fill — opposite side, softer, sculpts 3D depth */}
      <pointLight
        position={[-3.0, -1.6, 2.0]}
        intensity={5.5}
        color="#074e55"
        distance={14}
        decay={2}
      />

      {/* Localized inner-core light — glows from within, doesn't flood scene */}
      <pointLight
        position={[0, 0, 0]}
        intensity={6.0}
        color="#00f0ff"
        distance={2.2}
        decay={2}
      />

      {/* Subtle rim light — back silhouette definition */}
      <pointLight
        position={[-1.2, 2.2, -4.5]}
        intensity={3.5}
        color="#053e45"
        distance={12}
        decay={2}
      />

      {/* ── Core — primary focal point ──────────────────────────── */}
      {/* Heavy, calm float */}
      <Float speed={0.42} floatIntensity={0.15} rotationIntensity={0.025}>
        <group>
          <InnerCore />
          <CrystalLayer />
          <OuterShell />
          <WireShell />
        </group>
      </Float>

      {/* ── Orbital rings — midground, frame the core ───────────── */}
      {/* Inner ring — closest, primary frame */}
      <OrbitalRing
        radius={1.95}
        rotation={[1.15, 0.25, 0]}
        speed={0.052}
        opacity={0.09}
        color="#48e5ec"
      />
      {/* Middle ring — subtler counter-rotation */}
      <OrbitalRing
        radius={2.42}
        rotation={[0.35, 1.05, 0.45]}
        speed={-0.034}
        opacity={0.06}
        color="#28bac2"
      />
      {/* Outer ring — delicate outer boundary */}
      <OrbitalRing
        radius={2.85}
        rotation={[1.65, 0.40, 0.95]}
        speed={0.020}
        opacity={0.04}
        color="#168a92"
      />

      {/* ── Floating modules — game library data wafers ─────────── */}
      {/* Upper right — midground */}
      <FloatingModule
        position={[2.2, 0.85, -0.8]}
        initialRotation={[0.20, 0.45, 0.08]}
        driftSpeed={0.10}
        scale={1.05}
        color="#021417"
      />
      {/* Lower left — deeper background */}
      <FloatingModule
        position={[-2.0, -0.9, -1.2]}
        initialRotation={[0.10, -0.35, 0.12]}
        driftSpeed={0.08}
        scale={0.8}
        color="#010f12"
      />
      {/* Lower right — foreground depth */}
      <FloatingModule
        position={[1.6, -1.4, 0.6]}
        initialRotation={[-0.10, 0.5, 0.04]}
        driftSpeed={0.07}
        scale={0.65}
        color="#011215"
      />

      {/* ── Crystalline fragments ────────────────────────────────── */}
      <CrystalFragment position={[-1.8, 1.4, 0.9]} driftSpeed={0.15} size={0.085} />
      <CrystalFragment position={[2.5, -0.3, -0.9]} driftSpeed={0.12} size={0.072} />
      <CrystalFragment position={[-0.8, -2.0, 0.4]} driftSpeed={0.10} size={0.060} />

      {/* ── Geometric tiles — background depth ──────────────────── */}
      <GeometricTile position={[3.1, 1.1, -1.6]} driftSpeed={0.08} />
      <GeometricTile position={[-2.6, -1.5, -1.4]} driftSpeed={0.06} />

      {/* ── Particle Field ───────────────────────────────────────── */}
      <Particles />

      <Environment preset="night" environmentIntensity={0.2} />
    </>
  );
}

// ─── Exported Component ───────────────────────────────────────────────────────
export function HeroScene({ mouse }: { mouse?: { x: number; y: number } } = {}) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        // Correct tone mapping for dark premium aesthetics
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
      }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene mouse={mouse} />
    </Canvas>
  );
}
