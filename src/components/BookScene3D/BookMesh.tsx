/**
 * BookMesh — le livre 3D complet
 *
 * Structure :
 *  ┌─────────────────────────┐
 *  │  CoverFront             │  PlaneGeometry avec texture couverture
 *  │  PageStack (8 pages)    │  Pages cream qui se retournent
 *  │  SpineBox               │  BoxGeometry — tranche du livre
 *  │  CoverBack              │  PlaneGeometry — dos du livre
 *  │  PagesBlock             │  BoxGeometry fin — empilement pages (côté droit)
 *  └─────────────────────────┘
 *
 * Dimensions : 1.4 × 2.2 × 0.18 (unités Three.js)
 */
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import { PagePlane, PAGE_W, PAGE_H } from './PagePlane';
import { generateCoverTexture } from './coverTextureGenerator';

const BOOK_D  = 0.18;  // épaisseur totale
const SPINE_W = 0.08;  // largeur de la tranche

const PAGE_COUNT = 9;

// z de la face avant de la couverture (cover plane)
const COVER_Z = PAGE_COUNT * 0.004 + BOOK_D / 2 - 0.005 + 0.003; // 0.124
// Pages block : face avant flush sous la cover (évite le gap visible de côté)
// face avant = COVER_Z - 0.002, face arrière = -BOOK_D/2
const BLOCK_D = COVER_Z - 0.002 + BOOK_D / 2;          // ~0.212
const BLOCK_Z = (COVER_Z - 0.002 - BOOK_D / 2) / 2;   // ~0.016
// Délai entre chaque page qui tourne (ms)
const PER_PAGE_DELAY = 160;
// Délai avant que les pages commencent à flipper — laisse la cover s'écarter d'abord
const PAGE_START_DELAY = 200;

interface BookMeshProps {
  story: { title: string; theme: string; coverImage: string; colorKey: string };
  spineColor: string;
  frontColor: string;
  opening: boolean;
  onOpenComplete: () => void;
  bookPages?: string[];
}

