/**
 * FocusScene3D — scène Three.js unifiée pour FocusScreen + animation d'ouverture
 *
 * Phase focus  : caméra loin/isométrique, livre flotte, répond au drag en temps réel
 * Phase opening: triggered=true → caméra se centre, livre s'ouvre (phases 1→2→3)
 *
 * Permet une transition seamless sans coupure entre "regarder le livre" et "l'ouvrir".
 */
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { BookMesh } from './BookMesh';
import { BookLights } from './BookLights';
import { Story } from '@/data/stories';
import { THEME } from '@/lib/theme';

// ── Caméra : part de loin → frontale quand triggered ─────────────────────────
const CameraRig = ({ triggered, dragY }: { triggered: boolean; dragY: number }) => {
  const { camera } = useThree();
  const targetRef = useRef({ x: 0.28, y: 0.22, z: 7.5 });

  useEffect(() => {
    if (triggered) targetRef.current = { x: 0.05, y: 0.08, z: 4.8 };
  }, [triggered]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    // Léger zoom quand on tire vers le haut
    const zTarget = triggered ? targetRef.current.z : 7.5 + dragY * 0.004;
    const speed = triggered ? 2.8 : 1.2;
    camera.position.x += (targetRef.current.x - camera.position.x) * speed * dt;
    camera.position.y += (targetRef.current.y - camera.position.y) * speed * dt;
    camera.position.z += (zTarget - camera.position.z) * speed * dt;
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// ── Livre flottant — répond au drag + phases d'ouverture ─────────────────────
interface FloatingBookProps {
  story: Story;
  phase: number;
  dragX: number;
  dragY: number;
  onOpenComplete: () => void;
}

const FloatingBook = ({ story, phase, dragX, dragY, onOpenComplete }: FloatingBookProps) => {
  const th = THEME[story.colorKey] ?? THEME.peach;
  const floatRef = useRef(0);
  const posXRef = useRef(0);
  const posYRef = useRef(0);
  const meshGroupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (!meshGroupRef.current) return;
    const dt = Math.min(delta, 0.05);
    floatRef.current += dt;
    const floatY = Math.sin(floatRef.current * 1.9) * 0.09;

    // Position suit le doigt librement (clampée) — s'annule quand triggered
    const targetX = phase >= 1 ? 0 : dragX * 0.007;
    const targetY = phase >= 1 ? 0 : -dragY * 0.007;
    posXRef.current += (targetX - posXRef.current) * Math.min(1, dt * 12);
    posYRef.current += (targetY - posYRef.current) * Math.min(1, dt * 12);

    meshGroupRef.current.position.x = posXRef.current;
    meshGroupRef.current.position.y = floatY + posYRef.current;
  });

  // Rotation suit le drag dans toutes les directions
  const dragMag = Math.sqrt(dragX * dragX + dragY * dragY);
  const { rotX, rotY } = useSpring({
    rotX: phase >= 1 ? 0.05 : 0.12 - dragY * 0.006,   // drag haut → penche vers cam
    rotY: phase >= 1 ? 0.0  : -0.10 + dragX * 0.006,  // drag droite → tourne droite
    config: { mass: 0.5, tension: 320, friction: 22 },  // très réactif, colle au doigt
  });

  const { scale } = useSpring({
    scale: phase >= 2 ? 1.06 : 0.92 + Math.min(dragMag, 120) * 0.001,
    config: { mass: 0.6, tension: 200, friction: 18 },
  });

  return (
    <animated.group
      ref={meshGroupRef}
      rotation-x={rotX}
      rotation-y={rotY}
      scale={scale}
    >
      <BookMesh
        story={story}
        spineColor={th.spine}
        frontColor={th.front}
        opening={phase >= 2}
        onOpenComplete={onOpenComplete}
        bookPages={story.bookPages}
      />
    </animated.group>
  );
};

// ── Particules magiques (phase 3) ─────────────────────────────────────────────
const PARTICLE_COUNT = 72;
const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: ((i * 37 + 13) % 100 - 50) / 22,
  y: ((i * 61 + 7)  % 100 - 50) / 22,
  z: ((i * 23 + 5)  % 60  - 30) / 18,
  speed: 0.3 + ((i * 17) % 10) / 10,
}));

