import { Story } from '@/data/stories';

interface StoryCardProps {
  story: Story;
  onOpen: (story: Story) => void;
  index: number;
  isActive?: boolean;
  reflectionX?: number;
  reflectionY?: number;
  swipeTilt?: number;
  customRotX?: number;
  customRotY?: number;
  size?: number;
}

const SPINE_BG: Record<string, string> = {
  peach:    'linear-gradient(180deg, hsl(18,42%,44%), hsl(18,38%,36%))',
  lavender: 'linear-gradient(180deg, hsl(270,28%,44%), hsl(270,24%,36%))',
  sage:     'linear-gradient(180deg, hsl(148,28%,40%), hsl(148,25%,32%))',
  sky:      'linear-gradient(180deg, hsl(205,38%,42%), hsl(205,34%,34%))',
  winter:   'linear-gradient(180deg, hsl(210,32%,44%), hsl(210,28%,36%))',
  snow:     'linear-gradient(180deg, hsl(30,18%,52%),  hsl(30,15%,42%))',
};

const FRONT_BG: Record<string, string> = {
  peach:    'linear-gradient(160deg, hsl(18,48%,64%), hsl(18,44%,56%), hsl(20,40%,50%))',
  lavender: 'linear-gradient(160deg, hsl(270,32%,62%), hsl(270,28%,54%), hsl(270,25%,48%))',
  sage:     'linear-gradient(160deg, hsl(148,30%,58%), hsl(148,27%,50%), hsl(148,24%,44%))',
  sky:      'linear-gradient(160deg, hsl(205,40%,62%), hsl(205,36%,54%), hsl(205,32%,48%))',
  winter:   'linear-gradient(160deg, hsl(210,34%,60%), hsl(210,30%,52%), hsl(210,26%,46%))',
  snow:     'linear-gradient(160deg, hsl(30,20%,68%),  hsl(30,18%,60%), hsl(30,15%,54%))',
};

const IMG_BG: Record<string, string> = {
  peach:    'linear-gradient(135deg, hsl(20,55%,74%), hsl(20,48%,64%))',
  lavender: 'linear-gradient(135deg, hsl(270,35%,72%), hsl(270,28%,62%))',
  sage:     'linear-gradient(135deg, hsl(148,28%,68%), hsl(148,24%,58%))',
  sky:      'linear-gradient(135deg, hsl(205,42%,72%), hsl(205,36%,62%))',
  winter:   'linear-gradient(135deg, hsl(210,36%,70%), hsl(210,30%,60%))',
  snow:     'linear-gradient(135deg, hsl(30,22%,78%),  hsl(30,18%,68%))',
};

const GOLD = '#c9a84c';

// Dimensions matching the design reference exactly
const W = 140;
const H = 224;
const D = 32;

