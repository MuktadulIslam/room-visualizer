// src/components/Room.tsx
"use client";

import { DoubleSide } from "three";
import SmoothTextureSurface from "./SmoothTextureSurface";

interface RoomProps {
  size?: number;
}

export default function Room({ size = 10 }: RoomProps) {
  const halfSize = size / 2;

  return (
    <group>
      {/* Floor */}
      <SmoothTextureSurface 
        surfaceType="floor" 
        position={[0, -halfSize, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={size}
      />

      {/* Ceiling - Static, no texture changes */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, halfSize, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#ffffff" side={DoubleSide} />
      </mesh>

      {/* Front Wall (wall1) */}
      <SmoothTextureSurface 
        surfaceType="wall1" 
        position={[0, 0, -halfSize]}
        size={size}
      />

      {/* Back Wall (wall2) */}
      <SmoothTextureSurface 
        surfaceType="wall2" 
        position={[0, 0, halfSize]}
        rotation={[0, Math.PI, 0]}
        size={size}
      />

      {/* Left Wall (wall3) */}
      <SmoothTextureSurface 
        surfaceType="wall3" 
        position={[-halfSize, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={size}
      />

      {/* Right Wall (wall4) */}
      <SmoothTextureSurface 
        surfaceType="wall4" 
        position={[halfSize, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={size}
      />
    </group>
  );
}