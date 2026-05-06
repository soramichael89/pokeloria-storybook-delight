/**
 * OpeningAnimationV2 — Ni no Kuni-inspired book opening
 *
 * Mechanic: CSS preserve-3d + staggered rotateY page flips (CodePen approach)
 * Feeling : isometric book → pages cascade open → warm divine light → reader
 *
 * Isolated component — swap in StoryLibrary.tsx via USE_OPENING_V2 flag.
 */

import { useEffect, useState } from 'react';
import { Story } from '@/data/stories';
import { GOLD, THEME } from '@/lib/theme';

// ── Pre-computed particles (deterministic, no Math.random at render) ──────────
const PASTEL = ['#ffd1a8','#e0c8ff','#c8e8d0','#bfe0f2','#ffe4ec','#fff3c8','#ffc9d6','#d4f0e8'];

const STARS_V2 = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * 360;
  const dist = 65 + ((i * 37) % 185);
  return {
    id: i,
    x: Math.cos(a * Math.PI / 180) * dist,
    y: Math.sin(a * Math.PI / 180) * dist,
    rot: ((i * 127) % 720) - 360,
    delay: 80 + ((i * 53) % 820),
    size: 8 + ((i * 3) % 13),
    color: PASTEL[i % PASTEL.length],
  };
});

const DUST_V2 = Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * 360;
  const dist = 45 + ((i * 41) % 210);
  return {
    id: i,
    x: Math.cos(a * Math.PI / 180) * dist,
    y: Math.sin(a * Math.PI / 180) * dist - 30,
    delay: 80 + ((i * 71) % 900),
    size: 3 + ((i * 2) % 5),
    color: PASTEL[i % PASTEL.length],
  };
});

const BG_STARS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: (i * 43 + 7) % 100,
  y: (i * 61 + 13) % 70,
  size: 2 + (i % 3),
  delay: (i * 0.45) % 4,
  dur: 1.5 + (i % 3) * 0.9,
}));

// ── Book dimensions ───────────────────────────────────────────────────────────
const PW = 140;  // page / closed-book width  (matches StoryCard W)
const PH = 220;  // page height
const PAGE_COUNT = 9;  // cover (0) + 7 inner + 1 last

// Timing
const TURN_START   = 180;  // ms before first page turns
const PER_PAGE     = 145;  // ms between each page
const TURN_DUR     = 580;  // ms per page flip
// Last flip finishes at: TURN_START + (PAGE_COUNT-1)*PER_PAGE + TURN_DUR
// = 180 + 8*145 + 580 = 1920ms
const BURST_AT     = 1700; // particles burst (while last pages still turning)
const FLASH_AT     = 3000; // white flash
const COMPLETE_AT  = 3450; // onComplete → reader

// ── Gold corner bracket (same visual as StoryCard) ────────────────────────────
const Corner = ({ pos, sx, sy }: { pos: React.CSSProperties; sx: number; sy: number }) => (
  <svg viewBox="0 0 22 22" style={{ position: 'absolute', width: 14, height: 14, zIndex: 5, pointerEvents: 'none', transform: `scale(${sx},${sy})`, ...pos }}>
    <path d="M1 22 L1 5 Q1 1 5 1 L22 1" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.92" />
    <path d="M4 22 L4 8 Q4 4 8 4 L22 4" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.48" />
    <circle cx="5.5" cy="5.5" r="1.8" fill={GOLD} opacity="0.88" />
  </svg>
);

