/**
 * PagePlane — une page individuelle qui se retourne autour de la tranche gauche
 *
 * Chaque page est un PlaneGeometry avec deux faces (front/back).
 * L'animation rotateY 0 → -π utilise @react-spring/three pour
 * un easing spring physique naturel.
 */
import { useRef, useMemo } from 'react';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

// Dimensions (cohérent avec BookMesh)
export const PAGE_W = 1.4;
export const PAGE_H = 2.2;

interface PagePlaneProps {
  /** Index dans la pile (0 = couverture) */
  index: number;
  /** Nombre total de pages */
  total: number;
  /** true = cette page doit se retourner */
  turned: boolean;
  /** Décalage Z pour l'effet d'empilement */
  zOffset: number;
  /** Couleur de la tranche/couverture (fallback) */
  coverColor: string;
}

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

export const PagePlane = ({ index, total, turned, zOffset, coverColor }: PagePlaneProps) => {
  const groupRef = useRef<THREE.Group>(null!);

  // Le pivot de rotation est le bord gauche de la page
  // On décale la géométrie de +PAGE_W/2 sur X pour que le pivot soit à gauche
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(PAGE_W, PAGE_H, 1, 1);
    // Déplacer les vertices pour que l'origine soit sur le bord gauche
    g.translate(PAGE_W / 2, 0, 0);
    return g;
  }, []);

  const { rotation } = useSpring({
    rotation: turned ? -Math.PI + 0.04 : 0,
    config: {
      mass: 1.2,
      tension: 130,
      friction: 22,
    },
  });

  // Z position dans la pile
  const stackZ = (total - index) * 0.004 + zOffset;

  return (
    // Le groupe positionne le pivot au bord gauche du livre (x = -PAGE_W/2)
    <animated.group
      ref={groupRef}
      position={[-PAGE_W / 2, 0, stackZ]}
      rotation-y={rotation}
    >
      {/* Face avant de la page (crème clair) */}
      <mesh geometry={geo} material={PAGE_CREAM_FRONT} receiveShadow />
      {/* Face arrière de la page (crème légèrement plus sombre) */}
      <mesh geometry={geo} material={PAGE_CREAM_BACK} receiveShadow />

      {/* Lignes décoratives légères (simulant du texte imprimé) */}
      <TextLines turned={turned} />
    </animated.group>
  );
};

// Lignes de "texte" décoratifs sur chaque page
const LINE_WIDTHS = [0.85, 0.92, 0.70, 0.88, 0.76, 0.91, 0.65, 0.82, 0.74, 0.88, 0.70];
const LINE_WIDTHS_B = [0.88, 0.78, 0.92, 0.70, 0.86, 0.74, 0.90, 0.80, 0.70, 0.84, 0.76];

const TextLines = ({ turned }: { turned: boolean }) => {
  const lines = turned ? LINE_WIDTHS_B : LINE_WIDTHS;
  const startY = (PAGE_H / 2) - 0.22;
  const lineH = 0.012;
  const gap = 0.165;

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
