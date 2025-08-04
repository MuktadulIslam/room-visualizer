// src/contexts/TextureContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useRef, useCallback } from "react";

export type SurfaceType = 'wall1' | 'wall2' | 'wall3' | 'wall4' | 'floor';

interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

interface TextureTransition {
  isTransitioning: boolean;
  oldTexture: string;
  newTexture: string;
  progress: number;
}

interface TextureContextType {
  selectedSurface: SurfaceType | null;
  setSelectedSurface: (surface: SurfaceType | null) => void;
  currentTextures: Record<SurfaceType, string>;
  setTexture: (surface: SurfaceType, texture: string) => void;
  getTransition: (surface: SurfaceType) => TextureTransition | null;
  wallTextures: string[];
  floorTextures: string[];
  roomDimensions: RoomDimensions;
  setRoomDimensions: (dimensions: RoomDimensions) => void;
}

const TextureContext = createContext<TextureContextType | undefined>(undefined);

// Predefined texture lists
const WALL_TEXTURES = [
  "/textures/walls/brick-wall.jpg",
  "/textures/walls/brick-wall2.png",
  "/textures/walls/brick-wall3.png",
  // "/textures/walls/wood-panel.jpg", 
  // "/textures/walls/wood-panel2.jpg", 
  "/textures/walls/concrete.jpg",
  "/textures/walls/marble.jpg",
  "/textures/walls/wall1.png",
];

const FLOOR_TEXTURES = [
  "/textures/floors/floor1.jpg",
  "/textures/floors/floor2.jpg",
  "/textures/floors/floor3.png",
  "/textures/floors/floor4.jpg",
];

interface TextureProviderProps {
  children: ReactNode;
}

export function TextureProvider({ children }: TextureProviderProps) {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceType | null>(null);
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    width: 15,
    height: 8,
    depth: 15
  });

  const [currentTextures, setCurrentTextures] = useState<Record<SurfaceType, string>>({
    wall1: "/textures/walls/brick-wall2.png",
    wall2: "/textures/walls/wall1.png", 
    wall3: "/textures/walls/wall1.png",
    wall4: "/textures/walls/wall1.png",
    floor: "/textures/floors/floor2.jpg"
  });

  // Use refs to track transitions without causing re-renders
  const transitionsRef = useRef<Record<SurfaceType, TextureTransition | null>>({
    wall1: null,
    wall2: null,
    wall3: null,
    wall4: null,
    floor: null
  });

  const animationFrameRef = useRef<Record<SurfaceType, number | null>>({
    wall1: null,
    wall2: null,
    wall3: null,
    wall4: null,
    floor: null
  });

  const setTexture = useCallback((surface: SurfaceType, texture: string) => {
    // Don't set if it's the same texture
    if (currentTextures[surface] === texture) return;
    
    // Cancel any existing animation for this surface
    if (animationFrameRef.current[surface]) {
      cancelAnimationFrame(animationFrameRef.current[surface]!);
    }

    const oldTexture = currentTextures[surface];
    
    // Start transition immediately
    transitionsRef.current[surface] = {
      isTransitioning: true,
      oldTexture,
      newTexture: texture,
      progress: 0
    };

    // Quick transition using requestAnimationFrame
    const startTime = performance.now();
    const duration = 300; // 300ms transition

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (transitionsRef.current[surface]) {
        transitionsRef.current[surface]!.progress = progress;
      }

      if (progress < 1) {
        animationFrameRef.current[surface] = requestAnimationFrame(animate);
      } else {
        // Transition complete
        setCurrentTextures(prev => ({
          ...prev,
          [surface]: texture
        }));
        
        transitionsRef.current[surface] = null;
        animationFrameRef.current[surface] = null;
      }
    };

    animationFrameRef.current[surface] = requestAnimationFrame(animate);
  }, [currentTextures]);

  const getTransition = useCallback((surface: SurfaceType): TextureTransition | null => {
    return transitionsRef.current[surface];
  }, []);

  return (
    <TextureContext.Provider value={{
      selectedSurface,
      setSelectedSurface,
      currentTextures,
      setTexture,
      getTransition,
      wallTextures: WALL_TEXTURES,
      floorTextures: FLOOR_TEXTURES,
      roomDimensions,
      setRoomDimensions
    }}>
      {children}
    </TextureContext.Provider>
  );
}

export function useTexture() {
  const context = useContext(TextureContext);
  if (context === undefined) {
    throw new Error('useTexture must be used within a TextureProvider');
  }
  return context;
}