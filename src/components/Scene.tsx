// src/components/Scene.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Room from "./Room";
import CameraController from "./CameraController";
import Lighting from "./Lighting";
import LoadingScreen from "./LoadingScreen";
import { TextureProvider } from "@/contexts/TextureContext";
import TextureSelectionPanel from "./TextureSelectionPanel";

export default function Scene() {
  return (
    <TextureProvider>
      <div className="w-full h-screen bg-black relative">
        {/* Texture Selection Modal */}
        <TextureSelectionPanel />

        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0],
          }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Lighting />
            <Room />
            <CameraController />
          </Suspense>
        </Canvas>
      </div>
    </TextureProvider>
  );
}