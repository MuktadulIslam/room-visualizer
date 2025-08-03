// src/components/TextureSelectionPanel.tsx
"use client";

import { useTexture, SurfaceType } from "@/contexts/TextureContext";
export default function TextureSelectionPanel() {
  const {
    selectedSurface,
    currentTextures,
    setTexture,
    wallTextures,
    floorTextures,
    setSelectedSurface,
  } = useTexture();

  if (!selectedSurface) return null;

  const isFloor = selectedSurface === 'floor';
  const availableTextures = isFloor ? floorTextures : wallTextures;
  const currentTexture = currentTextures[selectedSurface];

  const getSurfaceLabel = (type: SurfaceType) => {
    switch (type) {
      case 'wall1': return 'Front Wall';
      case 'wall2': return 'Back Wall';
      case 'wall3': return 'Left Wall';
      case 'wall4': return 'Right Wall';
      case 'floor': return 'Floor';
      default: return type;
    }
  };

  const getTextureName = (texturePath: string) => {
    const fileName = texturePath.split('/').pop() || '';
    return fileName.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleTextureSelect = (texture: string) => {
    setTexture(selectedSurface, texture);
  };

  const handleClose = () => {
    setSelectedSurface(null);
  };

  return (
    <div className={`
      fixed top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-xl 
      transform transition-transform duration-300 ease-in-out z-50 pointer-events-auto
      ${selectedSurface ? 'translate-x-0' : 'translate-x-full'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">
            Room Designer
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white hover:rotate-180 transition-all duration-300 w-10 h-10 flex items-center justify-center rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>

          </button>
        </div>
        <div className="text-sm text-gray-400 mt-1">
          {getSurfaceLabel(selectedSurface)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-full overflow-y-auto pb-20">
        {/* Current selection indicator */}
        <div className="mb-6 p-3 bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">Current texture:</div>
          <div className="flex items-center space-x-3">
            <img
              src={currentTexture}
              alt="Current texture"
              className="w-12 h-12 object-cover rounded border-2 border-green-500"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
              }}
            />
            <span className="text-sm">{getTextureName(currentTexture)}</span>
          </div>
        </div>

        {/* Available textures header */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-200">
            Available {isFloor ? 'Floor' : 'Wall'} Textures
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Click on a texture to apply it
          </p>
        </div>

        {/* Texture list */}
        <div className="space-y-3 pb-20">
          {availableTextures.map((texture, index) => (
            <button
              key={index}
              onClick={() => handleTextureSelect(texture)}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all
                ${currentTexture === texture
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                }
              `}
            >
              <img
                src={texture}
                alt={getTextureName(texture)}
                className="w-16 h-16 object-cover rounded border"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0zMiA0OEMzOS4xNzk3IDQ4IDQ1IDQyLjE3OTcgNDUgMzVDNDUgMjcuODIwMyAzOS4xNzk3IDIyIDMyIDIyQzI0LjgyMDMgMjIgMTkgMjcuODIwMyAxOSAzNUMxOSA0Mi4xNzk3IDI0LjgyMDMgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
                }}
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">
                  {getTextureName(texture)}
                </div>
                <div className="text-xs text-gray-400">
                  {isFloor ? 'Floor' : 'Wall'} Texture
                </div>
              </div>
              {currentTexture === texture && (
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}