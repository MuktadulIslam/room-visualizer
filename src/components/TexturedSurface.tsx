// src/components/TexturedSurface.tsx
"use client";

import { useTexture as useThreeTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import { useTexture, SurfaceType } from "@/contexts/TextureContext";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

interface TexturedSurfaceProps {
  surfaceType: SurfaceType;
  position: [number, number, number];
  rotation?: [number, number, number];
  dimensions: [number, number]; // [width, height] for walls, [width, depth] for floor
}

function TextureLayer({ 
  texturePath, 
  opacity, 
  dimensions,
  zOffset = 0
}: { 
  texturePath: string; 
  opacity: number; 
  dimensions: [number, number];
  zOffset?: number;
}) {
  const texture = useThreeTexture(texturePath);

  return (
    <mesh position={[0, 0, zOffset]}>
      <planeGeometry args={dimensions} />
      <meshStandardMaterial 
        map={texture} 
        side={DoubleSide} 
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function SurfaceContent({ 
  surfaceType, 
  dimensions 
}: { 
  surfaceType: SurfaceType; 
  dimensions: [number, number] 
}) {
  const { currentTextures, getTransition } = useTexture();
  const isLoadingRef = useRef(false);
  
  const currentTexture = currentTextures[surfaceType];
  const transition = getTransition(surfaceType);

  // Use frame loop to check for transitions without causing re-renders
  useFrame(() => {
    if (transition && transition.isTransitioning) {
      // Transition is happening, component will re-render naturally due to animation
    }
  });

  return (
    <>
      {/* Current texture layer */}
      <Suspense fallback={null}>
        <TextureLayer 
          texturePath={currentTexture}
          opacity={transition ? 1 - transition.progress : 1}
          dimensions={dimensions}
          zOffset={0}
        />
      </Suspense>

      {/* New texture layer (only during transition) */}
      {transition && transition.isTransitioning && (
        <Suspense fallback={null}>
          <TextureLayer 
            texturePath={transition.newTexture}
            opacity={transition.progress}
            dimensions={dimensions}
            zOffset={0.001}
          />
        </Suspense>
      )}

      {/* Simple loading indicator - only show briefly */}
      {transition && transition.progress === 0 && (
        <Html 
          center
          position={[0, 0, 0.01]}
          style={{ zIndex: 1 }}
        >
          <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-500">
            <div className="flex items-center space-x-2 text-white">
              <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
              <span className="text-xs">Loading...</span>
            </div>
          </div>
        </Html>
      )}
    </>
  );
}

export default function TexturedSurface({ 
  surfaceType, 
  position, 
  rotation = [0, 0, 0], 
  dimensions 
}: TexturedSurfaceProps) {
  return (
    <group position={position} rotation={rotation}>
      <SurfaceContent surfaceType={surfaceType} dimensions={dimensions} />
    </group>
  );
}