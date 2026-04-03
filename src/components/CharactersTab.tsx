import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { characters, Character } from '@/data/characters';

const ITEM_HEIGHT = 100;
const GAP = 12;
const TOTAL = characters.length;
const SETS = 3;

const colorBgMap: Record<string, string> = {
  peach: 'bg-peach/30',
  lavender: 'bg-lavender/30',
  sage: 'bg-sage/30',
  sky: 'bg-sky/30',
};

const colorGradientMap: Record<string, string> = {
  peach: 'from-peach/20 to-peach-deep/10',
  lavender: 'from-lavender/20 to-lavender-deep/10',
  sage: 'from-sage/20 to-sage-deep/10',
  sky: 'from-sky/20 to-sky-deep/10',
};

const CharacterDetail = ({ character, onClose }: { character: Character; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-40 bg-background flex flex-col"
  >
    {/* Header image area */}
    <div className={`relative h-56 flex items-center justify-center bg-gradient-to-b ${colorGradientMap[character.colorKey]}`}>
      <span className="text-8xl">{character.emoji}</span>
      <button
        onClick={onClose}
        className="absolute top-14 left-5 w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft"
      >
        <X className="w-5 h-5 text-foreground" />
      </button>
    </div>

    {/* Content */}
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
    const padding = (clientHeight - ITEM_HEIGHT) / 2;
    return (ITEM_HEIGHT + GAP) * index + ITEM_HEIGHT / 2 + padding;
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
      return Math.min(distance / (ITEM_HEIGHT + GAP), 2);
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
      {/* Header */}
      <div className="px-6 pt-14 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="text-sm font-body text-muted-foreground mb-1">Habitants de Pokopia ✨</p>
          <h1 className="text-3xl font-display font-bold text-foreground leading-tight">Personnages</h1>
        </motion.div>
      </div>

      {/* Vertical carousel */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto hide-scrollbar snap-y snap-mandatory px-6"
        style={{
          paddingTop: `calc((100% - ${ITEM_HEIGHT}px) / 3)`,
          paddingBottom: `calc((100% - ${ITEM_HEIGHT}px) / 3)`,
        }}
      >
        <div className="flex flex-col" style={{ gap: `${GAP}px` }}>
          {allItems.map((character, index) => {
            const progress = scrollProgress[index] ?? 1;
            const scale = 1 - Math.min(progress, 1) * 0.08;
            const opacity = 1 - Math.min(progress, 1) * 0.5;

            return (
              <div
                key={`${character.id}-${index}`}
                className="snap-center flex-shrink-0"
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  transform: `scale(${scale})`,
                  opacity,
                  willChange: 'transform, opacity',
                }}
              >
                <button
                  onClick={() => setSelectedCharacter(character)}
                  className={`w-full h-full rounded-2xl ${colorBgMap[character.colorKey]} border border-border/30 flex items-center gap-4 px-4 transition-shadow hover:shadow-card active:scale-[0.98]`}
                >
                  <div className="w-16 h-16 rounded-xl bg-background/60 flex items-center justify-center text-3xl flex-shrink-0">
                    {character.emoji}
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-lg font-display font-bold text-foreground truncate">{character.name}</h3>
                    <p className="text-sm font-body text-muted-foreground truncate">{character.tagline}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail overlay */}
      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersTab;
