// src/components/Room.tsx
"use client";

import { useTexture as useThreeTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import { useTexture } from "@/contexts/TextureContext";
import InteractiveSurface from "./InteractiveSurface";

interface RoomProps {
  size?: number;
}

export default function Room({ size = 10 }: RoomProps) {
  const { currentTextures } = useTexture();
  
  // Load textures using current texture URLs from context
  const [wall1, wall2, wall3, wall4, floor] = useThreeTexture([
    currentTextures.wall1,
    currentTextures.wall2,
    currentTextures.wall3, 
    currentTextures.wall4,
    currentTextures.floor,
  ]);

  const halfSize = size / 2;

  return (
    <group>
      {/* Floor */}
      <InteractiveSurface 
        surfaceType="floor" 
        position={[0, -halfSize, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={floor} side={DoubleSide} />
      </InteractiveSurface>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, halfSize, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#ffffff" side={DoubleSide} />
      </mesh>

      {/* Front Wall (wall1) */}
      <InteractiveSurface 
        surfaceType="wall1" 
        position={[0, 0, -halfSize]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall1} side={DoubleSide} />
      </InteractiveSurface>

      {/* Back Wall (wall2) */}
      <InteractiveSurface 
        surfaceType="wall2" 
        position={[0, 0, halfSize]}
        rotation={[0, Math.PI, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall2} side={DoubleSide} />
      </InteractiveSurface>

      {/* Left Wall (wall3) */}
      <InteractiveSurface 
        surfaceType="wall3" 
        position={[-halfSize, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall3} side={DoubleSide} />
      </InteractiveSurface>

      {/* Right Wall (wall4) */}
      <InteractiveSurface 
        surfaceType="wall4" 
        position={[halfSize, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial map={wall4} side={DoubleSide} />
      </InteractiveSurface>
    </group>
  );
}