export const BookMesh = ({
  story,
  spineColor,
  frontColor,
  opening,
  onOpenComplete,
  bookPages = [],
}: BookMeshProps) => {
  const [turnedPages, setTurnedPages] = useState<boolean[]>(Array(PAGE_COUNT).fill(false));
  const completedRef = useRef(false);

  // --- Matériaux — tous MeshBasicMaterial pour rester visibles sans éclairage directionnel ---
  const spineMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: spineColor,
  }), [spineColor]);

  const backCoverMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: frontColor,
    side: THREE.DoubleSide,
  }), [frontColor]);

  // Couverture générée via Canvas 2D
  const coverMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: frontColor,
  }), [frontColor]);

  const coverLoadedRef = useRef(false);
  const shimmerRef = useRef(0);

  useEffect(() => {
    coverLoadedRef.current = false;
    generateCoverTexture(story, (tex) => {
      coverMat.map = tex;
      coverMat.color.set(0xffffff);
      coverMat.needsUpdate = true;
      coverLoadedRef.current = true;
    });
  }, [story, coverMat]);

  // Shimmer pulse sur la cover pendant le chargement de la texture
  useFrame((_, delta) => {
    if (coverLoadedRef.current) return;
    shimmerRef.current += delta * 3;
    const t = (Math.sin(shimmerRef.current) * 0.5 + 0.5); // 0→1
    coverMat.color.lerpColors(
      new THREE.Color(frontColor),
      new THREE.Color(frontColor).lerp(new THREE.Color('#ffffff'), 0.45),
      t,
    );
  });

  const pageBlockMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#f0e6cc',
  }), []);

  // Dernière page — plane posé sur la face avant du bloc, révélée quand toutes les pages ont flippé
  const lastPageMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#f0e6cc' }), []);
  const lastPageUrl = bookPages[bookPages.length - 1];
  useEffect(() => {
    if (!lastPageUrl) return;
    new THREE.TextureLoader().load(lastPageUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      lastPageMat.map = tex;
      lastPageMat.needsUpdate = true;
    });
  }, [lastPageUrl, lastPageMat]);

  // --- Déclencher les retournements en cascade ---
  useEffect(() => {
    if (!opening) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Retourner chaque page avec un délai staggeré
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = PAGE_START_DELAY + i * PER_PAGE_DELAY;
      timers.push(
        setTimeout(() => {
          setTurnedPages(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, delay)
      );
    }

    // V4 : suspension magique 700ms après la dernière page
    const totalDuration = PAGE_START_DELAY + (PAGE_COUNT - 1) * PER_PAGE_DELAY + 700;
    timers.push(
      setTimeout(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onOpenComplete();
        }
      }, totalDuration)
    );

    return () => timers.forEach(clearTimeout);
  }, [opening, onOpenComplete]);

  // --- Animation ouverture couverture — s'arrête à mi-ouverture (~105°) ---
  // V4 : spring avec fort momentum initial → décélération naturelle
  const { coverRotY } = useSpring({
    coverRotY: opening ? -Math.PI * 0.58 : 0,
    config: { mass: 2.4, tension: 72, friction: 22 },
  });

  // --- Bande dorée sur la tranche ---
  const goldMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#c9a84c',
  }), []);

  return (
    <group>
      {/* ── Tranche (spine) ── */}
      <mesh
        position={[-(PAGE_W / 2 + SPINE_W / 2), 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[SPINE_W, PAGE_H, BOOK_D]} />
        <primitive object={spineMat} attach="material" />
      </mesh>

      {/* Bande dorée haut/bas de la tranche */}
      {[-PAGE_H / 2 + 0.05, PAGE_H / 2 - 0.05].map((y, i) => (
        <mesh key={i} position={[-(PAGE_W / 2 + SPINE_W / 2), y, 0]}>
          <boxGeometry args={[SPINE_W + 0.002, 0.025, BOOK_D + 0.002]} />
          <primitive object={goldMat} attach="material" />
        </mesh>
      ))}

      {/* ── Bloc de pages — visible sur tous les côtés (cream ivoire) ── */}
      <mesh position={[0, 0, BLOCK_Z]}>
        <boxGeometry args={[PAGE_W, PAGE_H, BLOCK_D]} />
        <primitive object={pageBlockMat} attach="material" />
      </mesh>

      {/* ── Dernière page — posée sur la face avant du bloc, cachée sous les pages jusqu'au dernier flip ── */}
      <mesh position={[0, 0, BLOCK_Z + BLOCK_D / 2 + 0.001]}>
        <planeGeometry args={[PAGE_W, PAGE_H]} />
        <primitive object={lastPageMat} attach="material" />
      </mesh>

      {/* ── Pages individuelles qui se retournent ── */}
      {Array.from({ length: PAGE_COUNT }, (_, i) => (
        <PagePlane
          key={i}
          index={i}
          total={PAGE_COUNT}
          turned={turnedPages[i]}
          zOffset={BOOK_D / 2 - 0.005}
          coverColor={frontColor}
          rectoUrl={bookPages[i * 2]}
          versoUrl={bookPages[i * 2 + 1]}
        />
      ))}

      {/* ── Couverture avant (avec texture) ── */}
      {/* z = au-dessus de toutes les PagePlanes (max stackZ = PAGE_COUNT*0.004 + BOOK_D/2-0.005 ≈ 0.121) */}
      <animated.group
        position={[-PAGE_W / 2, 0, PAGE_COUNT * 0.004 + BOOK_D / 2 - 0.005 + 0.003]}
        rotation-y={coverRotY}
      >
        <mesh position={[PAGE_W / 2, 0, 0]} castShadow receiveShadow>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
          <primitive object={coverMat} attach="material" />
        </mesh>
        <CoverFrame />
      </animated.group>

      {/* ── Dos du livre — DoubleSide pour être visible depuis tous les angles ── */}
      <mesh position={[0, 0, -(BOOK_D / 2) - 0.001]}>
        <planeGeometry args={[PAGE_W, PAGE_H]} />
        <primitive object={backCoverMat} attach="material" />
      </mesh>
    </group>
  );
};

// Cadre doré décoratif sur la couverture (lignes fines)
const CoverFrame = () => {
  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#c9a84c',
    transparent: true,
    opacity: 0.7,
  }), []);

  const outerGeo = useMemo(() => {
    const inset = 0.06;
    const w = PAGE_W / 2 - inset;
    const h = PAGE_H / 2 - inset;
    const pts = [
      new THREE.Vector3(-w, -h, 0.001),
      new THREE.Vector3( w, -h, 0.001),
      new THREE.Vector3( w,  h, 0.001),
      new THREE.Vector3(-w,  h, 0.001),
      new THREE.Vector3(-w, -h, 0.001),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const innerGeo = useMemo(() => {
    const inset = 0.1;
    const w = PAGE_W / 2 - inset;
    const h = PAGE_H / 2 - inset;
    const pts = [
      new THREE.Vector3(-w, -h, 0.001),
      new THREE.Vector3( w, -h, 0.001),
      new THREE.Vector3( w,  h, 0.001),
      new THREE.Vector3(-w,  h, 0.001),
      new THREE.Vector3(-w, -h, 0.001),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  return (
    <group position={[PAGE_W / 2, 0, 0.001]}>
      <primitive object={new THREE.Line(outerGeo, mat)} />
      <primitive object={new THREE.Line(innerGeo, mat)} />
    </group>
  );
};
