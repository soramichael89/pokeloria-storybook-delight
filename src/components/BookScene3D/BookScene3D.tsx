/**
 * BookScene3D — Canvas WebGL isolé pour l'animation d'ouverture du livre
 *
 * Flow :
 *  Phase 1 (0-900ms)    : livre flotte, caméra se place (angle isométrique → frontal)
 *  Phase 2 (900-2800ms) : couverture + pages s'ouvrent
 *  Phase 3 (2800-3400ms): glow warm + fade out vers reader
 *
 * Lazy-loaded → ne charge Three.js que lors de l'animation.
 * Fallback automatique si WebGL indisponible.
 */
import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { BookMesh } from './BookMesh';
import { BookLights } from './BookLights';
import { Story } from '@/data/stories';
import { THEME, GOLD } from '@/lib/theme';

// ── Caméra cinématique ────────────────────────────────────────────────────────
interface CameraRigProps {
  phase: number;
}

const CameraRig = ({ phase }: CameraRigProps) => {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0, y: 0, z: 6 });

  // Positions caméra par phase
  const POSITIONS = [
    { x:  0.6, y:  0.8, z: 6.0 },  // phase 0 → entrée légèrement oblique
    { x:  0.2, y:  0.3, z: 5.2 },  // phase 1 → se rapproche, se centre
    { x:  0.0, y:  0.1, z: 4.6 },  // phase 2 → quasi-frontal pendant ouverture
    { x:  0.0, y:  0.0, z: 3.8 },  // phase 3 → zoom final dans le livre
  ];

  const p = POSITIONS[Math.min(phase, POSITIONS.length - 1)];

  useEffect(() => {
    targetRef.current = { x: p.x, y: p.y, z: p.z };
  }, [p.x, p.y, p.z]);

  useFrame((_, delta) => {
    const speed = 1.8;
    camera.position.x += (targetRef.current.x - camera.position.x) * speed * delta;
    camera.position.y += (targetRef.current.y - camera.position.y) * speed * delta;
    camera.position.z += (targetRef.current.z - camera.position.z) * speed * delta;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ── Livre flottant ────────────────────────────────────────────────────────────
interface FloatingBookProps {
  story: Story;
  phase: number;
  onOpenComplete: () => void;
}

const FloatingBook = ({ story, phase, onOpenComplete }: FloatingBookProps) => {
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Flottement doux continu
  const floatRef = useRef(0);
  const meshGroupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    floatRef.current += delta;
    if (meshGroupRef.current) {
      meshGroupRef.current.position.y = Math.sin(floatRef.current * 0.8) * 0.04;
    }
  });

  // Rotation initiale isométrique → devient frontal à la phase 1
  const { rotX, rotY } = useSpring({
    rotX: phase >= 1 ? 0.08 : 0.55,
    rotY: phase >= 1 ? 0.0  : -0.32,
    config: { mass: 1.6, tension: 90, friction: 28 },
  });

  // Scale : le livre monte en taille légèrement à l'ouverture
  const { scale } = useSpring({
    scale: phase >= 2 ? 1.06 : 1.0,
    config: { mass: 1, tension: 120, friction: 22 },
  });

  return (
    <animated.group
      ref={meshGroupRef}
      rotation-x={rotX}
      rotation-y={rotY}
      scale={scale}
    >
      <BookMesh
        coverImageUrl={story.coverImage}
        spineColor={th.spine}
        frontColor={th.front}
        opening={phase >= 2}
        onOpenComplete={onOpenComplete}
      />
    </animated.group>
  );
};

// ── Particules magiques légères ───────────────────────────────────────────────
const PARTICLE_COUNT = 60;
const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: ((i * 37 + 13) % 100 - 50) / 25,
  y: ((i * 61 + 7)  % 100 - 50) / 25,
  z: ((i * 23 + 5)  % 60  - 30) / 20,
  speed: 0.3 + ((i * 17) % 10) / 10,
  size:  0.012 + ((i * 3) % 8) / 800,
}));

