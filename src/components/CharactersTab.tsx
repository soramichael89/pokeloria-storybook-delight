import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { characters, Character } from '@/data/characters';

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const TOTAL = characters.length;
const SETS = 3;

const colorMap: Record<string, string> = {
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  sage: 'bg-sage',
  sky: 'bg-sky',
};

const colorGradientMap: Record<string, string> = {
  peach: 'from-peach/40 to-peach-deep/20',
  lavender: 'from-lavender/40 to-lavender-deep/20',
  sage: 'from-sage/40 to-sage-deep/20',
  sky: 'from-sky/40 to-sky-deep/20',
};

const CharacterDetail = ({ character, onClose }: { character: Character; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-background flex flex-col"
  >
    <div className={`relative h-64 flex items-center justify-center bg-gradient-to-b ${colorGradientMap[character.colorKey]}`}>
      <span className="text-[7rem] leading-none">{character.emoji}</span>
      <button
        onClick={onClose}
        className="absolute top-14 left-5 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>
    </div>
    <div className="flex-1 px-6 pt-6 pb-24 overflow-y-auto">
      <h2 className="text-2xl font-display font-bold text-foreground">{character.name}</h2>
      <p className="text-sm font-body text-muted-foreground mt-1 italic">{character.tagline}</p>
      <div className="mt-5 h-px bg-border" />
      <p className="mt-5 text-base font-body text-foreground leading-[1.85]">{character.description}</p>
    </div>
  </motion.div>
);

const CharactersTab = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isRepositioning = useRef(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const allItems = Array.from({ length: SETS }, () => characters).flat();
  const midOffset = TOTAL;

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

    let minDist = Infinity;
    let closest = 0;
    newProgress.forEach((p, i) => {
      if (p < minDist) { minDist = p; closest = i; }
    });
    setActiveIndex(closest % TOTAL);

    const firstSetEnd = getCardCenter(TOTAL - 1, el.clientWidth);
    const lastSetStart = getCardCenter(TOTAL * 2, el.clientWidth);

    if (containerCenter <= firstSetEnd) {
      isRepositioning.current = true;
      scrollToVirtualIndex(closest + TOTAL);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    } else if (containerCenter >= lastSetStart) {
      isRepositioning.current = true;
      scrollToVirtualIndex(closest - TOTAL);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    }
  }, [allItems, scrollToVirtualIndex]);

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
    scrollToVirtualIndex(midOffset + index, 'smooth');
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-body text-muted-foreground mb-1">Habitants de Pokopia ✨</p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">Personnages</h1>
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
          🧑‍🤝‍🧑 Galerie
        </motion.h2>
      </div>

      {/* Horizontal coverflow carousel */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar pb-8 snap-x snap-mandatory"
        style={{
          gap: `${CARD_GAP}px`,
          paddingLeft: `calc((100% - ${CARD_WIDTH}px) / 2)`,
          paddingRight: `calc((100% - ${CARD_WIDTH}px) / 2)`,
        }}
      >
        {allItems.map((character, index) => {
          const progress = scrollProgress[index] ?? 1;
          const scale = 1 - progress * 0.15;
          const opacity = 1 - progress * 0.4;
          const blur = progress * 1.5;

          return (
            <div
              key={`${character.id}-${index}`}
              className="snap-center flex-shrink-0"
              style={{
                width: `${CARD_WIDTH}px`,
                transform: `scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
                willChange: 'transform, opacity, filter',
              }}
            >
              <button
                onClick={() => setSelectedCharacter(character)}
                className="w-full group cursor-pointer text-left"
              >
                <div className={`${colorMap[character.colorKey]} rounded-2xl overflow-hidden shadow-card`}>
                  <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center">
                    <span className="text-[5rem] leading-none">{character.emoji}</span>
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/40 to-transparent" />
                  </div>
                  <div className="p-4 pb-5">
                    <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2">
                      {character.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground font-body leading-relaxed">
                      {character.tagline}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 pb-4">
        {characters.map((_, index) => (
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

      <div className="flex-1" />

      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersTab;
