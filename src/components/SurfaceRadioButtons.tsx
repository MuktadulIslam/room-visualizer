// src/components/SurfaceRadioButtons.tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, SurfaceType } from "@/contexts/TextureContext";
import { useState, useRef } from "react";
import * as THREE from "three";

interface SurfaceButtonProps {
  surfaceType: SurfaceType;
  position: [number, number, number];
  isVisible: boolean;
}

function SurfaceButton({ surfaceType, position, isVisible }: SurfaceButtonProps) {
  const { selectedSurface, setSelectedSurface } = useTexture();
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

  if (!isVisible) return null;

  return (
    <div 
      onClick={handleRadioChange}
      className={`
        absolute bg-black/80 backdrop-blur-sm px-6 py-4 rounded-xl border-3 transition-all cursor-pointer
        ${isSelected ? 'border-green-500 bg-green-500/20 shadow-green-500/30' : 'border-gray-600 hover:border-gray-400 hover:bg-gray-700/30'}
        shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
        min-w-[180px] pointer-events-auto
      `}
      style={{
        left: `${position[0]}px`,
        top: `${position[1]}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex items-center space-x-3 text-white">
        <input
          type="radio"
          name="surface-selection"
          checked={isSelected}
          onChange={handleRadioChange}
          className="form-radio text-green-500 w-5 h-5 pointer-events-none"
        />
        <span className="text-base font-medium whitespace-nowrap">
          {isFloor ? 'Change Floor' : 'Change Wall'}
        </span>
      </div>
      <div className="text-sm text-gray-300 mt-2 text-center font-medium">
        {getSurfaceLabel(surfaceType)}
      </div>
    </div>
  );
}

export default function SurfaceRadioButtons() {
  const { camera, size } = useThree();
  const { roomDimensions } = useTexture();
  const [visibleSurfaces, setVisibleSurfaces] = useState<{
    [key in SurfaceType]: { visible: boolean; screenPos: [number, number, number] }
  }>({
    wall1: { visible: false, screenPos: [0, 0, 0] },
    wall2: { visible: false, screenPos: [0, 0, 0] },
    wall3: { visible: false, screenPos: [0, 0, 0] },
    wall4: { visible: false, screenPos: [0, 0, 0] },
    floor: { visible: false, screenPos: [0, 0, 0] },
  });

  const tempVector = useRef(new THREE.Vector3());

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
        position: new THREE.Vector3(0, halfHeight * 0.3, -halfDepth),
        normal: new THREE.Vector3(0, 0, 1),
      },
      {
        type: 'wall2' as SurfaceType,
        position: new THREE.Vector3(0, halfHeight * 0.3, halfDepth),
        normal: new THREE.Vector3(0, 0, -1),
      },
      {
        type: 'wall3' as SurfaceType,
        position: new THREE.Vector3(-halfWidth, halfHeight * 0.3, 0),
        normal: new THREE.Vector3(1, 0, 0),
      },
      {
        type: 'wall4' as SurfaceType,
        position: new THREE.Vector3(halfWidth, halfHeight * 0.3, 0),
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

      // Convert 3D position to screen coordinates
      tempVector.current.copy(surface.position);
      tempVector.current.project(camera);

      const screenX = (tempVector.current.x * 0.5 + 0.5) * size.width;
      const screenY = (tempVector.current.y * -0.5 + 0.5) * size.height;

      newVisibleSurfaces[surface.type] = {
        visible: shouldBeVisible && tempVector.current.z < 1, // Only show if in front of camera
        screenPos: [screenX, screenY, tempVector.current.z],
      };
    });

    setVisibleSurfaces(newVisibleSurfaces);
  });

  return (
    <>
      {Object.entries(visibleSurfaces).map(([surfaceType, data]) => (
        <SurfaceButton
          key={surfaceType}
          surfaceType={surfaceType as SurfaceType}
          position={data.screenPos}
          isVisible={data.visible}
        />
      ))}
    </>
  );
}