const PASTEL_COLORS = [
  '#ffd1a8', '#e0c8ff', '#c8e8d0', '#bfe0f2',
  '#ffe4ec', '#fff3c8', '#ffc9d6', '#d4f0e8',
];

const MagicParticles = ({ active }: { active: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const { opacity } = useSpring({
    opacity: active ? 1 : 0,
    config: { duration: 600 },
  });

  const geo = createParticleGeometry();
  const mat = useRef(new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.12;
    // Sync opacity from spring
    mat.current.opacity = active ? Math.min(mat.current.opacity + delta * 1.5, 0.85) : Math.max(mat.current.opacity - delta * 2, 0);
  });

  return (
    <points ref={pointsRef} geometry={geo} material={mat.current} />
  );
};

function createParticleGeometry() {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const color     = new THREE.Color();

  PARTICLE_DATA.forEach((p, i) => {
    positions[i * 3]     = p.x;
    positions[i * 3 + 1] = p.y;
    positions[i * 3 + 2] = p.z;
    color.set(PASTEL_COLORS[i % PASTEL_COLORS.length]);
    colors[i * 3]     = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
  return geo;
}

// ── Scène principale ──────────────────────────────────────────────────────────
interface SceneProps {
  story: Story;
  onTransitionToReader: () => void;
}

const Scene = ({ story, onTransitionToReader }: SceneProps) => {
  const [phase, setPhase] = useState(0);
  const [openProgress, setOpenProgress] = useState(0);
  const progressRef = useRef(0);
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Phases temporelles
  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 400),   // livre se redresse
      setTimeout(() => setPhase(2), 900),   // ouverture commence
      setTimeout(() => setPhase(3), 2600),  // glow final
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  // Progress d'ouverture (0→1) pour les lumières
  useFrame((_, delta) => {
    if (phase >= 2 && progressRef.current < 1) {
      progressRef.current = Math.min(progressRef.current + delta * 0.55, 1);
      setOpenProgress(progressRef.current);
    }
  });

  const handleOpenComplete = useCallback(() => {
    // Les pages ont fini de tourner → transition vers reader
    setTimeout(onTransitionToReader, 600);
  }, [onTransitionToReader]);

  return (
    <>
      <CameraRig phase={phase} />
      <BookLights openProgress={openProgress} glowColor={th.glow} />
      <FloatingBook story={story} phase={phase} onOpenComplete={handleOpenComplete} />
      <MagicParticles active={phase >= 3} />

      {/* Plan sol pour les ombres (invisible mais récepteur) */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial transparent opacity={0.12} />
      </mesh>
    </>
  );
};

// ── Composant exporté ─────────────────────────────────────────────────────────
interface BookScene3DProps {
  story: Story;
  onComplete: () => void;
}

export const BookScene3D = ({ story, onComplete }: BookScene3DProps) => {
  const [canvasOpacity, setCanvasOpacity] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Fade in du canvas
  useEffect(() => {
    requestAnimationFrame(() => setCanvasOpacity(1));
  }, []);

  const handleTransitionToReader = useCallback(() => {
    // Fade out vers le reader (fond crème)
    setOverlayOpacity(1);
    setTimeout(onComplete, 500);
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      opacity: canvasOpacity,
      transition: 'opacity 0.25s ease-out',
      background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`,
    }}>
      <Canvas
        camera={{ position: [0.6, 0.8, 6], fov: 42 }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(th.bg1), 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Scene story={story} onTransitionToReader={handleTransitionToReader} />
      </Canvas>

      {/* Overlay de transition vers le reader (fond crème) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'hsl(44,38%,97%)',
        opacity: overlayOpacity,
        transition: 'opacity 0.5s ease-in',
        pointerEvents: 'none',
        zIndex: 20,
      }} />
    </div>
  );
};

export default BookScene3D;
