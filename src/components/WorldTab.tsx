import React, { useState, useRef, useEffect } from 'react';
import { WorldLocation } from '@/data/world';
import { useLocations } from '@/contexts/LocationsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CrystalBall from '@/components/CrystalBall';
import { GOLD, THEME, LOCATION_COLOR_KEY, LOCATION_PANORAMA } from '@/lib/theme';

// ── PIN positions on the parchment (% of 320×380) ────────────────────────────
const PIN_POSITIONS = [
  { x: 28, y: 64 },
  { x: 64, y: 44 },
  { x: 36, y: 30 },
  { x: 72, y: 72 },
  { x: 50, y: 52 },
  { x: 20, y: 44 },
];

// ── Stars background ──────────────────────────────────────────────────────────
const StarsBg = () => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
    {Array.from({ length: 18 }, (_, i) => (
      <div key={i} style={{
        position: 'absolute',
        left: `${(i * 41 + 13) % 100}%`,
        top: `${(i * 59 + 5) % 70}%`,
        width: 2 + (i % 2), height: 2 + (i % 2),
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.7)',
        animation: `twinkle ${1.8 + (i % 4) * 0.7}s ${(i * 0.3) % 4}s ease-in-out infinite`,
      }} />
    ))}
  </div>
);

// ── Orb Thumbnail ─────────────────────────────────────────────────────────────
const OrbThumb = ({ location, isActive }: { location: WorldLocation; isActive: boolean }) => {
  const colorKey = LOCATION_COLOR_KEY[location.id] ?? 'sky';
  const t = THEME[colorKey] ?? THEME.sky;
  const panorama = LOCATION_PANORAMA[location.id] ?? LOCATION_PANORAMA['moon-lake'];
  return (
    <div style={{ width: 46, height: 62, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), ${t.bg1} 30%, ${t.spine} 100%)`, boxShadow: isActive ? `0 4px 12px ${t.glow}, 0 0 0 1.5px ${GOLD}, inset -2px -3px 6px rgba(0,0,0,0.3), inset 1px 1px 2px rgba(255,255,255,0.5)` : `0 2px 6px rgba(40,20,5,0.3), 0 0 0 1px ${GOLD}aa, inset -2px -3px 5px rgba(0,0,0,0.25)`, transition: 'box-shadow 0.35s', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: '45% 14% 22%', borderRadius: '50%', background: panorama, opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: '18%', left: '22%', width: 4, height: 4, borderRadius: '50%', background: 'white' }} />
      </div>
    </div>
  );
};

// ── Parchment Map ─────────────────────────────────────────────────────────────
const ParchmentMap = ({ locations, activeId, onPinClick, animateIn = true }: {
  locations: WorldLocation[];
  activeId: string;
  onPinClick: (loc: WorldLocation) => void;
  animateIn?: boolean;
}) => {
  return (
    <div style={{
      position: 'relative', width: 320, height: 380,
      animation: animateIn ? 'mapUnfold 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
      transform: 'translate(-50%,-50%)',
      transformOrigin: 'center',
      background: `
        radial-gradient(ellipse at 30% 20%, hsl(40,42%,90%) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 80%, hsl(36,38%,85%) 0%, transparent 50%),
        linear-gradient(135deg, hsl(40,40%,88%), hsl(36,32%,82%) 60%, hsl(32,28%,76%))
      `,
      borderRadius: 8,
      boxShadow: `0 24px 60px rgba(40,20,5,0.45), inset 0 0 60px rgba(120,80,40,0.18), inset 0 0 0 1px rgba(160,130,55,0.4)`,
    }}>
      {/* Paper texture */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backgroundImage: `repeating-linear-gradient(0deg, transparent 0 3px, rgba(80,50,20,0.025) 3px 4px), repeating-linear-gradient(90deg, transparent 0 3px, rgba(80,50,20,0.02) 3px 4px), radial-gradient(circle at 15% 25%, rgba(120,80,30,0.18) 0%, transparent 8%), radial-gradient(circle at 78% 18%, rgba(120,80,30,0.15) 0%, transparent 10%)`, pointerEvents: 'none' }} />
      {/* Burnt edges */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0 0 30px rgba(80,40,15,0.35), inset 0 0 80px rgba(80,40,15,0.15)', pointerEvents: 'none' }} />

      {/* Compass rose */}
      <svg viewBox="0 0 60 60" style={{ position: 'absolute', top: 14, right: 14, width: 48, height: 48, opacity: 0.55 }}>
        <circle cx="30" cy="30" r="22" fill="none" stroke="hsl(25,40%,25%)" strokeWidth="0.8" />
        <circle cx="30" cy="30" r="15" fill="none" stroke="hsl(25,40%,25%)" strokeWidth="0.6" />
        <path d="M 30 8 L 33 30 L 30 52 L 27 30 Z" fill="hsl(25,40%,25%)" opacity="0.75" />
        <path d="M 8 30 L 30 27 L 52 30 L 30 33 Z" fill="hsl(25,40%,25%)" opacity="0.55" />
        <text x="30" y="6" textAnchor="middle" fontFamily="serif" fontSize="6" fontWeight="700" fill="hsl(25,40%,25%)">N</text>
      </svg>

      {/* Title cartouche */}
      <div style={{ position: 'absolute', top: 14, left: 18, fontFamily: "'Quicksand',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'hsl(25,45%,25%)' }}>
        <div style={{ fontStyle: 'italic', fontWeight: 600, fontSize: 9, letterSpacing: '0.1em', marginBottom: 1, opacity: 0.7 }}>Carte de</div>
        <div style={{ fontSize: 14, letterSpacing: '0.18em' }}>PokéLoria</div>
        <div style={{ width: 50, height: 1, background: 'hsl(25,45%,25%)', marginTop: 3, opacity: 0.6 }} />
      </div>

      {/* Terrain SVG */}
      <svg viewBox="0 0 100 120" style={{ position: 'absolute', inset: '14% 6% 6%', width: '88%', height: '80%', opacity: 0.55 }} preserveAspectRatio="none">
        <ellipse cx="62" cy="42" rx="22" ry="14" fill="hsl(140,38%,45%)" opacity="0.55" />
        <circle cx="55" cy="38" r="3" fill="hsl(140,40%,30%)" /><circle cx="65" cy="40" r="3.5" fill="hsl(140,40%,30%)" /><circle cx="72" cy="44" r="3" fill="hsl(140,40%,30%)" /><circle cx="58" cy="46" r="2.8" fill="hsl(140,40%,30%)" /><circle cx="68" cy="48" r="3.2" fill="hsl(140,40%,30%)" />
        <ellipse cx="32" cy="28" rx="14" ry="9" fill="hsl(205,55%,55%)" opacity="0.7" />
        <ellipse cx="32" cy="28" rx="11" ry="7" fill="hsl(205,55%,65%)" opacity="0.6" />
        <path d="M 32 36 Q 36 50 28 62 T 30 90" stroke="hsl(205,55%,55%)" strokeWidth="2.5" fill="none" opacity="0.55" />
        <path d="M 64 80 L 70 64 L 76 80 Z" fill="hsl(270,18%,40%)" opacity="0.7" />
        <path d="M 72 80 L 78 60 L 84 80 Z" fill="hsl(270,18%,35%)" opacity="0.75" />
        <path d="M 68.5 68 L 70 64 L 71.5 68 Z" fill="white" opacity="0.7" />
        <path d="M 76.5 64 L 78 60 L 79.5 64 Z" fill="white" opacity="0.75" />
        <rect x="22" y="68" width="4" height="3" fill="hsl(20,55%,40%)" /><path d="M 22 68 L 24 65 L 26 68 Z" fill="hsl(0,40%,35%)" />
        <rect x="27" y="69" width="3.5" height="2.5" fill="hsl(20,55%,40%)" /><path d="M 27 69 L 28.7 67 L 30.5 69 Z" fill="hsl(0,40%,35%)" />
        <path d="M 28 70 Q 40 60 60 50" stroke="hsl(25,40%,30%)" strokeWidth="0.6" strokeDasharray="1.5 1.5" fill="none" opacity="0.7" />
        <path d="M 30 70 Q 50 78 72 80" stroke="hsl(25,40%,30%)" strokeWidth="0.6" strokeDasharray="1.5 1.5" fill="none" opacity="0.7" />
      </svg>

      {/* Pins */}
      {locations.map((loc, i) => {
        const pos = PIN_POSITIONS[i] ?? { x: 50, y: 50 };
        const isAct = loc.id === activeId;
        const colorKey = LOCATION_COLOR_KEY[loc.id] ?? 'sky';
        const tt = THEME[colorKey] ?? THEME.sky;
        return (
          <button key={loc.id}
            onClick={() => onPinClick(loc)}
            style={{
              position: 'absolute',
              left: `${pos.x}%`, top: `${pos.y}%`,
              transform: 'translate(-50%,-100%)',
              animation: animateIn ? `pinDrop 0.6s ${600 + i * 120}ms cubic-bezier(0.34,1.56,0.64,1) backwards` : 'none',
              border: 'none', background: 'transparent', cursor: 'pointer',
              padding: 0, zIndex: isAct ? 10 : 5,
            }}
          >
            <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: 14, height: 4, borderRadius: '50%', background: 'rgba(40,20,5,0.35)', filter: 'blur(2px)' }} />
            <div style={{ position: 'relative', width: 26, height: 32, animation: isAct ? 'pinPulse 1.4s ease-in-out infinite' : 'none', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: `linear-gradient(135deg, ${tt.front}, ${tt.spine})`, boxShadow: `0 3px 8px rgba(40,20,5,0.4), inset -2px -2px 4px rgba(0,0,0,0.25), inset 2px 2px 4px rgba(255,255,255,0.4), 0 0 0 1.5px ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, white, ${tt.bg1})`, transform: 'rotate(45deg)', boxShadow: 'inset 0 0 0 1px rgba(40,20,5,0.3)' }} />
            </div>
            <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%,4px)', fontFamily: "'Quicksand',sans-serif", fontSize: 9, fontWeight: 700, color: 'hsl(25,45%,22%)', whiteSpace: 'nowrap', textShadow: '0 1px 0 rgba(255,250,235,0.7)', opacity: isAct ? 1 : 0.75, padding: '1px 5px', background: isAct ? 'rgba(255,250,235,0.85)' : 'transparent', borderRadius: 3 }}>{loc.name}</div>
          </button>
        );
      })}
    </div>
  );
};

// ── Location Image Modal ──────────────────────────────────────────────────────
const LocationImageModal = ({ location, onClose }: { location: WorldLocation; onClose: () => void }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const colorKey = LOCATION_COLOR_KEY[location.id] ?? 'sky';
  const t = THEME[colorKey] ?? THEME.sky;
  const images = location.images ?? [];

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(20,10,5,0.85)', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'fadeInUp 0.25s ease-out' }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 20px' }}>
        {/* Close + title */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 15, fontWeight: 700, color: 'white' }}>{location.name}</div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Main image */}
        {images.length > 0 && (
          <div style={{ width: '100%', borderRadius: 20, overflow: 'hidden', boxShadow: `0 0 0 2px ${GOLD}, 0 20px 50px rgba(0,0,0,0.5)` }}>
            <img
              key={imgIndex}
              src={images[imgIndex]}
              alt={location.name}
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {/* Thumbnail strip (if multiple images) */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {images.map((src, i) => (
              <button key={i} onClick={() => setImgIndex(i)} style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === imgIndex ? GOLD : 'rgba(255,255,255,0.2)'}`, padding: 0, cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── World Map Screen (parchment + compact drawer) ─────────────────────────────
const WorldMap = ({ initialId, locations, onBack, header }: {
  initialId: string;
  locations: WorldLocation[];
  onBack: () => void;
  header?: React.ReactNode;
}) => {
  const [activeId, setActiveId] = useState(initialId);
  const [modalLocation, setModalLocation] = useState<WorldLocation | null>(null);
  const { language } = useLanguage();
  const active = locations.find(l => l.id === activeId) ?? locations[0];
  const colorKey = LOCATION_COLOR_KEY[active.id] ?? 'sky';
  const t = THEME[colorKey] ?? THEME.sky;

  const description = typeof (active.description as any) === 'object'
    ? ((active.description as any)[language] ?? (active.description as any)['fr'] ?? '')
    : active.description;

  const handlePinClick = (loc: WorldLocation) => {
    setActiveId(loc.id);
    setModalLocation(loc);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, overflow: 'hidden', transition: 'background 0.6s ease' }}>
      <StarsBg />
      {header}

      <button onClick={onBack} style={{ position: 'absolute', top: 52, left: 14, zIndex: 10, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.65)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
      </button>

      <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(${t.glow}, ${t.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

      {/* Map */}
      <div style={{ position: 'absolute', top: '42%', left: '50%', zIndex: 2 }}>
        <ParchmentMap locations={locations} activeId={activeId} onPinClick={handlePinClick} />
      </div>

      {/* Compact bottom drawer — name + description only */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5, background: 'rgba(255,250,242,0.95)', backdropFilter: 'blur(14px)', borderRadius: '24px 24px 0 0', boxShadow: '0 -10px 30px rgba(40,20,5,0.18), inset 0 1px 0 rgba(255,255,255,0.6)', padding: '14px 20px 28px', animation: 'fadeInUp 0.4s ease-out' }}>
        <div style={{ width: 42, height: 4, borderRadius: 2, background: 'rgba(40,20,5,0.2)', margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, fontWeight: 700, color: 'hsl(25,30%,18%)' }}>{active.name}</div>
          {active.images?.length > 0 && (
            <button
              onClick={() => setModalLocation(active)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 10, border: `1px solid ${t.spine}55`, background: `linear-gradient(135deg, ${t.bg1}, ${t.bg2})`, cursor: 'pointer', fontFamily: "'Quicksand',sans-serif", fontSize: 10, fontWeight: 700, color: t.spine, flexShrink: 0 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              {active.images.length} photo{active.images.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, lineHeight: 1.65, color: 'hsl(25,30%,40%)', margin: 0 }}>{description}</p>
      </div>

      {/* Image modal */}
      {modalLocation && <LocationImageModal location={modalLocation} onClose={() => setModalLocation(null)} />}
    </div>
  );
};

// ── World Focus Screen (drag-up to reveal map) ────────────────────────────────
const WorldFocus = ({ location, onBack, onReveal }: { location: WorldLocation; onBack: () => void; onReveal: () => void }) => {
  const [dragY, setDragY] = useState(0);
  const [springing, setSpringing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragYRef = useRef(0);
  const THRESHOLD = 110;
  const prog = Math.min(1, Math.max(0, -dragY) / THRESHOLD);
  const isReady = prog >= 0.78;
  const colorKey = LOCATION_COLOR_KEY[location.id] ?? 'sky';
  const t = THEME[colorKey] ?? THEME.sky;
  const glowSize = 220 + prog * 160;

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
      if (p >= 0.68) onReveal();
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
  }, [onReveal]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    startYRef.current = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY;
    isDragging.current = true;
    setSpringing(false);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none', overflow: 'hidden' }}>
      <StarsBg />

      <button onClick={onBack} style={{ position: 'absolute', top: 52, left: 14, zIndex: 10, width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.65)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
      </button>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize, height: glowSize, borderRadius: '50%', background: `radial-gradient(${t.glow}, ${t.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0, transition: 'width 0.1s, height 0.1s' }} />
      {isReady && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: glowSize * 1.5, height: glowSize * 1.5, borderRadius: '50%', background: `radial-gradient(${t.glow}, transparent 60%)`, pointerEvents: 'none', zIndex: 0, animation: 'pulseGlow 0.6s ease-in-out infinite' }} />}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
        <div
          onMouseDown={startDrag} onTouchStart={startDrag}
          style={{ transform: `translateY(${prog * -40 + dragY * 0.3}px) scale(${1 + prog * 0.08})`, transition: springing ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none', cursor: 'grab', touchAction: 'none' }}
        >
          <CrystalBall location={location} size={210} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2, opacity: isReady ? 0 : 0.75, transition: 'opacity 0.3s', pointerEvents: 'none' }}>
        <div style={{ animation: 'swipeHint 1.6s ease-in-out infinite' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,30%)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
        </div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 600, color: 'hsl(25,30%,35%)', marginTop: 4 }}>Glisse pour déplier la carte</div>
      </div>
      {isReady && (
        <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, fontWeight: 700, color: t.spine, textShadow: '0 0 20px white', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ✨ Lâche pour révéler !
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, height: 4, background: 'rgba(40,20,5,0.10)', borderRadius: 2, zIndex: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${prog * 100}%`, background: `linear-gradient(to right, ${t.spine}, ${GOLD})`, borderRadius: 2, transition: 'width 0.05s' }} />
      </div>
    </div>
  );
};

// ── World Tab ─────────────────────────────────────────────────────────────────
type Screen = 'library' | 'focus' | 'map';

const WorldTab = ({ header }: { header?: React.ReactNode }) => {
  const { locations } = useLocations();
  const [activeIndex, setActiveIndex] = useState(0);
  const [screen, setScreen] = useState<Screen>('library');
  const [focusLocation, setFocusLocation] = useState<WorldLocation | null>(null);
  const [dragX, setDragX] = useState(0);
  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);
  const [springing, setSpringing] = useState(false);

  const isDragging = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef<'h' | 'v' | null>(null);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const ballRef = useRef<HTMLDivElement>(null);

  const location = locations[activeIndex];
  const colorKey = location ? (LOCATION_COLOR_KEY[location.id] ?? 'sky') : 'sky';
  const t = THEME[colorKey] ?? THEME.sky;

  const H_THRESHOLD = 70;
  const AXIS_LOCK = 8;

  const onPtrMove = (e: React.MouseEvent | React.TouchEvent) => {
    const el = ballRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const touch = (e as React.TouchEvent).touches?.[0];
    const cx = (touch?.clientX ?? (e as React.MouseEvent).clientX) - r.left;
    const cy = (touch?.clientY ?? (e as React.MouseEvent).clientY) - r.top;
    setPtr({ x: Math.max(0, Math.min(1, cx / r.width)), y: Math.max(0, Math.min(1, cy / r.height)) });
  };

  useEffect(() => {
    if (screen !== 'library') return;
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
        const atLeft = activeIndex === 0 && dx > 0;
        const atRight = activeIndex === locations.length - 1 && dx < 0;
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
        const wantNext = dx < -H_THRESHOLD && activeIndex < locations.length - 1;
        const wantPrev = dx > H_THRESHOLD && activeIndex > 0;
        if (wantNext || wantPrev) {
          setSpringing(true);
          setDragX(wantNext ? -380 : 380);
          setTimeout(() => {
            setSpringing(false);
            setActiveIndex(i => i + (wantNext ? 1 : -1));
            setDragX(wantNext ? 380 : -380);
            dragXRef.current = wantNext ? 380 : -380;
            requestAnimationFrame(() => {
              setSpringing(true);
              setDragX(0); dragXRef.current = 0;
              setTimeout(() => setSpringing(false), 420);
            });
          }, 280);
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
  }, [screen, activeIndex, locations.length]);

  const onDown = (e: React.MouseEvent | React.TouchEvent) => {
    const x = (e as React.TouchEvent).touches?.[0]?.clientX ?? (e as React.MouseEvent).clientX;
    const y = (e as React.TouchEvent).touches?.[0]?.clientY ?? (e as React.MouseEvent).clientY;
    isDragging.current = true;
    startRef.current = { x, y };
    axisRef.current = null;
    dragXRef.current = 0;
    movedRef.current = false;
  };

  const onTap = () => {
    if (movedRef.current) return;
    if (location) { setFocusLocation(location); setScreen('focus'); }
  };

  if (!location || locations.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, transition: 'background 0.6s ease', overflow: 'hidden' }}>
      {screen === 'library' && (
        <>
          <StarsBg />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(${t.glow}, ${t.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0, transition: 'background 0.5s ease' }} />
          {header}

          {/* Ball area */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 210, zIndex: 2 }}>
            <div
              ref={ballRef}
              onMouseMove={onPtrMove} onMouseLeave={() => setPtr(null)}
              onTouchMove={onPtrMove}
              onMouseDown={onDown} onTouchStart={onDown}
              onClick={onTap}
              style={{
                cursor: 'pointer',
                transform: `translateX(${dragX}px)`,
                transition: springing ? 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                touchAction: 'pan-y', userSelect: 'none',
              }}
            >
              <CrystalBall location={location} size={210} reflection={ptr} />
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, paddingBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {locations.map((_, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === activeIndex ? GOLD : 'rgba(40,20,5,0.25)', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, paddingLeft: 24, paddingRight: 24, paddingTop: 22, paddingBottom: 4, overflowX: 'auto', scrollbarWidth: 'none', justifyContent: locations.length <= 6 ? 'center' : undefined }}>
              {locations.map((loc, i) => {
                const isAct = i === activeIndex;
                return (
                  <div key={loc.id} onClick={() => setActiveIndex(i)} style={{ cursor: 'pointer', flexShrink: 0, transform: isAct ? 'scale(1.15) translateY(-5px)' : 'scale(0.92)', opacity: isAct ? 1 : 0.55, transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s' }}>
                    <OrbThumb location={loc} isActive={isAct} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button
                onClick={() => { setFocusLocation(location); setScreen('focus'); }}
                style={{ background: 'rgba(40,20,5,0.10)', backdropFilter: 'blur(8px)', border: '1px solid rgba(40,20,5,0.12)', borderRadius: 24, padding: '10px 22px', cursor: 'pointer', fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13, color: 'hsl(25,30%,22%)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" style={{ display: 'block' }}><path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill="hsl(25,30%,25%)" /></svg>
                Touche pour révéler
                <svg width="11" height="11" viewBox="0 0 24 24" style={{ display: 'block' }}><path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill="hsl(25,30%,25%)" /></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {screen === 'focus' && focusLocation && (
        <WorldFocus location={focusLocation} onBack={() => setScreen('library')} onReveal={() => setScreen('map')} />
      )}
      {screen === 'map' && focusLocation && (
        <WorldMap initialId={focusLocation.id} locations={locations} onBack={() => { setScreen('library'); setFocusLocation(null); }} header={header} />
      )}
    </div>
  );
};

export default WorldTab;
