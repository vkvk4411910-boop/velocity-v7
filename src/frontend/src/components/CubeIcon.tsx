import { Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

interface CubeMeshProps {
  label: string;
  isHovered: boolean;
  size?: number;
  isDayMode: boolean;
}

function GoldenCubeMesh({ isHovered, size = 1, isDayMode }: CubeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef({ speed: 0.005 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isHovered) {
      rotationRef.current.speed = Math.min(
        rotationRef.current.speed + delta * 4,
        0.12,
      );
    } else {
      rotationRef.current.speed = Math.max(
        rotationRef.current.speed - delta * 2,
        0.005,
      );
    }
    meshRef.current.rotation.y += rotationRef.current.speed;
    meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
  });

  return (
    <>
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size, size]} />
        {isDayMode ? (
          <meshPhysicalMaterial
            color="#C8E8F0"
            metalness={0.05}
            roughness={0.0}
            transmission={0.82}
            thickness={2.0}
            envMapIntensity={4}
            iridescence={0.8}
            iridescenceIOR={1.4}
            ior={1.5}
            transparent
            opacity={0.9}
            attenuationColor="#A8D8EA"
            attenuationDistance={0.5}
          />
        ) : (
          <meshPhysicalMaterial
            color="#C9A84C"
            metalness={1}
            roughness={0.08}
            transmission={0.25}
            thickness={0.5}
            envMapIntensity={2}
            reflectivity={1}
            iridescence={0.3}
            iridescenceIOR={1.5}
          />
        )}
      </mesh>
      <Environment preset={isDayMode ? "park" : "city"} />
    </>
  );
}

