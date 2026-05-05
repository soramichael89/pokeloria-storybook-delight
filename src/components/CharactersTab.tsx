import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '@/data/characters';
import { useCharacters } from '@/contexts/CharactersContext';
import { useLanguage } from '@/contexts/LanguageContext';
import TcgCard from '@/components/TcgCard';
import { GOLD, THEME, TYPE_COLOR, COLOR_KEY_TO_TYPE } from '@/lib/theme';

// ── Pre-computed particle data (no Math.random at render time) ────────────────
const INVOCATION_PARTICLES = Array.from({ length: 48 }, (_, i) => {
  const angle = (i / 48) * 360 + ((i * 7.3) % 15);
  const dist = 80 + ((i * 31) % 220);
  return {
    id: i,
    x: Math.cos(angle * Math.PI / 180) * dist,
    y: Math.sin(angle * Math.PI / 180) * dist,
    rot: ((i * 127) % 720) - 360,
    delay: 100 + ((i * 17) % 800),
    duration: 1200 + ((i * 41) % 400),
    size: 7 + ((i * 3) % 14),
  };
});

const SPIRAL_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  delay: i * 40,
  radius: 60 + (i % 3) * 25,
}));

// ── Star SVG ──────────────────────────────────────────────────────────────────
const StarShape = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path d="M12 2 L13 10 L22 12 L13 14 L12 22 L11 14 L2 12 L11 10 Z" fill={color} />
  </svg>
);

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

