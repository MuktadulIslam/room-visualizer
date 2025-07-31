// src/components/Room.tsx
"use client";

import { useTexture } from "@react-three/drei";
import { DoubleSide } from "three";

interface RoomProps {
  size?: number;
}

export default function Room({ size = 10 }: RoomProps) {
  // Load textures
  const [wall1, wall2, wall3, wall4, floor] = useTexture([
    "/wall1.png",
    "/wall2.png",
    "/wall3.png",
    "/wall4.png",
    "/floor.png",
  ]);

  const halfSize = size / 2;

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -halfSize, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={floor} side={DoubleSide} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, halfSize, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#ffffff" side={DoubleSide} />
      </mesh>

      {/* Front Wall (wall1) */}
      <mesh position={[0, 0, -halfSize]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall1} side={DoubleSide} />
      </mesh>

      {/* Back Wall (wall2) */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, 0, halfSize]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall2} side={DoubleSide} />
      </mesh>

      {/* Left Wall (wall3) */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-halfSize, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall3} side={DoubleSide} />
      </mesh>

      {/* Right Wall (wall4) */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[halfSize, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall4} side={DoubleSide} />
      </mesh>
    </group>
  );
}