// ── Inner page face (front or back) ──────────────────────────────────────────
const PageFace = ({ flip = false, lines }: { flip?: boolean; lines: number[] }) => (
  <div style={{
    position: 'absolute', inset: 0,
    backfaceVisibility: 'hidden',
    transform: flip ? 'rotateY(180deg)' : undefined,
    background: flip
      ? 'linear-gradient(180deg, hsl(40,28%,91%), hsl(36,23%,86%))'
      : 'linear-gradient(180deg, hsl(44,38%,97%), hsl(40,30%,92%) 70%, hsl(36,24%,87%))',
    borderRadius: flip ? '8px 2px 2px 8px' : '2px 8px 8px 2px',
    boxShadow: flip
      ? 'inset 4px 0 8px rgba(120,90,50,0.10)'
      : 'inset -4px 0 8px rgba(120,90,50,0.12), inset 0 0 20px rgba(255,220,160,0.22)',
  }}>
    {/* Page rule lines (decorative) */}
    <div style={{ position: 'absolute', inset: '16px 20px', display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.13 }}>
      {lines.map((w, j) => (
        <div key={j} style={{ height: 2, width: `${w * 100}%`, background: 'hsl(25,40%,40%)', borderRadius: 1 }} />
      ))}
    </div>
    {/* Spine shadow */}
    {!flip && (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(80,40,10,0.14), transparent 18%)', pointerEvents: 'none', borderRadius: 'inherit' }} />
    )}
  </div>
);

// ── The turning page ──────────────────────────────────────────────────────────
const TurnPage = ({ id, linesF, linesB, delay }: { id: number; linesF: number[]; linesB: number[]; delay: number }) => (
  <div style={{
    position: 'absolute', inset: 0,
    transformStyle: 'preserve-3d',
    transformOrigin: '0 center',
    ['--page-id' as any]: `${id}`,
    ['--page-total' as any]: `${PAGE_COUNT}`,
    animation: `v2TurnPage ${TURN_DUR}ms ${delay}ms cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
    zIndex: PAGE_COUNT - id,
  }}>
    <PageFace lines={linesF} />
    <PageFace flip lines={linesB} />
  </div>
);

// ── The book cover (id=0) ─────────────────────────────────────────────────────
const CoverPage = ({ story, delay }: { story: Story; delay: number }) => {
  const th = THEME[story.colorKey] ?? THEME.peach;
  const isPng = story.coverImage?.endsWith('.png');
  return (
    <div style={{
      position: 'absolute', inset: 0,
      transformStyle: 'preserve-3d',
      transformOrigin: '0 center',
      ['--page-id' as any]: '0',
      ['--page-total' as any]: `${PAGE_COUNT}`,
      animation: `v2TurnPage ${TURN_DUR}ms ${delay}ms cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
      zIndex: PAGE_COUNT,
    }}>
      {/* Cover front */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        background: th.front,
        borderRadius: '2px 8px 8px 2px',
        overflow: 'hidden',
      }}>
        {/* Spine shadow */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.04) 12%,transparent 26%)', zIndex: 6, pointerEvents: 'none' }} />
        {/* Gold frames */}
        <div style={{ position: 'absolute', inset: 5, border: `1px solid rgba(201,168,76,0.70)`, borderRadius: 2, zIndex: 4 }} />
        <div style={{ position: 'absolute', inset: 9, border: `0.5px solid rgba(201,168,76,0.40)`, borderRadius: 1, zIndex: 4 }} />
        {/* Corner brackets */}
        <Corner pos={{ top: 2, left: 2 }}   sx={1}  sy={1}  />
        <Corner pos={{ top: 2, right: 2 }}  sx={-1} sy={1}  />
        <Corner pos={{ bottom: 2, left: 2 }} sx={1}  sy={-1} />
        <Corner pos={{ bottom: 2, right: 2 }} sx={-1} sy={-1} />
        {/* Cover artwork */}
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '12px 7px 6px' }}>
          <div style={{ flex: 1, borderRadius: 2, overflow: 'hidden', position: 'relative', background: isPng ? th.bg1 : undefined }}>
            <img src={story.coverImage} alt={story.title} style={{ width: '100%', height: '100%', display: 'block', objectFit: isPng ? 'contain' : 'cover', padding: isPng ? 6 : 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.18) 100%)' }} />
          </div>
          <div style={{ textAlign: 'center', paddingTop: 4 }}>
            <div style={{ width: 36, height: 1, background: `linear-gradient(to right,transparent,rgba(201,168,76,0.70),transparent)`, margin: '0 auto 3px' }} />
            <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 9, lineHeight: 1.25, color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.50)' }}>{story.title}</div>
          </div>
        </div>
      </div>
      {/* Cover back (inside) */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: 'rotateY(180deg)',
        backfaceVisibility: 'hidden',
        background: `linear-gradient(135deg, ${th.front}, ${th.spine})`,
        borderRadius: '8px 2px 2px 8px',
        opacity: 0.85,
      }} />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
