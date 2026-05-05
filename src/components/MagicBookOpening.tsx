import { useEffect, useState } from 'react';
import { Story } from '@/data/stories';

interface MagicBookOpeningProps {
  story: Story;
  onComplete: () => void;
}

// ── Theme palette ─────────────────────────────────────────────────────────────
const THEMES: Record<string, { bg1: string; bg2: string; glow: string; glow2: string; spine: string; front: string }> = {
  peach:    { bg1:'hsl(20,75%,94%)',  bg2:'hsl(270,45%,92%)', glow:'rgba(255,155,90,0.55)',  glow2:'rgba(255,200,140,0.3)', spine:'hsl(18,48%,52%)',  front:'hsl(18,44%,60%)'  },
  lavender: { bg1:'hsl(270,55%,95%)', bg2:'hsl(200,55%,94%)', glow:'rgba(170,110,240,0.55)', glow2:'rgba(200,155,255,0.3)', spine:'hsl(270,30%,50%)', front:'hsl(270,26%,58%)' },
  sage:     { bg1:'hsl(140,38%,93%)', bg2:'hsl(60,45%,93%)',  glow:'rgba(90,185,120,0.55)',  glow2:'rgba(145,220,165,0.3)', spine:'hsl(148,28%,46%)', front:'hsl(148,24%,54%)' },
  sky:      { bg1:'hsl(200,65%,94%)', bg2:'hsl(270,45%,93%)', glow:'rgba(80,165,230,0.55)',  glow2:'rgba(130,210,255,0.3)', spine:'hsl(205,36%,48%)', front:'hsl(205,32%,56%)' },
};
const GOLD = '#c9a84c';

// ── Particles ─────────────────────────────────────────────────────────────────
const rnd = () => Math.random();
const PASTEL_COLORS = ['#ffd1a8','#e0c8ff','#c8e8d0','#bfe0f2','#ffe4ec','#fff3c8','#ffc9d6','#d4f0e8'];

const NI_PAGES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  side: (i % 2 === 0 ? 'L' : 'R') as 'L' | 'R',
  delay: 80 + i * 85,
  duration: 700 + rnd() * 180,
}));

const PASTEL_STARS = Array.from({ length: 36 }, (_, i) => {
  const a = -90 + (-65 + rnd() * 130);
  const dist = 90 + rnd() * 200;
  return {
    id: i,
    x: Math.cos((a * Math.PI) / 180) * dist,
    y: Math.sin((a * Math.PI) / 180) * dist,
    rot: -180 + rnd() * 360,
    delay: 200 + rnd() * 900,
    size: 9 + rnd() * 12,
    color: PASTEL_COLORS[i % PASTEL_COLORS.length],
  };
});

const DUST = Array.from({ length: 24 }, (_, i) => {
  const a = rnd() * 360;
  const dist = 60 + rnd() * 220;
  return {
    id: i,
    x: Math.cos((a * Math.PI) / 180) * dist,
    y: Math.sin((a * Math.PI) / 180) * dist - 40,
    delay: 150 + rnd() * 1100,
    size: 3 + rnd() * 5,
    color: PASTEL_COLORS[i % PASTEL_COLORS.length],
  };
});

const STARFIELD = Array.from({ length: 20 }, (_, i) => ({
  id: i, x: rnd() * 100, y: rnd() * 100,
  size: 2 + rnd() * 4, delay: rnd() * 4, dur: 1.5 + rnd() * 3,
}));

// ── Sub-components ────────────────────────────────────────────────────────────
const StarShape = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path
      d="M12 1 Q13 10 23 12 Q13 14 12 23 Q11 14 1 12 Q11 10 12 1 Z"
      fill={color}
      opacity="0.95"
      style={{ filter: `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 2px white)` }}
    />
    <circle cx="12" cy="12" r="1.5" fill="white" opacity="0.9" />
  </svg>
);

const CornerBracket = ({ pos, sx, sy }: { pos: React.CSSProperties; sx: number; sy: number }) => (
  <svg viewBox="0 0 22 22" style={{ position: 'absolute', width: 18, height: 18, transform: `scale(${sx},${sy})`, ...pos }}>
    <path d="M1 22 L1 5 Q1 1 5 1 L22 1" fill="none" stroke={GOLD} strokeWidth="1.6" opacity="0.95" />
    <path d="M4 22 L4 8 Q4 4 8 4 L22 4" fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.55" />
    <circle cx="6" cy="6" r="2" fill={GOLD} opacity="0.95" />
  </svg>
);