// ── Character Silhouette ──────────────────────────────────────────────────────
const CharacterSilhouette = ({ character, large = false, imageUrl }: { character: Character; large?: boolean; imageUrl?: string }) => {
  const t = THEME[character.colorKey] ?? THEME.peach;
  const typeName = COLOR_KEY_TO_TYPE[character.colorKey] ?? 'Électrik';
  const tc = TYPE_COLOR[typeName] ?? TYPE_COLOR['Électrik'];
  const size = large ? 240 : 200;
  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      {/* Circle — overflow hidden so image is clipped cleanly */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 30%, ${tc.bg}, ${t.front} 50%, ${t.spine} 100%)`,
        boxShadow: `0 0 60px ${t.glow}, 0 12px 40px rgba(40,20,5,0.4), inset 0 0 0 4px ${GOLD}, inset 0 0 0 6px rgba(255,255,255,0.5)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {imageUrl ? (
          <img src={imageUrl} alt={character.name} style={{ width: '88%', height: '88%', objectFit: 'contain' }} />
        ) : (
          <div style={{ fontSize: size * 0.55, fontFamily: "'Quicksand',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,0.92)', textShadow: '0 4px 16px rgba(0,0,0,0.4)', lineHeight: 1 }}>
            {character.name.charAt(0)}
          </div>
        )}
      </div>
      {/* Badge outside circle */}
      <div style={{ position: 'absolute', bottom: -4, right: -4, width: 54, height: 54, borderRadius: '50%', background: tc.accent, border: `3px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        {tc.icon}
      </div>
    </div>
  );
};

// ── Invocation Animation ──────────────────────────────────────────────────────
const InvocationAnimation = ({ character, onComplete }: { character: Character; onComplete: () => void }) => {
  const [phase, setPhase] = useState(1);
  const t = THEME[character.colorKey] ?? THEME.peach;
  const typeName = COLOR_KEY_TO_TYPE[character.colorKey] ?? 'Électrik';
  const tc = TYPE_COLOR[typeName] ?? TYPE_COLOR['Électrik'];

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, overflow: 'hidden' }}>
      <StarsBg />

      {/* Pulsing glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: phase === 1 ? 180 : phase === 2 ? 340 : phase === 3 ? 500 : 600,
        height: phase === 1 ? 180 : phase === 2 ? 340 : phase === 3 ? 500 : 600,
        borderRadius: '50%',
        background: `radial-gradient(${tc.accent}cc, ${t.glow} 35%, transparent 72%)`,
        zIndex: 1, pointerEvents: 'none',
        opacity: phase === 1 ? 0.4 : phase === 4 ? 0 : 1,
        transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)', mixBlendMode: 'screen',
      }} />

      {/* Spinning rays (phases 2–3) */}
      {phase >= 2 && phase <= 3 && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 600, height: 600,
          background: `conic-gradient(from 0deg, transparent 0deg, ${tc.accent}55 30deg, transparent 60deg, ${t.glow} 100deg, transparent 140deg, ${tc.accent}66 180deg, transparent 220deg, ${t.glow} 280deg, transparent 320deg, ${tc.accent}55 360deg)`,
          borderRadius: '50%', zIndex: 1, pointerEvents: 'none',
          animation: 'raysSpin 1.6s linear infinite',
          opacity: phase === 3 ? 0.85 : 0.5, mixBlendMode: 'screen',
          transform: 'translate(-50%,-50%)',
          WebkitMaskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
          maskImage: 'radial-gradient(circle, black 25%, transparent 70%)',
        } as React.CSSProperties} />
      )}

      {/* Phase 1 — card swipes up */}
      {phase === 1 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'cardSwipeUp 0.55s cubic-bezier(0.4,0,0.6,1) forwards' }}>
          <TcgCard character={character} size={1.35} />
        </div>
      )}

      {/* Phase 2 — card returns + glows */}
      {phase === 2 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'cardReturn 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <div style={{ position: 'relative', animation: 'cardGlowPulse 0.6s ease-in-out infinite alternate' }}>
            <TcgCard character={character} size={1.35} />
          </div>
        </div>
      )}

      {/* Phase 3 — particles + dissolve + silhouette */}
      {phase === 3 && (
        <>
          {INVOCATION_PARTICLES.map(p => (
            <div key={p.id} style={{
              position: 'absolute', top: '50%', left: '50%', zIndex: 8,
              animation: `invokePulse ${p.duration}ms ${p.delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
              opacity: 0,
              ['--ix' as any]: `${p.x}px`,
              ['--iy' as any]: `${p.y}px`,
              ['--ir' as any]: `${p.rot}deg`,
            }}>
              <StarShape color={tc.accent} size={p.size} />
            </div>
          ))}
          {SPIRAL_PARTICLES.map(p => (
            <div key={`s${p.id}`} style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%,-50%) rotate(${p.angle}deg) translateY(-${p.radius}px)`,
              zIndex: 7,
              animation: `spiralOrbit 1.4s ${p.delay}ms ease-in-out forwards`,
              opacity: 0,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.accent, boxShadow: `0 0 12px ${tc.accent}, 0 0 24px ${t.glow}` }} />
            </div>
          ))}
          <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, transform: 'translate(-50%,-50%)', animation: 'cardDissolve 0.8s ease-out forwards' }}>
            <TcgCard character={character} size={1.35} />
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 6, animation: 'summonAppear 1.4s 0.3s cubic-bezier(0.25,0.46,0.45,0.94) forwards', opacity: 0 }}>
            <CharacterSilhouette character={character} />
          </div>
        </>
      )}

      {/* Phase 4 — white flash + zoom */}
      {phase === 4 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 20, animation: 'whiteFlash 0.5s ease-out forwards' }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, animation: 'finalZoom 0.5s cubic-bezier(0.4,0,0.2,1) forwards' }}>
            <CharacterSilhouette character={character} large />
          </div>
        </>
      )}
    </div>
  );
};

// ── Character Focus Screen ────────────────────────────────────────────────────
const CharacterFocus = ({ character, onBack, onInvoke }: { character: Character; onBack: () => void; onInvoke: () => void }) => {
  const [dragY, setDragY] = useState(0);
  const [springing, setSpringing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const isDragging = useRef(false);
  const dragYRef = useRef(0);
  const rotDir = useRef(character.name.charCodeAt(0) % 2 === 0 ? 1 : -1);
  const THRESHOLD = 110;
  const prog = Math.min(1, Math.max(0, -dragY) / THRESHOLD);
  const isReady = prog >= 0.78;
  const t = THEME[character.colorKey] ?? THEME.peach;
  const glowSize = 180 + prog * 120;

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
      if (p >= 0.68) onInvoke();
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
  }, [onInvoke]);

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
          style={{ transform: `translateY(${prog * -40 + dragY * 0.3}px) rotate(${rotDir.current * 2 * prog}deg)`, transition: springing ? 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'none', cursor: 'grab', touchAction: 'none' }}
        >
          <TcgCard character={character} size={1.35} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 2, opacity: isReady ? 0 : 0.75, transition: 'opacity 0.3s', pointerEvents: 'none' }}>
        <div style={{ animation: 'swipeHint 1.6s ease-in-out infinite' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,30%)" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
        </div>
        <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 12, fontWeight: 600, color: 'hsl(25,30%,35%)', marginTop: 4 }}>Glisse pour invoquer</div>
      </div>
      {isReady && (
        <div style={{ position: 'absolute', bottom: 96, left: '50%', transform: 'translateX(-50%)', zIndex: 2, animation: 'fadeInUp 0.3s ease-out' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 16, fontWeight: 700, color: t.spine, textShadow: '0 0 20px white', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            ✨ Lâche pour invoquer !
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 60, left: 60, right: 60, height: 4, background: 'rgba(40,20,5,0.10)', borderRadius: 2, zIndex: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${prog * 100}%`, background: `linear-gradient(to right, ${t.spine}, ${GOLD})`, borderRadius: 2, transition: 'width 0.05s' }} />
      </div>
    </div>
  );
};

