import { useState, useRef, useEffect, lazy, Suspense, Component, ReactNode } from 'react';
import { Story } from '@/data/stories';
import { useStories } from '@/contexts/StoriesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import StoryCard from './StoryCard';
import StoryReader from './StoryReader';
import OpeningAnimationV2 from './OpeningAnimationV2';
import wallpaper from '@/assets/papierpaint.png';
import { GOLD, THEME } from '@/lib/theme';
import { preloadCoverTexture } from './BookScene3D/coverTextureGenerator';

// ── FocusScene3D lazy-loadé (Three.js ne charge qu'au clic sur un livre) ─────
const FocusScene3D = lazy(() => import('./BookScene3D/FocusScene3D'));

// ── ErrorBoundary pour capturer les crashs WebGL/Three.js ────────────────────
interface EBProps { fallback: ReactNode; children: ReactNode; }
interface EBState { crashed: boolean; }
class SceneErrorBoundary extends Component<EBProps, EBState> {
  state: EBState = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  componentDidCatch(error: Error) { console.error('[BookScene3D ERROR]', error.message, error.stack); }
  render() { return this.state.crashed ? this.props.fallback : this.props.children; }
}

// ── Détection WebGL (une seule fois) ─────────────────────────────────────────
const hasWebGL = (() => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
})();

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
  const [selectBounce, setSelectBounce] = useState(false);
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
    // Bounce + glow flash avant de partir en 3D
    setSelectBounce(true);
    setTimeout(() => onSelect(story), 280);
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
            animation: selectBounce ? 'selectBounce 0.28s ease-out forwards' : 'floatBook 3.2s ease-in-out infinite',
            cursor: 'pointer',
            transform: `translateX(${dragX}px)`,
            transition: springing ? 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            filter: selectBounce ? `drop-shadow(0 0 28px ${th.spark}) brightness(1.15)` : undefined,
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

// ── Screen: Focus — livre 3D seamless, swipe up déclenche l'ouverture ─────────
const FocusScreen = ({ story, onBack, onComplete }: { story: Story; onBack: () => void; onComplete: () => void }) => {
  const { t } = useLanguage();
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [triggered, setTriggered] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const startRef = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const dragRef = useRef({ x: 0, y: 0 });
  const th = THEME[story.colorKey] ?? THEME.peach;

  // Magnitude du drag pour le glow
  const dragMag = Math.min(1, Math.sqrt(drag.x * drag.x + drag.y * drag.y) / 120);
  const glowSize = 180 + dragMag * 140;

  useEffect(() => {
    if (triggered) return;
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = (e as TouchEvent).touches?.[0]?.clientX ?? (e as MouseEvent).clientX;
      const y = (e as TouchEvent).touches?.[0]?.clientY ?? (e as MouseEvent).clientY;
      const dx = x - startRef.current.x;
      const dy = y - startRef.current.y;
      // Clamp pour garder le livre dans un range raisonnable
      const cx = Math.max(-160, Math.min(160, dx));
      const cy = Math.max(-160, Math.min(160, dy));
      dragRef.current = { x: cx, y: cy };
      setDrag({ x: cx, y: cy });
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) hasMoved.current = true;
    };
    const handleUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsPressing(false);
      setTriggered(true); // release = toujours ouvrir
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
  }, [triggered]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (triggered) return;
    e.preventDefault();
    const x = (e as React.TouchEvent).touches?.[0]?.clientX ?? (e as React.MouseEvent).clientX;
    const y = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY;
    startRef.current = { x, y };
    hasMoved.current = false;
    isDragging.current = true;
    setIsPressing(true);
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, userSelect: 'none', touchAction: 'none',
        background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`,
        overflow: 'hidden',
      }}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {/* Étoiles de fond */}
      {BG_STARS.slice(0, 10).map(s => (
        <div key={s.id} style={{ position: 'absolute', left: s.x + '%', top: s.y + '%', width: s.size, height: s.size, borderRadius: '50%', background: 'white', opacity: 0.6, animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}

      {/* Glow orb couleur du thème */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(${th.glow}, ${th.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0, transition: 'width 0.1s, height 0.1s' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize * 1.5, height: glowSize * 1.5, borderRadius: '50%', background: `radial-gradient(${th.glow}, transparent 60%)`, pointerEvents: 'none', zIndex: 0, animation: 'pulseGlow 0.6s ease-in-out infinite' }} />

      {/* Scène 3D (canvas transparent, laisse voir les étoiles/glow derrière) */}
      <Suspense fallback={null}>
        <FocusScene3D
          story={story}
          triggered={triggered}
          dragX={drag.x}
          dragY={drag.y}
          onComplete={onComplete}
        />
      </Suspense>

      {/* UI overlay — disparaît quand triggered */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        pointerEvents: triggered ? 'none' : 'auto',
        opacity: triggered ? 0 : 1,
        transition: triggered ? 'opacity 0.4s ease-out' : 'none',
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          style={{ position: 'absolute', top: 52, left: 16, zIndex: 50, background: 'rgba(255,255,255,0.60)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Hint — "touche et bouge le livre, relâche pour ouvrir" */}
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 2, opacity: triggered ? 0 : 0.75, transition: 'opacity 0.3s', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ animation: 'swipeHint 1.6s ease-in-out infinite', display: 'flex', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,30%)" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
            </svg>
          </div>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 600, color: 'hsl(25,30%,35%)', whiteSpace: 'nowrap' }}>{isPressing ? t.releaseToOpen : t.swipeHint}</div>
        </div>
      </div>
    </div>
  );
};

// ── Main StoryLibrary (orchestrates all screens) ──────────────────────────────

interface StoryLibraryProps {
  header: React.ReactNode;
}

const StoryLibrary = ({ header }: StoryLibraryProps) => {
  const { stories } = useStories();
  const [screen, setScreen] = useState<'library' | 'focus' | 'reading'>('library');
  const [activeIndex, setActiveIndex] = useState(0);
  const [story, setStory] = useState<Story | null>(null);

  if (!stories.length) return null;

  const select = (s: Story) => {
    preloadCoverTexture(s); // démarre le dessin canvas + cache la texture AVANT que BookMesh monte
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
        <SceneErrorBoundary fallback={<OpeningAnimationV2 story={story} onComplete={() => setScreen('reading')} />}>
          <FocusScreen story={story} onBack={() => setScreen('library')} onComplete={() => setScreen('reading')} />
        </SceneErrorBoundary>
      )}
      {screen === 'reading' && story && (
        <StoryReader story={story} onClose={() => { setScreen('library'); setStory(null); }} />
      )}
    </div>
  );
};

export default StoryLibrary;