const FlipPageNi = ({ side, delay, duration }: { side: 'L' | 'R'; delay: number; duration: number }) => {
  const PW = 170, PH = 220;
  const isLeft = side === 'L';
  return (
    <div
      style={{
        position: 'absolute',
        left: isLeft ? 0 : PW + 20,
        top: 0,
        width: PW,
        height: PH,
        transformStyle: 'preserve-3d',
        transformOrigin: isLeft ? 'right center' : 'left center',
        animation: `${isLeft ? 'mbo-flipL' : 'mbo-flipR'} ${duration}ms ${delay}ms cubic-bezier(0.45,0.05,0.55,0.95) forwards`,
        opacity: 0,
        zIndex: 20,
        willChange: 'transform',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, hsl(44,42%,98%), hsl(40,32%,93%) 70%, hsl(36,26%,88%))',
          borderRadius: isLeft ? '4px 1px 1px 4px' : '1px 4px 4px 1px',
          boxShadow: '0 6px 14px rgba(40,20,5,0.25), inset 0 0 18px rgba(255,220,160,0.5)',
          backfaceVisibility: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: '18px 22px', display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.18 }}>
          {[0.85, 0.92, 0.7, 0.88, 0.78, 0.66, 0.84, 0.74].map((w, j) => (
            <div key={j} style={{ height: 2, width: `${w * 100}%`, background: 'hsl(25,40%,40%)', borderRadius: 1 }} />
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, hsl(40,32%,92%), hsl(36,26%,86%))',
          borderRadius: isLeft ? '1px 4px 4px 1px' : '4px 1px 1px 4px',
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
          boxShadow: 'inset 0 0 16px rgba(120,90,50,0.2)',
        }}
      />
    </div>
  );
};

const OpenBookNi = ({ themeColor }: { themeColor: { spine: string; front: string } }) => {
  const PW = 170, PH = 220;
  return (
    <div style={{ position: 'relative', width: PW * 2 + 20, height: PH + 30, transformStyle: 'preserve-3d' }}>
      <div
        style={{
          position: 'absolute', left: -12, top: -8,
          width: PW * 2 + 44, height: PH + 28,
          background: `linear-gradient(180deg, ${themeColor.spine}, ${themeColor.front})`,
          borderRadius: 8,
          boxShadow: '0 18px 40px rgba(40,20,5,0.45), 0 0 0 1px rgba(160,130,55,0.4)',
          transform: 'translateZ(-8px)',
        }}
      >
        <div style={{ position: 'absolute', inset: 6, border: `1.5px solid ${GOLD}`, borderRadius: 5, opacity: 0.85 }} />
      </div>

      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: PW, height: PH,
          background: 'linear-gradient(180deg, hsl(44,38%,96%), hsl(40,32%,92%) 60%, hsl(36,26%,86%))',
          borderRadius: '4px 1px 1px 4px',
          boxShadow: 'inset -8px 0 12px rgba(120,90,50,0.18), inset 0 0 30px rgba(255,220,160,0.35)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(255,235,180,0.55), transparent 55%)' }} />
        <CornerBracket pos={{ top: 4, left: 4 }} sx={1} sy={1} />
        <CornerBracket pos={{ bottom: 4, left: 4 }} sx={1} sy={-1} />
      </div>

      <div
        style={{
          position: 'absolute', left: PW + 20, top: 0, width: PW, height: PH,
          background: 'linear-gradient(180deg, hsl(44,38%,96%), hsl(40,32%,92%) 60%, hsl(36,26%,86%))',
          borderRadius: '1px 4px 4px 1px',
          boxShadow: 'inset 8px 0 12px rgba(120,90,50,0.18), inset 0 0 30px rgba(255,220,160,0.35)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,235,180,0.55), transparent 55%)' }} />
        <CornerBracket pos={{ top: 4, right: 4 }} sx={-1} sy={1} />
        <CornerBracket pos={{ bottom: 4, right: 4 }} sx={-1} sy={-1} />
      </div>

      <div
        style={{
          position: 'absolute', left: PW, top: -2, width: 20, height: PH + 4,
          background: 'linear-gradient(to right, rgba(60,30,10,0.45), rgba(40,20,5,0.65) 50%, rgba(60,30,10,0.45))',
          borderRadius: 2,
          boxShadow: '0 0 12px rgba(255,220,160,0.5)',
          zIndex: 10,
        }}
      />

      <div
        style={{
          position: 'absolute', left: PW + 10, top: '50%',
          transform: 'translate(-50%,-50%)',
          width: 220, height: PH * 1.2,
          background: 'radial-gradient(ellipse at center, rgba(255,235,180,0.85), rgba(255,210,140,0.4) 35%, transparent 70%)',
          zIndex: 11, pointerEvents: 'none', mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes mbo-twinkle { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1.3)} }
