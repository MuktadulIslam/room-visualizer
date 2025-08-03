// src/components/InteractiveSurface.tsx
"use client";

import { Html } from "@react-three/drei";
import { useTexture, SurfaceType } from "@/contexts/TextureContext";
import { useRef } from "react";
import { Mesh } from "three";

interface InteractiveSurfaceProps {
  children: React.ReactNode;
  surfaceType: SurfaceType;
  position: [number, number, number];
  rotation?: [number, number, number];
}

export default function InteractiveSurface({ 
  children, 
  surfaceType, 
  position,
  rotation 
}: InteractiveSurfaceProps) {
  const meshRef = useRef<Mesh>(null);
  const { 
    selectedSurface, 
    setSelectedSurface 
  } = useTexture();

  const isSelected = selectedSurface === surfaceType;
  const isFloor = surfaceType === 'floor';

  const handleRadioChange = () => {
    setSelectedSurface(surfaceType);
  };

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

  // Calculate radio button position based on surface type
  const getRadioPosition = (): [number, number, number] => {
    switch(surfaceType) {
      case 'wall1': return [0, 2, 0.01]; // Front wall - center top
      case 'wall2': return [0, 2, -0.01]; // Back wall - center top
      case 'wall3': return [0.01, 2, 0]; // Left wall - center top
      case 'wall4': return [-0.01, 2, 0]; // Right wall - center top
      case 'floor': return [0, 0.01, 0]; // Floor - center
      default: return [0, 0, 0.01];
    }
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Main surface mesh */}
      <mesh ref={meshRef}>
        {children}
      </mesh>

      {/* Fixed radio button */}
      <Html
        position={getRadioPosition()}
        center
        style={{
          pointerEvents: 'auto',
          zIndex: 1,
        }}
      >
        <div 
          className={`
            bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border-2 transition-all
            ${isSelected ? 'border-green-500 bg-green-500/20' : 'border-gray-600'}
          `}
        >
          <label className="flex items-center space-x-2 text-white cursor-pointer">
            <input
              type="radio"
              name="surface-selection"
              checked={isSelected}
              onChange={handleRadioChange}
              className="form-radio text-green-500 w-4 h-4"
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {isFloor ? 'Change Floor' : 'Change Wall'}
            </span>
          </label>
          <div className="text-xs text-gray-300 mt-1 text-center">
            {getSurfaceLabel(surfaceType)}
          </div>
        </div>
      </Html>
    </group>
  );
}