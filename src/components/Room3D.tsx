// src/components/canvas/Room3DCanvas.tsx
"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import Room from '@/components/rooms/room1/Room';
import RoomControls from '@/components/canvas/RoomControls'
import Sidebar from './sidebar/Sidebar';
import PlayGround from './PlayGround';
import HtmlLoader from './SuspenseLoader';
import ObjectControls from './ObjectControls';
import { MeshProvider, useMeshContext } from './MeshContext';
import { RoomProvider, useRoomContext } from './RoomDimensionsContext';
import FullscreenWrapper from '@/app/FullscreenWrapper';
import * as THREE from 'three';

// Custom Camera Controller Component
function CameraController() {
    const { camera, gl } = useThree();
    const isMoving = useRef(false);
    const previousMousePosition = useRef({ x: 0, y: 0 });
    const cameraRotation = useRef({ x: 0, y: 0 });

    // Set initial camera position
    React.useEffect(() => {
        camera.position.set(0, 3, 8);
        camera.lookAt(0, 0, 0);
    }, [camera]);

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 0) { // Left mouse button
            isMoving.current = true;
            previousMousePosition.current = { x: event.clientX, y: event.clientY };
            gl.domElement.style.cursor = 'grabbing';
        }
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!isMoving.current) return;

        const deltaX = event.clientX - previousMousePosition.current.x;
        const deltaY = event.clientY - previousMousePosition.current.y;

        // Sensitivity factor
        const sensitivity = 0.003;

        // Update rotation values
        cameraRotation.current.y -= deltaX * sensitivity;
        cameraRotation.current.x -= deltaY * sensitivity;

        // Limit vertical rotation to prevent flipping
        cameraRotation.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, cameraRotation.current.x));

        // Apply rotation to camera
        const radius = 8; // Distance from center
        camera.position.x = radius * Math.sin(cameraRotation.current.y) * Math.cos(cameraRotation.current.x);
        camera.position.y = 3 + radius * Math.sin(cameraRotation.current.x);
        camera.position.z = radius * Math.cos(cameraRotation.current.y) * Math.cos(cameraRotation.current.x);

        camera.lookAt(0, 0, 0);

        previousMousePosition.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
        isMoving.current = false;
        gl.domElement.style.cursor = 'grab';
    };

    const handleWheel = (event: WheelEvent) => {
        const zoomSensitivity = 0.001;
        const currentDistance = camera.position.length();
        const newDistance = Math.max(2, Math.min(20, currentDistance + event.deltaY * zoomSensitivity));
        
        const direction = camera.position.clone().normalize();
        camera.position.copy(direction.multiplyScalar(newDistance));
    };

    React.useEffect(() => {
        const canvas = gl.domElement;
        canvas.style.cursor = 'grab';

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);
        canvas.addEventListener('wheel', handleWheel);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
            canvas.removeEventListener('wheel', handleWheel);
        };
    }, [gl, camera]);

    return null;
}

function Room3DCanvasContent() {
    const [controlsVisible, setControlsVisible] = useState<boolean>(true);
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
    const [currentObject, setCurrentObject] = useState<{ component: React.ReactNode } | null>(null)
    const [orbitEnabled, setOrbitEnabled] = useState(true)
    const [freezeOrbit, setFreezeOrbit] = useState(false)
    const [useCustomControls, setUseCustomControls] = useState(false);

    // Use mesh context
    const { isObjectControlsVisible } = useMeshContext();
    const { dimensions: roomDimensions, setLength: setRoomLength, setWidth: setRoomWidth } = useRoomContext();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+S combination
            if (event.ctrlKey && event.shiftKey && event.key === 'S') {
                event.preventDefault(); // Prevent default browser save dialog
                setSidebarVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+F combination
            if (event.ctrlKey && event.shiftKey && event.key === 'F') {
                event.preventDefault(); // Prevent default browser save dialog
                setFreezeOrbit(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+Z combination
            if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
                event.preventDefault(); // Prevent default browser save dialog
                setControlsVisible(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check for Ctrl+Shift+C combination to toggle control type
            if (event.ctrlKey && event.shiftKey && event.key === 'C') {
                event.preventDefault();
                setUseCustomControls(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleDragStart = (component: React.ReactNode) => {
        setCurrentObject({ component })
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#226764a8]">
            <Sidebar
                onDragStart={handleDragStart}
                visible={sidebarVisible}
            />
            {controlsVisible &&
                <RoomControls
                    length={roomDimensions.length}
                    width={roomDimensions.width}
                    onWidthChange={setRoomWidth}
                    onLengthChange={setRoomLength}
                />
            }
            {isObjectControlsVisible && (
                <ObjectControls />
            )}

            {/* Control type indicator */}
            <div className="absolute top-5 left-5 bg-black/70 text-white px-3 py-1 rounded-lg text-sm z-50">
                Controls: {useCustomControls ? 'Custom' : 'Orbit'} | Ctrl+Shift+C to toggle
            </div>

            <Canvas
                camera={{ fov: 60, position: [0, 3, 8] }}
                shadows
                style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
            >
                <Suspense fallback={<HtmlLoader />}>
                    {/* Lighting */}
                    <ambientLight intensity={0.4} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1}
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                    />
                    <pointLight
                        position={[roomDimensions.width / 2 - 1, 3, -roomDimensions.length / 2 + 1]}
                        intensity={0.8}
                        color="#fff8dc"
                    />

                    {/* Room structure */}
                    <PlayGround
                        key={`${roomDimensions.width}-${roomDimensions.length}`}
                        currentObject={currentObject}
                        setCurrentObject={setCurrentObject}
                        setOrbitEnabled={setOrbitEnabled}
                        roomWidth={roomDimensions.width}
                        roomLength={roomDimensions.length}
                    >
                        <Room width={roomDimensions.width} length={roomDimensions.length} />
                    </PlayGround>

                    {/* Environment and controls */}
                    <Environment preset="apartment" />
                    
                    {/* Conditional controls */}
                    {useCustomControls ? (
                        <CameraController />
                    ) : (
                        <OrbitControls
                            enabled={orbitEnabled && !freezeOrbit}
                            minDistance={2}
                            maxDistance={20}
                            enableDamping={true}
                            dampingFactor={0.05}
                            rotateSpeed={0.8}
                            zoomSpeed={1.2}
                            panSpeed={0.8}
                            maxPolarAngle={Math.PI / 2.2}
                            minPolarAngle={Math.PI / 6}
                            target={[0, 0, 0]}
                        />
                    )}
                </Suspense>
            </Canvas>
        </div>
    );
};

export default function Room3DCanvas() {
    return (
        <FullscreenWrapper>
            <RoomProvider initialDimensions={{ width: 20, length: 25, height: 5 }}>
                <MeshProvider>
                    <Room3DCanvasContent />
                </MeshProvider>
            </RoomProvider>
        </FullscreenWrapper>
    );
}