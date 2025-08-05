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
  visibility: number;
}

export default function SurfaceRadioManager() {
  const { camera, size } = useThree();
  const { roomDimensions, selectedSurface, setSelectedSurface } = useTexture();
  
  const [isFloorVisible, setIsFloorVisible] = useState(false);
  const [floorVisibilityAmount, setFloorVisibilityAmount] = useState(0);
  const frameCount = useRef(0);
  
  const [visibleSurfaces, setVisibleSurfaces] = useState<{
    [key in SurfaceType]: SurfaceButtonData
  }>({
    wall1: { visible: false, position: new THREE.Vector3(), visibility: 0 },
    wall2: { visible: false, position: new THREE.Vector3(), visibility: 0 },
    wall3: { visible: false, position: new THREE.Vector3(), visibility: 0 },
    wall4: { visible: false, position: new THREE.Vector3(), visibility: 0 },
    floor: { visible: false, position: new THREE.Vector3(), visibility: 0 },
  });

  useFrame(() => {
    // Update every 3 frames for optimal performance
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    const { width, height, depth } = roomDimensions;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);

    // Optimized floor visibility calculation
    const lookingDown = Math.max(0, -cameraDirection.y);
    const floorVisibility = Math.pow(lookingDown, 1.5); // Smooth curve
    const newFloorVisible = floorVisibility > 0.25; // Threshold for floor visibility
    
    if (newFloorVisible !== isFloorVisible) {
      setIsFloorVisible(newFloorVisible);
    }
    setFloorVisibilityAmount(floorVisibility);

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
        position: new THREE.Vector3(0, -halfHeight + 0.5, 0), // Slightly above floor
        normal: new THREE.Vector3(0, 1, 0),
        customVisibility: floorVisibility,
      },
    ];

    const newVisibleSurfaces = { ...visibleSurfaces };

    surfaces.forEach(surface => {
      let visibility: number;
      let shouldBeVisible: boolean;

      if (surface.type === 'floor' && surface.customVisibility !== undefined) {
        // Use custom floor visibility calculation
        visibility = surface.customVisibility;
        shouldBeVisible = newFloorVisible;
      } else {
        // Standard wall visibility calculation
        const dot = cameraDirection.dot(surface.normal);
        visibility = Math.max(0, -dot);
        shouldBeVisible = dot < -0.3;
      }

      // Check if position is in front of camera (for walls)
      let isInFront = true;
      if (surface.type !== 'floor') {
        const cameraToSurface = surface.position.clone().sub(camera.position);
        isInFront = cameraDirection.dot(cameraToSurface.normalize()) > 0;
      }

      newVisibleSurfaces[surface.type] = {
        visible: shouldBeVisible && isInFront,
        position: surface.position.clone(),
        visibility: visibility,
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
    if (selectedSurface === surfaceType) {
      setSelectedSurface(null);
    } else {
      setSelectedSurface(surfaceType);
    }
  };

  // Get visible walls (excluding floor)
  const visibleWalls = Object.entries(visibleSurfaces)
    .filter(([type, data]) => type !== 'floor' && data.visible)
    .sort(([_, a], [__, b]) => b.visibility - a.visibility);

  const mostVisibleWall = visibleWalls[0];
  const floorData = visibleSurfaces.floor;

  return (
    <group>
      {/* Wall button - show most visible wall */}
      {mostVisibleWall && (
        <Html
          position={mostVisibleWall[1].position}
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'auto',
            zIndex: 1,
          }}
        >
          <SurfaceButton
            surfaceType={mostVisibleWall[0] as SurfaceType}
            isSelected={selectedSurface === mostVisibleWall[0]}
            onSelect={handleRadioChange}
            getSurfaceLabel={getSurfaceLabel}
          />
        </Html>
      )}

      {/* Floor button - show at bottom of screen when floor is visible */}
      {isFloorVisible && (
        <Html
          position={[0, 0, 0]}
          center
          transform={false}
          style={{
            pointerEvents: 'auto',
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <SurfaceButton
            surfaceType="floor"
            isSelected={selectedSurface === 'floor'}
            onSelect={handleRadioChange}
            getSurfaceLabel={getSurfaceLabel}
          />
        </Html>
      )}
    </group>
  );
}

// Surface Button Component - Reusable for both walls and floor
interface SurfaceButtonProps {
  surfaceType: SurfaceType;
  isSelected: boolean;
  onSelect: (type: SurfaceType) => void;
  getSurfaceLabel: (type: SurfaceType) => string;
}

function SurfaceButton({ surfaceType, isSelected, onSelect, getSurfaceLabel }: SurfaceButtonProps) {
  const isFloor = surfaceType === 'floor';
  
  return (
    <div 
      onClick={() => onSelect(surfaceType)}
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
          onChange={() => onSelect(surfaceType)}
          className="form-radio text-green-500 w-5 h-5 pointer-events-none"
        />
        <span className="text-base font-medium whitespace-nowrap">
          {isSelected ? 'Close Panel' : (isFloor ? 'Change Floor' : 'Change Wall')}
        </span>
      </div>
      <div className="text-sm text-gray-300 mt-2 text-center font-medium">
        {getSurfaceLabel(surfaceType)}
      </div>
    </div>
  );
}