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
import SurfaceRadioManager from "./SurfaceRadioManager";

export default function Scene() {
  return (
    <TextureProvider>
      <div className="w-full h-screen bg-black relative">
        {/* 3D Canvas with radio button manager inside */}
        <Canvas
          className="absolute inset-0"
          style={{ zIndex: 1 }}
          camera={{
            fov: 65,
            near: 0.1,
            far: 1000,
            position: [0, 0, 0],
          }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <Lighting />
            <Room />
            <CameraController />
            <SurfaceRadioManager />
          </Suspense>
        </Canvas>

        {/* Texture Selection Panel - top layer */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
          <TextureSelectionPanel />
        </div>
      </div>
    </TextureProvider>
  );
}