// Crystal hexagon jewel for V7 logo
function CrystalHexagon() {
  const hexRef = useRef<THREE.Mesh>(null);
  const colorRef = useRef({ hue: 0 });
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((_, delta) => {
    if (!hexRef.current || !matRef.current) return;
    hexRef.current.rotation.y += delta * 1.8;
    hexRef.current.rotation.x += delta * 0.7;

    colorRef.current.hue = (colorRef.current.hue + delta * 40) % 360;
    const h = colorRef.current.hue;
    // Cycle: ice blue -> gold -> rose -> back
    let r: number;
    let g: number;
    let b: number;
    if (h < 120) {
      const t = h / 120;
      // #A8D8EA -> #C9A84C
      r = 0.659 + t * (0.788 - 0.659);
      g = 0.847 + t * (0.659 - 0.847);
      b = 0.918 + t * (0.298 - 0.918);
    } else if (h < 240) {
      const t = (h - 120) / 120;
      // #C9A84C -> #E8A0BF
      r = 0.788 + t * (0.91 - 0.788);
      g = 0.659 + t * (0.627 - 0.659);
      b = 0.298 + t * (0.749 - 0.298);
    } else {
      const t = (h - 240) / 120;
      // #E8A0BF -> #A8D8EA
      r = 0.91 + t * (0.659 - 0.91);
      g = 0.627 + t * (0.847 - 0.627);
      b = 0.749 + t * (0.918 - 0.749);
    }
    matRef.current.color.setRGB(r, g, b);
  });

  return (
    <mesh ref={hexRef}>
      <cylinderGeometry args={[0.28, 0.28, 0.55, 6]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#A8D8EA"
        transmission={0.92}
        roughness={0.02}
        metalness={0.05}
        iridescence={1.0}
        iridescenceIOR={1.5}
        envMapIntensity={3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

interface CubeIconProps {
  label: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export function CubeIcon({
  label,
  size = 40,
  className = "",
  onClick,
}: CubeIconProps) {
  const [hovered, setHovered] = useState(false);
  const { isDayMode } = useTheme();

  return (
    <button
      type="button"
      className={`relative cursor-pointer bg-transparent border-0 p-0 ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
      >
        {isDayMode ? (
          <>
            <ambientLight intensity={1.0} color="#F0F8FF" />
            <directionalLight
              position={[5, 8, 5]}
              intensity={4}
              color="#FFFACD"
            />
            <pointLight
              position={[-4, -4, 4]}
              intensity={1.5}
              color="#A8D8EA"
            />
          </>
        ) : (
          <>
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]} intensity={2} color="#FFD700" />
            <pointLight
              position={[-2, -2, 2]}
              intensity={0.8}
              color="#C9A84C"
            />
          </>
        )}
        <GoldenCubeMesh
          label={label}
          isHovered={hovered}
          size={0.85}
          isDayMode={isDayMode}
        />
      </Canvas>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          color: isDayMode ? "rgba(20,40,80,0.9)" : "rgba(0,0,0,0.85)",
          fontWeight: 700,
          fontSize: "10px",
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.05em",
          textShadow: isDayMode
            ? "0 1px 2px rgba(168,216,234,0.7)"
            : "0 1px 2px rgba(255,215,0,0.5)",
          zIndex: 10,
        }}
      >
        {label}
      </div>
    </button>
  );
}

// V7 logo cube - larger, with inner crystal hexagon
export function V7LogoCube({ onClick }: { onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const { isDayMode } = useTheme();

  return (
    <button
      type="button"
      className="relative cursor-pointer bg-transparent border-0 p-0"
      style={{ width: 56, height: 56 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
      >
        {isDayMode ? (
          <>
            <ambientLight intensity={1.0} color="#F0F8FF" />
            <directionalLight
              position={[5, 8, 5]}
              intensity={4}
              color="#FFFACD"
            />
            <pointLight
              position={[-4, -4, 4]}
              intensity={1.5}
              color="#A8D8EA"
            />
          </>
        ) : (
          <>
            <ambientLight intensity={0.5} />
            <pointLight position={[4, 4, 4]} intensity={3} color="#FFD700" />
            <pointLight position={[-3, -2, 3]} intensity={1} color="#C9A84C" />
            <spotLight
              position={[0, 5, 5]}
              intensity={2}
              color="#FFF8DC"
              angle={0.4}
            />
          </>
        )}
        {/* Outer glass cube */}
        <V7OuterCube isHovered={hovered} isDayMode={isDayMode} />
        {/* Inner crystal hexagon jewel */}
        <CrystalHexagon />
        <Environment preset={isDayMode ? "park" : "city"} />
      </Canvas>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          color: isDayMode ? "rgba(20,40,80,0.95)" : "rgba(255,255,255,0.95)",
          fontWeight: 900,
          fontSize: "13px",
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.05em",
          textShadow: isDayMode
            ? "0 1px 3px rgba(168,216,234,0.9)"
            : "0 1px 3px rgba(255,215,0,0.8)",
          zIndex: 10,
        }}
      >
        V7
      </div>
    </button>
  );
}

function V7OuterCube({
  isHovered,
  isDayMode,
}: { isHovered: boolean; isDayMode: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rotationRef = useRef({ speed: 0.005 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (isHovered) {
      rotationRef.current.speed = Math.min(
        rotationRef.current.speed + delta * 4,
        0.1,
      );
    } else {
      rotationRef.current.speed = Math.max(
        rotationRef.current.speed - delta * 2,
        0.005,
      );
    }
    meshRef.current.rotation.y += rotationRef.current.speed;
    meshRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.12;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      {isDayMode ? (
        <meshPhysicalMaterial
          color="#C8E8F0"
          metalness={0.05}
          roughness={0.0}
          transmission={0.82}
          thickness={2.0}
          envMapIntensity={4}
          iridescence={0.8}
          iridescenceIOR={1.4}
          ior={1.5}
          transparent
          opacity={0.9}
          attenuationColor="#A8D8EA"
          attenuationDistance={0.5}
        />
      ) : (
        <meshPhysicalMaterial
          color="#C9A84C"
          metalness={0.8}
          roughness={0.05}
          transmission={0.55}
          thickness={0.5}
          envMapIntensity={2.5}
          reflectivity={1}
          iridescence={0.4}
          iridescenceIOR={1.5}
          transparent
          opacity={0.72}
        />
      )}
    </mesh>
  );
}