const StoryCard = ({
  story, onOpen, index, isActive = false,
  reflectionX, reflectionY, swipeTilt = 0,
  customRotX, customRotY, size = 1.28,
}: StoryCardProps) => {
  const isPng = story.coverImage?.endsWith('.png');
  const spine = SPINE_BG[story.colorKey] ?? SPINE_BG.peach;
  const front = FRONT_BG[story.colorKey] ?? FRONT_BG.peach;
  const imgBg = IMG_BG[story.colorKey]   ?? IMG_BG.peach;

  // swipeTilt is added to rotY directly (matches reference design)
  const rotX = customRotX !== undefined ? customRotX : (isActive ? 5 : 4);
  const rotY = (customRotY !== undefined ? customRotY : (isActive ? 28 : 24)) + swipeTilt;

  return (
    <button
      onClick={() => onOpen(story)}
      className="focus:outline-none cursor-pointer"
      style={{ background: 'none', border: 'none', padding: 0, display: 'block' }}
      aria-label={story.title}
    >
      {/* Ground shadow — outside perspective wrapper so filter doesn't kill preserve-3d */}
      <div style={{
        width: W * 0.75, height: 14,
        margin: '0 auto',
        background: 'radial-gradient(ellipse, rgba(40,20,5,0.22) 0%, transparent 70%)',
        filter: 'blur(6px)',
        transform: 'translateY(4px)',
      }} />

      {/* Perspective container — critical for proper 3D foreshortening */}
      <div style={{ perspective: 900, width: W + D, paddingLeft: D }}>

        {/* 3D book group — NO filter/opacity here, only transform */}
        <div style={{
          width: W, height: H,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${size})`,
          transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}>

          {/* ── SPINE (left face) ── */}
          <div style={{
            position: 'absolute',
            left: -D, top: 0,
            width: D, height: H,
            transformOrigin: 'right center',
            transform: `translateZ(${D / 2}px) rotateY(-90deg)`,
            backfaceVisibility: 'hidden',
            background: spine,
            borderRadius: '4px 0 0 4px',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(0,0,0,0.38) 0%,rgba(0,0,0,0.08) 30%,rgba(255,255,255,0.08) 55%,rgba(0,0,0,0.22) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(180deg,transparent 9%,rgba(0,0,0,0.28) 9%,rgba(0,0,0,0.28) 11.5%,rgba(255,255,255,0.08) 11.5%,rgba(255,255,255,0.08) 12.5%,transparent 12.5%,transparent 87.5%,rgba(0,0,0,0.28) 87.5%,rgba(0,0,0,0.28) 90%,rgba(255,255,255,0.08) 90%,rgba(255,255,255,0.08) 91%,transparent 91%)' }} />
            <span style={{
              position: 'relative', zIndex: 5,
              writingMode: 'vertical-rl',
              fontFamily: 'var(--font-display)',
              fontSize: 9, fontWeight: 700,
              color: 'rgba(255,255,255,0.80)',
              letterSpacing: '0.06em',
              textShadow: '0 1px 3px rgba(0,0,0,0.65)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxHeight: '70%', padding: '8px 0',
            }}>
              {story.title}
            </span>
          </div>

          {/* ── PAGE EDGES (right face) ── */}
          <div style={{
            position: 'absolute',
            left: W, top: 3,
            width: D, height: H - 6,
            transformOrigin: 'left center',
            transform: `translateZ(${D / 2}px) rotateY(90deg)`,
            backfaceVisibility: 'hidden',
            borderRadius: '0 3px 3px 0',
            overflow: 'hidden',
            background: 'repeating-linear-gradient(180deg,hsl(44,24%,98%) 0px,hsl(44,24%,98%) 0.8px,hsl(40,18%,93%) 0.8px,hsl(40,18%,93%) 1.6px,hsl(44,22%,96%) 1.6px,hsl(44,22%,96%) 2.4px,hsl(38,15%,91%) 2.4px,hsl(38,15%,91%) 3px)',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to right,rgba(0,0,0,0.12) 0%,transparent 25%,rgba(201,168,76,0.10) 65%,rgba(201,168,76,0.28) 87%,rgba(160,130,55,0.20) 100%)` }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(0,0,0,0.20) 0%,transparent 14%,transparent 86%,rgba(0,0,0,0.20) 100%)' }} />
          </div>

          {/* ── FRONT COVER ── */}
          <div style={{
            position: 'absolute', inset: 0,
            transform: `translateZ(${D / 2}px)`,
            backfaceVisibility: 'hidden',
            borderRadius: '1px 8px 8px 1px',
            overflow: 'hidden',
            background: front,
            boxShadow: '3px 5px 18px rgba(40,20,5,0.20)',
          }}>
            {/* Leather grain */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.014) 3px,rgba(0,0,0,0.014) 4px)', pointerEvents: 'none' }} />
            {/* Spine-join shadow */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 6, background: 'linear-gradient(to right,rgba(0,0,0,0.30) 0%,rgba(0,0,0,0.04) 12%,transparent 26%)', pointerEvents: 'none' }} />
            {/* Gold outer border */}
            <div style={{ position: 'absolute', inset: 5, border: `1px solid rgba(201,168,76,0.70)`, borderRadius: 2, zIndex: 4, pointerEvents: 'none' }} />
            {/* Gold inner border */}
            <div style={{ position: 'absolute', inset: 9, border: `0.5px solid rgba(201,168,76,0.40)`, borderRadius: 1, zIndex: 4, pointerEvents: 'none' }} />

            {/* Corner ornaments */}
            {[
              { top: 2, left: 2,  sx: 1,  sy: 1  },
              { top: 2, right: 2, sx: -1, sy: 1  },
              { bottom: 2, left: 2,  sx: 1,  sy: -1 },
              { bottom: 2, right: 2, sx: -1, sy: -1 },
            ].map((pos, i) => (
              <svg key={i} viewBox="0 0 22 22" style={{ position: 'absolute', width: 16, height: 16, zIndex: 5, pointerEvents: 'none', transform: `scale(${pos.sx},${pos.sy})`, ...{ top: pos.top, left: pos.left, bottom: pos.bottom, right: pos.right } as React.CSSProperties }}>
                <path d="M1 22 L1 5 Q1 1 5 1 L22 1" fill="none" stroke={GOLD} strokeWidth="1.1" opacity="0.9"/>
                <path d="M4 22 L4 8 Q4 4 8 4 L22 4" fill="none" stroke={GOLD} strokeWidth="0.55" opacity="0.50"/>
                <circle cx="5.5" cy="5.5" r="1.8" fill={GOLD} opacity="0.85"/>
                <line x1="1" y1="12" x2="6" y2="12" stroke={GOLD} strokeWidth="0.8" opacity="0.6"/>
                <line x1="12" y1="1" x2="12" y2="6" stroke={GOLD} strokeWidth="0.8" opacity="0.6"/>
              </svg>
            ))}

            {/* Shimmer reflection overlay */}
            {reflectionX != null && reflectionY != null && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 7, borderRadius: 'inherit',
                background: `radial-gradient(circle 88px at ${reflectionX * 100}% ${reflectionY * 100}%, rgba(255,255,255,0.52), rgba(255,255,255,0.08) 55%, transparent 75%)`,
                mixBlendMode: 'overlay', pointerEvents: 'none',
              }} />
            )}

            {/* Cover layout */}
            <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '14px 8px 7px' }}>
              {/* Image */}
              <div style={{
                flex: 1, borderRadius: 2, overflow: 'hidden', position: 'relative',
                background: isPng ? imgBg : undefined,
                outline: `1px solid rgba(201,168,76,0.48)`, outlineOffset: 2,
              }}>
                <img
                  src={story.coverImage}
                  alt={story.title}
                  loading={index === 0 ? undefined : 'lazy'}
                  style={{
                    width: '100%', height: '100%', display: 'block',
                    objectFit: isPng ? 'contain' : 'cover',
                    padding: isPng ? 8 : 0,
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.18) 100%)' }} />
              </div>

              {/* Title footer */}
              <div style={{ textAlign: 'center', paddingTop: 5 }}>
                <div style={{ width: 40, height: 1, background: `linear-gradient(to right,transparent,rgba(201,168,76,0.70),transparent)`, margin: '0 auto 4px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, lineHeight: 1.25, color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 4px rgba(0,0,0,0.50)', letterSpacing: '0.02em', margin: 0 }}>
                  {story.title}
                </h3>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.60)', marginTop: 1, letterSpacing: '0.04em', fontFamily: 'var(--font-body)' }}>
                  {story.theme}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </button>
  );
};

export default StoryCard;
