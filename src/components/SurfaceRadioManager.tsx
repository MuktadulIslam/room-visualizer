// src/components/SurfaceRadioManager.tsx
"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, SurfaceType } from "@/contexts/TextureContext";
import { useState, useRef } from "react";
import * as THREE from "three";

interface SurfaceButtonData {
  visible: boolean;
  position: THREE.Vector3;
}

export default function SurfaceRadioManager() {
  const { camera } = useThree();
  const { roomDimensions, selectedSurface, setSelectedSurface } = useTexture();
  const [visibleSurfaces, setVisibleSurfaces] = useState<{
    [key in SurfaceType]: SurfaceButtonData
  }>({
    wall1: { visible: false, position: new THREE.Vector3() },
    wall2: { visible: false, position: new THREE.Vector3() },
    wall3: { visible: false, position: new THREE.Vector3() },
    wall4: { visible: false, position: new THREE.Vector3() },
    floor: { visible: false, position: new THREE.Vector3() },
  });

  useFrame(() => {
    const { width, height, depth } = roomDimensions;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    const surfaces = [
      {
        type: 'wall1' as SurfaceType,
        position: new THREE.Vector3(0, halfHeight * 0.3, -halfDepth + 0.01),
        normal: new THREE.Vector3(0, 0, 1),
      },
      {
        type: 'wall2' as SurfaceType,
        position: new THREE.Vector3(0, halfHeight * 0.3, halfDepth - 0.01),
        normal: new THREE.Vector3(0, 0, -1),
      },
      {
        type: 'wall3' as SurfaceType,
        position: new THREE.Vector3(-halfWidth + 0.01, halfHeight * 0.3, 0),
        normal: new THREE.Vector3(1, 0, 0),
      },
      {
        type: 'wall4' as SurfaceType,
        position: new THREE.Vector3(halfWidth - 0.01, halfHeight * 0.3, 0),
        normal: new THREE.Vector3(-1, 0, 0),
      },
      {
        type: 'floor' as SurfaceType,
        position: new THREE.Vector3(0, -halfHeight + 0.1, 0),
        normal: new THREE.Vector3(0, 1, 0),
      },
    ];

    const newVisibleSurfaces = { ...visibleSurfaces };

    surfaces.forEach(surface => {
      // Check if camera is looking towards this surface
      const dot = cameraDirection.dot(surface.normal);
      const shouldBeVisible = dot < -0.3;

      // Check if position is in front of camera
      const cameraToSurface = surface.position.clone().sub(camera.position);
      const isInFront = cameraDirection.dot(cameraToSurface.normalize()) > 0;

      newVisibleSurfaces[surface.type] = {
        visible: shouldBeVisible && isInFront,
        position: surface.position.clone(),
      };
    });

    setVisibleSurfaces(newVisibleSurfaces);
  });

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

  const handleRadioChange = (surfaceType: SurfaceType) => {
    setSelectedSurface(surfaceType);
  };

  // Find the most visible surface to show only one button
  const mostVisibleSurface = Object.entries(visibleSurfaces).find(([_, data]) => data.visible);
  
  if (!mostVisibleSurface) return null;

  const [surfaceType, surfaceData] = mostVisibleSurface;
  const typedSurfaceType = surfaceType as SurfaceType;
  const isSelected = selectedSurface === typedSurfaceType;
  const isFloor = typedSurfaceType === 'floor';

  return (
    <group>
      <Html
        position={surfaceData.position}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'auto',
          zIndex: 1,
        }}
      >
        <div 
          onClick={() => handleRadioChange(typedSurfaceType)}
          className={`
            bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border-3 transition-all cursor-pointer
            ${isSelected ? 'border-green-500 bg-green-500/20 shadow-green-500/30' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-700/30'}
            shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
            min-w-[180px]
          `}
        >
          <div className="flex items-center space-x-3 text-white">
            <input
              type="radio"
              name="surface-selection"
              checked={isSelected}
              onChange={() => handleRadioChange(typedSurfaceType)}
              className="form-radio text-green-500 w-5 h-5 pointer-events-none"
            />
            <span className="text-base font-medium whitespace-nowrap">
              {isFloor ? 'Change Floor' : 'Change Wall'}
            </span>
          </div>
          <div className="text-sm text-gray-300 mt-2 text-center font-medium">
            {getSurfaceLabel(typedSurfaceType)}
          </div>
        </div>
      </Html>
    </group>
  );
}