interface Props { story: Story; onComplete: () => void; }

const OpeningAnimationV2 = ({ story, onComplete }: Props) => {
  const [burst, setBurst]   = useState(false);
  const [flash, setFlash]   = useState(false);
  const th = THEME[story.colorKey] ?? THEME.peach;

  useEffect(() => {
    const ts = [
      setTimeout(() => setBurst(true),   BURST_AT),
      setTimeout(() => setFlash(true),   FLASH_AT),
      setTimeout(() => onComplete(),     COMPLETE_AT),
    ];
    return () => ts.forEach(clearTimeout);
  }, []); // eslint-disable-line

  // Pre-computed inner page line widths (deterministic)
  const LINE_SETS = [
    [0.85,0.92,0.70,0.88,0.76,0.91,0.66,0.82,0.74],
    [0.88,0.78,0.92,0.70,0.86,0.74,0.90,0.80,0.70],
    [0.76,0.90,0.82,0.68,0.88,0.72,0.94,0.78,0.84],
    [0.92,0.74,0.86,0.78,0.66,0.90,0.80,0.70,0.88],
    [0.80,0.88,0.72,0.92,0.76,0.84,0.68,0.90,0.78],
    [0.84,0.70,0.90,0.76,0.88,0.66,0.82,0.92,0.74],
    [0.74,0.86,0.78,0.90,0.70,0.88,0.80,0.72,0.92],
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `linear-gradient(175deg, ${th.bg1}, ${th.bg2})`,
      overflow: 'hidden',
      perspective: 1400,
    }}>
      {/* Background stars */}
      {BG_STARS.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.72)',
          animation: `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
          pointerEvents: 'none', zIndex: 0,
        }} />
      ))}

      {/* Ambient glow — grows as pages turn, bursts on completion */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width:  burst ? 520 : 260,
        height: burst ? 520 : 260,
        borderRadius: '50%',
        background: `radial-gradient(${th.glow}, ${th.glow2} 42%, transparent 72%)`,
        zIndex: 1, pointerEvents: 'none',
        opacity: burst ? 1 : 0.45,
        transition: 'all 0.9s cubic-bezier(0.34,1.56,0.64,1)',
        mixBlendMode: 'screen',
      }} />

      {/* Spine divine light — warm beam from book center, fades as book opens */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 60, height: PH * 0.8,
        background: 'radial-gradient(ellipse at center, rgba(255,248,220,0.95), rgba(255,235,170,0.65) 45%, transparent 78%)',
        zIndex: 4, pointerEvents: 'none',
        mixBlendMode: 'screen',
        opacity: burst ? 0 : 1,
        transition: 'opacity 0.6s ease-out',
        animation: 'pulseGlow 1.2s ease-in-out infinite',
        ['--glow-c' as any]: 'rgba(255,235,170,0.4)',
        ['--glow-c2' as any]: 'rgba(255,200,100,0.2)',
      }} />

      {/* ── The CSS book ── */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transformStyle: 'preserve-3d',
        animation: 'v2BookRise 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards',
        opacity: flash ? 0 : 1,
        transition: flash ? 'opacity 0.15s' : 'none',
        zIndex: 5,
      }}>
        <div style={{ position: 'relative', width: PW, height: PH, transformStyle: 'preserve-3d' }}>

          {/* Back cover — sits at -PAGE_COUNT px in Z, no animation */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${th.spine}, hsl(25,30%,14%))`,
            borderRadius: '2px 8px 8px 2px',
            transform: `translateZ(${-PAGE_COUNT}px)`,
            backfaceVisibility: 'hidden',
            boxShadow: '0 8px 28px rgba(40,20,5,0.55)',
          }}>
            <div style={{ position: 'absolute', inset: 4, border: `1px solid ${GOLD}44`, borderRadius: 4 }} />
          </div>

          {/* Inner pages — flip in sequence after cover */}
          {Array.from({ length: PAGE_COUNT - 1 }, (_, i) => {
            const id = i + 1;
            const delay = TURN_START + id * PER_PAGE;
            const linesF = LINE_SETS[i % LINE_SETS.length];
            const linesB = LINE_SETS[(i + 1) % LINE_SETS.length];
            return <TurnPage key={id} id={id} linesF={linesF} linesB={linesB} delay={delay} />;
          })}

          {/* Cover — flips first (id=0, smallest delay) */}
          <CoverPage story={story} delay={TURN_START} />
        </div>
      </div>

      {/* ── Particles burst (phase 2) ── */}
      {burst && (
        <>
          {/* Spinning warm rays */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 600, height: 600,
            background: `conic-gradient(from 0deg,
              transparent 0deg, rgba(255,235,180,0.38) 22deg, transparent 45deg,
              rgba(255,210,180,0.32) 85deg, transparent 115deg,
              rgba(255,225,200,0.35) 165deg, transparent 195deg,
              rgba(255,230,175,0.30) 248deg, transparent 278deg,
              rgba(255,225,195,0.33) 328deg, transparent 360deg)`,
            borderRadius: '50%',
            zIndex: 2, pointerEvents: 'none',
            animation: 'raysSpin 3.2s linear infinite',
            opacity: 0.65, mixBlendMode: 'screen',
            WebkitMaskImage: 'radial-gradient(circle, black 28%, transparent 68%)',
            maskImage: 'radial-gradient(circle, black 28%, transparent 68%)',
          }} />

          {/* Warm pulse */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 480, height: 480, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,238,190,0.88), rgba(255,215,155,0.50) 32%, rgba(255,200,200,0.22) 58%, transparent 78%)',
            zIndex: 2, pointerEvents: 'none',
            animation: 'warmRayPulse 1.4s 0.1s ease-out forwards',
            mixBlendMode: 'screen',
          }} />

          {/* Pastel stars */}
          {STARS_V2.map(s => (
            <div key={s.id} style={{
              position: 'absolute', top: '50%', left: '50%',
              zIndex: 9,
              animation: `pastelStar 1.45s ${s.delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
              opacity: 0,
              ['--sx' as any]: `${s.x}px`,
              ['--sy' as any]: `${s.y}px`,
              ['--sr' as any]: `${s.rot}deg`,
            }}>
              <svg width={s.size} height={s.size} viewBox="0 0 24 24" style={{ display: 'block', filter: `drop-shadow(0 0 5px ${s.color}) drop-shadow(0 0 2px white)` }}>
                <path d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z" fill={s.color} opacity="0.96" />
                <circle cx="12" cy="12" r="1.4" fill="white" opacity="0.88" />
              </svg>
            </div>
          ))}

          {/* Dust motes */}
          {DUST_V2.map(d => (
            <div key={d.id} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: d.size, height: d.size, borderRadius: '50%',
              background: d.color,
              boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
              zIndex: 8,
              animation: `pastelDust 1.55s ${d.delay}ms ease-out forwards`,
              opacity: 0,
              ['--dx' as any]: `${d.x}px`,
              ['--dy' as any]: `${d.y}px`,
            }} />
          ))}
        </>
      )}

      {/* White flash */}
      {flash && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'white', zIndex: 20,
          animation: 'whiteFlash 0.45s ease-out forwards',
        }} />
      )}
    </div>
  );
};

export default OpeningAnimationV2;