// ── Character Detail Screen ───────────────────────────────────────────────────
const CharacterDetail = ({ character, onClose }: { character: Character; onClose: () => void }) => {
  const [activeImage, setActiveImage] = useState<'standard' | 'figurine' | 'dessin'>('standard');
  const { t } = useLanguage();
  const th = THEME[character.colorKey] ?? THEME.peach;
  const typeName = COLOR_KEY_TO_TYPE[character.colorKey] ?? 'Électrik';
  const tc = TYPE_COLOR[typeName] ?? TYPE_COLOR['Électrik'];

  const IMAGE_TYPES = [
    { key: 'standard' as const, label: t.illustration },
    { key: 'figurine' as const, label: t.figurine },
    { key: 'dessin' as const, label: t.dessin },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`, display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.4s ease-out', overflow: 'hidden' }}>
      <StarsBg />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 16px 12px' }}>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.65)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700, color: 'hsl(25,30%,22%)' }}>{character.name}</div>
          <div style={{ fontSize: 10, color: 'hsl(25,15%,45%)', fontStyle: 'italic', fontFamily: "'Nunito',sans-serif" }}>{character.role}</div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* Portrait circle — shows the selected image */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', padding: '0 0 12px', animation: 'fadeInUp 0.5s 0.1s ease-out backwards' }}>
        <CharacterSilhouette character={character} large imageUrl={character.images[activeImage]} />
      </div>

      {/* Image type switcher */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 18px 10px', animation: 'fadeInUp 0.5s 0.2s ease-out backwards' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {IMAGE_TYPES.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveImage(key)} style={{ flex: 1, padding: '8px 6px', borderRadius: 12, border: 'none', cursor: 'pointer', background: activeImage === key ? GOLD : 'rgba(40,20,5,0.06)', color: activeImage === key ? '#fff' : 'hsl(25,30%,22%)', fontFamily: "'Quicksand',sans-serif", fontSize: 11, fontWeight: 700, transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Description + skills */}
      <div style={{ flex: 1, position: 'relative', zIndex: 2, padding: '4px 18px 24px', overflowY: 'auto', animation: 'fadeInUp 0.5s 0.3s ease-out backwards' }}>
        <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(10px)', borderRadius: 18, padding: '12px 14px', boxShadow: '0 4px 18px rgba(40,20,5,0.10)', border: '1px solid rgba(255,255,255,0.5)', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{ padding: '3px 9px', borderRadius: 8, background: `linear-gradient(to right, ${tc.accent}cc, ${tc.accent}66)`, color: 'white', fontFamily: "'Quicksand',sans-serif", fontSize: 10, fontWeight: 700 }}>{tc.icon} {typeName}</span>
          </div>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 13, lineHeight: 1.6, color: 'hsl(25,30%,22%)' }}>{character.description}</p>
        </div>

        {character.skills.length > 0 && (
          <>
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(40,20,5,0.55)', marginBottom: 8, paddingLeft: 4 }}>
              {t.capacites}
            </div>
            {character.skills.map((skill, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: 14, padding: '10px 12px', marginBottom: 8 }}>
                <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700, color: 'hsl(25,30%,18%)' }}>{skill.name}</div>
                <div style={{ fontFamily: "'Nunito',sans-serif", fontSize: 11, color: 'hsl(25,15%,45%)', lineHeight: 1.5, marginTop: 2 }}>{skill.description}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// ── Thumbnail ─────────────────────────────────────────────────────────────────
const THUMB_W = 46;
const THUMB_GAP = 10;

const TcgThumb = ({ character, isActive }: { character: Character; isActive: boolean }) => {
  const t = THEME[character.colorKey] ?? THEME.peach;
  const typeName = COLOR_KEY_TO_TYPE[character.colorKey] ?? 'Électrik';
  const tc = TYPE_COLOR[typeName] ?? TYPE_COLOR['Électrik'];
  return (
    <div style={{ width: THUMB_W, height: 62, borderRadius: 5, overflow: 'hidden', background: `linear-gradient(155deg, ${tc.bg}, ${t.bg1})`, boxShadow: isActive ? `0 6px 20px ${t.glow}, 0 0 0 1.5px ${GOLD}, inset 0 0 0 1px rgba(255,255,255,0.5)` : `0 3px 8px rgba(0,0,0,0.15), 0 0 0 1px ${GOLD}`, transition: 'box-shadow 0.35s', pointerEvents: 'none', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, margin: '3px 3px 1px', borderRadius: 2, background: `linear-gradient(135deg, ${t.front}, ${t.spine})`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {character.images?.standard ? (
          <img src={character.images.standard} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: 18, fontFamily: "'Quicksand',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>{character.name.charAt(0)}</span>
        )}
      </div>
      <div style={{ padding: '1px 3px 2px', fontFamily: "'Quicksand',sans-serif", fontSize: 6, fontWeight: 700, color: 'hsl(25,30%,22%)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
        {character.name.split(' ').slice(-1)[0]}
      </div>
    </div>
  );
};

// ── Characters Tab ────────────────────────────────────────────────────────────
type Screen = 'library' | 'focus' | 'invoke' | 'detail';

const CharactersTab = ({ header }: { header?: React.ReactNode }) => {
  const { characters } = useCharacters();
  const [activeIndex, setActiveIndex] = useState(0);
  const [screen, setScreen] = useState<Screen>('library');
  const [focusChar, setFocusChar] = useState<Character | null>(null);
  const [dragX, setDragX] = useState(0);
  const [ptr, setPtr] = useState<{ x: number; y: number } | null>(null);

  const isDragging = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef<'h' | 'v' | null>(null);
  const dragXRef = useRef(0);
  const movedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const character = characters[activeIndex];
  const t = character ? (THEME[character.colorKey] ?? THEME.peach) : THEME.peach;

  const H_THRESHOLD = 70;
  const AXIS_LOCK = 8;

  const onPtrMove = (e: React.MouseEvent | React.TouchEvent) => {
    const el = cardRef.current; if (!el) return;
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
        const atRight = activeIndex === characters.length - 1 && dx < 0;
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
        if (dx < -H_THRESHOLD && activeIndex < characters.length - 1) setActiveIndex(i => i + 1);
        else if (dx > H_THRESHOLD && activeIndex > 0) setActiveIndex(i => i - 1);
        dragXRef.current = 0;
        setDragX(0);
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
  }, [screen, activeIndex, characters.length]);

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
    if (character) { setFocusChar(character); setScreen('focus'); }
  };

  if (!character || characters.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})`, transition: 'background 0.6s ease', overflow: 'hidden' }}>
      {screen === 'library' && (
        <>
          <StarsBg />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(${t.glow}, ${t.glow2}, transparent 70%)`, pointerEvents: 'none', zIndex: 0, transition: 'background 0.5s ease' }} />
          {header}

          {/* Card area */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingBottom: 200, zIndex: 2 }}>
            <div
              ref={cardRef}
              onMouseMove={onPtrMove} onMouseLeave={() => setPtr(null)}
              onTouchMove={onPtrMove}
              onMouseDown={onDown} onTouchStart={onDown}
              onClick={onTap}
              style={{
                cursor: 'pointer',
                transform: `translateX(${dragX * 0.7}px) rotate(${dragX * 0.015}deg)`,
                transition: dragX === 0 ? 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
                touchAction: 'pan-y', userSelect: 'none',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, scale: 0.88, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 20px 40px ${t.glow}) drop-shadow(0 8px 16px ${t.glow2})` }}
                >
                  <TcgCard character={character} size={1.35} reflection={ptr} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom controls */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, paddingBottom: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {characters.map((_, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === activeIndex ? GOLD : 'rgba(40,20,5,0.25)', transition: 'all 0.3s ease', border: 'none', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: THUMB_GAP, paddingLeft: 24, paddingRight: 24, paddingTop: 22, paddingBottom: 4, overflowX: 'auto', scrollbarWidth: 'none', justifyContent: characters.length <= 5 ? 'center' : undefined }}>
              {characters.map((ch, i) => {
                const isAct = i === activeIndex;
                return (
                  <div key={ch.id} onClick={() => setActiveIndex(i)} style={{ cursor: 'pointer', flexShrink: 0, transform: isAct ? 'scale(1.15) translateY(-5px)' : 'scale(0.92)', opacity: isAct ? 1 : 0.55, transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s' }}>
                    <TcgThumb character={ch} isActive={isAct} />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <button
                onClick={() => { setFocusChar(character); setScreen('focus'); }}
                style={{ background: 'rgba(40,20,5,0.10)', backdropFilter: 'blur(8px)', border: '1px solid rgba(40,20,5,0.12)', borderRadius: 24, padding: '10px 22px', cursor: 'pointer', fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13, color: 'hsl(25,30%,22%)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" style={{ display: 'block' }}><path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill="hsl(25,30%,25%)" /></svg>
                Touche pour choisir
                <svg width="11" height="11" viewBox="0 0 24 24" style={{ display: 'block' }}><path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill="hsl(25,30%,25%)" /></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {screen === 'focus' && focusChar && (
        <CharacterFocus character={focusChar} onBack={() => setScreen('library')} onInvoke={() => setScreen('invoke')} />
      )}
      {screen === 'invoke' && focusChar && (
        <InvocationAnimation character={focusChar} onComplete={() => setScreen('detail')} />
      )}
      {screen === 'detail' && focusChar && (
        <CharacterDetail character={focusChar} onClose={() => { setScreen('library'); setFocusChar(null); }} />
      )}
    </div>
  );
};

export default CharactersTab;
