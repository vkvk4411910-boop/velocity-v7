import { Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

function DayCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    if (!meshRef.current || !edgesRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.5;
    edgesRef.current.rotation.x = t * 0.3;
    edgesRef.current.rotation.y = t * 0.5;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    edgesRef.current.position.y = Math.sin(t * 0.8) * 0.15;
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

  useFrame((state) => {
    if (!meshRef.current || !edgesRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.3;
    meshRef.current.rotation.y = t * 0.5;
    edgesRef.current.rotation.x = t * 0.3;
    edgesRef.current.rotation.y = t * 0.5;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    edgesRef.current.position.y = Math.sin(t * 0.8) * 0.15;
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
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
    >
      {isDayMode ? <DayCube /> : <NightCube />}
    </Canvas>
  );
}
