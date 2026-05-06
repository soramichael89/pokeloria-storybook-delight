/**
 * BookLights — éclairage cinématique chaud pour la scène livre
 *
 * Setup :
 *  - AmbientLight faible (fill général)
 *  - PointLight warm top-right (lumière principale dramatique)
 *  - PointLight cool faint de derrière (rim light, séparation)
 *  - RectAreaLight subtil en dessous (uplighting magique)
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BookLightsProps {
  /** 0→1, progress de l'animation. La lumière s'intensifie à l'ouverture */
  openProgress: number;
  /** Couleur thème du livre (ex: 'rgba(255,155,90,0.55)') */
  glowColor: string;
}

export const BookLights = ({ openProgress }: BookLightsProps) => {
  const mainRef   = useRef<THREE.PointLight>(null!);
  const rimRef    = useRef<THREE.PointLight>(null!);
  const spineRef  = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    if (mainRef.current) {
      // Intensité principale : 1.2 au repos, monte à 2.8 quand le livre s'ouvre
      mainRef.current.intensity = 1.2 + openProgress * 1.6;
    }
    if (spineRef.current) {
      // Lumière de tranche : invisible au repos, explose à l'ouverture
      spineRef.current.intensity = openProgress * 3.5;
    }
    if (rimRef.current) {
      rimRef.current.intensity = 0.4 + openProgress * 0.3;
    }
  });

  return (
    <>
      {/* Ambiance générale — très douce */}
      <ambientLight intensity={0.35} color="#fff8f0" />

      {/* Lumière principale — warm top-right (comme une bougie au-dessus) */}
      <pointLight
        ref={mainRef}
        position={[3, 5, 3]}
        color="#ffe8c0"
        intensity={1.2}
        distance={18}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />

      {/* Rim light — cool, vient de derrière-gauche, séparation subtile */}
      <pointLight
        ref={rimRef}
        position={[-4, 2, -3]}
        color="#c8d8ff"
        intensity={0.4}
        distance={12}
        decay={2}
      />

      {/* Lumière de tranche — warm, sort de la tranche du livre quand il s'ouvre */}
      <pointLight
        ref={spineRef}
        position={[0, 0, 1.5]}
        color="#ffe5a0"
        intensity={0}
        distance={8}
        decay={1.5}
      />

      {/* Fill bas — uplighting très subtil, effet sol réfléchissant */}
      <pointLight
        position={[0, -4, 2]}
        color="#ffd8a0"
        intensity={0.15}
        distance={10}
        decay={2}
      />
    </>
  );
};
