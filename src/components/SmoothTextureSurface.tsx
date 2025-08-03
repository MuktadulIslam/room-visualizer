// src/components/SmoothTextureSurface.tsx
"use client";

import { useTexture as useThreeTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import { useTexture, SurfaceType } from "@/contexts/TextureContext";
import InteractiveSurface from "./InteractiveSurface";
import { Suspense, useState, useEffect, useRef } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface SmoothTextureSurfaceProps {
  surfaceType: SurfaceType;
  position: [number, number, number];
  rotation?: [number, number, number];
  size: number;
}

function TextureLayer({ 
  texturePath, 
  opacity, 
  size,
  onLoad 
}: { 
  texturePath: string; 
  opacity: number; 
  size: number;
  onLoad?: () => void;
}) {
  const texture = useThreeTexture(texturePath, (loadedTexture) => {
    if (onLoad) onLoad();
  });

  return (
    <mesh>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        map={texture} 
        side={DoubleSide} 
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

function LoadingOverlay({ surfaceType }: { surfaceType: SurfaceType }) {
  const getSurfaceLabel = (type: SurfaceType) => {
    switch(type) {
      case 'wall1': return 'Front Wall';
      case 'wall2': return 'Back Wall';
      case 'wall3': return 'Left Wall';
      case 'wall4': return 'Right Wall';
      case 'floor': return 'Floor';
      default: return type;
    }
  };

  const isFloor = surfaceType === 'floor';

  return (
    <Html 
      center
      style={{
        zIndex: 1,
      }}
    >
      <div className="bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg border border-blue-500 shadow-lg">
        <div className="flex items-center space-x-3 text-white">
          <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full"></div>
          <div>
            <div className="text-sm font-medium">
              Loading {isFloor ? 'floor' : 'wall'} texture...
            </div>
            <div className="text-xs text-gray-300">{getSurfaceLabel(surfaceType)}</div>
          </div>
        </div>
      </div>
    </Html>
  );
}

function SurfaceContent({ surfaceType, size }: { surfaceType: SurfaceType; size: number }) {
  const { currentTextures, pendingTextures, setPendingTexture, clearPendingTexture } = useTexture();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [oldOpacity, setOldOpacity] = useState(1);
  const [newOpacity, setNewOpacity] = useState(0);
  const [showLoading, setShowLoading] = useState(false);
  
  const currentTexture = currentTextures[surfaceType];
  const pendingTexture = pendingTextures[surfaceType];
  
  // Handle texture transitions
  useEffect(() => {
    if (pendingTexture && pendingTexture !== currentTexture) {
      setShowLoading(true);
      setIsTransitioning(true);
    }
  }, [pendingTexture, currentTexture]);

  const handleNewTextureLoaded = () => {
    setShowLoading(false);
    
    // Start transition: fade out old, fade in new
    setOldOpacity(1);
    setNewOpacity(0);
    
    // Fade out old texture
    const fadeOutInterval = setInterval(() => {
      setOldOpacity(prev => {
        const newValue = prev - 0.1;
        if (newValue <= 0) {
          clearInterval(fadeOutInterval);
          
          // Start fading in new texture
          const fadeInInterval = setInterval(() => {
            setNewOpacity(prev => {
              const newValue = prev + 0.1;
              if (newValue >= 1) {
                clearInterval(fadeInInterval);
                // Transition complete
                setIsTransitioning(false);
                setOldOpacity(1);
                setNewOpacity(0);
                clearPendingTexture(surfaceType);
                return 1;
              }
              return newValue;
            });
          }, 20); // 20ms * 10 steps = 200ms fade in
          
          return 0;
        }
        return newValue;
      });
    }, 20); // 20ms * 10 steps = 200ms fade out
  };

  return (
    <>
      {/* Current/Old texture layer */}
      <Suspense fallback={null}>
        <TextureLayer 
          texturePath={currentTexture}
          opacity={isTransitioning ? oldOpacity : 1}
          size={size}
        />
      </Suspense>

      {/* New texture layer (only shown during transition) */}
      {isTransitioning && pendingTexture && (
        <group position={[0, 0, 0.001]}>
          <Suspense fallback={null}>
            <TextureLayer 
              texturePath={pendingTexture}
              opacity={newOpacity}
              size={size}
              onLoad={handleNewTextureLoaded}
            />
          </Suspense>
        </group>
      )}

      {/* Loading overlay */}
      {showLoading && (
        <group position={[0, 0, 0.002]}>
          <LoadingOverlay surfaceType={surfaceType} />
        </group>
      )}
    </>
  );
}

export default function SmoothTextureSurface({ 
  surfaceType, 
  position, 
  rotation, 
  size 
}: SmoothTextureSurfaceProps) {
  return (
    <InteractiveSurface 
      surfaceType={surfaceType} 
      position={position}
      rotation={rotation}
    >
      <SurfaceContent surfaceType={surfaceType} size={size} />
    </InteractiveSurface>
  );
}