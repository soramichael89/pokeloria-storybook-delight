/**
 * PageTurnSpread — wraps react-pageflip (StPageFlip) for iPad landscape.
 * Gives a realistic canvas-based page curl with shadows, touch & mouse drag.
 */
import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useCallback,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import { StoryPage } from '@/data/stories';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PageTurnSpreadHandle {
  flipNext: () => void;
  flipPrev: () => void;
  flipToPage: (index: number) => void;
}

interface PageTurnSpreadProps {
  pages: StoryPage[];
  pageIndex: number;       // even; current spread's left page
  onPageChange: (index: number) => void;
  spineColor: string;
}

// ── Single page (must be forwardRef for react-pageflip) ───────────────────

interface FlipPageProps {
  page: StoryPage | null;
  isLast: boolean;
  spineColor: string;
}

const FlipPage = forwardRef<HTMLDivElement, FlipPageProps>(
  ({ page, isLast, spineColor }, ref) => (
    <div
      ref={ref}
      className="flip-page"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Content */}
      {page && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20, padding: '28px 32px', boxSizing: 'border-box',
        }}>
          {page.image && (
            <img
              src={page.image} alt=""
              style={{
                width: '100%', maxWidth: 280,
                objectFit: 'contain', mixBlendMode: 'multiply',
              }}
            />
          )}
          <p style={{
            fontFamily: "'Nunito',sans-serif",
            fontSize: 17, lineHeight: 1.9,
            color: 'hsl(25,30%,22%)',
            textAlign: 'center', maxWidth: 320,
            margin: 0,
          }}>
            {page.text}
          </p>
          {isLast && (
            <div style={{
              fontFamily: "'Quicksand',sans-serif",
              fontSize: 13, fontWeight: 700,
              color: spineColor,
              background: 'rgba(212,165,116,0.15)',
              padding: '8px 20px', borderRadius: 20, marginTop: 8,
            }}>
              ✨ Fin
            </div>
          )}
        </div>
      )}
    </div>
  )
);

FlipPage.displayName = 'FlipPage';

// ── Main component ─────────────────────────────────────────────────────────

export const PageTurnSpread = forwardRef<PageTurnSpreadHandle, PageTurnSpreadProps>(
  ({ pages, pageIndex, onPageChange, spineColor }, outerRef) => {
    const wrapRef  = useRef<HTMLDivElement>(null);
    const bookRef  = useRef<any>(null);
    const suppress = useRef(false);
    const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

    // Measure container once mounted
    useEffect(() => {
      if (!wrapRef.current) return;
      const { clientWidth, clientHeight } = wrapRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setDims({ w: Math.floor(clientWidth / 2), h: clientHeight });
      }
    }, []);

    // Expose imperative API to parent (prev / next / jump)
    useImperativeHandle(outerRef, () => ({
      flipNext:   () => bookRef.current?.pageFlip?.().flipNext(),
      flipPrev:   () => bookRef.current?.pageFlip?.().flipPrev(),
      flipToPage: (index: number) => {
        suppress.current = true;
        bookRef.current?.pageFlip?.().turnToPage(index);
      },
    }), []);

    // Sync when parent changes pageIndex externally (dots / buttons)
    const prevIndex = useRef(pageIndex);
    useEffect(() => {
      if (pageIndex === prevIndex.current) return;
      prevIndex.current = pageIndex;
      suppress.current  = true;
      bookRef.current?.pageFlip?.()?.turnToPage(pageIndex);
    }, [pageIndex]);

    // onFlip → notify parent (skip if we triggered it ourselves)
    const handleFlip = useCallback((e: { data: number }) => {
      if (suppress.current) { suppress.current = false; return; }
      // Mark as already synced so the useEffect below won't call turnToPage again
      prevIndex.current = e.data;
      onPageChange(e.data);
    }, [onPageChange]);

    return (
      <div
        ref={wrapRef}
        style={{ position: 'absolute', inset: 0 }}
      >
        {dims && (
          <HTMLFlipBook
            ref={bookRef}
            className=""
            style={{ margin: '0 auto' }}
            width={dims.w}
            height={dims.h}
            size="fixed"
            minWidth={dims.w}
            maxWidth={dims.w}
            minHeight={dims.h}
            maxHeight={dims.h}
            drawShadow
            flippingTime={650}
            usePortrait={false}
            startZIndex={1}
            autoSize={false}
            maxShadowOpacity={0.45}
            showCover={false}
            mobileScrollSupport={false}
            clickEventForward
            useMouseEvents
            swipeDistance={30}
            showPageCorners
            disableFlipByClick={false}
            startPage={pageIndex}
            renderOnlyPageLengthChange={false}
            onFlip={handleFlip}
          >
            {pages.map((page, i) => (
              <FlipPage
                key={i}
                page={page}
                isLast={i === pages.length - 1}
                spineColor={spineColor}
              />
            ))}
          </HTMLFlipBook>
        )}
      </div>
    );
  }
);

PageTurnSpread.displayName = 'PageTurnSpread';
