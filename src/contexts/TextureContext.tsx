// src/contexts/TextureContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SurfaceType = 'wall1' | 'wall2' | 'wall3' | 'wall4' | 'floor';

interface TextureContextType {
  selectedSurface: SurfaceType | null;
  setSelectedSurface: (surface: SurfaceType | null) => void;
  currentTextures: Record<SurfaceType, string>;
  setTexture: (surface: SurfaceType, texture: string) => void;
  wallTextures: string[];
  floorTextures: string[];
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
  const [currentTextures, setCurrentTextures] = useState<Record<SurfaceType, string>>({
    wall1: "/textures/walls/wall1.png",
    wall2: "/textures/walls/wall1.png", 
    wall3: "/textures/walls/wall1.png",
    wall4: "/textures/walls/wall1.png",
    floor: "/textures/floors/floor2.jpg"
  });

  const setTexture = (surface: SurfaceType, texture: string) => {
    setCurrentTextures(prev => ({
      ...prev,
      [surface]: texture
    }));
  };

  return (
    <TextureContext.Provider value={{
      selectedSurface,
      setSelectedSurface,
      currentTextures,
      setTexture,
      wallTextures: WALL_TEXTURES,
      floorTextures: FLOOR_TEXTURES
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