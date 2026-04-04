import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Character } from '@/data/characters';
import { useCharacters } from '@/contexts/CharactersContext';

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const SETS = 3;

const colorMap: Record<string, string> = {
  peach: 'bg-peach',
  lavender: 'bg-lavender',
  sage: 'bg-sage',
  sky: 'bg-sky',
  winter: 'bg-winter',
  snow: 'bg-snow',
};

const colorGradientMap: Record<string, string> = {
  peach: 'from-peach/40 to-peach-deep/20',
  lavender: 'from-lavender/40 to-lavender-deep/20',
  sage: 'from-sage/40 to-sage-deep/20',
  sky: 'from-sky/40 to-sky-deep/20',
  winter: 'from-winter/40 to-winter-deep/20',
  snow: 'from-snow/40 to-snow-deep/20',
};

const IMAGE_TYPES = [
  { key: 'standard' as const, label: 'Illustration' },
  { key: 'figurine' as const, label: 'Figurine' },
  { key: 'dessin' as const, label: 'Dessin' },
];

const CharacterDetail = ({ character, onClose }: { character: Character; onClose: () => void }) => {
  const [activeImage, setActiveImage] = useState<'standard' | 'figurine' | 'dessin'>('standard');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg text-foreground leading-tight">{character.name}</h2>
          <p className="text-xs font-body text-muted-foreground italic">{character.role}</p>
        </div>
      </div>

      {/* Image carousel */}
      <div className="flex-shrink-0 px-5">
        <div className={`rounded-2xl overflow-hidden bg-gradient-to-b ${colorGradientMap[character.colorKey] ?? colorGradientMap.peach} aspect-square flex items-center justify-center`}>
          <img
            key={activeImage}
            src={character.images[activeImage]}
            alt={character.name}
            className="w-full h-full object-contain p-6"
          />
        </div>
        {/* Image type selector */}
        <div className="flex gap-2 mt-3">
          {IMAGE_TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveImage(key)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-display font-semibold transition-colors ${
                activeImage === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-10">
        {/* Description */}
        <p className="text-base font-body text-foreground leading-[1.85]">{character.description}</p>

        {/* Skills */}
        {character.skills.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Capacités
            </h3>
            <div className="flex flex-col gap-3">
              {character.skills.map((skill, i) => (
                <div key={i} className="rounded-2xl bg-card border border-border/50 px-4 py-3">
                  <p className="font-display font-bold text-sm text-foreground">{skill.name}</p>
                  <p className="mt-1 text-xs font-body text-muted-foreground leading-relaxed">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const CharactersTab = () => {
  const { characters } = useCharacters();
  const TOTAL = characters.length;
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
    <div className="flex flex-col h-full justify-center relative">
      <div className="pt-8" />

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
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % TOTAL) * 0.1, duration: 0.5, ease: 'easeOut' }}
                onClick={() => setSelectedCharacter(character)}
                className="w-full group cursor-pointer text-left"
              >
                <div className={`${colorMap[character.colorKey] ?? colorMap.peach} rounded-2xl overflow-hidden shadow-card`}>
                  <div className={`relative aspect-[3/4] overflow-hidden flex items-center justify-center bg-gradient-to-b ${colorGradientMap[character.colorKey] ?? colorGradientMap.peach}`}>
                    <img
                      src={character.images.standard}
                      alt={character.name}
                      className="w-full h-full object-contain p-4"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-foreground/30 to-transparent" />
                  </div>
                  <div className="p-4 pb-5 text-center">
                    <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2">
                      {character.name}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground font-body leading-relaxed">
                      {character.role}
                    </p>
                  </div>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

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

      <AnimatePresence>
        {selectedCharacter && (
          <CharacterDetail character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharactersTab;
