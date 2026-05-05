import { Character } from '@/data/characters';
import { GOLD, THEME, TYPE_COLOR, COLOR_KEY_TO_TYPE, COLOR_KEY_TO_HP } from '@/lib/theme';

export const TCG_W = 168;
export const TCG_H = 240;

interface TcgCardProps {
  character: Character;
  size?: number;
  reflection?: { x: number; y: number } | null;
  style?: React.CSSProperties;
}

const TcgCard = ({ character, size = 1, reflection = null, style = {} }: TcgCardProps) => {
  const t = THEME[character.colorKey] ?? THEME.peach;
  const typeName = COLOR_KEY_TO_TYPE[character.colorKey] ?? 'Électrik';
  const tc = TYPE_COLOR[typeName] ?? TYPE_COLOR['Électrik'];
  const hp = COLOR_KEY_TO_HP[character.colorKey] ?? 70;

  // Derive attacks from the character's first two skills
  const attacks = character.skills.slice(0, 2).map((skill, i) => ({
    name: skill.name,
    cost: i === 0 ? tc.costs : [tc.icon],
    dmg: i === 0 ? tc.highDmg : tc.lowDmg,
  }));

  return (
    <div style={{
      width: TCG_W,
      height: TCG_H,
      transform: `scale(${size})`,
      transformOrigin: 'center',
      position: 'relative',
      borderRadius: 12,
      background: `linear-gradient(155deg, ${tc.bg} 0%, ${t.bg1} 50%, ${tc.bg} 100%)`,
      boxShadow: `
        0 8px 24px rgba(40,20,5,0.32),
        0 0 0 2px ${GOLD},
        0 0 0 4px rgba(40,20,5,0.85),
        0 0 0 6px ${GOLD},
        inset 0 1px 0 rgba(255,255,255,0.6)
      `,
      overflow: 'hidden',
      flexShrink: 0,
      ...style,
    }}>
      {/* Cursor shimmer */}
      {reflection && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 6,
          background: `radial-gradient(circle 110px at ${reflection.x * 100}% ${reflection.y * 100}%, rgba(255,255,255,0.55), rgba(255,255,255,0.10) 50%, transparent 75%)`,
          mixBlendMode: 'overlay', pointerEvents: 'none',
        }} />
      )}

      {/* Holo grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, opacity: 0.15,
        backgroundImage: `repeating-linear-gradient(45deg, transparent 0 6px, ${tc.accent} 6px 7px), repeating-linear-gradient(-45deg, transparent 0 6px, ${tc.accent} 6px 7px)`,
        pointerEvents: 'none',
      }} />

      {/* Stage + Name + HP */}
      <div style={{ position: 'relative', zIndex: 5, padding: '8px 10px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <div style={{ fontSize: 8, fontFamily: "'Quicksand',sans-serif", fontWeight: 600, color: 'rgba(40,20,5,0.55)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Niv. 1
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
          <div style={{ fontFamily: "'Quicksand',sans-serif", fontWeight: 700, fontSize: 13, color: 'hsl(25,30%,18%)', lineHeight: 1.05, textShadow: '0 1px 0 rgba(255,255,255,0.4)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {character.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'hsl(0,75%,42%)', fontFamily: "'Quicksand',sans-serif" }}>HP</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'hsl(0,75%,42%)', fontFamily: "'Quicksand',sans-serif", lineHeight: 1 }}>{hp}</span>
          </div>
        </div>
      </div>

      {/* Art frame */}
      <div style={{
        position: 'relative', zIndex: 5,
        margin: '2px 10px 0', height: 110, borderRadius: 4, overflow: 'hidden',
        background: `linear-gradient(135deg, ${t.front}, ${t.spine})`,
        boxShadow: `inset 0 0 0 1.5px ${GOLD}, 0 2px 8px rgba(40,20,5,0.25)`,
      }}>
        {character.images?.standard ? (
          <img
            src={character.images.standard}
            alt={character.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 64, opacity: 0.3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{tc.icon}</div>
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 72, fontFamily: "'Quicksand',sans-serif", fontWeight: 800, color: 'rgba(255,255,255,0.85)', textShadow: '0 4px 12px rgba(0,0,0,0.4)', lineHeight: 1 }}>
                {character.name.charAt(0)}
              </div>
            </div>
          </>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.35) 100%)' }} />
      </div>

      {/* Type banner */}
      <div style={{
        position: 'relative', zIndex: 5, margin: '6px 10px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '2px 8px', borderRadius: 10,
        background: `linear-gradient(to right, ${tc.accent}cc, ${tc.accent}66)`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset',
      }}>
        <span style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 9, fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.4)', letterSpacing: '0.05em' }}>{typeName}</span>
        <span style={{ fontSize: 12 }}>{tc.icon}</span>
      </div>

      {/* Attacks */}
      <div style={{ position: 'relative', zIndex: 5, padding: '6px 10px 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {attacks.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 5, borderBottom: i < attacks.length - 1 ? '0.5px solid rgba(40,20,5,0.18)' : 'none' }}>
            <div style={{ display: 'flex', gap: 1, flexShrink: 0 }}>
              {a.cost.map((c, j) => (
                <span key={j} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, ${tc.bg}, ${tc.accent})`,
                  border: `0.5px solid ${tc.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, lineHeight: 1,
                }}>{c}</span>
              ))}
            </div>
            <div style={{ flex: 1, fontFamily: "'Quicksand',sans-serif", fontSize: 9.5, fontWeight: 700, color: 'hsl(25,30%,18%)', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.name}
            </div>
            {a.dmg > 0 && (
              <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 800, color: 'hsl(25,30%,18%)', lineHeight: 1, flexShrink: 0 }}>{a.dmg}</div>
            )}
          </div>
        ))}
      </div>

      {/* Corner sparkle */}
      <svg width="14" height="14" viewBox="0 0 24 24" style={{ position: 'absolute', top: 6, right: 6, zIndex: 6, opacity: 0.7 }}>
        <path d="M12 2 L13 10 L22 12 L13 14 L12 22 L11 14 L2 12 L11 10 Z" fill={GOLD} />
      </svg>
    </div>
  );
};

export default TcgCard;
