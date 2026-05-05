import { useState, useRef, useEffect } from 'react';
import { Story } from '@/data/stories';
import { useStories } from '@/contexts/StoriesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StoryCard from './StoryCard';
import StoryReader from './StoryReader';
import wallpaper from '@/assets/papierpaint.png';
import { GOLD, THEME } from '@/lib/theme';

// ── Pastel particle configs (randomised once at module load) ──────────────────
const PASTEL = ['#ffd1a8','#e0c8ff','#c8e8d0','#bfe0f2','#ffe4ec','#fff3c8','#ffc9d6','#d4f0e8'];
const STARS_CFG = Array.from({ length: 32 }, (_, i) => {
  const a = -90 + (-65 + Math.random() * 130);
  const dist = 80 + Math.random() * 200;
  return { id: i, x: Math.cos(a * Math.PI / 180) * dist, y: Math.sin(a * Math.PI / 180) * dist, rot: -180 + Math.random() * 360, delay: 150 + Math.random() * 900, size: 8 + Math.random() * 12, color: PASTEL[i % PASTEL.length] };
});
const DUST_CFG = Array.from({ length: 22 }, (_, i) => {
  const a = Math.random() * 360;
  const dist = 50 + Math.random() * 200;
  return { id: i, x: Math.cos(a * Math.PI / 180) * dist, y: Math.sin(a * Math.PI / 180) * dist - 40, delay: 100 + Math.random() * 1100, size: 3 + Math.random() * 5, color: PASTEL[i % PASTEL.length] };
});
const BG_STARS = Array.from({ length: 16 }, (_, i) => ({
  id: i, x: (i * 43 + 7) % 100, y: (i * 61 + 13) % 70,
  size: 2 + (i % 3), delay: (i * 0.45) % 4, dur: 1.5 + (i % 3) * 0.9,
}));

