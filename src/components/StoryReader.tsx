import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Story, StoryPage } from '@/data/stories';
import wallpaper from '@/assets/papierpaint.png';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

/* ─── Book dimensions ─── */
function getBookDims() {
  const vh = document.documentElement.clientHeight || window.innerHeight;
  const bookH = Math.round((vh - 120) * 0.98);
  const bookW = Math.round(bookH * 0.7);
  return { bookH, bookW };
}

/* ─── Easing ─── */
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/* ─── Clip-path helpers ─────────────────────────────────────────
   Forward fold: corner peels from bottom-right diagonally.
   t = 0 → full page visible.  t = 1 → nothing visible.
   A mid-point with slight "bow" gives the organic curve.
──────────────────────────────────────────────────────────────── */
function forwardClip(t: number): string {
  const rx = 100, ry = (1 - t) * 100;          // point on right edge
  const bx = (1 - t) * 100, by = 100;           // point on bottom edge
  const bow = t * 8;                             // max 8% organic bow
  const mx = (rx + bx) / 2 + bow;
  const my = (ry + by) / 2 - bow;
  return `polygon(0% 0%, 100% 0%, ${rx}% ${ry}%, ${mx}% ${my}%, ${bx}% ${by}%, 0% 100%)`;
}

function forwardFlapClip(t: number): string {
  const rx = 100, ry = (1 - t) * 100;
  const bx = (1 - t) * 100, by = 100;
  const bow = t * 8;
  const mx = (rx + bx) / 2 + bow;
  const my = (ry + by) / 2 - bow;
  return `polygon(${rx}% ${ry}%, ${mx}% ${my}%, ${bx}% ${by}%, 100% 100%)`;
}

/* ─── Backward fold: corner peels from bottom-left ─── */
function backwardClip(t: number): string {
  const lx = 0, ly = (1 - t) * 100;             // point on left edge
  const bx = t * 100, by = 100;                  // point on bottom edge
  const bow = t * 8;
  const mx = (lx + bx) / 2 - bow;
  const my = (ly + by) / 2 - bow;
  return `polygon(0% 0%, 100% 0%, 100% 100%, ${bx}% ${by}%, ${mx}% ${my}%, ${lx}% ${ly}%)`;
}

function backwardFlapClip(t: number): string {
  const lx = 0, ly = (1 - t) * 100;
  const bx = t * 100, by = 100;
  const bow = t * 8;
  const mx = (lx + bx) / 2 - bow;
  const my = (ly + by) / 2 - bow;
  return `polygon(${lx}% ${ly}%, 0% 100%, ${bx}% ${by}%, ${mx}% ${my}%)`;
}

/* ─── Page renderers ─── */

const TextPage = ({ page }: { page: StoryPage }) => (
  <div className="h-full flex flex-col justify-center items-center" style={{ padding: 40 }}>
    <p className="font-body text-foreground text-center" style={{ fontSize: 18, lineHeight: 1.8 }}>
      {page.text}
    </p>
  </div>
);

const TextImagePage = ({ page }: { page: StoryPage }) => (
  <div className="h-full flex flex-col items-center justify-center gap-5" style={{ padding: 40 }}>
    <p className="font-body text-foreground text-center" style={{ fontSize: 18, lineHeight: 1.8 }}>
      {page.text}
    </p>
    <img src={page.image} alt="" className="max-w-full object-contain drop-shadow-md"
      style={{ maxHeight: '40dvh' }} />
  </div>
);

