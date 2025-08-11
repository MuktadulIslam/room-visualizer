// src/components/Room.tsx
"use client";

import { DoubleSide } from "three";
import { useTexture } from "@/contexts/TextureContext";
import TexturedSurface from "./TexturedSurface";
import ImagePlanes from "./ImagePlanes";

export default function Room() {
  const { roomDimensions } = useTexture();
  const { width, height, depth } = roomDimensions;

  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  return (
    <group>
      {/* Floor */}
      <TexturedSurface 
        surfaceType="floor" 
        position={[0, -halfHeight, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        dimensions={[width, depth]}
      />

      {/* Ceiling - Static, no texture changes */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, halfHeight, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#c4c0c0" side={DoubleSide} />
      </mesh>

      {/* Front Wall (wall1) - facing negative Z */}
      <TexturedSurface 
        surfaceType="wall1" 
        position={[0, 0, -halfDepth]}
        rotation={[0, 0, 0]}
        dimensions={[width, height]}
      />

      {/* Back Wall (wall2) - facing positive Z */}
      <TexturedSurface 
        surfaceType="wall2" 
        position={[0, 0, halfDepth]}
        rotation={[0, Math.PI, 0]}
        dimensions={[width, height]}
      />

      {/* Left Wall (wall3) - facing negative X */}
      <TexturedSurface 
        surfaceType="wall3" 
        position={[-halfWidth, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        dimensions={[depth, height]}
      />

      {/* Right Wall (wall4) - facing positive X */}
      <TexturedSurface 
        surfaceType="wall4" 
        position={[halfWidth, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        dimensions={[depth, height]}
      />

      {/* Furnitures */}
      {/* <ImagePlanes/> */}
    </group>
  );
}