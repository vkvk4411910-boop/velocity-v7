import { Environment } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

interface DragState {
  isDragging: boolean;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
  userRotX: number;
  userRotY: number;
}

function useDragRotation() {
  const { gl } = useThree();
  const drag = useRef<DragState>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    userRotX: 0,
    userRotY: 0,
  });

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      drag.current.isDragging = true;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
      drag.current.velocityX = 0;
      drag.current.velocityY = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.isDragging) return;
      const dx = e.clientX - drag.current.lastX;
      const dy = e.clientY - drag.current.lastY;
      drag.current.velocityX = dy * 0.01;
      drag.current.velocityY = dx * 0.01;
      drag.current.userRotX += dy * 0.01;
      drag.current.userRotY += dx * 0.01;
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
    };

    const onPointerUp = () => {
      drag.current.isDragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
    };
  }, [gl]);

  return drag;
}

function DayCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const drag = useDragRotation();

  useFrame((state) => {
    if (!meshRef.current || !edgesRef.current) return;
    const t = state.clock.getElapsedTime();
    const d = drag.current;

    if (d.isDragging) {
      // While dragging: apply user rotation directly
      meshRef.current.rotation.x = d.userRotX;
      meshRef.current.rotation.y = d.userRotY;
    } else {
      // Decay velocity
      d.velocityX *= 0.92;
      d.velocityY *= 0.92;
      d.userRotX += d.velocityX;
      d.userRotY += d.velocityY;

      const momentum = Math.abs(d.velocityX) + Math.abs(d.velocityY);

      if (momentum > 0.001) {
        // Momentum phase: apply user rotation with decaying velocity
        meshRef.current.rotation.x = d.userRotX;
        meshRef.current.rotation.y = d.userRotY;
      } else {
        // Auto-rotate phase: blend back to auto-rotation
        meshRef.current.rotation.x = t * 0.3;
        meshRef.current.rotation.y = t * 0.5;
      }
    }

    edgesRef.current.rotation.x = meshRef.current.rotation.x;
    edgesRef.current.rotation.y = meshRef.current.rotation.y;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    edgesRef.current.position.y = meshRef.current.position.y;
  });

  return (
    <>
      <ambientLight intensity={0.8} color="#e8f4ff" />
      <pointLight position={[5, 5, 5]} intensity={4} color="#ffffff" />
      <pointLight position={[-5, -5, 3]} intensity={2} color="#b0d4ff" />
      <spotLight
        position={[0, 8, 4]}
        intensity={3}
        color="#ffffff"
        angle={0.5}
      />
      <Environment preset="city" />
      <mesh ref={meshRef}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshPhysicalMaterial
          color="#c0d8f0"
          metalness={1}
          roughness={0.05}
          transmission={0.35}
          thickness={1.5}
          envMapIntensity={3}
          reflectivity={1}
          iridescence={0.5}
          iridescenceIOR={1.8}
          transparent
          opacity={0.85}
          attenuationColor={new THREE.Color("#cceeff")}
          attenuationDistance={3.0}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 2.2, 2.2)]} />
        <lineBasicMaterial color="#88ccff" linewidth={2} />
      </lineSegments>
    </>
  );
}

function NightCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const drag = useDragRotation();

  useFrame((state) => {
    if (!meshRef.current || !edgesRef.current) return;
    const t = state.clock.getElapsedTime();
    const d = drag.current;

    if (d.isDragging) {
      meshRef.current.rotation.x = d.userRotX;
      meshRef.current.rotation.y = d.userRotY;
    } else {
      d.velocityX *= 0.92;
      d.velocityY *= 0.92;
      d.userRotX += d.velocityX;
      d.userRotY += d.velocityY;

      const momentum = Math.abs(d.velocityX) + Math.abs(d.velocityY);

      if (momentum > 0.001) {
        meshRef.current.rotation.x = d.userRotX;
        meshRef.current.rotation.y = d.userRotY;
      } else {
        meshRef.current.rotation.x = t * 0.3;
        meshRef.current.rotation.y = t * 0.5;
      }
    }

    edgesRef.current.rotation.x = meshRef.current.rotation.x;
    edgesRef.current.rotation.y = meshRef.current.rotation.y;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    edgesRef.current.position.y = meshRef.current.position.y;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={4} color="#FFD700" />
      <pointLight position={[-5, -5, 3]} intensity={2} color="#C9A84C" />
      <spotLight
        position={[0, 8, 4]}
        intensity={3}
        color="#FFF8DC"
        angle={0.5}
      />
      <Environment preset="city" />
      <mesh ref={meshRef}>
        <boxGeometry args={[2.2, 2.2, 2.2]} />
        <meshPhysicalMaterial
          color="#C9A84C"
          metalness={1}
          roughness={0.05}
          transmission={0.35}
          thickness={1.5}
          envMapIntensity={3}
          reflectivity={1}
          iridescence={0.5}
          iridescenceIOR={1.8}
          transparent
          opacity={0.85}
        />
      </mesh>
      <lineSegments ref={edgesRef}>
        <edgesGeometry args={[new THREE.BoxGeometry(2.2, 2.2, 2.2)]} />
        <lineBasicMaterial color="#FFD700" linewidth={2} />
      </lineSegments>
    </>
  );
}

export function HeroCube() {
  const { isDayMode } = useTheme();

  return (
    <Canvas
      camera={{ position: [0, 0, 6.5], fov: 42 }}
      style={{ width: "100%", height: "100%", cursor: "grab" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {isDayMode ? <DayCube /> : <NightCube />}
    </Canvas>
  );
}
