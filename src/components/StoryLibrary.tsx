import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { stories, Story } from '@/data/stories';
import StoryCard from './StoryCard';

interface StoryLibraryProps {
  onOpenStory: (story: Story) => void;
}

const CARD_WIDTH = 260;
const CARD_GAP = 16;

const StoryLibrary = ({ onOpenStory }: StoryLibraryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState<number[]>(stories.map((_, i) => i === 0 ? 0 : 1));

  const computeProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const newProgress = stories.map((_, i) => {
      const cardCenter = (CARD_WIDTH + CARD_GAP) * i + CARD_WIDTH / 2;
      // padding offset
      const offset = (el.clientWidth - CARD_WIDTH) / 2;
      const adjustedCenter = cardCenter + offset;
      const distance = Math.abs(containerCenter - adjustedCenter);
      // Normalize: 0 = center, 1 = far away
      return Math.min(distance / (CARD_WIDTH + CARD_GAP), 1);
    });

    setScrollProgress(newProgress);

    // Find closest to center
    let minDist = Infinity;
    let closest = 0;
    newProgress.forEach((p, i) => {
      if (p < minDist) { minDist = p; closest = i; }
    });
    setActiveIndex(closest);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', computeProgress, { passive: true });
    computeProgress();
    return () => el.removeEventListener('scroll', computeProgress);
  }, [computeProgress]);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const padding = (el.clientWidth - CARD_WIDTH) / 2;
    const scrollTarget = (CARD_WIDTH + CARD_GAP) * index + CARD_WIDTH / 2 - el.clientWidth / 2 + padding;
    el.scrollTo({ left: scrollTarget, behavior: 'smooth' });
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
        {stories.map((story, index) => {
          const progress = scrollProgress[index] ?? 1;
          const scale = 1 - progress * 0.15; // 1 → 0.85
          const opacity = 1 - progress * 0.4; // 1 → 0.6
          const blur = progress * 1.5; // 0 → 1.5px

          return (
            <div
              key={story.id}
              className="snap-center flex-shrink-0"
              style={{
                width: `${CARD_WIDTH}px`,
                transform: `scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
                transition: 'transform 0.3s ease-out, opacity 0.3s ease-out, filter 0.3s ease-out',
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