@keyframes mbo-swipeUp { 0%{transform:translate(-50%,-50%) translateY(0) scale(1.28)} 55%{transform:translate(-50%,-50%) translateY(-380px) scale(.85) rotate(-5deg)} 100%{transform:translate(-50%,-50%) translateY(-520px) scale(.6) rotate(-3deg);opacity:0} }
@keyframes mbo-return { 0%{transform:translate(-50%,-50%) translateY(-260px) scale(.5) rotate(6deg);opacity:0} 50%{transform:translate(-50%,-50%) translateY(20px) scale(1.08) rotate(-2deg);opacity:1} 100%{transform:translate(-50%,-50%) translateY(0) scale(1);opacity:1} }
@keyframes mbo-flipL { 0%{transform:rotateY(0) translateZ(0);opacity:0} 8%{opacity:1} 50%{transform:rotateY(-90deg) translateZ(40px);opacity:1} 92%{opacity:1} 100%{transform:rotateY(-178deg) translateZ(0);opacity:1} }
@keyframes mbo-flipR { 0%{transform:rotateY(0) translateZ(0);opacity:0} 8%{opacity:1} 50%{transform:rotateY(90deg) translateZ(40px);opacity:1} 92%{opacity:1} 100%{transform:rotateY(178deg) translateZ(0);opacity:1} }
@keyframes mbo-star { 0%{transform:translate(-50%,-50%) scale(0) rotate(0);opacity:0} 18%{transform:translate(-50%,-50%) scale(1) rotate(40deg);opacity:1} 100%{transform:translate(calc(-50% + var(--sx)),calc(-50% + var(--sy))) scale(.2) rotate(var(--sr));opacity:0} }
@keyframes mbo-dust { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 20%{transform:translate(-50%,-50%) scale(1);opacity:.9} 100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.4);opacity:0} }
@keyframes mbo-pulse { 0%{opacity:0;transform:translate(-50%,-50%) scale(.3)} 35%{opacity:.9;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-50%) scale(1.6)} }
@keyframes mbo-spin { from{transform:translate(-50%,-50%) rotate(0)} to{transform:translate(-50%,-50%) rotate(360deg)} }
@keyframes mbo-zoom { 0%{transform:scale(.5);opacity:0;filter:blur(24px)} 40%{opacity:1;filter:blur(10px)} 100%{transform:scale(1);opacity:1;filter:blur(0)} }
@keyframes mbo-flash { 0%{opacity:0} 40%{opacity:.9} 100%{opacity:0} }
`;

const MagicBookOpening = ({ story, onComplete }: MagicBookOpeningProps) => {
  const [phase, setPhase] = useState(1);
  // Map your story's color/theme to one of the palettes (adapt this to your Story type)
  const themeKey = (story as any).colorKey || 'peach';
  const t = THEMES[themeKey] || THEMES.peach;

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(2), 500),
      setTimeout(() => setPhase(3), 1100),
      setTimeout(() => setPhase(4), 3300),
      setTimeout(() => onComplete(), 3950),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: `linear-gradient(175deg, ${t.bg1}, ${t.bg2})` }}>
      <style>{KEYFRAMES}</style>

      {/* Star field */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {STARFIELD.map(s => (
          <div
            key={s.id}
            style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size, borderRadius: '50%',
              background: 'white', opacity: 0.7,
              boxShadow: '0 0 5px rgba(255,255,255,0.9)',
              animation: `mbo-twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: phase >= 2 ? 320 : 180, height: phase >= 2 ? 320 : 180,
          borderRadius: '50%',
          background: `radial-gradient(${t.glow}, ${t.glow2} 40%, transparent 72%)`,
          zIndex: 1, pointerEvents: 'none',
          opacity: phase >= 2 ? 1 : 0.4,
          transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />

      {/* PHASE 1: book swipes up */}
      {phase === 1 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'mbo-swipeUp 0.55s cubic-bezier(0.4,0,0.6,1) forwards' }}>
          <ClosedBook themeColor={t} />
        </div>
      )}

      {/* PHASE 2: book returns */}
      {phase === 2 && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 5, animation: 'mbo-return 0.65s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
          <ClosedBook themeColor={t} />
        </div>
      )}

      {/* PHASE 3: Ni no Kuni style book opens */}
      {phase === 3 && (
        <>
          <div
            style={{
              position: 'absolute', top: '52%', left: '50%',
              width: 520, height: 520, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,235,180,0.85), rgba(255,210,160,0.5) 30%, rgba(255,200,200,0.25) 55%, transparent 75%)',
              zIndex: 1, pointerEvents: 'none',
              animation: 'mbo-pulse 1.3s 0.1s ease-out forwards',
              mixBlendMode: 'screen',
            }}
          />
          <div
            style={{
              position: 'absolute', top: '52%', left: '50%',
              width: 600, height: 600, borderRadius: '50%',
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,235,180,0.35) 25deg, transparent 50deg, rgba(255,210,180,0.3) 90deg, transparent 120deg, rgba(255,225,200,0.32) 170deg, transparent 200deg, rgba(255,230,180,0.28) 250deg, transparent 290deg, rgba(255,225,200,0.3) 330deg, transparent 360deg)',
              zIndex: 1, pointerEvents: 'none',
              animation: 'mbo-spin 3s linear infinite',
              opacity: 0.55, mixBlendMode: 'screen',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
              maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
            }}
          />

          <div
            style={{
              position: 'absolute', top: '52%', left: '50%',
              transform: 'translate(-50%,-50%) rotateX(58deg)',
              transformStyle: 'preserve-3d',
              perspective: 1400,
              zIndex: 5,
            }}
          >
            <OpenBookNi themeColor={t} />
            {NI_PAGES.map(p => (
              <FlipPageNi key={p.id} side={p.side} delay={p.delay} duration={p.duration} />
            ))}
          </div>

          {PASTEL_STARS.map(s => (
            <div
              key={s.id}
              style={{
                position: 'absolute', top: '52%', left: '50%', zIndex: 9,
                animation: `mbo-star 1.4s ${s.delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
                opacity: 0,
                ['--sx' as any]: `${s.x}px`,
                ['--sy' as any]: `${s.y}px`,
                ['--sr' as any]: `${s.rot}deg`,
              }}
            >
              <StarShape color={s.color} size={s.size} />
            </div>
          ))}

          {DUST.map(d => (
            <div
              key={d.id}
              style={{
                position: 'absolute', top: '52%', left: '50%',
                width: d.size, height: d.size, borderRadius: '50%',
                background: d.color,
                boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
                zIndex: 8,
                animation: `mbo-dust 1.5s ${d.delay}ms ease-out forwards`,
                opacity: 0,
                ['--dx' as any]: `${d.x}px`,
                ['--dy' as any]: `${d.y}px`,
              }}
            />
          ))}
        </>
      )}

      {/* PHASE 4: zoom in to first page */}
      {phase === 4 && (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'white', zIndex: 20, animation: 'mbo-flash 0.6s ease-out forwards' }} />
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 15,
              background: 'white',
              animation: 'mbo-zoom 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
            }}
          />
        </>
      )}
    </div>
  );
};

// Small closed-book stand-in for phase 1/2 — replace with your own StoryCard if you want
const ClosedBook = ({ themeColor }: { themeColor: { spine: string; front: string } }) => (
  <div
    style={{
      width: 140, height: 200,
      background: `linear-gradient(135deg, ${themeColor.front}, ${themeColor.spine})`,
      borderRadius: '4px 8px 8px 4px',
      boxShadow: '0 20px 50px rgba(40,20,5,0.4), inset 0 0 0 1px rgba(160,130,55,0.5)',
      position: 'relative',
    }}
  >
    <div style={{ position: 'absolute', inset: 6, border: `1.5px solid ${GOLD}`, borderRadius: 4, opacity: 0.85 }} />
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)', borderRadius: '4px 0 0 4px' }} />
  </div>
);

export default MagicBookOpening;