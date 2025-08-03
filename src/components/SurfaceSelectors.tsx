// src/components/SurfaceSelector.tsx
"use client";

import { Html } from "@react-three/drei";
import { Vector3 } from "three";

interface SurfaceSelectorProps {
  position: Vector3;
  surfaceId: string;
  label: string;
  selectedSurface: string;
  onSelect: (surfaceId: string) => void;
}

export default function SurfaceSelector({ 
  position, 
  surfaceId, 
  label, 
  selectedSurface, 
  onSelect 
}: SurfaceSelectorProps) {
  return (
    <Html
      position={position}
      center
      transform
      sprite
      style={{
        pointerEvents: 'auto'
      }}
    >
      <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-500">
        <input
          type="radio"
          name="surface"
          id={surfaceId}
          value={surfaceId}
          checked={selectedSurface === surfaceId}
          onChange={(e) => onSelect(e.target.value)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
        />
        <label 
          htmlFor={surfaceId}
          className="text-white text-sm font-medium cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    </Html>
  );
}