import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story, StoryPage } from '@/data/stories';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

const bgColorMap = {
  peach: 'bg-peach/40',
  lavender: 'bg-lavender/40',
  sage: 'bg-sage/40',
  sky: 'bg-sky/40',
} as const;

const bgGradientMap = {
  peach: 'from-peach/20 via-background to-peach-deep/10',
  lavender: 'from-lavender/20 via-background to-lavender-deep/10',
  sage: 'from-sage/20 via-background to-sage-deep/10',
  sky: 'from-sky/20 via-background to-sky-deep/10',
} as const;

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

/* ─── Page renderers ─── */

const TextPage = ({ page, colorKey }: { page: StoryPage; colorKey: string }) => (
  <div className={`h-full flex flex-col justify-center items-center px-8 bg-gradient-to-b ${bgGradientMap[colorKey as keyof typeof bgGradientMap]}`}>
    <p className="text-lg font-body text-foreground leading-[1.9] text-center max-w-[340px]">
      {page.text}
    </p>
  </div>
);

const TextImagePage = ({ page, colorKey }: { page: StoryPage; colorKey: string }) => (
  <div className={`h-full flex flex-col items-center justify-center px-6 bg-gradient-to-b ${bgGradientMap[colorKey as keyof typeof bgGradientMap]}`}>
    <div className="flex flex-col items-center gap-6 max-w-[340px]">
      <p className="text-base font-body text-foreground leading-[1.85] text-center">
        {page.text}
      </p>
      <div className="w-full flex items-center justify-center">
        <img
          src={page.image}
          alt=""
          className="max-w-[280px] max-h-[320px] w-auto h-auto object-contain drop-shadow-md"
        />
      </div>
    </div>
  </div>
);

const ImmersivePage = ({ page }: { page: StoryPage }) => (
  <div className="h-full relative">
    <img
      src={page.image}
      alt=""
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 px-6 pb-8">
      <p className="text-base font-body text-background leading-[1.85] text-center drop-shadow-md">
        {page.text}
      </p>
    </div>
  </div>
);

const StoryReader = ({ story, onClose }: StoryReaderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const totalPages = story.pages.length;
  const page = story.pages[currentPage];

  const goNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setDirection(1);
      setCurrentPage(p => p + 1);
    }
  }, [currentPage, totalPages]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection(-1);
      setCurrentPage(p => p - 1);
    }
  }, [currentPage]);

  // Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  };

  const renderPage = (p: StoryPage) => {
    switch (p.type) {
      case 'immersive':
        return <ImmersivePage page={p} />;
      case 'text-image':
        return <TextImagePage page={p} colorKey={story.colorKey} />;
      case 'text':
      default:
        return <TextPage page={p} colorKey={story.colorKey} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-muted/50"
    >
      <div className="relative w-full max-w-[430px] h-screen sm:h-[860px] sm:rounded-[2.5rem] overflow-hidden bg-background flex flex-col">

        {/* Page content — full height, no scroll */}
        <div
          className="absolute inset-0 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0"
            >
              {renderPage(page)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Overlay UI — close button & page counter */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft transition-transform active:scale-90"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-xs font-body text-muted-foreground bg-background/60 backdrop-blur-sm rounded-full px-3 py-1">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="w-10" />
        </div>

        {/* Bottom navigation */}
        <div className="relative z-10 mt-auto flex items-center justify-between px-6 pb-10 pt-4 pointer-events-none">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="pointer-events-auto w-12 h-12 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90 disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {story.pages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentPage
                    ? 'w-6 bg-foreground/50'
                    : 'w-1.5 bg-foreground/15'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentPage === totalPages - 1 ? onClose : goNext}
            className="pointer-events-auto w-12 h-12 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90"
          >
            {currentPage === totalPages - 1 ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryReader;
