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
// Délai entre chaque page qui tourne (ms)
const PER_PAGE_DELAY = 160;
// La couverture commence à s'ouvrir à t=0 de l'animation d'ouverture
const COVER_OPEN_DELAY = 0;

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

  // --- Matériaux ---
  const spineMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: spineColor, roughness: 0.75, metalness: 0.05,
  }), [spineColor]);

  const frontMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: frontColor, roughness: 0.78, metalness: 0.04,
  }), [frontColor]);

  // Couverture générée via Canvas 2D (même look que StoryCard)
  const coverMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: frontColor, roughness: 0.78, metalness: 0.04,
  }), [frontColor]);

  useEffect(() => {
    generateCoverTexture(story, (tex) => {
      coverMat.map = tex;
      coverMat.needsUpdate = true;
    });
  }, [story, coverMat]);

  const pageBlockCream = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#f8f0dc', roughness: 0.9, metalness: 0.0,
  }), []);

  // Face avant du bloc (+Z, index 4) = last-page.jpg révélée quand toutes les pages ont flippé
  const lastPageUrl = bookPages[bookPages.length - 1];
  const pageBlockMats = useMemo(() => {
    const cream = pageBlockCream;
    const frontMat = new THREE.MeshStandardMaterial({
      color: '#f8f0dc', roughness: 0.85, metalness: 0.0,
    });
    if (lastPageUrl) {
      new THREE.TextureLoader().load(lastPageUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        frontMat.map = tex;
        frontMat.needsUpdate = true;
      });
    }
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z (back)
    return [cream, cream, cream, cream, frontMat, cream];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPageUrl]);

  // --- Déclencher les retournements en cascade ---
  useEffect(() => {
    if (!opening) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Retourner chaque page avec un délai staggeré
    for (let i = 0; i < PAGE_COUNT; i++) {
      const delay = COVER_OPEN_DELAY + i * PER_PAGE_DELAY;
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
    const totalDuration = COVER_OPEN_DELAY + (PAGE_COUNT - 1) * PER_PAGE_DELAY + 700;
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
    delay: COVER_OPEN_DELAY,
    config: { mass: 2.4, tension: 72, friction: 22 },
  });

  // --- Bande dorée sur la tranche ---
  const goldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9a84c',
    roughness: 0.3,
    metalness: 0.8,
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

      {/* ── Bloc de pages — face avant = last-page.jpg révélée après tous les flips ── */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[PAGE_W, PAGE_H, BOOK_D - 0.01]} />
        {pageBlockMats.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))}
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
      {/* Groupe pivot au bord gauche, mesh offset +PAGE_W/2 pour couvrir tout le livre */}
      <animated.group
        position={[-PAGE_W / 2, 0, BOOK_D / 2]}
        rotation-y={coverRotY}
      >
        <mesh position={[PAGE_W / 2, 0, 0]} castShadow receiveShadow>
          <planeGeometry args={[PAGE_W, PAGE_H]} />
          <primitive object={coverMat} attach="material" />
        </mesh>
        <CoverFrame />
      </animated.group>

      {/* ── Dos du livre ── */}
      <mesh
        position={[0, 0, -(BOOK_D / 2)]}
        rotation={[0, Math.PI, 0]}
        castShadow
      >
        <planeGeometry args={[PAGE_W, PAGE_H]} />
        <primitive object={frontMat} attach="material" />
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
