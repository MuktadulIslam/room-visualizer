// src/components/LoadingScreen.tsx
"use client";

import { Html, useProgress } from "@react-three/drei";

export default function LoadingScreen() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="text-2xl font-bold mb-2">Loading...</div>
        <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-sm">{progress.toFixed(0)}%</div>
      </div>
    </Html>
  );
}