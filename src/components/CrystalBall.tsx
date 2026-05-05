import { WorldLocation } from '@/data/world';
import { GOLD, THEME, LOCATION_PANORAMA, LOCATION_COLOR_KEY } from '@/lib/theme';

interface CrystalBallProps {
  location: WorldLocation;
  size?: number;
  reflection?: { x: number; y: number } | null;
  style?: React.CSSProperties;
}

const CrystalBall = ({ location, size = 180, reflection = null, style = {} }: CrystalBallProps) => {
  const colorKey = LOCATION_COLOR_KEY[location.id] ?? 'sky';
  const t = THEME[colorKey] ?? THEME.sky;
  const panorama = LOCATION_PANORAMA[location.id] ?? LOCATION_PANORAMA['moon-lake'];

  return (
    <div style={{
      width: size, height: size, position: 'relative',
      borderRadius: '50%',
      animation: 'crystalFloat 4s ease-in-out infinite',
      ...style,
    }}>
      {/* Outer aura */}
      <div style={{
        position: 'absolute', inset: -30, borderRadius: '50%',
        background: `radial-gradient(circle, ${t.glow}, ${t.glow2} 50%, transparent 75%)`,
        filter: 'blur(8px)', pointerEvents: 'none',
      }} />

      {/* Glass sphere */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 8%, ${t.bg1} 25%, ${t.spine}cc 70%, ${t.spine} 100%)`,
        boxShadow: `
          inset -16px -20px 40px rgba(20,10,5,0.45),
          inset 8px 6px 30px rgba(255,255,255,0.35),
          0 12px 32px rgba(40,20,5,0.4),
          0 0 0 2px ${GOLD},
          0 0 0 4px rgba(40,20,5,0.5),
          0 0 0 6px ${GOLD}
        `,
        overflow: 'hidden',
      }}>
        {/* Swirling mist */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '130%', height: '130%',
          background: `conic-gradient(from 0deg, transparent 0deg, ${t.front}55 60deg, transparent 140deg, ${t.bg1}88 220deg, transparent 300deg, ${t.front}55 360deg)`,
          animation: 'crystalShine 8s linear infinite',
          opacity: 0.7, mixBlendMode: 'screen',
        }} />

        {/* Landscape inside */}
        <div style={{
          position: 'absolute', inset: '30% 18% 22%',
          borderRadius: '50%',
          background: panorama,
          boxShadow: 'inset 0 -6px 12px rgba(0,0,0,0.3), 0 0 18px rgba(255,255,255,0.4)',
          opacity: 0.85, overflow: 'hidden',
        }}>
          <svg viewBox="0 0 100 60" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none">
            <path d="M 0 60 L 18 32 L 30 42 L 48 18 L 62 38 L 78 26 L 100 50 L 100 60 Z" fill="rgba(40,20,5,0.45)" />
            <path d="M 0 60 L 22 44 L 38 50 L 56 38 L 72 48 L 90 42 L 100 56 L 100 60 Z" fill="rgba(40,20,5,0.6)" />
          </svg>
          <div style={{ position: 'absolute', top: '18%', left: '22%', width: 6, height: 6, borderRadius: '50%', background: 'white', boxShadow: '0 0 8px white' }} />
          <div style={{ position: 'absolute', top: '30%', right: '24%', width: 4, height: 4, borderRadius: '50%', background: 'white', boxShadow: '0 0 6px white', opacity: 0.7 }} />
        </div>

        {/* Cursor shimmer */}
        {reflection && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `radial-gradient(circle 70px at ${reflection.x * 100}% ${reflection.y * 100}%, rgba(255,255,255,0.6), transparent 60%)`,
            mixBlendMode: 'overlay', pointerEvents: 'none',
          }} />
        )}

        {/* Top-left specular highlight */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: '42%', height: '30%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.9), rgba(255,255,255,0.2) 50%, transparent 70%)',
          filter: 'blur(2px)', pointerEvents: 'none',
        }} />
      </div>

      {/* Pedestal */}
      <div style={{
        position: 'absolute', bottom: -28, left: '50%', transform: 'translateX(-50%)',
        width: size * 0.7, height: 28,
        background: `linear-gradient(180deg, ${t.spine}, hsl(25,30%,18%))`,
        borderRadius: '50% 50% 8px 8px / 30% 30% 8px 8px',
        boxShadow: `0 4px 14px rgba(40,20,5,0.4), inset 0 2px 0 ${GOLD}, inset 0 -4px 8px rgba(0,0,0,0.4)`,
      }}>
        <div style={{ position: 'absolute', top: 5, left: '10%', right: '10%', height: 2, background: `linear-gradient(to right, transparent, ${GOLD}, transparent)`, borderRadius: 1 }} />
        <div style={{ position: 'absolute', top: 11, left: '15%', right: '15%', height: 1, background: `${GOLD}88`, borderRadius: 1 }} />
      </div>

      {/* Location label */}
      <div style={{
        position: 'absolute', bottom: -58, left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700,
        color: 'hsl(25,30%,22%)', textShadow: '0 1px 0 rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap', letterSpacing: '0.04em',
      }}>{location.name}</div>
    </div>
  );
};

export default CrystalBall;
