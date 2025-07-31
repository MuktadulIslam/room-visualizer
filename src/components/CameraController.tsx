// src/components/CameraController.tsx
"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";

export default function CameraController() {
  const { camera } = useThree();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const targetRotationX = useRef(0);
  const targetRotationY = useRef(0);
  const isMouseDown = useRef(false);
  const lastMouseX = useRef(0);
  const lastMouseY = useRef(0);

  useEffect(() => {
    // Set initial camera position at the center of the room
    camera.position.set(0, 0, 0);

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) { // Left mouse button
        isMouseDown.current = true;
        lastMouseX.current = event.clientX;
        lastMouseY.current = event.clientY;
        
        // Change cursor to indicate dragging
        document.body.style.cursor = 'grabbing';
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
      // Reset cursor
      document.body.style.cursor = 'default';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown.current) return;

      // Calculate mouse movement delta
      const deltaX = event.clientX - lastMouseX.current;
      const deltaY = event.clientY - lastMouseY.current;

      // Update last mouse position
      lastMouseX.current = event.clientX;
      lastMouseY.current = event.clientY;

      // Normalize mouse position to -1 to 1
      mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY.current = -(event.clientY / window.innerHeight) * 2 + 1;

      // Calculate rotation based on mouse delta
      const rotationSpeed = 0.001;
      targetRotationY.current += deltaX * rotationSpeed;
      targetRotationX.current += deltaY * rotationSpeed;

      // Clamp vertical rotation to prevent over-rotation
      targetRotationX.current = Math.max(
        -Math.PI * 0.4, 
        Math.min(Math.PI * 0.4, targetRotationX.current)
      );
    };

    const animate = () => {
      // Smooth camera rotation
      camera.rotation.y += (targetRotationY.current - camera.rotation.y) * 0.1;
      camera.rotation.x += (targetRotationX.current - camera.rotation.x) * 0.1;

      // Ensure camera stays at center
      camera.position.set(0, 0, 0);

      requestAnimationFrame(animate);
    };

    // Add event listeners
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    
    // Handle mouse leave to stop rotation when cursor leaves window
    window.addEventListener("mouseleave", handleMouseUp);

    animate();

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [camera]);

  return null;
}