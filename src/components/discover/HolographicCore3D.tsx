"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// ─── Glowing Inner Quantum Core ─────────────────────────────────────────────
function QuantumCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.y = t * 0.6;
    const pulse = 1.2 + Math.sin(t * 2.5) * 0.4;
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = pulse;
    }
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.7, 0]} />
      <meshStandardMaterial
        color="#001824"
        emissive="#00e5ff"
        emissiveIntensity={1.4}
        roughness={0.1}
        metalness={0.9}
        wireframe={false}
      />
    </mesh>
  );
}

// ─── Translucent Crystalline Cage ───────────────────────────────────────────
function CrystalCage() {
  const cageRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!cageRef.current) return;
    const t = state.clock.getElapsedTime();
    cageRef.current.rotation.x = -t * 0.2;
    cageRef.current.rotation.z = t * 0.3;
  });

  return (
    <mesh ref={cageRef}>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color="#003544"
        emissive="#00b4d8"
        emissiveIntensity={0.3}
        roughness={0.15}
        metalness={0.8}
        wireframe={true}
        transparent={true}
        opacity={0.65}
      />
    </mesh>
  );
}

// ─── Gyroscopic Tech Rings ──────────────────────────────────────────────────
function GyroRings() {
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ring1.current) {
      ring1.current.rotation.z = t * 0.5;
      ring1.current.rotation.x = Math.sin(t * 0.3) * 0.4;
    }
    if (ring2.current) {
      ring2.current.rotation.y = -t * 0.6;
      ring2.current.rotation.z = Math.cos(t * 0.4) * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={ring1}>
        <torusGeometry args={[1.6, 0.018, 16, 100]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.65} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.85, 0.015, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

// ─── Floating Particle Field ────────────────────────────────────────────────
function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 45;

  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const rx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const ry = (Math.sin(i * 78.233) * 43758.5453) % 1;
      const rz = (Math.sin(i * 45.164) * 43758.5453) % 1;
      pos[i * 3] = (rx - 0.5) * 4.5;
      pos[i * 3 + 1] = (ry - 0.5) * 4.5;
      pos[i * 3 + 2] = (rz - 0.5) * 4.5;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#00e5ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─── Scene Container ────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4.2]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 4, 3]} intensity={1.8} color="#00e5ff" />
      <pointLight position={[-3, -4, -2]} intensity={1.2} color="#ff263d" />

      <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
        <QuantumCore />
        <CrystalCage />
        <GyroRings />
        <ParticleField />
      </Float>
    </>
  );
}

// ─── Exported Holographic Viewport ──────────────────────────────────────────
export function HolographicCore3D() {
  return (
    <div className="relative h-full w-full min-h-[320px] sm:min-h-[380px] md:min-h-[420px] flex items-center justify-center">
      {/* 3D Canvas */}
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="h-full w-full pointer-events-none"
      >
        <Scene />
      </Canvas>

      {/* Cyber Reticle Overlay HUD */}
      <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
        {/* Top HUD */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#00e5ff]/70 tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-ping" />
            LIVE // QUANTUM CORE
          </span>
          <span>STABILITY 99.8%</span>
        </div>

        {/* Center Target Bracket */}
        <div className="mx-auto flex h-28 w-28 items-center justify-center border border-[#00e5ff]/20 rounded-full animate-spin [animation-duration:18s]">
          <div className="h-20 w-20 border border-dashed border-[#00e5ff]/40 rounded-full" />
        </div>

        {/* Bottom HUD */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8f9298] tracking-widest">
          <span>SEC // CLASSIFIED</span>
          <span className="text-[#00e5ff]">3D HOLOGRAPHIC PROJECTION</span>
        </div>
      </div>
    </div>
  );
}
