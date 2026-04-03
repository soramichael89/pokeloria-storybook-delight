import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { stories, Story } from '@/data/stories';
import StoryCard from './StoryCard';

interface StoryLibraryProps {
  onOpenStory: (story: Story) => void;
}

const CARD_WIDTH = 240;
const CARD_GAP = 12;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const DECEL = 0.94; // friction per frame
const MIN_VELOCITY = 0.3;
const SNAP_STIFFNESS = 0.12;
const SNAP_DAMPING = 0.78;

const StoryLibrary = ({ onOpenStory }: StoryLibraryProps) => {
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, offset: 0, time: 0 });
  const lastDrag = useRef({ x: 0, time: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const n = stories.length;

  // Wrap index to [0, n)
  const wrapIndex = (i: number) => ((i % n) + n) % n;

  // Get the "real" center index from offset
  const getCenterIndex = useCallback(() => {
    return wrapIndex(Math.round(offsetRef.current / CARD_STEP));
  }, [n]);

  const setPos = useCallback((v: number) => {
    offsetRef.current = v;
    setOffset(v);
  }, []);

  // Physics loop: inertia then snap
  const animate = useCallback(() => {
    if (isDragging.current) return;

    const vel = velocityRef.current;
    const absVel = Math.abs(vel);

    if (absVel > MIN_VELOCITY) {
      // Inertia phase
      velocityRef.current *= DECEL;
      setPos(offsetRef.current + velocityRef.current);
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // Snap phase
      const target = Math.round(offsetRef.current / CARD_STEP) * CARD_STEP;
      const diff = target - offsetRef.current;

      if (Math.abs(diff) < 0.5) {
        setPos(target);
        velocityRef.current = 0;
        return;
      }

      velocityRef.current = (velocityRef.current + diff * SNAP_STIFFNESS) * SNAP_DAMPING;
      setPos(offsetRef.current + velocityRef.current);
      rafRef.current = requestAnimationFrame(animate);
    }
  }, [setPos]);

  // Pointer handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    dragStart.current = { x: e.clientX, offset: offsetRef.current, time: Date.now() };
    lastDrag.current = { x: e.clientX, time: Date.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const now = Date.now();
    const dt = now - lastDrag.current.time || 1;
    velocityRef.current = (e.clientX - lastDrag.current.x) / dt * 16; // normalize to ~frame
    lastDrag.current = { x: e.clientX, time: now };
    setPos(dragStart.current.offset - dx);
  }, [setPos]);

  const onPointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Touch handlers for mobile
  const touchRef = useRef({ x: 0, time: 0 });
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    cancelAnimationFrame(rafRef.current);
    velocityRef.current = 0;
    const x = e.touches[0].clientX;
    dragStart.current = { x, offset: offsetRef.current, time: Date.now() };
    lastDrag.current = { x, time: Date.now() };
    touchRef.current = { x, time: Date.now() };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const x = e.touches[0].clientX;
    const dx = x - dragStart.current.x;
    const now = Date.now();
    const dt = now - lastDrag.current.time || 1;
    velocityRef.current = (x - lastDrag.current.x) / dt * 16;
    lastDrag.current = { x, time: now };
    setPos(dragStart.current.offset - dx);
  }, [setPos]);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Compute card transforms
  const centerFloat = offset / CARD_STEP;
  const activeIndex = wrapIndex(Math.round(centerFloat));

  // Render enough cards to fill viewport + buffer
  const visibleRange = 3; // cards on each side
  const cards: { story: Story; realIndex: number; posIndex: number }[] = [];
  const centerInt = Math.round(centerFloat);

  for (let i = centerInt - visibleRange; i <= centerInt + visibleRange; i++) {
    const realIndex = wrapIndex(i);
    cards.push({ story: stories[realIndex], realIndex, posIndex: i });
  }

  const scrollToIndex = (index: number) => {
    // Find closest path to target
    const current = centerFloat;
    let target = index;
    // Adjust for wrapping — find closest equivalent
    while (target - current > n / 2) target -= n;
    while (current - target > n / 2) target += n;
    
    cancelAnimationFrame(rafRef.current);
    const targetOffset = target * CARD_STEP;
    const diff = targetOffset - offsetRef.current;
    velocityRef.current = diff * 0.08;
    isDragging.current = false;
    rafRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-body text-muted-foreground mb-1">
            Bienvenue à Pokopia ✨
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">
            PokéLoria
          </h1>
          <p className="mt-2 text-sm font-body text-muted-foreground leading-relaxed">
            Des histoires douces et magiques à lire en famille, dans un univers Pokémon merveilleux.
          </p>
        </motion.div>
      </div>

      {/* Section title */}
      <div className="px-6 pt-4 pb-3">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg font-display font-semibold text-foreground"
        >
          📚 Bibliothèque
        </motion.h2>
      </div>

      {/* Physics carousel */}
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none touch-pan-y"
        style={{ height: '380px', cursor: isDragging.current ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '800px' }}>
          {cards.map(({ story, realIndex, posIndex }) => {
            const distFromCenter = posIndex - centerFloat;
            const absD = Math.abs(distFromCenter);
            
            const translateX = distFromCenter * CARD_STEP;
            const scale = 1 - Math.min(absD, 2) * 0.12;
            const rotateY = -distFromCenter * 6; // subtle 3D rotation
            const opacity = 1 - Math.min(absD, 2) * 0.35;
            const blur = Math.min(absD, 2) * 1.5;
            const zIndex = 10 - Math.round(absD * 10);

            return (
              <div
                key={`${posIndex}`}
                className="absolute"
                style={{
                  width: `${CARD_WIDTH}px`,
                  transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                  opacity,
                  filter: blur > 0.1 ? `blur(${blur}px)` : 'none',
                  zIndex,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity, filter',
                  pointerEvents: absD < 0.5 ? 'auto' : 'none',
                }}
              >
                <StoryCard story={story} onOpen={onOpenStory} index={realIndex} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pb-4 pt-2">
        {stories.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`rounded-full transition-all duration-300 ${
              index === activeIndex
                ? 'w-6 h-2 bg-primary'
                : 'w-2 h-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Bottom decorative area */}
      <div className="flex-1 flex items-end justify-center pb-10 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-xs text-muted-foreground text-center font-body"
        >
          Fais glisser pour découvrir les histoires →
        </motion.p>
      </div>
    </div>
  );
};

export default StoryLibrary;
