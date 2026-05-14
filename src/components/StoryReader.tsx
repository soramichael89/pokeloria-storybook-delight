import { useState } from 'react';
import { Story } from '@/data/stories';
import { GOLD, THEME } from '@/lib/theme';
import wallpaper from '@/assets/papierpaint.png';
import { useDisplayMode } from '@/contexts/DisplayModeContext';
import { useOrientation } from '@/hooks/useOrientation';
import { PageTurnSpread } from './StoryReader/PageTurnSpread';

interface StoryReaderProps {
  story: Story;
  onClose: () => void;
}

const StoryReader = ({ story, onClose }: StoryReaderProps) => {
  const [page, setPage] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  const { isIpad } = useDisplayMode();
  const { isLandscape } = useOrientation();
  const isTwoPage = isIpad && isLandscape;

  const total = story.pages.length;
  const p = story.pages[page];
  const pNext = isTwoPage ? story.pages[page + 1] : null;
  const t = THEME[story.colorKey] ?? THEME.peach;

  const step = isTwoPage ? 2 : 1;
  const spreadTotal = isTwoPage ? Math.ceil(total / 2) : total;
  const spreadIndex = isTwoPage ? Math.floor(page / 2) : page;
  const isLastSpread = isTwoPage ? page >= total - 2 : page === total - 1;

  const go = (d: number) => {
    const next = page + d * step;
    if (next < 0 || next >= total) return;
    setPage(next);
    setAnimKey(k => k + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) go(diff > 0 ? 1 : -1);
    setTouchX(null);
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'hsl(44,38%,97%)',
      display: 'flex', flexDirection: 'column',
      animation: 'fadeInUp 0.4s ease-out',
    }}>
      {/* Paper texture */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${wallpaper})`,
        backgroundSize: 300, backgroundRepeat: 'repeat',
        opacity: 0.35, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(250,244,232,0.70)',
        pointerEvents: 'none',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '52px 20px 12px',
      }}>
        <button
          onClick={onClose}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 8px rgba(40,20,5,0.12)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{
          fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700,
          color: 'hsl(25,30%,35%)', textAlign: 'center', maxWidth: 200,
        }}>
          {story.title}
        </div>

        <div style={{
          fontFamily: "'Nunito',sans-serif", fontSize: 11,
          color: 'hsl(25,15%,55%)',
          background: 'rgba(255,255,255,0.65)', borderRadius: 12,
          padding: '3px 10px', backdropFilter: 'blur(8px)',
        }}>
          {spreadIndex + 1}/{spreadTotal}
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          flex: 1, position: 'relative', zIndex: 3,
          overflow: 'hidden',
        }}
      >
        {isTwoPage ? (
          /* ── iPad landscape: page-turn spread ── */
          <PageTurnSpread
            pages={story.pages}
            pageIndex={page}
            onPageChange={setPage}
            spineColor={t.spine}
          />
        ) : (
          /* ── iPhone / portrait: classic scroll ── */
          <div
            key={animKey}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '0 28px', gap: 20,
              animation: 'fadeInUp 0.35s ease-out',
            }}
          >
            {p.image && (
              <img src={p.image} alt="" style={{ width: '100%', maxWidth: 300, display: 'block', objectFit: 'contain', mixBlendMode: 'multiply' }} />
            )}
            <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 17, lineHeight: 1.9, color: 'hsl(25,30%,22%)', textAlign: 'center', maxWidth: 320, margin: 0 }}>
              {p.text}
            </p>
            {page === total - 1 && (
              <div style={{ fontFamily: "'Quicksand',sans-serif", fontSize: 13, fontWeight: 700, color: t.spine, background: `linear-gradient(135deg, ${t.bg1}, ${t.bg2})`, padding: '8px 20px', borderRadius: 20, marginTop: 8 }}>✨ Fin</div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'relative', zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px 36px',
      }}>
        <button
          onClick={() => go(-1)}
          disabled={page === 0}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.75)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: page === 0 ? 'default' : 'pointer',
            opacity: page === 0 ? 0.3 : 1,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page dots — spreads en mode deux pages */}
        <div style={{ display: 'flex', gap: 5 }}>
          {Array.from({ length: spreadTotal }, (_, i) => (
            <div
              key={i}
              onClick={() => { setPage(isTwoPage ? i * 2 : i); setAnimKey(k => k + 1); }}
              style={{
                cursor: 'pointer',
                height: 6, width: i === spreadIndex ? 24 : 6,
                borderRadius: 3,
                background: i === spreadIndex ? t.spine : 'hsl(25,15%,75%)',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => isLastSpread ? onClose() : go(1)}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: isLastSpread ? t.spine : 'rgba(255,255,255,0.75)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          {isLastSpread
            ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(25,30%,22%)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          }
        </button>
      </div>
    </div>
  );
};

export default StoryReader;
