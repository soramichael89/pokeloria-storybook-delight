/**
 * PagePlane — une page individuelle qui se retourne autour de la tranche gauche
 *
 * Recto/verso : chaque page accepte deux URLs de texture optionnelles.
 * Si absentes → fallback crème décoratif.
 */
import { useRef, useMemo, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// Dimensions (cohérent avec BookMesh)
export const PAGE_W = 1.4;
export const PAGE_H = 2.2;

interface PagePlaneProps {
  index: number;
  total: number;
  turned: boolean;
  zOffset: number;
  coverColor: string;
  /** URL image face avant (recto) */
  rectoUrl?: string;
  /** URL image face arrière (verso) */
  versoUrl?: string;
}

// Matériaux fallback (crème) — partagés entre toutes les pages sans texture
const PAGE_CREAM_FRONT = new THREE.MeshStandardMaterial({
  color: '#fdf6e3',
  roughness: 0.85,
  metalness: 0.0,
  side: THREE.FrontSide,
});

const PAGE_CREAM_BACK = new THREE.MeshStandardMaterial({
  color: '#f5ead0',
  roughness: 0.9,
  metalness: 0.0,
  side: THREE.BackSide,
});

function usePageTexture(url?: string): THREE.Texture | null {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    loader.load(url, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      setTex(t);
    });
  }, [url]);
  return tex;
}

export const PagePlane = ({ index, total, turned, zOffset, rectoUrl, versoUrl }: PagePlaneProps) => {
  const groupRef = useRef<THREE.Group>(null!);

  const rectoTex = usePageTexture(rectoUrl);
  const versoTex = usePageTexture(versoUrl);

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PAGE_W, PAGE_H, 1, 1);
    g.translate(PAGE_W / 2, 0, 0);
    return g;
  }, []);

  // Matériaux avec texture si disponible, sinon fallback crème
  const rectoMat = useMemo(() => {
    if (!rectoTex) return PAGE_CREAM_FRONT;
    return new THREE.MeshStandardMaterial({
      map: rectoTex,
      roughness: 0.82,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
  }, [rectoTex]);

  const versoMat = useMemo(() => {
    if (!versoTex) return PAGE_CREAM_BACK;
    return new THREE.MeshStandardMaterial({
      map: versoTex,
      roughness: 0.85,
      metalness: 0.0,
      side: THREE.BackSide,
    });
  }, [versoTex]);

  // V4 : pages s'arrêtent vers 120° (mi-ouverture), spring fort momentum
  const { rotation } = useSpring({
    rotation: turned ? -(Math.PI * 0.67) : 0,
    config: { mass: 2.0, tension: 95, friction: 21 },
  });

  const stackZ = (total - index) * 0.004 + zOffset;

  return (
    <animated.group
      ref={groupRef}
      position={[-PAGE_W / 2, 0, stackZ]}
      rotation-y={rotation}
    >
      <mesh geometry={geo} material={rectoMat} receiveShadow />
      <mesh geometry={geo} material={versoMat} receiveShadow />
      {/* Fallback décoratif uniquement si pas de texture */}
      {!rectoUrl && !versoUrl && <TextLines turned={turned} />}
    </animated.group>
  );
};

// Lignes de "texte" décoratifs — fallback sans image
const LINE_WIDTHS   = [0.85, 0.92, 0.70, 0.88, 0.76, 0.91, 0.65, 0.82, 0.74, 0.88, 0.70];
const LINE_WIDTHS_B = [0.88, 0.78, 0.92, 0.70, 0.86, 0.74, 0.90, 0.80, 0.70, 0.84, 0.76];

const TextLines = ({ turned }: { turned: boolean }) => {
  const lines = turned ? LINE_WIDTHS_B : LINE_WIDTHS;
  const startY = (PAGE_H / 2) - 0.22;
  const lineH  = 0.012;
  const gap    = 0.165;
  return (
    <group position={[0.12, 0, 0.001]}>
      {lines.map((w, i) => (
        <mesh key={i} position={[(w * PAGE_W * 0.78) / 2 - 0.02, startY - i * gap, 0]}>
          <planeGeometry args={[w * PAGE_W * 0.78, lineH]} />
          <meshBasicMaterial color="#c8a870" transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
};