// ── Small helper: 4-point sparkle SVG ────────────────────────────────────────
const Sparkle = ({ size = 13, color = 'hsl(25,30%,25%)' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill={color} />
  </svg>
);

// ── Thumbnail strip ───────────────────────────────────────────────────────────
const THUMB_W = 46;
const THUMB_GAP = 10;

const BookThumb = ({ story, isActive }: { story: Story; isActive: boolean }) => {
  const spine = THEME[story.colorKey]?.spine ?? 'hsl(18,48%,52%)';
  const front = THEME[story.colorKey]?.front ?? 'hsl(18,44%,60%)';
  const glow  = THEME[story.colorKey]?.glow  ?? 'rgba(255,155,90,0.55)';
  const isPng = story.coverImage?.endsWith('.png');
  return (
    <div style={{
      width: THUMB_W, height: 62, borderRadius: 6, overflow: 'hidden',
      background: front,
      boxShadow: isActive
        ? `0 6px 20px ${glow}, 0 0 0 2px ${GOLD}`
        : '0 3px 8px rgba(0,0,0,0.15)',
      transition: 'box-shadow 0.35s', pointerEvents: 'none',
    }}>
      {story.coverImage && (
        <img src={story.coverImage} alt={story.title} draggable={false}
          style={{ width: '100%', height: '100%', objectFit: isPng ? 'contain' : 'cover', padding: isPng ? 4 : 0, pointerEvents: 'none' }} />
      )}
    </div>
  );
};

// ── Screen: Library (Book3D centered + swipe L/R + thumbnail strip) ───────────
const LibraryScreen = ({ stories, active, setActive, onSelect, header }: {
  stories: Story[]; active: number; setActive: (i: number) => void;
  onSelect: (s: Story) => void; header: React.ReactNode;
}) => {
  const { t } = useLanguage();
  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [springing, setSpringing] = useState(false);
  const [transitioning, setTransitioning] = useState<'left' | 'right' | null>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef<'h' | 'v' | null>(null);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const H_THRESHOLD = 70;
  const AXIS_LOCK = 8;

  const story = stories[active];
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Auto-center active thumbnail in the strip
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const slot = THUMB_W + THUMB_GAP;
    const target = active * slot - container.clientWidth / 2 + THUMB_W / 2 + 24;
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [active]);

  const onPtrMove = (e: React.MouseEvent | React.TouchEvent) => {
    const el = bookRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const touch = (e as React.TouchEvent).touches?.[0];
    const cx = (touch?.clientX ?? (e as React.MouseEvent).clientX) - r.left;
    const cy = (touch?.clientY ?? (e as React.MouseEvent).clientY) - r.top;
    setPtr({ x: Math.max(0, Math.min(1, cx / r.width)), y: Math.max(0, Math.min(1, cy / r.height)) });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const x = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
      const dx = x - startRef.current.x;
      const dy = y - startRef.current.y;
      if (axisRef.current === null) {
        if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return;
        axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        if (axisRef.current === 'h') movedRef.current = true;
      }
      if (axisRef.current === 'h') {
        e.preventDefault?.();
        const atLeft = active === 0 && dx > 0;
        const atRight = active === stories.length - 1 && dx < 0;
        const eff = (atLeft || atRight) ? dx * 0.4 : dx;
        dragXRef.current = eff;
        setDragX(eff);
      }
    };
    const handleUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (axisRef.current === 'h') {
        const dx = dragXRef.current;
        const wantNext = dx < -H_THRESHOLD && active < stories.length - 1;
        const wantPrev = dx > H_THRESHOLD && active > 0;
        if (wantNext || wantPrev) {
          setTransitioning(wantNext ? 'left' : 'right');
        } else {
          setSpringing(true);
          setTimeout(() => { setDragX(0); dragXRef.current = 0; setSpringing(false); }, 350);
        }
      }
      axisRef.current = null;
      setTimeout(() => { movedRef.current = false; }, 50);
    };
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [active, stories.length]);

  useEffect(() => {
    if (!transitioning) return;
    const dir = transitioning;
    setSpringing(true);
    setDragX(dir === 'left' ? -380 : 380);
    const t1 = setTimeout(() => {
      setSpringing(false);
      setActive(active + (dir === 'left' ? 1 : -1));
      setDragX(dir === 'left' ? 380 : -380);
      dragXRef.current = dir === 'left' ? 380 : -380;
      requestAnimationFrame(() => {
        setSpringing(true);
        setDragX(0);
        dragXRef.current = 0;
        setTimeout(() => { setSpringing(false); setTransitioning(null); }, 420);
      });
    }, 280);
    return () => clearTimeout(t1);
  }, [transitioning]); // eslint-disable-line

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (transitioning) return;
    const x = (e as React.TouchEvent).touches?.[0]?.clientX ?? (e as React.MouseEvent).clientX;
    const y = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY;
    startRef.current = { x, y };
    axisRef.current = null;
    isDragging.current = true;
    setSpringing(false);
  };

  const handleClick = () => {
    if (movedRef.current) return;
    onSelect(story);
  };

  const swipeTilt = Math.max(-12, Math.min(12, dragX * 0.04));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'hidden',
      transition: 'background 0.6s ease',
    }}>
      {/* Bg stars */}
      {BG_STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute', left: s.x + '%', top: s.y + '%',
          width: s.size, height: s.size, borderRadius: '50%',
          background: 'white', opacity: 0.65,
          boxShadow: '0 0 5px rgba(255,255,255,0.9)',
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(${th.glow}, ${th.glow2}, transparent 70%)`,
        pointerEvents: 'none', zIndex: 0,
        transition: 'background 0.5s ease',
      }} />

      {header}

      {/* Book */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div
          ref={bookRef}
          onMouseMove={onPtrMove} onMouseLeave={() => setPtr(null)}
          onTouchMove={onPtrMove} onTouchEnd={() => setPtr(null)}
          onMouseDown={startDrag} onTouchStart={startDrag}
          onClick={handleClick}
          style={{
            animation: 'floatBook 3.2s ease-in-out infinite',
            cursor: 'pointer',
            transform: `translateX(${dragX}px)`,
            transition: springing ? 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <StoryCard story={story} onOpen={handleClick as any} index={active} isActive={true} reflectionX={ptr?.x} reflectionY={ptr?.y} swipeTilt={swipeTilt} />
        </div>
      </div>

      {/* Thumbnail row + CTA */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingBottom: 30 }}>
        <div
          ref={scrollRef}
          style={{
            width: '100%',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingTop: 22,    // room for scale(1.18)+translateY(-6px) so it's not clipped
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 14,
            touchAction: 'pan-x',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            display: 'flex', gap: THUMB_GAP, alignItems: 'flex-end',
            justifyContent: stories.length <= 7 ? 'center' : undefined,
            width: stories.length > 7 ? 'max-content' : undefined,
            margin: '0 auto',
          }}>
            {stories.map((s, i) => {
              const isAct = i === active;
              return (
                <div key={s.id} onClick={() => setActive(i)} style={{
                  cursor: 'pointer', flexShrink: 0,
                  transform: isAct ? 'scale(1.18) translateY(-6px)' : 'scale(0.92)',
                  opacity: isAct ? 1 : 0.55,
                  transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s',
                }}>
                  <BookThumb story={s} isActive={isAct} />
                </div>
              );
            })}
          </div>
        </div>
        <div
          onClick={() => onSelect(story)}
          style={{
            background: 'rgba(40,20,5,0.12)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(40,20,5,0.12)', borderRadius: 24,
            padding: '10px 22px 10px 18px', cursor: 'pointer',
            fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 14,
            color: 'hsl(25,30%,25%)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <Sparkle size={13} />
          <span>{t.touchToChoose}</span>
          <Sparkle size={11} />
        </div>
      </div>
    </div>
  );
};

// ── Screen: Focus (drag UP to open the book) ──────────────────────────────────
const FocusScreen = ({ story, onBack, onOpen }: { story: Story; onBack: () => void; onOpen: () => void }) => {
  const { t } = useLanguage();
  const [dragY, setDragY] = useState(0);
  const [springing, setSpringing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragYRef = useRef(0);
  const THRESHOLD = 110;
  const prog = Math.min(1, Math.max(0, -dragY) / THRESHOLD);
  const isReady = prog >= 0.78;
  const th = THEME[story.colorKey] ?? THEME.peach;

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || startYRef.current === null) return;
      e.preventDefault();
      const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
      const delta = y - startYRef.current;
      const clamped = Math.min(20, delta);
      dragYRef.current = clamped;
      setDragY(clamped);
    };
    const handleUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const p = Math.min(1, Math.max(0, -dragYRef.current) / THRESHOLD);
      if (p >= 0.68) onOpen();
      else { setSpringing(true); setTimeout(() => { setDragY(0); dragYRef.current = 0; setSpringing(false); }, 400); }
    };
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [onOpen]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startYRef.current = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY;
    isDragging.current = true;
    setSpringing(false);
  };

  const rotX = 5 + prog * 52;
  const rotY = 28 - prog * 10;
  const liftY = prog * -40;
  const glowSize = 180 + prog * 120;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      userSelect: 'none', overflow: 'hidden',
    }}>
      {/* Bg stars */}
      {BG_STARS.slice(0, 10).map(s => (
        <div key={s.id} style={{ position: 'absolute', left: s.x + '%', top: s.y + '%', width: s.size, height: s.size, borderRadius: '50%', background: 'white', opacity: 0.6, animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Glow orb */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(${th.glow}, ${th.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0, transition: 'width 0.1s, height 0.1s' }} />
      {isReady && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize * 1.5, height: glowSize * 1.5, borderRadius: '50%', background: `radial-gradient(${th.glow}, transparent 60%)`, pointerEvents: 'none', zIndex: 0, animation: 'pulseGlow 0.6s ease-in-out infinite' }} />}

      {/* Back button */}
      <button onClick={onBack} style={{ position: 'absolute', top: 52, left: 16, zIndex: 50, background: 'rgba(255,255,255,0.60)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
      </button>

      {/* Book */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div
          onMouseDown={startDrag} onTouchStart={startDrag}
          style={{ transform: `translateY(${liftY + dragY * 0.3}px)`, transition: springing ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}
        >
          <StoryCard story={story} onOpen={() => {}} index={0} isActive={true} customRotX={rotX} customRotY={rotY} />
        </div>
      </div>

      {/* Swipe hint */}
      <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2, opacity: isReady ? 0 : 0.75, transition: 'opacity 0.3s', pointerEvents: 'none' }}>
        <div style={{ animation: 'swipeHint 1.6s ease-in-out infinite' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,30%)" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 600, color: 'hsl(25,30%,35%)', marginTop: 4 }}>{t.swipeHint}</div>
      </div>
      {isReady && (
        <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, fontWeight: 700, color: th.spine, textShadow: '0 0 20px white', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkle size={14} color={th.spine} />
            <span>{t.releaseToOpen}</span>
            <Sparkle size={12} color={th.spine} />
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, height: 4, background: 'rgba(40,20,5,0.10)', borderRadius: 2, zIndex: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: (prog * 100) + '%', background: `linear-gradient(to right, ${th.spine}, ${GOLD})`, borderRadius: 2, transition: 'width 0.05s' }} />
      </div>
    </div>
  );
};

// ── Screen: Opening Animation ─────────────────────────────────────────────────
const OpeningAnimation = ({ story, onComplete }: { story: Story; onComplete: () => void }) => {
  const [phase, setPhase] = useState(1);
  const th = THEME[story.colorKey] ?? THEME.peach;

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 3300),
      setTimeout(() => onComplete(), 3950),
    ];
    return () => ts.forEach(clearTimeout);
  }, []); // eslint-disable-line

  const landingPage = story.pages.find(p => p.image) ?? story.pages[0];
  const isPng = story.coverImage?.endsWith('.png');
  const imgBg = THEME[story.colorKey]?.bg1 ?? 'hsl(20,75%,94%)';

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`, overflow: 'hidden' }}>
      {BG_STARS.slice(0, 12).map(s => (
        <div key={s.id} style={{ position: 'absolute', left: s.x + '%', top: s.y + '%', width: s.size, height: s.size, borderRadius: '50%', background: 'white', opacity: 0.6, animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: phase >= 2 ? 320 : 180, height: phase >= 2 ? 320 : 180, borderRadius: '50%', background: `radial-gradient(${th.glow}, ${th.glow2} 40%, transparent 72%)`, zIndex: 1, pointerEvents: 'none', opacity: phase >= 2 ? 1 : 0.4, transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />

      {/* Phase 1: book swipes up */}
      {phase === 1 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'bookSwipeUp 0.55s cubic-bezier(0.4,0,0.6,1) forwards' }}>
          <StoryCard story={story} onOpen={() => {}} index={0} isActive={true} />
        </div>
      )}
      {/* Phase 2: book returns */}
      {phase === 2 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'bookReturn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <StoryCard story={story} onOpen={() => {}} index={0} isActive={true} />
        </div>
      )}

      {/* Phase 3: open book + particles */}
      {phase === 3 && (
        <>
          <div style={{ position: 'absolute', top: '52%', left: '50%', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,235,180,0.85), rgba(255,210,160,0.5) 30%, rgba(255,200,200,0.25) 55%, transparent 75%)', zIndex: 1, pointerEvents: 'none', animation: 'warmRayPulse 1.3s 0.1s ease-out forwards', mixBlendMode: 'screen' }} />
          <div style={{ position: 'absolute', top: '52%', left: '50%', width: 600, height: 600, background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,235,180,0.35) 25deg, transparent 50deg, rgba(255,210,180,0.3) 90deg, transparent 120deg, rgba(255,225,200,0.32) 170deg, transparent 200deg, rgba(255,230,180,0.28) 250deg, transparent 290deg, rgba(255,225,200,0.3) 330deg, transparent 360deg)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none', animation: 'raysSpin 3s linear infinite', opacity: 0.55, mixBlendMode: 'screen', WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)', maskImage: 'radial-gradient(circle, black 30%, transparent 70%)' }} />
          {/* Open book visual */}
          <div style={{ position: 'absolute', top: '52%', left: '50%', transform: 'translate(-50%,-50%) rotateX(55deg)', transformStyle: 'preserve-3d', perspective: 1400, zIndex: 5, animation: 'fadeInUp 0.5s ease-out' }}>
            <OpenBook colorKey={story.colorKey} />
          </div>
          {/* Pastel stars */}
          {STARS_CFG.map(s => (
            <div key={s.id} style={{ position: 'absolute', top: '52%', left: '50%', zIndex: 9, animation: `pastelStar 1.4s ${s.delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`, opacity: 0, ['--sx' as any]: `${s.x}px`, ['--sy' as any]: `${s.y}px`, ['--sr' as any]: `${s.rot}deg` }}>
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" style={{ display: 'block', filter: `drop-shadow(0 0 6px ${s.color}) drop-shadow(0 0 2px white)` }}>
                <path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill={s.color} opacity="0.95" />
                <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.9" />
              </svg>
            </div>
          ))}
          {/* Dust particles */}
          {DUST_CFG.map(d => (
            <div key={d.id} style={{ position: 'absolute', top: '52%', left: '50%', width: d.size, height: d.size, borderRadius: '50%', background: d.color, boxShadow: `0 0 ${d.size * 2}px ${d.color}`, zIndex: 8, animation: `pastelDust 1.5s ${d.delay}ms ease-out forwards`, opacity: 0, ['--dx' as any]: `${d.x}px`, ['--dy' as any]: `${d.y}px` }} />
          ))}
        </>
      )}

      {/* Phase 4: white flash → reader preview */}
      {phase === 4 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 20, animation: 'whiteFlash 0.6s ease-out forwards' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', animation: 'finalZoom 0.6s cubic-bezier(0.4,0,0.2,1) forwards' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${wallpaper})`, backgroundSize: 300, opacity: 0.35 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(253,248,240,0.70)' }} />
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, padding: '0 28px' }}>
              {landingPage?.image && (
                <div style={{ width: 240, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(40,20,5,0.14)', outline: '1px solid rgba(201,168,76,0.30)', outlineOffset: 3 }}>
                  <img src={landingPage.image} alt="" style={{ width: '100%', display: 'block', objectFit: isPng ? 'contain' : 'cover', maxHeight: 170, padding: isPng ? 12 : 0, background: isPng ? imgBg : 'none' }} />
                </div>
              )}
              <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, lineHeight: 1.7, color: 'hsl(25,30%,22%)', textAlign: 'center', maxWidth: 280, opacity: 0.9 }}>
                {(landingPage?.text ?? '').slice(0, 80)}{(landingPage?.text?.length ?? 0) > 80 ? '…' : ''}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ── Open book visual (flat spread, for opening animation phase 3) ─────────────
