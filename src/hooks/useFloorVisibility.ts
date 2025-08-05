// src/hooks/useFloorVisibility.ts
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useState, useRef } from "react";
import * as THREE from "three";

interface FloorVisibilityOptions {
  threshold?: number; // How much the camera needs to look down (0 to 1)
  updateFrequency?: number; // How often to update (in frames)
  smoothing?: number; // Smoothing factor for visibility amount (0 to 1)
}

export function useFloorVisibility(options: FloorVisibilityOptions = {}) {
  const { camera } = useThree();
  const { 
    threshold = 0.25, 
    updateFrequency = 3, 
    smoothing = 0.1 
  } = options;
  
  const [isFloorVisible, setIsFloorVisible] = useState(false);
  const [visibilityAmount, setVisibilityAmount] = useState(0);
  const frameCount = useRef(0);
  const smoothedVisibility = useRef(0);

  useFrame(() => {
    // Only update every N frames for performance
    frameCount.current++;
    if (frameCount.current % updateFrequency !== 0) return;

    // Get camera's world direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    
    // Calculate how much the camera is looking down
    const lookingDown = Math.max(0, -cameraDirection.y);
    const rawVisibility = Math.pow(lookingDown, 1.5); // Smooth curve
    
    // Apply smoothing to reduce jitter
    smoothedVisibility.current = THREE.MathUtils.lerp(
      smoothedVisibility.current, 
      rawVisibility, 
      smoothing
    );
    
    // Update visibility amount
    setVisibilityAmount(smoothedVisibility.current);
    
    // Check if floor should be considered visible
    const newFloorVisible = smoothedVisibility.current > threshold;
    
    if (newFloorVisible !== isFloorVisible) {
      setIsFloorVisible(newFloorVisible);
    }
  });

  return {
    isFloorVisible,
    visibilityAmount, // 0 to 1, how much the floor is visible
    rawLookingDown: -new THREE.Vector3().copy(camera.getWorldDirection(new THREE.Vector3())).y, // Raw downward amount
  };
}