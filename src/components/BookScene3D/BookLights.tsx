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
  /** Couleur glow du thème (rgba string) */
  glowColor: string;
  /** Couleur spark du thème — utilisée pour la lumière de tranche */
  spineColor: string;
}

export const BookLights = ({ openProgress, spineColor }: BookLightsProps) => {
  const mainRef   = useRef<THREE.PointLight>(null!);
  const rimRef    = useRef<THREE.PointLight>(null!);
  const spineRef  = useRef<THREE.PointLight>(null!);
  const fillRef   = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    if (mainRef.current) {
      // Principale : 1.4 → 3.2 pendant ouverture
      mainRef.current.intensity = 1.4 + openProgress * 1.8;
    }
    if (spineRef.current) {
      // Tranche thématique : 0 → 4.5, couleur du livre
      spineRef.current.intensity = openProgress * 4.5;
    }
    if (rimRef.current) {
      rimRef.current.intensity = 0.45 + openProgress * 0.4;
    }
    if (fillRef.current) {
      // Uplighting magique s'intensifie à la suspension (phase 3)
      fillRef.current.intensity = 0.15 + openProgress * 0.55;
    }
  });

  return (
    <>
      {/* Ambiance générale — s'éclaircit légèrement à l'ouverture */}
      <ambientLight intensity={0.40 + openProgress * 0.15} color="#fff8f0" />

      {/* Lumière principale — warm top-right dramatique */}
      <pointLight
        ref={mainRef}
        position={[2.5, 4.5, 3]}
        color="#ffe8c0"
        intensity={1.4}
        distance={20}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-bias={-0.001}
      />

      {/* Rim light — cool, séparation du livre */}
      <pointLight
        ref={rimRef}
        position={[-4, 2, -3]}
        color="#d0e8ff"
        intensity={0.45}
        distance={12}
        decay={2}
      />

      {/* Lumière thématique de tranche — couleur du livre, jaillit à l'ouverture */}
      <pointLight
        ref={spineRef}
        position={[-0.5, 0, 1.8]}
        color={spineColor}
        intensity={0}
        distance={10}
        decay={1.2}
      />

      {/* Uplighting magique — sol réfléchissant + suspension */}
      <pointLight
        ref={fillRef}
        position={[0, -3.5, 2]}
        color={spineColor}
        intensity={0.15}
        distance={12}
        decay={2}
      />
    </>
  );
};
