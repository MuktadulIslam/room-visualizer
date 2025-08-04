// src/components/ImagePlanes.tsx
"use client";

import { useTexture as useThreeTexture } from "@react-three/drei";
import { DoubleSide } from "three";
import { useTexture } from "@/contexts/TextureContext";
import { Suspense } from "react";

interface ImagePlaneProps {
  position: [number, number, number];
  size: [number, number];
  imageUrl: string;
  name: string;
}

function ImagePlane({ position, size, imageUrl, name }: ImagePlaneProps) {
  const texture = useThreeTexture(imageUrl);
  
  // Enable transparency for the texture
  texture.premultiplyAlpha = false;
  
  return (
    <mesh position={position} renderOrder={1}>
      <planeGeometry args={size} />
      <meshStandardMaterial 
        map={texture}
        transparent={true}
        alphaTest={0.1} // This helps with transparency
        side={DoubleSide}
        depthWrite={false} // Prevents z-fighting issues
        depthTest={true} // Enable depth testing for proper ordering
      />
    </mesh>
  );
}

export default function ImagePlanes() {
  const { roomDimensions } = useTexture();
  const { width, height, depth } = roomDimensions;
  const halfDepth = depth / 2;
  
  // Hardcoded values from debugging
  const globalX = -0.8;
  const globalY = -3.2;
  const globalZ = 1.7;
  const globalOffsetFromWall = 0.53;
  
  // Plane 1 values
  const plane1X = -4.6;
  const plane1Y = 1.4;
  const plane1Z = -1.49;
  const plane1Width = 2.1;
  const plane1Height = 4.7;
  
  // Plane 2 values
  const plane2X = -0.2;
  const plane2Y = 0.7;
  const plane2Z = -0.88;
  const plane2Width = 8.3;
  const plane2Height = 4.2;
  
  // Plane 3 values
  const plane3X = 4.2;
  const plane3Y = 2;
  const plane3Z = -1.2;
  const plane3Width = 4;
  const plane3Height = 5.7;

  // Calculate the base Z position (front wall position + offset)
  const baseZ = -halfDepth + globalOffsetFromWall;
  
  // Define three planes with hardcoded positions and sizes
  const planes = [
    {
      position: [globalX + plane1X, globalY + plane1Y, globalZ + baseZ + plane1Z] as [number, number, number],
      size: [plane1Width, plane1Height] as [number, number],
      imageUrl: "/furniture/table_lamp1.png",
      name: "Plane 1"
    },
    {
      position: [globalX + plane2X, globalY + plane2Y, globalZ + baseZ + plane2Z] as [number, number, number],
      size: [plane2Width, plane2Height] as [number, number],
      imageUrl: "/furniture/sofa1.png",
      name: "Plane 2"
    },
    {
      position: [globalX + plane3X, globalY + plane3Y, globalZ + baseZ + plane3Z] as [number, number, number],
      size: [plane3Width, plane3Height] as [number, number],
      imageUrl: "/furniture/tree1.png",
      name: "Plane 3"
    }
  ];

  return (
    <group>
      {planes.map((plane, index) => (
        <Suspense key={index} fallback={null}>
          <ImagePlane
            position={plane.position}
            size={plane.size}
            imageUrl={plane.imageUrl}
            name={plane.name}
          />
        </Suspense>
      ))}
    </group>
  );
}