const MagicParticles = ({ active, themeColors }: { active: boolean; themeColors: string[] }) => {
  const pointsRef = useRef<THREE.Points>(null!);

  const geo = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors    = new Float32Array(PARTICLE_COUNT * 3);
    const color     = new THREE.Color();
    PARTICLE_DATA.forEach((p, i) => {
      positions[i * 3]     = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      color.set(themeColors[i % themeColors.length]);
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('color',    new THREE.BufferAttribute(colors,    3));
    return g;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mat = useRef(new THREE.PointsMaterial({
    size: 0.022, vertexColors: true, transparent: true,
    opacity: 0, sizeAttenuation: true,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.10;
    pointsRef.current.rotation.x += delta * 0.04;
    mat.current.opacity = active
      ? Math.min(mat.current.opacity + delta * 1.8, 0.9)
      : Math.max(mat.current.opacity - delta * 2.2, 0);
  });

  return <points ref={pointsRef} geometry={geo} material={mat.current} />;
};

// ── Scène interne ─────────────────────────────────────────────────────────────
interface FocusSceneProps {
  story: Story;
  triggered: boolean;
  dragX: number;
  dragY: number;
  onTransitionToReader: () => void;
}

const FocusSceneInner = ({ story, triggered, dragX, dragY, onTransitionToReader }: FocusSceneProps) => {
  const [phase, setPhase] = useState(0);
  const [openProgress, setOpenProgress] = useState(0);
  const progressRef = useRef(0);
  const th = THEME[story.colorKey] ?? THEME.peach;

  useEffect(() => {
    if (!triggered) return;
    const ts = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2600),
    ];
    return () => ts.forEach(clearTimeout);
  }, [triggered]);

  useFrame((_, delta) => {
    if (phase >= 2 && progressRef.current < 1) {
      const dt = Math.min(delta, 0.05);
      progressRef.current = Math.min(progressRef.current + dt * 0.55, 1);
      setOpenProgress(progressRef.current);
    }
  });

  const handleOpenComplete = useCallback(() => {
    setTimeout(onTransitionToReader, 600);
  }, [onTransitionToReader]);

  const themeColors = [th.spark, th.spark, th.front, '#fffef0', th.spark, '#ffffff', th.front, th.spark];

  return (
    <>
      <CameraRig triggered={triggered} dragY={dragY} />
      <BookLights openProgress={openProgress} glowColor={th.glow} spineColor={th.spark} />
      <FloatingBook story={story} phase={phase} dragX={dragX} dragY={dragY} onOpenComplete={handleOpenComplete} />
      <MagicParticles active={phase >= 3} themeColors={themeColors} />
    </>
  );
};

// ── Composant exporté ─────────────────────────────────────────────────────────
interface FocusScene3DProps {
  story: Story;
  triggered: boolean;
  dragX: number;
  dragY: number;
  onComplete: () => void;
}

export const FocusScene3D = ({ story, triggered, dragX, dragY, onComplete }: FocusScene3DProps) => {
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [introOpacity, setIntroOpacity] = useState(0);
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Fade-in d'entrée — la scène apparaît doucement depuis la bibliothèque
  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIntroOpacity(1));
    });
  }, []);

  const handleTransitionToReader = useCallback(() => {
    setOverlayOpacity(1);
    setTimeout(onComplete, 500);
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0,
      opacity: introOpacity,
      transition: 'opacity 0.35s ease-out',
    }}>
      <Canvas
        camera={{ position: [0.28, 0.22, 7.5], fov: 42 }}
        gl={{ antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'default', failIfMajorPerformanceCaveat: false }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color(th.bg1), 0);
        }}
      >
        <FocusSceneInner
          story={story}
          triggered={triggered}
          dragX={dragX}
          dragY={dragY}
          onTransitionToReader={handleTransitionToReader}
        />
      </Canvas>

      {/* Overlay fade vers le reader */}
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

export default FocusScene3D;
