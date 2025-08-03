// src/app/page.tsx
import Scene from "@/components/Scene";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <Scene />
      
      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 text-white bg-black/50 p-4 rounded-lg">
        <h1 className="text-xl font-bold mb-2">3D Room Viewer</h1>
        <p className="text-sm mb-1">Click and drag to look around</p>
        <p className="text-sm mb-1">Click radio buttons on surfaces to select them</p>
        <p className="text-sm">Texture options will appear on the right</p>
      </div>
    </main>
  );
}