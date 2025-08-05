// src/contexts/TextureContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useRef, useCallback } from "react";

export type SurfaceType = 'wall1' | 'wall2' | 'wall3' | 'wall4' | 'floor';

export interface TextureOption {
  id: string;
  name: string;
  type: 'color' | 'image';
  value: string; // hex color for color type, URL for image type
  preview?: string; // Optional preview URL for images
}

interface RoomDimensions {
  width: number;
  height: number;
  depth: number;
}

interface TextureTransition {
  isTransitioning: boolean;
  oldTexture: TextureOption;
  newTexture: TextureOption;
  progress: number;
}

interface RepetitionSettings {
  x: number; // How many times to repeat horizontally
  y: number; // How many times to repeat vertically
}

interface TextureContextType {
  selectedSurface: SurfaceType | null;
  setSelectedSurface: (surface: SurfaceType | null) => void;
  currentTextures: Record<SurfaceType, TextureOption>;
  setTexture: (surface: SurfaceType, texture: TextureOption) => void;
  getTransition: (surface: SurfaceType) => TextureTransition | null;
  wallTextures: TextureOption[];
  floorTextures: TextureOption[];
  roomDimensions: RoomDimensions;
  setRoomDimensions: (dimensions: RoomDimensions) => void;
  // Floor repetition controls only
  floorRepetition: RepetitionSettings;
  setFloorRepetition: (repetition: RepetitionSettings) => void;
}

const TextureContext = createContext<TextureContextType | undefined>(undefined);

// Predefined wall texture options (colors + images)
const WALL_TEXTURES: TextureOption[] = [
  // Solid Colors
  { id: 'wall-white', name: 'White', type: 'color', value: '#ffffff' },
  { id: 'wall-light-gray', name: 'Light Gray', type: 'color', value: '#f3f4f6' },
  { id: 'wall-dark-gray', name: 'Dark Gray', type: 'color', value: '#6b7280' },
  { id: 'wall-beige', name: 'Beige', type: 'color', value: '#f5f5dc' },
  { id: 'wall-cream', name: 'Cream', type: 'color', value: '#fffdd0' },
  { id: 'wall-light-blue', name: 'Light Blue', type: 'color', value: '#dbeafe' },
  { id: 'wall-sage-green', name: 'Sage Green', type: 'color', value: '#9ca3af' },
  { id: 'wall-warm-yellow', name: 'Warm Yellow', type: 'color', value: '#fef3c7' },
  
  // Image Textures
  { id: 'wall-brick1', name: 'Brick Wall', type: 'image', value: '/textures/walls/brick-wall.jpg' },
  { id: 'wall-brick2', name: 'Red Brick', type: 'image', value: '/textures/walls/brick-wall2.png' },
  { id: 'wall-brick3', name: 'Dark Brick', type: 'image', value: '/textures/walls/brick-wall3.png' },
  { id: 'wall-concrete', name: 'Concrete', type: 'image', value: '/textures/walls/concrete.jpg' },
  { id: 'wall-marble', name: 'Marble', type: 'image', value: '/textures/walls/marble.jpg' },
];

// Predefined floor texture options (colors + images)
const FLOOR_TEXTURES: TextureOption[] = [
  // Solid Colors
  { id: 'floor-white', name: 'White', type: 'color', value: '#ffffff' },
  { id: 'floor-light-gray', name: 'Light Gray', type: 'color', value: '#f2f0ef' },
  { id: 'floor-dark-gray', name: 'Dark Gray', type: 'color', value: '#374151' },
  { id: 'floor-black', name: 'Black', type: 'color', value: '#111827' },
  { id: 'floor-brown', name: 'Brown', type: 'color', value: '#92400e' },
  { id: 'floor-light-brown', name: 'Light Brown', type: 'color', value: '#b09696' },
  { id: 'floor-warm-beige', name: 'Warm Beige', type: 'color', value: '#d6d3d1' },
  
  // Image Textures
  { id: 'floor-wood1', name: 'Light Wood', type: 'image', value: '/textures/floors/floor1.jpg' },
  { id: 'floor-wood2', name: 'Dark Wood', type: 'image', value: '/textures/floors/floor2.jpg' },
  { id: 'floor-tile1', name: 'Stone Tile', type: 'image', value: '/textures/floors/floor3.png' },
  { id: 'floor-parquet', name: 'Parquet', type: 'image', value: '/textures/floors/floor4.jpg' },
];

interface TextureProviderProps {
  children: ReactNode;
}

export function TextureProvider({ children }: TextureProviderProps) {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceType | null>(null);
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({
    width: 25,
    height: 8,
    depth: 20
  });

  const [currentTextures, setCurrentTextures] = useState<Record<SurfaceType, TextureOption>>({
    wall1: WALL_TEXTURES.find(t => t.id === 'floor-light-gray') || WALL_TEXTURES[0],
    wall2: WALL_TEXTURES.find(t => t.id === 'floor-light-gray') || WALL_TEXTURES[0], 
    wall3: WALL_TEXTURES.find(t => t.id === 'floor-light-gray') || WALL_TEXTURES[0],
    wall4: WALL_TEXTURES.find(t => t.id === 'floor-light-gray') || WALL_TEXTURES[0],
    floor: FLOOR_TEXTURES.find(t => t.id === 'floor-parquet') || FLOOR_TEXTURES[0]
  });

  // Floor repetition settings only
  const [floorRepetition, setFloorRepetition] = useState<RepetitionSettings>({ x: 25, y: 20 });

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

  const setTexture = useCallback((surface: SurfaceType, texture: TextureOption) => {
    // Don't set if it's the same texture
    if (currentTextures[surface].id === texture.id) return;
    
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
      setRoomDimensions,
      floorRepetition,
      setFloorRepetition
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