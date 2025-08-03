// src/components/DebugPanel.tsx
"use client";

import { useState } from "react";

interface DebugPanelProps {
  onTextureChange: (textureType: string, imagePath: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

// Predefined texture options
const WALL_TEXTURES = [
  { name: "Default Wall 1", path: "/wall1.png" },
  { name: "Default Wall 2", path: "/wall2.png" },
  { name: "Default Wall 3", path: "/wall3.png" },
  { name: "Default Wall 4", path: "/wall4.png" },
  { name: "Brick Pattern", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYnJpY2siIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSIzMCI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjYjc0MTJhIi8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjYTQzYjI2IiBzdHJva2U9IiM5MDMxMjAiIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHg9IjMwIiB5PSIwIiB3aWR0aD0iMzAiIGhlaWdodD0iMTUiIGZpbGw9IiNhNDNiMjYiIHN0cm9rZT0iIzkwMzEyMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iMzAiIGhlaWdodD0iMTUiIGZpbGw9IiNhNDNiMjYiIHN0cm9rZT0iIzkwMzEyMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNicmljaykiLz48L3N2Zz4=" },
  { name: "Wood Grain", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Indvb2QiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGI2ZjQ3O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYTY4YjViO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6Izc0NWUzOTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCN3b29kKSIvPjwvc3ZnPg==" },
];

const FLOOR_TEXTURES = [
  { name: "Default Floor", path: "/floor.png" },
  { name: "Checkerboard", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iY2hlY2tlciIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IiNmZmZmZmYiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMwMDAwMDAiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzAwMDAwMCIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjY2hlY2tlcikiLz48L3N2Zz4=" },
  { name: "Wooden Floor", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0id29vZGZsb29yIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZGViODg3Ii8+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjUwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZDRhNTc0IiBzdHJva2U9IiNjNDk1NjQiIHN0cm9rZS13aWR0aD0iMSIvPjxyZWN0IHg9IjUwIiB5PSIwIiB3aWR0aD0iNTAiIGhlaWdodD0iMjAiIGZpbGw9IiNkNGE1NzQiIHN0cm9rZT0iI2M0OTU2NCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCN3b29kZmxvb3IpIi8+PC9zdmc+" },
  { name: "Marble Tiles", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ibWFyYmxlIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiPjxyZWN0IHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgZmlsbD0iI2Y4ZjhmOCIgc3Ryb2tlPSIjZGRkZGRkIiBzdHJva2Utd2lkdGg9IjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ1cmwoI21hcmJsZSkiLz48L3N2Zz4=" },
  { name: "Carpet", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjkiIG51bU9jdGF2ZXM9IjQiIHNlZWQ9IjIiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOGQzNTNiIi8+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM4ZDM1M2IiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==" },
  { name: "Concrete", path: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJjb25jcmV0ZSI+PGZlVHVyYnVsZW5jZSBiYXNlRnJlcXVlbmN5PSIwLjUiIG51bU9jdGF2ZXM9IjMiIHNlZWQ9IjEiLz48ZmVDb2xvck1hdHJpeCB0eXBlPSJzYXR1cmF0ZSIgdmFsdWVzPSIwIi8+PC9maWx0ZXI+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOWY5ZjlmIi8+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM5ZjlmOWYiIGZpbHRlcj0idXJsKCNjb25jcmV0ZSkiIG9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==" },
];

export default function DebugPanel({ onTextureChange, isOpen, onToggle }: DebugPanelProps) {
  const [selectedSurface, setSelectedSurface] = useState<string>("");
  
  const surfaceOptions = [
    { id: "wall1", label: "Front Wall", type: "wall" },
    { id: "wall2", label: "Back Wall", type: "wall" },
    { id: "wall3", label: "Left Wall", type: "wall" },
    { id: "wall4", label: "Right Wall", type: "wall" },
    { id: "floor", label: "Floor", type: "floor" },
  ];

  const handleSurfaceChange = (surfaceId: string) => {
    setSelectedSurface(surfaceId);
  };

  const handleTextureSelect = (imagePath: string) => {
    if (selectedSurface) {
      onTextureChange(selectedSurface, imagePath);
    }
  };

  const getTextureOptions = () => {
    if (!selectedSurface) return [];
    
    const selectedOption = surfaceOptions.find(option => option.id === selectedSurface);
    return selectedOption?.type === "wall" ? WALL_TEXTURES : FLOOR_TEXTURES;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        {isOpen ? "Hide Panel" : "Debug Panel"}
      </button>

      {/* Debug Panel */}
      <div
        className={`fixed top-16 right-4 w-80 bg-gray-900 text-white rounded-lg shadow-xl p-4 z-40 transition-transform max-h-[80vh] overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-lg font-bold mb-4 text-center">Texture Selection Panel</h2>
        
        {/* Surface Selection */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3 text-gray-300">Select Surface to Change:</h3>
          <div className="space-y-2">
            {surfaceOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
              >
                <input
                  type="radio"
                  name="surface"
                  value={option.id}
                  checked={selectedSurface === option.id}
                  onChange={(e) => handleSurfaceChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">
                  {option.label}
                  <span className="text-xs text-gray-400 ml-1">
                    ({option.type === "wall" ? "Wall" : "Floor"})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Texture Options */}
        {selectedSurface && (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-md font-semibold mb-3 text-gray-300">
              Choose Texture for {surfaceOptions.find(opt => opt.id === selectedSurface)?.label}:
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {getTextureOptions().map((texture, index) => (
                <button
                  key={index}
                  onClick={() => handleTextureSelect(texture.path)}
                  className="group relative bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors border border-gray-600 hover:border-blue-500"
                >
                  {/* Texture Preview */}
                  <div className="w-full h-16 bg-gray-700 rounded mb-2 overflow-hidden">
                    <img
                      src={texture.path}
                      alt={texture.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center text-2xl">
                      🖼️
                    </div>
                  </div>
                  
                  <div className="text-xs font-medium text-center text-gray-300 group-hover:text-white">
                    {texture.name}
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center space-y-1">
            <div>💡 Step 1: Select a surface to change</div>
            <div>💡 Step 2: Choose a texture from the list</div>
            {!selectedSurface && (
              <div className="text-yellow-400 mt-2">
                ⚠️ Please select a surface first
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}