import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { characters, Character } from '@/data/characters';

const CARD_HEIGHT = 340;
const GAP = 20;
const TOTAL = characters.length;
const SETS = 3;

const colorGradientMap: Record<string, string> = {
  peach: 'from-peach/40 to-peach-deep/20',
  lavender: 'from-lavender/40 to-lavender-deep/20',
  sage: 'from-sage/40 to-sage-deep/20',
  sky: 'from-sky/40 to-sky-deep/20',
};

const colorBorderMap: Record<string, string> = {
  peach: 'border-peach-deep/20',
  lavender: 'border-lavender-deep/20',
  sage: 'border-sage-deep/20',
  sky: 'border-sky-deep/20',
};

const CharacterDetail = ({ character, onClose }: { character: Character; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-40 bg-background flex flex-col"
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
  const isRepositioning = useRef(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  const allItems = Array.from({ length: SETS }, () => characters).flat();
  const midOffset = TOTAL;

  const getItemCenter = (index: number, clientHeight: number) => {
    const padding = (clientHeight - CARD_HEIGHT) / 2;
    return (CARD_HEIGHT + GAP) * index + CARD_HEIGHT / 2 + padding;
  };

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'instant') => {
    const el = scrollRef.current;
    if (!el) return;
    const target = getItemCenter(index, el.clientHeight) - el.clientHeight / 2;
    el.scrollTo({ top: target, behavior });
  }, []);

  const [scrollProgress, setScrollProgress] = useState<number[]>(
    allItems.map((_, i) => (i === midOffset ? 0 : 1))
  );

  const computeProgress = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isRepositioning.current) return;

    const containerCenter = el.scrollTop + el.clientHeight / 2;
    const newProgress = allItems.map((_, i) => {
      const itemCenter = getItemCenter(i, el.clientHeight);
      const distance = Math.abs(containerCenter - itemCenter);
      return Math.min(distance / (CARD_HEIGHT + GAP), 2);
    });

    setScrollProgress(newProgress);

    const firstSetEnd = getItemCenter(TOTAL - 1, el.clientHeight);
    const lastSetStart = getItemCenter(TOTAL * 2, el.clientHeight);

    let minDist = Infinity;
    let closest = 0;
    newProgress.forEach((p, i) => {
      if (p < minDist) { minDist = p; closest = i; }
    });

    if (containerCenter <= firstSetEnd) {
      isRepositioning.current = true;
      scrollToIndex(closest + TOTAL);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    } else if (containerCenter >= lastSetStart) {
      isRepositioning.current = true;
      scrollToIndex(closest - TOTAL);
      requestAnimationFrame(() => { isRepositioning.current = false; });
    }
  }, [allItems, scrollToIndex]);

  useEffect(() => {
    scrollToIndex(midOffset);
  }, [scrollToIndex, midOffset]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', computeProgress, { passive: true });
    computeProgress();
    return () => el.removeEventListener('scroll', computeProgress);
  }, [computeProgress]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-6 pt-14 pb-2">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-body text-muted-foreground mb-1">Habitants de Pokopia ✨</p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">Personnages</h1>
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory px-6"
        style={{
          paddingTop: `calc((100% - ${CARD_HEIGHT}px) / 2.5)`,
          paddingBottom: `calc((100% - ${CARD_HEIGHT}px) / 2.5)`,
        }}
      >
        <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
          {allItems.map((character, index) => {
            const progress = scrollProgress[index] ?? 1;
            const scale = 1 - Math.min(progress, 1) * 0.12;
            const opacity = 1 - Math.min(progress, 1) * 0.5;
            const blur = Math.min(progress, 1) * 2;

            return (
              <div
                key={`${character.id}-${index}`}
                className="snap-center flex-shrink-0"
                style={{
                  height: `${CARD_HEIGHT}px`,
                  transform: `scale(${scale})`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  willChange: 'transform, opacity, filter',
                }}
              >
                <button
                  onClick={() => setSelectedCharacter(character)}
                  className={`w-full h-full rounded-3xl bg-gradient-to-b ${colorGradientMap[character.colorKey]} border ${colorBorderMap[character.colorKey]} flex flex-col items-center justify-center gap-3 px-5 shadow-card active:scale-[0.98]`}
                >
                  <div className="w-24 h-24 rounded-2xl bg-background/50 flex items-center justify-center text-5xl flex-shrink-0 shadow-soft">
                    {character.emoji}
                  </div>
                  <div className="text-center min-w-0 mt-1">
                    <h3 className="text-xl font-display font-bold text-foreground">{character.name}</h3>
                    <p className="text-sm font-body text-muted-foreground mt-1">{character.tagline}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersTab;
