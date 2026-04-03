import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story } from '@/data/stories';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

const bgColorMap = {
  peach: 'from-peach/60 to-peach-deep/30',
  lavender: 'from-lavender/60 to-lavender-deep/30',
  sage: 'from-sage/60 to-sage-deep/30',
  sky: 'from-sky/60 to-sky-deep/30',
} as const;

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

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

  // Swipe handling
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-muted/50"
    >
      <div className="relative w-full max-w-[430px] h-screen sm:h-[860px] sm:rounded-[2.5rem] overflow-hidden bg-background flex flex-col">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${bgColorMap[story.colorKey]} pointer-events-none`} />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-transform active:scale-90"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-xs font-body text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>
          <div className="w-10" />
        </div>

        {/* Story title on first page */}
        {currentPage === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-6 pt-2 pb-1"
          >
            <span className="text-3xl mb-2 block">{story.emoji}</span>
            <h2 className="text-xl font-display font-bold text-foreground leading-snug">
              {story.title}
            </h2>
          </motion.div>
        )}

        {/* Page content area */}
        <div
          className="relative z-10 flex-1 flex flex-col px-6 overflow-hidden"
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
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-1 flex flex-col justify-center"
            >
              {/* Illustration */}
              <div className="rounded-2xl overflow-hidden shadow-card mb-5 aspect-[4/3]">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Text */}
              <p className="text-base font-body text-foreground leading-relaxed text-center px-2">
                {page.text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="relative z-10 flex items-center justify-between px-6 pb-10 pt-4">
          <button
            onClick={goPrev}
            disabled={currentPage === 0}
            className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90 disabled:opacity-30 disabled:cursor-default"
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
                    ? 'w-6 bg-foreground/60'
                    : 'w-1.5 bg-foreground/15'
                }`}
              />
            ))}
          </div>

          <button
            onClick={currentPage === totalPages - 1 ? onClose : goNext}
            className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90"
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
