// src/components/TexturedSurface.tsx
"use client";

import { useTexture as useThreeTexture } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, ClampToEdgeWrapping } from "three";
import { useTexture, SurfaceType, TextureOption } from "@/contexts/TextureContext";
import { Suspense, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface TexturedSurfaceProps {
  surfaceType: SurfaceType;
  position: [number, number, number];
  rotation?: [number, number, number];
  dimensions: [number, number]; // [width, height] for walls, [width, depth] for floor
}

function ColorLayer({ 
  color, 
  opacity, 
  dimensions,
  zOffset = 0
}: { 
  color: string; 
  opacity: number; 
  dimensions: [number, number];
  zOffset?: number;
}) {
  return (
    <mesh position={[0, 0, zOffset]}>
      <planeGeometry args={dimensions} />
      <meshStandardMaterial 
        color={color}
        side={DoubleSide} 
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function ImageLayer({ 
  texturePath, 
  opacity, 
  dimensions,
  surfaceType,
  zOffset = 0
}: { 
  texturePath: string; 
  opacity: number; 
  dimensions: [number, number];
  surfaceType: SurfaceType;
  zOffset?: number;
}) {
  const texture = useThreeTexture(texturePath);
  const { floorRepetition } = useTexture();
  
  useEffect(() => {
    if (texture) {
      if (surfaceType === 'floor') {
        // Apply repetition only to floor
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        texture.repeat.set(floorRepetition.x, floorRepetition.y);
      } else {
        // Walls use default single texture (no repetition)
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
      }
      
      // Update the texture
      texture.needsUpdate = true;
    }
  }, [texture, surfaceType, floorRepetition]);

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

function TextureLayer({ 
  textureOption, 
  opacity, 
  dimensions,
  surfaceType,
  zOffset = 0
}: { 
  textureOption: TextureOption; 
  opacity: number; 
  dimensions: [number, number];
  surfaceType: SurfaceType;
  zOffset?: number;
}) {
  if (textureOption.type === 'color') {
    return (
      <ColorLayer
        color={textureOption.value}
        opacity={opacity}
        dimensions={dimensions}
        zOffset={zOffset}
      />
    );
  } else {
    return (
      <Suspense fallback={
        <ColorLayer
          color="#cccccc"
          opacity={opacity}
          dimensions={dimensions}
          zOffset={zOffset}
        />
      }>
        <ImageLayer
          texturePath={textureOption.value}
          opacity={opacity}
          dimensions={dimensions}
          surfaceType={surfaceType}
          zOffset={zOffset}
        />
      </Suspense>
    );
  }
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
      <TextureLayer 
        textureOption={currentTexture}
        opacity={transition ? 1 - transition.progress : 1}
        dimensions={dimensions}
        surfaceType={surfaceType}
        zOffset={0}
      />

      {/* New texture layer (only during transition) */}
      {transition && transition.isTransitioning && (
        <TextureLayer 
          textureOption={transition.newTexture}
          opacity={transition.progress}
          dimensions={dimensions}
          surfaceType={surfaceType}
          zOffset={0.001}
        />
      )}

      {/* Simple loading indicator - only show briefly for image textures */}
      {transition && transition.progress === 0 && transition.newTexture.type === 'image' && (
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