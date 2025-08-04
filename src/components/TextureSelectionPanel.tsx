// src/components/TextureSelectionPanel.tsx
"use client";

import { useTexture, SurfaceType, TextureOption } from "@/contexts/TextureContext";
import { useState, useRef } from "react";

export default function TextureSelectionPanel() {
  const {
    selectedSurface,
    currentTextures,
    setTexture,
    wallTextures,
    floorTextures,
    setSelectedSurface,
  } = useTexture();
  
  const [activeTab, setActiveTab] = useState<'colors' | 'images' | 'custom'>('colors');
  const [customColor, setCustomColor] = useState('#ffffff');
  const [uploadedImages, setUploadedImages] = useState<TextureOption[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedSurface) return null;

  const isFloor = selectedSurface === 'floor';
  const availableTextures = isFloor ? floorTextures : wallTextures;
  const currentTexture = currentTextures[selectedSurface];

  // Filter textures by type
  const colorTextures = availableTextures.filter(t => t.type === 'color');
  const imageTextures = availableTextures.filter(t => t.type === 'image');
  const allImageTextures = [...imageTextures, ...uploadedImages];
  
  const displayTextures = activeTab === 'colors' ? colorTextures : 
                         activeTab === 'images' ? allImageTextures : [];

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

  const handleTextureSelect = (texture: TextureOption) => {
    setTexture(selectedSurface, texture);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    const customTexture: TextureOption = {
      id: `custom-color-${Date.now()}`,
      name: 'Custom Color',
      type: 'color',
      value: color
    };
    setTexture(selectedSurface, customTexture);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newTexture: TextureOption = {
          id: `uploaded-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: 'image',
          value: imageUrl
        };
        setUploadedImages(prev => [...prev, newTexture]);
        setTexture(selectedSurface, newTexture);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClose = () => {
    setSelectedSurface(null);
  };

  const renderTexturePreview = (texture: TextureOption) => {
    if (texture.type === 'color') {
      return (
        <div 
          className="w-16 h-16 rounded border-2 border-gray-600"
          style={{ backgroundColor: texture.value }}
        />
      );
    } else {
      return (
        <img
          src={texture.value}
          alt={texture.name}
          className="w-16 h-16 object-cover rounded border-2 border-gray-600"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0zMiA0OEMzOS4xNzk3IDQ4IDQ1IDQyLjE3OTcgNDUgMzVDNDUgMjcuODIwMyAzOS4xNzk3IDIyIDMyIDIyQzI0LjgyMDMgMjIgMTkgMjcuODIwMyAxOSAzNUMxOSA0Mi4xNzk3IDI0LjgyMDMgNDggMzIgNDhaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
          }}
        />
      );
    }
  };

  const renderCurrentTexturePreview = (texture: TextureOption) => {
    if (texture.type === 'color') {
      return (
        <div 
          className="w-12 h-12 rounded border-2 border-green-500"
          style={{ backgroundColor: texture.value }}
        />
      );
    } else {
      return (
        <img
          src={texture.value}
          alt="Current texture"
          className="w-12 h-12 object-cover rounded border-2 border-green-500"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMzc0MTUxIi8+CjxwYXRoIGQ9Ik0yNCAzNkMzMC42Mjc0IDM2IDM2IDMwLjYyNzQgMzYgMjRDMzYgMTcuMzcyNiAzMC42Mjc0IDEyIDI0IDEyQzE3LjM3MjYgMTIgMTIgMTcuMzcyNiAxMiAyNEMxMiAzMC42Mjc0IDE3LjM3MjYgMzYgMjQgMzZaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
          }}
        />
      );
    }
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
            {renderCurrentTexturePreview(currentTexture)}
            <div>
              <div className="text-sm font-medium">{currentTexture.name}</div>
              <div className="text-xs text-gray-400 capitalize">
                {currentTexture.type} {isFloor ? 'Floor' : 'Wall'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'colors'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Colors ({colorTextures.length})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'images'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Images ({allImageTextures.length})
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Available textures header */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-200">
            {activeTab === 'colors' ? 'Solid Colors' : 
             activeTab === 'images' ? 'Image Textures' : 
             'Custom Options'} for {isFloor ? 'Floor' : 'Walls'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {activeTab === 'colors' ? 'Click on a color to apply it' :
             activeTab === 'images' ? 'Click on a texture to apply it' :
             'Create custom colors or upload your own images'}
          </p>
        </div>

        {/* Custom Tab Content */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            {/* Custom Color Picker */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Custom Color</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-16 h-16 rounded cursor-pointer border-2 border-gray-600"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => handleCustomColorChange(e.target.value)}
                      placeholder="#ffffff"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Enter hex color code or use the color picker above
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-3">Upload Image</h4>
              <div className="space-y-3">
                <button
                  onClick={triggerImageUpload}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-gray-400 hover:text-gray-300"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm">Click to upload image</span>
                    <span className="text-xs text-gray-500">JPG, PNG, GIF up to 10MB</span>
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Texture grid - only show for colors and images tabs */}
        {(activeTab === 'colors' || activeTab === 'images') && (
          <div className="grid grid-cols-2 gap-3 pb-20">
            {displayTextures.map((texture, index) => (
              <button
                key={texture.id}
                onClick={() => handleTextureSelect(texture)}
                className={`
                  flex flex-col items-center p-3 rounded-lg border-2 transition-all
                  ${currentTexture.id === texture.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                  }
                `}
              >
                {renderTexturePreview(texture)}
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-white">
                    {texture.name}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {texture.type}
                  </div>
                </div>
                {currentTexture.id === texture.id && (
                  <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {(activeTab === 'colors' || activeTab === 'images') && displayTextures.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-sm">No {activeTab} available</div>
          </div>
        )}
      </div>
    </div>
  );
}