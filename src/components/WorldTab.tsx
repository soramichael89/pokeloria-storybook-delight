import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { WorldLocation } from '@/data/world';
import { useLocations } from '@/contexts/LocationsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import wallpaper from '@/assets/papierpaint.png';

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const SETS = 3;

/* One color per location id — used for card placeholder backgrounds */
const CARD_COLOR: Record<string, string> = {
  'pokopia-village':  'bg-peach',
  'mushroom-forest':  'bg-sage',
  'moon-lake':        'bg-sky',
  'thunder-ridge':    'bg-lavender',
  'whispering-cave':  'bg-winter',
  'star-hill':        'bg-snow',
};
const FALLBACK_COLORS = ['bg-peach', 'bg-sage', 'bg-sky', 'bg-lavender', 'bg-winter', 'bg-snow'];

/* ─── Location detail ─── */

const LocationDetail = ({ location, onClose }: { location: WorldLocation; onClose: () => void }) => {
  const { language } = useLanguage();
  const description = typeof (location.description as any) === 'object'
    ? ((location.description as any)[language] ?? (location.description as any)['fr'] ?? '')
    : location.description;
  return (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col"
  >
    {/* Wallpaper + readability overlay */}
    <div className="absolute inset-0 bg-cover bg-center bg-repeat" style={{ backgroundImage: `url(${wallpaper})` }} />
    <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px]" />

    {/* Back button */}
    <div className="relative z-10 flex items-center gap-3 px-5 pt-14 pb-4 flex-shrink-0">
      <button
        onClick={onClose}
        className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="font-display font-bold text-lg text-foreground leading-tight">
        {location.name}
      </h2>
    </div>

    {/* Image carousel — native horizontal scroll with snap */}
    <div className="relative z-10 flex-shrink-0 px-5">
      {(location.images ?? []).length > 0 ? (
        <div
          className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory', gap: 12 }}
        >
          {(location.images ?? []).map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 snap-center flex items-center justify-center rounded-2xl bg-black/5"
              style={{ width: '100%', height: '60svh' }}
            >
              <img
                src={src}
                alt=""
                className="max-w-full max-h-full object-contain rounded-2xl"
              />
            </div>
          ))}
        </div>
      ) : (
        /* Placeholder when no images yet */
        <div className={`rounded-2xl flex items-center justify-center ${CARD_COLOR[location.id] ?? 'bg-muted'}`} style={{ height: '60svh' }}>
          <span className="text-6xl opacity-30 select-none">🗺️</span>
        </div>
      )}
    </div>

    {/* Description */}
    <div className="relative z-10 flex-1 overflow-y-auto px-5 pt-5 pb-10">
      <p className="text-base font-body text-foreground leading-[1.85]">
        {description}
      </p>
    </div>
  </motion.div>
  );
};

/* ─── Main tab ─── */

const WorldTab = () => {
  const { locations } = useLocations();
  const TOTAL = locations.length;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isRepositioning = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedLocation = selectedId ? locations.find(l => l.id === selectedId) ?? null : null;

  const allItems = Array.from({ length: SETS }, () => locations).flat();
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
        {allItems.map((location, index) => {
          const progress    = scrollProgress[index] ?? 1;
          const scale       = 1 - progress * 0.15;
          const opacity     = 1 - progress * 0.4;
          const blur        = progress * 1.5;
          const bgColor     = CARD_COLOR[location.id] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
          const firstImage  = (location.images ?? [])[0];

          return (
            <div
              key={`${location.id}-${index}`}
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
                onClick={() => setSelectedId(location.id)}
                className="w-full cursor-pointer text-left"
              >
                <div className={`${bgColor} rounded-2xl overflow-hidden shadow-card`}>
                  {/* Card image or placeholder */}
                  <div className="relative aspect-[3/4] overflow-hidden flex items-center justify-center">
                    {firstImage ? (
                      <img
                        src={firstImage}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[5rem] leading-none opacity-30 select-none">🗺️</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-foreground/30 to-transparent" />
                  </div>
                  <div className="p-4 pb-5 text-center">
                    <h3 className="font-display font-bold text-base leading-snug text-foreground line-clamp-2">
                      {location.name}
                    </h3>
                  </div>
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-2 pb-4">
        {locations.map((_, index) => (
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
        {selectedLocation && (
          <LocationDetail location={selectedLocation} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorldTab;