const ImmersivePage = ({ page }: { page: StoryPage }) => (
  <div className="h-full relative">
    <img src={page.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
      <p className="font-body text-white text-center drop-shadow-md"
        style={{ fontSize: 18, lineHeight: 1.8 }}>{page.text}</p>
    </div>
  </div>
);

/* ─── Flip state ─── */
type FlipState = { direction: 'next' | 'prev'; behindIdx: number } | null;

/* ─── Reader ─── */

const StoryReader = ({ story, onClose }: StoryReaderProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [flip, setFlip] = useState<FlipState>(null);

  /* DOM refs — animated without React re-renders */
  const pageLayerRef = useRef<HTMLDivElement>(null); // current page (clipped)
  const flapRef      = useRef<HTMLDivElement>(null); // folded flap
  const bookRef      = useRef<HTMLDivElement>(null); // touch target

  /* Animation state refs */
  const flipRef      = useRef<FlipState>(null);
  const progressRef  = useRef(0);          // 0–1 current progress
  const isAnimRef    = useRef(false);
  const rafRef       = useRef<number>(0);
  const touchStartX  = useRef<number | null>(null);
  const wasDragRef   = useRef(false);

  const totalPages = story.pages.length;
  const { bookH: BOOK_H, bookW: BOOK_W } = useMemo(() => getBookDims(), []);

  /* ── Sync state + ref ── */
  const updateFlip = useCallback((next: FlipState) => {
    flipRef.current = next;
    setFlip(next);
  }, []);

  /* ── Apply progress to DOM ── */
  const applyProgress = useCallback((t: number) => {
    progressRef.current = t;
    const dir = flipRef.current?.direction;
    const page = pageLayerRef.current;
    const flap = flapRef.current;
    if (!page || !flap) return;

    if (dir === 'next') {
      page.style.clipPath = forwardClip(t);
      flap.style.clipPath = forwardFlapClip(t);
    } else {
      page.style.clipPath = backwardClip(t);
      flap.style.clipPath = backwardFlapClip(t);
    }

    /* Drop-shadow along the clip edge — follows the fold */
    const s = (t * 0.55).toFixed(2);
    page.style.filter = t > 0.01
      ? `drop-shadow(${dir === 'next' ? '-' : ''}3px 4px ${Math.round(t * 10)}px rgba(0,0,0,${s}))`
      : 'none';

    /* Flap gradient: simulates the back/shadow of the fold */
    const flapOpacity = (t * 0.45).toFixed(2);
    flap.style.background =
      dir === 'next'
        ? `linear-gradient(225deg, rgba(230,225,218,0.95) 0%, rgba(200,195,188,${flapOpacity}) 100%)`
        : `linear-gradient(315deg, rgba(230,225,218,0.95) 0%, rgba(200,195,188,${flapOpacity}) 100%)`;
  }, []);

  /* ── Smooth RAF animation ── */
  const animateTo = useCallback((target: number, onDone?: () => void) => {
    cancelAnimationFrame(rafRef.current);
    const start    = progressRef.current;
    const duration = 420;
    const t0       = performance.now();

    const tick = (now: number) => {
      const raw    = (now - t0) / duration;
      const eased  = easeInOut(Math.min(1, raw));
      applyProgress(start + (target - start) * eased);
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        applyProgress(target);
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [applyProgress]);

  /* ── Complete flip ── */
  const completeFlip = useCallback(() => {
    const f = flipRef.current;
    if (!f || isAnimRef.current) return;
    isAnimRef.current = true;

    animateTo(1, () => {
      /* Reset clip silently before changing page */
      if (pageLayerRef.current) {
        pageLayerRef.current.style.clipPath = 'none';
        pageLayerRef.current.style.filter   = 'none';
      }
      if (flapRef.current) flapRef.current.style.clipPath = 'none';
      progressRef.current = 0;

      setCurrentPage(p => f.direction === 'next' ? p + 1 : p - 1);
      updateFlip(null);
      isAnimRef.current = false;
    });
  }, [animateTo, updateFlip]);

  /* ── Snap back ── */
  const snapBack = useCallback(() => {
    if (isAnimRef.current) return;
    isAnimRef.current = true;

    animateTo(0, () => {
      if (pageLayerRef.current) {
        pageLayerRef.current.style.clipPath = 'none';
        pageLayerRef.current.style.filter   = 'none';
      }
      if (flapRef.current) flapRef.current.style.clipPath = 'none';
      progressRef.current = 0;
      updateFlip(null);
      isAnimRef.current = false;
    });
  }, [animateTo, updateFlip]);

  /* ── Reset DOM when flip starts ── */
  useEffect(() => {
    if (flip) {
      if (pageLayerRef.current) {
        pageLayerRef.current.style.clipPath = 'none';
        pageLayerRef.current.style.filter   = 'none';
      }
      if (flapRef.current) flapRef.current.style.clipPath = 'none';
      progressRef.current = 0;
    }
  }, [flip?.direction, flip?.behindIdx]);

  /* ── Touch listeners ── */
  useEffect(() => {
    const el = bookRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isAnimRef.current) return;
      touchStartX.current = e.touches[0].clientX;
      wasDragRef.current  = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX.current === null || isAnimRef.current) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      if (Math.abs(dx) < 5) return;
      wasDragRef.current = true;

      if (dx < 0 && currentPage < totalPages - 1) {
        if (!flipRef.current) updateFlip({ direction: 'next', behindIdx: currentPage + 1 });
        applyProgress(Math.min(1, (-dx) / BOOK_W));
      } else if (dx > 0 && currentPage > 0) {
        if (!flipRef.current) updateFlip({ direction: 'prev', behindIdx: currentPage - 1 });
        applyProgress(Math.min(1, dx / BOOK_W));
      }
    };

    const onTouchEnd = () => {
      if (touchStartX.current === null || !flipRef.current) return;
      touchStartX.current = null;
      if (progressRef.current > 0.3) completeFlip();
      else snapBack();
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    el.addEventListener('touchend',   onTouchEnd,   { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
    };
  }, [currentPage, totalPages, BOOK_W, applyProgress, completeFlip, snapBack, updateFlip]);

  /* ── Button navigation ── */
  const goNext = useCallback(() => {
    if (isAnimRef.current || currentPage >= totalPages - 1) return;
    updateFlip({ direction: 'next', behindIdx: currentPage + 1 });
    requestAnimationFrame(() => requestAnimationFrame(() => completeFlip()));
  }, [currentPage, totalPages, updateFlip, completeFlip]);

  const goPrev = useCallback(() => {
    if (isAnimRef.current || currentPage <= 0) return;
    updateFlip({ direction: 'prev', behindIdx: currentPage - 1 });
    requestAnimationFrame(() => requestAnimationFrame(() => completeFlip()));
  }, [currentPage, updateFlip, completeFlip]);

  const handleBookClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (wasDragRef.current || isAnimRef.current) { wasDragRef.current = false; return; }
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX > rect.left + rect.width / 2) goNext();
    else goPrev();
  }, [goNext, goPrev]);

  /* ── Memoized page elements ── */
  const renderPage = (page: StoryPage) => {
    switch (page.type) {
      case 'immersive':  return <ImmersivePage  page={page} />;
      case 'text-image': return <TextImagePage  page={page} />;
      default:           return <TextPage        page={page} />;
    }
  };

  const pageElements = useMemo(
    () => story.pages.map((page, i) => (
      <div key={i} className="w-full h-full">{renderPage(page)}</div>
    )),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [story.pages]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
      }}
    >
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-cover bg-center bg-repeat"
           style={{ backgroundImage: `url(${wallpaper})` }} />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px]" />

      {/* Header */}
      <div style={{ width: BOOK_W }} className="relative z-10 flex items-center justify-between">
        <button onClick={onClose}
          className="w-9 h-9 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-background/90 active:scale-90">
          <X className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-xs font-body text-muted-foreground">{currentPage + 1} / {totalPages}</span>
        <div className="w-9" />
      </div>

      {/* Book + arrows */}
      <div className="relative z-10 flex items-center gap-3">

        <button onClick={goPrev} disabled={currentPage === 0}
          className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90 disabled:opacity-20">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Book */}
        <div
          ref={bookRef}
          onClick={handleBookClick}
          style={{
            width: BOOK_W, height: BOOK_H,
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'pan-y',
          } as React.CSSProperties}
        >
          {/* ── Layer 0: behind page (next or prev) ── */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'white', overflow: 'hidden' }}>
            {pageElements[flip ? flip.behindIdx : currentPage]}
          </div>

          {/* ── Layer 1: current page, clip-path animates away ── */}
          <div
            ref={pageLayerRef}
            style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'white', overflow: 'hidden' }}
          >
            {pageElements[currentPage]}
          </div>

          {/* ── Layer 2: fold flap — simulates the back of the curling page ── */}
          <div
            ref={flapRef}
            style={{
              position: 'absolute', inset: 0, zIndex: 2,
              pointerEvents: 'none',
              /* clip-path and background set via applyProgress() */
            }}
          />
        </div>

        <button onClick={goNext} disabled={currentPage === totalPages - 1}
          className="w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center shadow-soft transition-all active:scale-90 disabled:opacity-20">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>

      </div>

      {/* Progress dots */}
      <div className="relative z-10 flex gap-1.5">
        {story.pages.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${
            i === currentPage ? 'w-5 h-1.5 bg-foreground/50' : 'w-1.5 h-1.5 bg-foreground/15'
          }`} />
        ))}
      </div>
    </motion.div>
  );
};

export default StoryReader;
