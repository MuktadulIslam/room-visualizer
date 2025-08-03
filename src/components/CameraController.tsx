// src/components/CameraController.tsx
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function CameraController() {
  const { camera, gl } = useThree();
  const keysPressed = useRef<Set<string>>(new Set());
  const isMouseDown = useRef(false);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const rotationSpeed = 0.1;
  const moveSpeed = 0.1;
  const verticalLookSpeed = 0.1;
  const mouseRotationSpeed = 0.002;

  const yaw = useRef(0);
  const pitch = useRef(0);

  // Room dimensions (matching your Room component size=10)
  const roomSize = 10;
  const wallThickness = 0.1;
  const margin = 0.5; // Keep camera away from walls

  // Calculate camera boundaries (keep camera inside room with some margin)
  const maxX = roomSize / 2 - wallThickness - margin;
  const minX = -roomSize / 2 + wallThickness + margin;
  const maxZ = roomSize / 2 - wallThickness - margin;
  const minZ = -roomSize / 2 + wallThickness + margin;

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.code);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        isMouseDown.current = true;
        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
        gl.domElement.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        isMouseDown.current = false;
        gl.domElement.style.cursor = 'grab';
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isMouseDown.current) {
        const deltaX = event.clientX - mouseX.current;
        const deltaY = event.clientY - mouseY.current;

        yaw.current -= deltaX * mouseRotationSpeed;
        pitch.current -= deltaY * mouseRotationSpeed;
        pitch.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch.current));

        mouseX.current = event.clientX;
        mouseY.current = event.clientY;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const direction = new THREE.Vector3(0, 0, event.deltaY * 0.001);
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0; // Keep movement only horizontal

      const newPosition = camera.position.clone().add(direction);

      // Keep camera within room bounds and maintain fixed Y position
      newPosition.x = Math.max(minX, Math.min(maxX, newPosition.x));
      newPosition.z = Math.max(minZ, Math.min(maxZ, newPosition.z));
      newPosition.y = camera.position.y; // Keep Y position unchanged

      camera.position.copy(newPosition);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });

    gl.domElement.style.cursor = 'grab';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl, minX, maxX, minZ, maxZ]);

  useFrame(() => {
    const keys = keysPressed.current;

    // Rotation (left/right arrows)
    if (keys.has('ArrowLeft')) {
      yaw.current += rotationSpeed;
    }
    if (keys.has('ArrowRight')) {
      yaw.current -= rotationSpeed;
    }

    // Vertical look (U/D keys)
    if (keys.has('KeyU')) {
      pitch.current = Math.min(pitch.current + verticalLookSpeed, Math.PI / 3);
    }
    if (keys.has('KeyD')) {
      pitch.current = Math.max(pitch.current - verticalLookSpeed, -Math.PI / 3);
    }

    // Movement (up/down arrows)
    const direction = new THREE.Vector3();

    if (keys.has('ArrowUp')) {
      direction.z -= moveSpeed;
    }
    if (keys.has('ArrowDown')) {
      direction.z += moveSpeed;
    }

    // Apply rotation to camera
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');

    // Apply movement relative to camera's rotation
    if (direction.length() > 0) {
      const currentY = camera.position.y;
      direction.applyQuaternion(camera.quaternion);
      direction.y = 0; // Keep movement horizontal only
      camera.position.add(direction);

      // Keep Y position fixed
      camera.position.y = currentY;

      // Boundary limits (keep within room)
      camera.position.x = Math.max(minX, Math.min(maxX, camera.position.x));
      camera.position.z = Math.max(minZ, Math.min(maxZ, camera.position.z));
    }
  });

  return null;
}