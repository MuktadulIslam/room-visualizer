// src/contexts/TextureContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SurfaceType = 'wall1' | 'wall2' | 'wall3' | 'wall4' | 'floor';

interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

interface TextureContextType {
  selectedSurface: SurfaceType | null;
  setSelectedSurface: (surface: SurfaceType | null) => void;
  currentTextures: Record<SurfaceType, string>;
  pendingTextures: Record<SurfaceType, string | null>;
  setTexture: (surface: SurfaceType, texture: string) => void;
  setPendingTexture: (surface: SurfaceType, texture: string) => void;
  clearPendingTexture: (surface: SurfaceType) => void;
  wallTextures: string[];
  floorTextures: string[];
  roomDimensions: RoomDimensions;
  setRoomDimensions: (dimensions: RoomDimensions) => void;
}

const TextureContext = createContext<TextureContextType | undefined>(undefined);

// Predefined texture lists
const WALL_TEXTURES = [
  "/textures/walls/brick-wall.jpg",
  "/textures/walls/wood-panel.jpg", 
  "/textures/walls/wood-panel2.jpg", 
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
    wall1: "/textures/walls/wall1.png",
    wall2: "/textures/walls/wall1.png", 
    wall3: "/textures/walls/wall1.png",
    wall4: "/textures/walls/wall1.png",
    floor: "/textures/floors/floor2.jpg"
  });

  const [pendingTextures, setPendingTexturesState] = useState<Record<SurfaceType, string | null>>({
    wall1: null,
    wall2: null,
    wall3: null,
    wall4: null,
    floor: null
  });

  const setTexture = (surface: SurfaceType, texture: string) => {
    // Don't set if it's the same texture
    if (currentTextures[surface] === texture) return;
    
    // Set as pending first
    setPendingTexture(surface, texture);
  };

  const setPendingTexture = (surface: SurfaceType, texture: string) => {
    setPendingTexturesState(prev => ({
      ...prev,
      [surface]: texture
    }));
  };

  const clearPendingTexture = (surface: SurfaceType) => {
    const pendingTexture = pendingTextures[surface];
    if (pendingTexture) {
      // Move pending to current
      setCurrentTextures(prev => ({
        ...prev,
        [surface]: pendingTexture
      }));
      
      // Clear pending
      setPendingTexturesState(prev => ({
        ...prev,
        [surface]: null
      }));
    }
  };

  return (
    <TextureContext.Provider value={{
      selectedSurface,
      setSelectedSurface,
      currentTextures,
      pendingTextures,
      setTexture,
      setPendingTexture,
      clearPendingTexture,
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