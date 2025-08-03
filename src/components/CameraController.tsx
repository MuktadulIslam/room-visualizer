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

  const rotationSpeed = 0.02; // Reduced for smoother rotation with arrows
  const mouseRotationSpeed = 0.002;

  const yaw = useRef(0);
  const pitch = useRef(0);

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
      // Wheel can still be used for forward/backward movement if desired
      // For now, we'll disable it to focus on arrow rotation
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
  }, [camera, gl]);

  useFrame(() => {
    const keys = keysPressed.current;

    // Arrow key rotation controls
    if (keys.has('ArrowLeft')) {
      yaw.current += rotationSpeed; // Rotate left
    }
    if (keys.has('ArrowRight')) {
      yaw.current -= rotationSpeed; // Rotate right
    }
    if (keys.has('ArrowUp')) {
      pitch.current = Math.min(pitch.current + rotationSpeed, Math.PI / 2); // Look up
    }
    if (keys.has('ArrowDown')) {
      pitch.current = Math.max(pitch.current - rotationSpeed, -Math.PI / 2); // Look down
    }

    // Apply rotation to camera
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
  });

  return null;
}