const OpenBook = ({ colorKey }: { colorKey: string }) => {
  const th = THEME[colorKey] ?? THEME.peach;
  const PW = 150, PH = 200;
  return (
    <div style={{ position: 'relative', width: PW * 2 + 20, height: PH + 30, transformStyle: 'preserve-3d' }}>
      {/* Back cover */}
      <div style={{ position: 'absolute', left: -12, top: -8, width: PW * 2 + 44, height: PH + 28, background: `linear-gradient(180deg, ${th.spine}, ${th.front})`, borderRadius: 8, boxShadow: '0 18px 40px rgba(40,20,5,0.45), 0 0 0 1px rgba(160,130,55,0.4)', transform: 'translateZ(-8px)' }}>
        <div style={{ position: 'absolute', inset: 6, border: `1.5px solid ${GOLD}`, borderRadius: 5, opacity: 0.85 }} />
      </div>
      {/* Left page */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, background: 'linear-gradient(180deg, hsl(44,38%,96%), hsl(40,32%,92%) 60%, hsl(36,26%,86%))', borderRadius: '4px 1px 1px 4px', boxShadow: 'inset -8px 0 12px rgba(120,90,50,0.18), inset 0 0 30px rgba(255,220,160,0.35)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(255,235,180,0.55), transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '18px 22px', display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.18 }}>
          {[0.85, 0.92, 0.7, 0.88, 0.78, 0.92, 0.66, 0.84].map((w, j) => <div key={j} style={{ height: 2, width: `${w * 100}%`, background: 'hsl(25,40%,40%)', borderRadius: 1 }} />)}
        </div>
      </div>
      {/* Right page */}
      <div style={{ position: 'absolute', left: PW + 20, top: 0, width: PW, height: PH, background: 'linear-gradient(180deg, hsl(44,38%,96%), hsl(40,32%,92%) 60%, hsl(36,26%,86%))', borderRadius: '1px 4px 4px 1px', boxShadow: 'inset 8px 0 12px rgba(120,90,50,0.18), inset 0 0 30px rgba(255,220,160,0.35)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,235,180,0.55), transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '18px 22px', display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.18 }}>
          {[0.88, 0.78, 0.92, 0.7, 0.86, 0.74, 0.9, 0.8].map((w, j) => <div key={j} style={{ height: 2, width: `${w * 100}%`, background: 'hsl(25,40%,40%)', borderRadius: 1 }} />)}
        </div>
      </div>
      {/* Spine crease */}
      <div style={{ position: 'absolute', left: PW, top: -2, width: 20, height: PH + 4, background: 'linear-gradient(to right, rgba(60,30,10,0.45), rgba(40,20,5,0.65) 50%, rgba(60,30,10,0.45))', borderRadius: 2, boxShadow: '0 0 12px rgba(255,220,160,0.5)', zIndex: 10 }} />
      <div style={{ position: 'absolute', left: PW + 10, top: '50%', transform: 'translate(-50%,-50%)', width: 180, height: PH * 1.2, background: 'radial-gradient(ellipse at center, rgba(255,235,180,0.85), rgba(255,210,140,0.4) 35%, transparent 70%)', zIndex: 11, pointerEvents: 'none', mixBlendMode: 'screen' }} />
    </div>
  );
};

// ── Main StoryLibrary (orchestrates all screens) ──────────────────────────────

interface StoryLibraryProps {
  header: React.ReactNode;
}

const StoryLibrary = ({ header }: StoryLibraryProps) => {
  const { stories } = useStories();
  const [screen, setScreen] = useState<'library' | 'focus' | 'opening' | 'reading'>('library');
  const [activeIndex, setActiveIndex] = useState(0);
  const [story, setStory] = useState<Story | null>(null);

  if (!stories.length) return null;

  const select = (s: Story) => {
    setStory(s);
    setActiveIndex(stories.findIndex(x => x.id === s.id));
    setScreen('focus');
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {screen === 'library' && (
        <LibraryScreen stories={stories} active={activeIndex} setActive={setActiveIndex} onSelect={select} header={header} />
      )}
      {screen === 'focus' && story && (
        <FocusScreen story={story} onBack={() => setScreen('library')} onOpen={() => setScreen('opening')} />
      )}
      {screen === 'opening' && story && (
        <OpeningAnimation story={story} onComplete={() => setScreen('reading')} />
      )}
      {screen === 'reading' && story && (
        <StoryReader story={story} onClose={() => { setScreen('library'); setStory(null); }} />
      )}
    </div>
  );
};

export default StoryLibrary;
