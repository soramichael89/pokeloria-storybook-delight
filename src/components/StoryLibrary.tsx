import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { stories, Story } from '@/data/stories';
import StoryCard from './StoryCard';

interface StoryLibraryProps {
  onOpenStory: (story: Story) => void;
}

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const TOTAL = stories.length;
const SETS = 3; // render 3 copies for infinite illusion

const StoryLibrary = ({ onOpenStory }: StoryLibraryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isRepositioning = useRef(false);
  const allItems = Array.from({ length: SETS }, () => stories).flat();
  const midOffset = TOTAL; // index offset where the "real" middle set starts

  const [scrollProgress, setScrollProgress] = useState<number[]>(
    allItems.map((_, i) => (i === midOffset ? 0 : 1))
  );

  const getCardCenter = (index: number, clientWidth: number) => {
    const padding = (clientWidth - CARD_WIDTH) / 2;
    return (CARD_WIDTH + CARD_GAP) * index + CARD_WIDTH / 2 + padding;
  };

  const scrollToVirtualIndex = useCallback((index: number, behavior: ScrollBehavior = 'instant') => {
    const el = scrollRef.current;
    if (!el) return;
    const target = getCardCenter(index, el.clientWidth) - el.clientWidth / 2;
    el.scrollTo({ left: target, behavior });
  }, []);

  const computeProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isRepositioning.current) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const newProgress = allItems.map((_, i) => {
      const cardCenter = getCardCenter(i, el.clientWidth);
      const distance = Math.abs(containerCenter - cardCenter);
      return Math.min(distance / (CARD_WIDTH + CARD_GAP), 1);
    });

    setScrollProgress(newProgress);

    // Find closest to center
    let minDist = Infinity;
    let closest = 0;
    newProgress.forEach((p, i) => {
      if (p < minDist) { minDist = p; closest = i; }
    });
    setActiveIndex(closest % TOTAL);

    // Reposition if scrolled into the first or last clone set
    const firstSetEnd = getCardCenter(TOTAL - 1, el.clientWidth);
    const lastSetStart = getCardCenter(TOTAL * 2, el.clientWidth);

    if (containerCenter <= firstSetEnd) {
      // Scrolled into first clone set → jump to middle set
      isRepositioning.current = true;
      const offset = closest + TOTAL;
      scrollToVirtualIndex(offset);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    } else if (containerCenter >= lastSetStart) {
      // Scrolled into last clone set → jump to middle set
      isRepositioning.current = true;
      const offset = closest - TOTAL;
      scrollToVirtualIndex(offset);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    }
  }, [allItems, scrollToVirtualIndex]);

  // Initialize scroll to middle set
  useEffect(() => {
    scrollToVirtualIndex(midOffset);
  }, [scrollToVirtualIndex, midOffset]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', computeProgress, { passive: true });
    computeProgress();
    return () => el.removeEventListener('scroll', computeProgress);
  }, [computeProgress]);

  const scrollToIndex = (index: number) => {
    // Find the virtual index in the middle set closest to current view
    scrollToVirtualIndex(midOffset + index, 'smooth');
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

      {/* Coverflow carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar pb-8 snap-x snap-mandatory"
        style={{
          gap: `${CARD_GAP}px`,
          paddingLeft: `calc((100% - ${CARD_WIDTH}px) / 2)`,
          paddingRight: `calc((100% - ${CARD_WIDTH}px) / 2)`,
        }}
      >
        {allItems.map((story, index) => {
          const progress = scrollProgress[index] ?? 1;
          const scale = 1 - progress * 0.15;
          const opacity = 1 - progress * 0.4;
          const blur = progress * 1.5;

          return (
            <div
              key={`${story.id}-${index}`}
              className="snap-center flex-shrink-0"
              style={{
                width: `${CARD_WIDTH}px`,
                transform: `scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
                willChange: 'transform, opacity, filter',
              }}
            >
              <StoryCard story={story} onOpen={onOpenStory} index={index} />
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pb-4">
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

      {/* Spacer */}
      <div className="flex-1" />
    </div>
  );
};

export default StoryLibrary;
