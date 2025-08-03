// src/components/Lighting.tsx
"use client";

export default function Lighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={1} />
      
      {/* Point light in the center of the room */}
      <pointLight position={[0, 0, 0]} intensity={1} />
      
      {/* Additional directional light for better visibility */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        color="#ffffff"
      />
    </>
  );
}