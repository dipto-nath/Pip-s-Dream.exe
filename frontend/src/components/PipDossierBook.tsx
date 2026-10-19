// =============================================================
// PIP.EXE — PipDossierBook
// Storytelling flip-page animated style dossier book powered by react-pageflip
// =============================================================

import React, { useRef, useState, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Star, 
  BookOpen, 
  Compass, 
  Heart, 
  ShieldCheck, 
  Wand2,
  RotateCcw
} from 'lucide-react';

export interface PipDossierBookProps {
  className?: string;
  onPageFlip?: (pageIndex: number) => void;
}

// In react-pageflip, every page child must forward ref to a native DOM element
const Page = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', style, ...rest }, ref) => {
    const isCover = className.includes('pip-book-cover');
    return (
      <div
        ref={ref}
        className={`pip-book-page ${className}`}
        style={{
          boxSizing: 'border-box',
          backgroundColor: isCover ? '#1e1218' : 'var(--paper-bg)',
          color: isCover ? '#fff8f1' : 'var(--paper-text)',
          boxShadow: isCover ? 'none' : 'inset 0 0 30px rgba(0, 0, 0, 0.05)',
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
Page.displayName = 'Page';

export function PipDossierBook({ className = '', onPageFlip }: PipDossierBookProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 6; // Cover, 4 content pages, Back Cover

  const handleFlip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const pageIndex = typeof e?.data === 'number' ? e.data : 0;
      setCurrentPage(pageIndex);
      if (onPageFlip) onPageFlip(pageIndex);
    },
    [onPageFlip]
  );

  const flipPrev = () => {
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (!pf) return;
      if (pf.getState && pf.getState() !== 'read') return;
      pf.flipPrev();
    } catch {
      /* ignore */
    }
  };

  const flipNext = () => {
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (!pf) return;
      if (pf.getState && pf.getState() !== 'read') return;
      pf.flipNext();
    } catch {
      /* ignore */
    }
  };

  const jumpToPage = (target: number) => {
    try {
      const pf = flipBookRef.current?.pageFlip();
      if (!pf) return;
      if (pf.getState && pf.getState() !== 'read') return;
      pf.flip(target);
    } catch {
      /* ignore */
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const FlipBookComponent = HTMLFlipBook as any;

  return (
    <div className={`pip-dossier-book-container ${className}`}>
      {/* Navigation & Controls Bar */}
      <div className="pip-book-controls">
        <div className="pip-book-page-indicator">
          <BookOpen size={14} className="text-amber-700" />
          <span>
            {currentPage === 0
              ? 'Cover · Dossier File'
              : currentPage >= totalPages - 1
              ? 'Back Cover · Archive Seal'
              : `Pages ${currentPage <= 2 ? '1–2' : '3–4'} of 4`}
          </span>
        </div>

        <div className="pip-book-nav-buttons">
          <button
            type="button"
            onClick={flipPrev}
            disabled={currentPage === 0}
            className="pip-book-btn"
            aria-label="Previous book page"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button
            type="button"
            onClick={flipNext}
            disabled={currentPage >= totalPages - 1}
            className="pip-book-btn pip-book-btn-primary"
            aria-label="Next book page"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Book stage */}
      <div className="pip-book-stage">
        <FlipBookComponent
          ref={flipBookRef}
          width={340}
          height={510}
          size="stretch"
          minWidth={260}
          maxWidth={440}
          minHeight={480}
          maxHeight={570}
          maxShadowOpacity={0.5}
          showCover={true}
          showPageCorners={true}
          disableFlipByClick={true}
          clickEventForward={true}
          renderOnlyPageLengthChange={true}
          mobileScrollSupport={true}
          usePortrait={false}
          onFlip={handleFlip}
          className={`pip-flipbook-instance ${
            currentPage === 0
              ? 'pip-cover-state-front'
              : currentPage >= totalPages - 1
              ? 'pip-cover-state-back'
              : 'pip-cover-state-spread'
          }`}
          style={{ margin: '0 auto', width: '100%' }}
        >
          {/* PAGE 0: VINTAGE LEATHER COVER */}
          <Page className="pip-book-cover page-cover">
            <div className="pip-cover-inner">
              <div className="pip-cover-border">
                <div className="pip-cover-badge">
                  <Moon size={16} className="text-amber-300" />
                  <span>THE MIDNIGHT NURSERY</span>
                  <Star size={14} className="text-amber-300" />
                </div>

                <div className="pip-cover-emblem">
                  <div className="pip-emblem-ring">
                    <span className="pip-emblem-icon">🌙</span>
                  </div>
                  <h3 className="pip-cover-title">PIP'S DOSSIER</h3>
                  <p className="pip-cover-subtitle">Official Personnel Storybook</p>
                  <div className="pip-cover-file-no">FILE REF: MN-DE-001</div>
                </div>

                <div className="pip-cover-classification">
                  <div className="pip-class-stamp">
                    <ShieldCheck size={13} />
                    <span>NIGHT SHIFT LEVEL 1</span>
                  </div>
                  <p className="pip-cover-teaser">
                    Junior Dream Engineer · Story & Archives
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    flipNext();
                  }}
                  className="pip-cover-open-hint"
                >
                  <span>Click to open dossier</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </Page>

          {/* PAGE 1: CHAPTER I — IDENTITY & ROLE */}
          <Page className="pip-content-page">
            <div className="pip-page-sheet">
              <div className="pip-sheet-header">
                <span className="pip-chapter-tag">CHAPTER I</span>
                <span className="pip-sheet-ref">MN // ARCHIVE 01</span>
              </div>

              <h4 className="pip-sheet-title">Identity & Role</h4>
              <div className="pip-tape-banner">Official Personnel Record</div>

              <div className="pip-field-group">
                <div className="pip-dossier-row">
                  <span className="pip-label">Full Name</span>
                  <span className="pip-value pip-highlight">Pip</span>
                </div>

                <div className="pip-dossier-row">
                  <span className="pip-label">Identity</span>
                  <span className="pip-value">
                    A baby with a smooth, cute skull face and warm amber eyes
                  </span>
                </div>

                <div className="pip-dossier-row">
                  <span className="pip-label">Role</span>
                  <span className="pip-value font-semibold text-amber-900">
                    Junior Dream Engineer
                  </span>
                </div>

                <div className="pip-dossier-row">
                  <span className="pip-label">Workplace</span>
                  <span className="pip-value">The Midnight Nursery</span>
                </div>

                <div className="pip-dossier-row">
                  <span className="pip-label">Department</span>
                  <span className="pip-value">
                    Dream Delivery &amp; Lullaby Synthesis
                  </span>
                </div>

                <div className="pip-dossier-row">
                  <span className="pip-label">Clearance</span>
                  <span className="pip-value pip-badge-clearance">
                    Night Shift — Level 1 (Enthusiastic)
                  </span>
                </div>
              </div>

              <div className="pip-sheet-footer">
                <span>Page 1</span>
                <span className="pip-corner-hint">Drag corner to flip ➔</span>
              </div>
            </div>
          </Page>

          {/* PAGE 2: CHAPTER II — HEART & PERSONALITY */}
          <Page className="pip-content-page">
            <div className="pip-page-sheet">
              <div className="pip-sheet-header">
                <span className="pip-chapter-tag">CHAPTER II</span>
                <span className="pip-sheet-ref">HEART &amp; HABITS</span>
              </div>

              <h4 className="pip-sheet-title">Personality & Quirks</h4>
              <div className="pip-tape-banner">Observations by Elder Dreamkeepers</div>

              <div className="pip-field-group">
                <div className="pip-dossier-block">
                  <div className="pip-block-title">
                    <Heart size={13} className="text-rose-500" />
                    <span>Personality</span>
                  </div>
                  <p className="pip-block-text">
                    Sleepy, curious, slightly clumsy, and easily delighted by floating bubbles and warm blankets.
                  </p>
                </div>

                <div className="pip-dossier-block">
                  <div className="pip-block-title">
                    <Compass size={13} className="text-amber-600" />
                    <span>Interests</span>
                  </div>
                  <p className="pip-block-text">
                    Lullabies, starlight lanterns, rooftop dream delivery, and hearing bedtime stories before drifting off.
                  </p>
                </div>

                <div className="pip-dossier-block">
                  <div className="pip-block-title">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>Quirk</span>
                  </div>
                  <p className="pip-block-text">
                    Dislikes absolute silence. Enjoys little gentle giggles. Can fall asleep anywhere, especially on soft cumulus clouds.
                  </p>
                </div>
              </div>

              <div className="pip-sheet-footer">
                <span>Page 2</span>
                <span className="pip-corner-hint">Next: Field Gear ➔</span>
              </div>
            </div>
          </Page>

          {/* PAGE 3: CHAPTER III — DREAM TOOLS & GEAR */}
          <Page className="pip-content-page">
            <div className="pip-page-sheet">
              <div className="pip-sheet-header">
                <span className="pip-chapter-tag">CHAPTER III</span>
                <span className="pip-sheet-ref">EQUIPMENT</span>
              </div>

              <h4 className="pip-sheet-title">Standard Issue Kit</h4>
              <div className="pip-tape-banner">Handcrafted Nursery Inventions</div>

              <div className="pip-gear-cards">
                <div className="pip-gear-item">
                  <div className="pip-gear-icon">🏮</div>
                  <div className="pip-gear-info">
                    <strong>Dream Lantern</strong>
                    <span>Calibrated to soft 432 Hz frequencies (892 tuned)</span>
                  </div>
                </div>

                <div className="pip-gear-item">
                  <div className="pip-gear-icon">☁️</div>
                  <div className="pip-gear-info">
                    <strong>Cloud Saddle</strong>
                    <span>Fluffy cumulus cushion for drifting across 17 rooftop routes</span>
                  </div>
                </div>

                <div className="pip-gear-item">
                  <div className="pip-gear-icon">🦄</div>
                  <div className="pip-gear-info">
                    <strong>Harmonic Rattle</strong>
                    <span>Resonates tranquil bedtime chimes to soothe dreamers</span>
                  </div>
                </div>
              </div>

              <div className="pip-stat-callout">
                <div className="pip-stat-badge">4,209</div>
                <div className="pip-stat-label">Lullabies synthesized &amp; delivered to slumbering babies</div>
              </div>

              <div className="pip-sheet-footer">
                <span>Page 3</span>
                <span className="pip-corner-hint">Next: Motto ➔</span>
              </div>
            </div>
          </Page>

          {/* PAGE 4: CHAPTER IV — TAGLINE & MOTTO */}
          <Page className="pip-content-page">
            <div className="pip-page-sheet">
              <div className="pip-sheet-header">
                <span className="pip-chapter-tag">CHAPTER IV</span>
                <span className="pip-sheet-ref">MOTTO &amp; PLEDGE</span>
              </div>

              <h4 className="pip-sheet-title">The Dreamer's Creed</h4>
              <div className="pip-tape-banner">Engineer's Personal Oath</div>

              <div className="pip-tagline-quote">
                <span className="pip-quote-mark">“</span>
                <p className="pip-tagline-text">
                  I build the dreams you fall asleep inside.
                </p>
                <span className="pip-quote-author">— Pip, Junior Dream Engineer</span>
              </div>

              <div className="pip-approval-stamp">
                <div className="pip-stamp-box">
                  <div className="pip-stamp-badge">
                    <Wand2 size={12} />
                    <span>OFFICIAL NIGHT EMBLEM</span>
                  </div>
                  <p className="pip-stamp-text">
                    CERTIFIED BY MIDNIGHT NURSERY ARCHIVES
                  </p>
                  <div className="pip-stamp-signature">~ Pip ✦</div>
                </div>
              </div>

              <div className="pip-sheet-footer">
                <span>Page 4</span>
                <span className="pip-corner-hint">Flip to close ➔</span>
              </div>
            </div>
          </Page>

          {/* PAGE 5: BACK COVER — ARCHIVAL SEAL */}
          <Page className="pip-book-cover page-back-cover">
            <div className="pip-cover-inner">
              <div className="pip-cover-border pip-back-cover-border flex flex-col justify-between items-center text-center">
                <div className="pip-cover-badge">
                  <Star size={13} className="text-amber-300" />
                  <span>NURSERY ARCHIVES</span>
                  <Star size={13} className="text-amber-300" />
                </div>

                <div className="pip-back-center">
                  <div className="pip-back-emblem-ring">
                    <span className="pip-emblem-icon">⭐</span>
                  </div>
                  <h4 className="pip-back-title">Good Night, Dreamer</h4>
                  <p className="pip-back-quote">
                    “When the nursery lights dim, the sweetest dreams take flight.”
                  </p>
                  <div className="pip-back-seal-pill">
                    <Sparkles size={11} className="text-amber-300" />
                    <span>Archival Seal · Dream Verified</span>
                    <Sparkles size={11} className="text-amber-300" />
                  </div>
                </div>

                <div className="pip-back-bottom">
                  <div className="pip-back-ref-text">
                    Pip's Dream.exe · MN-ARCHIVE-2026
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToPage(0);
                    }}
                    className="pip-cover-open-hint mx-auto"
                  >
                    <RotateCcw size={13} />
                    <span>Flip back to cover</span>
                  </button>
                </div>
              </div>
            </div>
          </Page>
        </FlipBookComponent>
      </div>

      {/* Chapter Quick Jumps */}
      <div className="pip-book-chapters">
        {[
          { label: 'Cover', page: 0 },
          { label: 'Identity', page: 1 },
          { label: 'Personality', page: 2 },
          { label: 'Gear', page: 3 },
          { label: 'Motto', page: 4 },
          { label: 'Seal', page: 5 },
        ].map((ch) => {
          const isActive =
            ch.page === currentPage ||
            (ch.page === 5 && currentPage >= 5);

          return (
            <button
              key={ch.page}
              type="button"
              onClick={() => jumpToPage(ch.page)}
              className={`pip-chapter-chip ${isActive ? 'pip-chapter-chip--active' : ''}`}
            >
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* Scoped CSS Styles for the flipbook */}
      <style>{`
        .pip-dossier-book-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          flex: 1;
        }

        .pip-book-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-bottom: 8px;
          padding: 6px 12px;
          background: rgba(255, 252, 246, 0.85);
          border: 1px solid var(--border-warm, #e8dcc8);
          border-radius: var(--radius-md, 8px);
        }

        .pip-book-page-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--body-text, #3d2b20);
        }

        .pip-book-nav-buttons {
          display: flex;
          gap: 6px;
        }

        .pip-book-btn {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--border-warm, #d8c8b4);
          background: #fff;
          color: var(--body-text, #3d2b20);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pip-book-btn:hover:not(:disabled) {
          background: var(--surface-panel, #fdf8f0);
          border-color: var(--accent, #a64b2a);
          color: var(--accent, #a64b2a);
        }

        .pip-book-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pip-book-btn-primary {
          background: var(--surface-panel, #f7efe4);
          color: var(--accent, #a64b2a);
        }

        .pip-book-stage {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          flex: 1;
          min-height: 480px;
          perspective: 1500px;
          position: relative;
          overflow: hidden;
        }

        .pip-flipbook-instance {
          max-width: 100%;
          transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
        }

        @media (min-width: 640px) {
          .pip-cover-state-front {
            transform: translateX(-25%);
          }
          .pip-cover-state-spread {
            transform: translateX(0);
          }
          .pip-cover-state-back {
            transform: translateX(25%);
          }
        }

        .pip-book-page {
          transition: none !important;
        }

        /* Cover styling */
        .pip-book-cover {
          background: #1e1218 !important;
          color: #f7eedf !important;
          border-radius: 8px 3px 3px 8px;
        }

        .page-back-cover {
          border-radius: 3px 8px 8px 3px !important;
        }

        .pip-cover-inner {
          height: 100%;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }

        .pip-cover-border {
          height: 100%;
          border: 2px dashed rgba(212, 175, 55, 0.45);
          border-radius: 6px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          text-align: center;
          background: radial-gradient(circle at 50% 30%, rgba(68, 43, 33, 0.6) 0%, rgba(26, 17, 12, 0.95) 100%);
        }

        .pip-back-cover-border {
          background: radial-gradient(circle at 50% 35%, #3d222b 0%, #20131b 60%, #12090f 100%) !important;
          border: 2px solid rgba(255, 215, 0, 0.6) !important;
          outline: 1px dashed rgba(255, 215, 0, 0.35) !important;
          outline-offset: -5px !important;
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.65), 0 4px 20px rgba(0, 0, 0, 0.3) !important;
          padding: 16px 14px;
        }

        .pip-back-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .pip-back-emblem-ring {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 2px solid #ffd700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 4px;
          font-size: 22px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.04) 70%);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.35);
        }

        .pip-back-title {
          font-family: var(--font-display, serif) !important;
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #fff8f1 !important;
          margin: 4px 0 0 0 !important;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(255, 215, 0, 0.3) !important;
          letter-spacing: 0.02em;
        }

        .pip-back-quote {
          font-family: var(--font-story, serif) !important;
          font-size: 0.76rem !important;
          font-style: italic !important;
          color: #ffe6c7 !important;
          line-height: 1.35 !important;
          max-width: 210px;
          margin: 2px auto 0 !important;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7) !important;
        }

        .pip-back-seal-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 14px;
          background: rgba(255, 215, 0, 0.15);
          border: 1px solid rgba(255, 215, 0, 0.45);
          color: #ffd700;
          font-family: var(--font-ui, system-ui);
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-top: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .pip-back-bottom {
          width: 100%;
          border-top: 1px dashed rgba(255, 215, 0, 0.3);
          padding-top: 6px;
        }

        .pip-back-ref-text {
          font-family: monospace;
          font-size: 0.58rem;
          color: rgba(255, 238, 215, 0.65);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
        }

        .pip-cover-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #ffd700;
          text-transform: uppercase;
        }

        .pip-emblem-ring {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid rgba(255, 215, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          font-size: 26px;
          background: rgba(255, 215, 0, 0.1);
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }

        .pip-cover-title {
          font-family: var(--font-display, serif);
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #fff4e0;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .pip-cover-subtitle {
          font-family: var(--font-ui, system-ui);
          font-size: 0.72rem;
          color: rgba(255, 238, 215, 0.75);
          margin-top: 4px;
        }

        .pip-cover-file-no {
          display: inline-block;
          font-family: monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          padding: 2px 8px;
          margin-top: 8px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 4px;
          color: #ffd700;
        }

        .pip-cover-classification {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .pip-class-stamp {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #a8d5ba;
          background: rgba(46, 125, 50, 0.2);
          border: 1px solid rgba(168, 213, 186, 0.4);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pip-cover-teaser {
          font-family: var(--font-story, serif);
          font-size: 0.72rem;
          color: rgba(255, 238, 215, 0.7);
          margin: 0;
        }

        .pip-cover-open-hint {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.72rem;
          font-weight: 600;
          color: #231610;
          background: #ffd700;
          border: none;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }

        .pip-cover-open-hint:hover {
          background: #ffe033;
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.5);
        }

        .pip-cover-open-hint * {
          pointer-events: none;
        }

        /* Page Content Sheet - tightened layout to comfortably fit all frames */
        .pip-content-page {
          background-color: var(--paper-bg, #fffdf8) !important;
          background-image: var(--paper-texture, radial-gradient(#e5d9c5 0.75px, transparent 0.75px)) !important;
          background-size: 14px 14px !important;
        }

        .pip-page-sheet {
          height: 100%;
          padding: 14px 16px 10px;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .pip-sheet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(166, 75, 42, 0.15);
          padding-bottom: 2px;
        }

        .pip-chapter-tag {
          font-family: var(--font-ui, system-ui);
          font-size: 0.62rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: var(--accent, #a64b2a);
          text-transform: uppercase;
        }

        .pip-sheet-ref {
          font-family: monospace;
          font-size: 0.58rem;
          color: var(--text-faint, #8c7b70);
        }

        .pip-sheet-title {
          font-family: var(--font-display, serif);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--body-text, #2b1e16);
          margin: 0 0 2px 0;
          line-height: 1.2;
        }

        .pip-tape-banner {
          display: inline-block;
          font-family: var(--font-ui, system-ui);
          font-size: 0.58rem;
          font-weight: 600;
          color: #7a5840;
          background: #f0e6d6;
          border-left: 2px solid var(--accent, #a64b2a);
          padding: 1px 6px;
          border-radius: 0 3px 3px 0;
          margin-bottom: 6px;
          align-self: flex-start;
        }

        .pip-field-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .pip-dossier-row {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-bottom: 3px;
          border-bottom: 1px dashed rgba(166, 75, 42, 0.15);
        }

        .pip-label {
          font-family: var(--font-ui, system-ui);
          font-size: 0.56rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-faint, #8c7b70);
          text-transform: uppercase;
        }

        .pip-value {
          font-family: var(--font-story, serif);
          font-size: 0.76rem;
          color: var(--body-text, #2b1e16);
          line-height: 1.25;
        }

        .pip-highlight {
          font-family: var(--font-display, serif);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--accent, #a64b2a);
        }

        .pip-badge-clearance {
          display: inline-block;
          font-family: var(--font-ui, system-ui);
          font-size: 0.62rem;
          font-weight: 700;
          color: #2e7d32;
          background: #e8f5e9;
          padding: 1px 5px;
          border-radius: 4px;
          align-self: flex-start;
          margin-top: 1px;
        }

        /* Chapter II blocks */
        .pip-dossier-block {
          background: #fdfaf4;
          border: 1px solid #ebdcc8;
          border-radius: 5px;
          padding: 5px 8px;
        }

        .pip-block-title {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--body-text, #2b1e16);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }

        .pip-block-text {
          font-family: var(--font-story, serif);
          font-size: 0.72rem;
          color: var(--body-text, #3d2b20);
          margin: 0;
          line-height: 1.28;
        }

        /* Chapter III gear */
        .pip-gear-cards {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 6px;
        }

        .pip-gear-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fcf8f0;
          border: 1px solid #eadbc8;
          border-radius: 5px;
          padding: 4px 8px;
        }

        .pip-gear-icon {
          font-size: 1.15rem;
        }

        .pip-gear-info strong {
          display: block;
          font-family: var(--font-display, serif);
          font-size: 0.74rem;
          color: var(--body-text, #2b1e16);
        }

        .pip-gear-info span {
          display: block;
          font-family: var(--font-ui, system-ui);
          font-size: 0.64rem;
          color: var(--text-muted, #705d52);
          line-height: 1.2;
        }

        .pip-stat-callout {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff8eb;
          border: 1.5px dashed #d4af37;
          border-radius: 5px;
          padding: 5px 8px;
        }

        .pip-stat-badge {
          font-family: var(--font-display, serif);
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--accent, #a64b2a);
        }

        .pip-stat-label {
          font-family: var(--font-ui, system-ui);
          font-size: 0.62rem;
          color: var(--body-text, #3d2b20);
          line-height: 1.2;
        }

        /* Chapter IV quote & stamp */
        .pip-tagline-quote {
          position: relative;
          background: #fbf5ea;
          border-left: 3px solid #d4af37;
          border-radius: 0 5px 5px 0;
          padding: 8px 10px 6px 18px;
          margin-bottom: 8px;
        }

        .pip-quote-mark {
          position: absolute;
          left: 3px;
          top: -2px;
          font-size: 1.6rem;
          font-family: Georgia, serif;
          color: #d4af37;
          opacity: 0.5;
          line-height: 1;
        }

        .pip-tagline-text {
          font-family: var(--font-story, serif);
          font-size: 0.82rem;
          font-style: italic;
          font-weight: 500;
          color: var(--body-text, #2b1e16);
          margin: 0;
          line-height: 1.28;
        }

        .pip-quote-author {
          display: block;
          font-family: var(--font-ui, system-ui);
          font-size: 0.6rem;
          font-weight: 600;
          color: var(--text-faint, #8c7b70);
          margin-top: 3px;
        }

        .pip-approval-stamp {
          margin-top: auto;
          display: flex;
          justify-content: center;
        }

        .pip-stamp-box {
          border: 1.5px dashed #b7410e;
          border-radius: 5px;
          padding: 5px 10px;
          text-align: center;
          transform: rotate(-1.5deg);
          background: rgba(183, 65, 14, 0.04);
        }

        .pip-stamp-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-family: var(--font-ui, system-ui);
          font-size: 0.56rem;
          font-weight: 700;
          color: #b7410e;
          letter-spacing: 0.08em;
        }

        .pip-stamp-text {
          font-family: var(--font-ui, system-ui);
          font-size: 0.58rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #b7410e;
          margin: 1px 0 0 0;
        }

        .pip-stamp-signature {
          font-family: var(--font-display, cursive);
          font-size: 0.88rem;
          color: #b7410e;
          margin-top: 1px;
        }

        .pip-sheet-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: var(--font-ui, system-ui);
          font-size: 0.6rem;
          color: var(--text-faint, #8c7b70);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding-top: 4px;
        }

        .pip-corner-hint {
          font-style: italic;
          color: var(--accent, #a64b2a);
          font-weight: 600;
        }

        /* Chapter Quick Jumps */
        .pip-book-chapters {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          margin-top: 12px;
        }

        .pip-chapter-chip {
          font-family: var(--font-ui, system-ui);
          font-size: 0.65rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          border: 1px solid var(--border-warm, #d8c8b4);
          background: #fff;
          color: var(--body-text, #3d2b20);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pip-chapter-chip:hover {
          background: var(--surface-panel, #fdf8f0);
          border-color: var(--accent, #a64b2a);
          color: var(--accent, #a64b2a);
        }

        .pip-chapter-chip--active {
          background: var(--accent, #a64b2a) !important;
          color: #fff !important;
          border-color: var(--accent, #a64b2a) !important;
        }

        /* ── Dream Mode overrides: keep the dossier book cozy on dark surfaces ── */
        [data-theme="dream"] .pip-cover-page {
          background: radial-gradient(circle at 50% 30%, rgba(68, 43, 33, 0.85) 0%, rgba(20, 12, 16, 0.98) 100%);
        }
        [data-theme="dream"] .pip-content-page {
          background-color: var(--paper-bg) !important;
          background-image: var(--paper-texture) !important;
        }
        [data-theme="dream"] .pip-tape-banner {
          color: #c4a882;
          background: var(--surface-panel);
        }
        [data-theme="dream"] .pip-dossier-block {
          background: var(--surface-panel);
          border-color: var(--border-warm);
        }
        [data-theme="dream"] .pip-gear-item {
          background: var(--surface-panel);
          border-color: #d4a882;
        }
        [data-theme="dream"] .pip-stat-callout {
          background: var(--surface-panel);
        }
        [data-theme="dream"] .pip-tagline-quote {
          background: var(--surface-inset);
        }
        [data-theme="dream"] .pip-chapter-chip {
          background: var(--surface-panel);
          color: var(--body-text);
        }
        [data-theme="dream"] .pip-chapter-chip:hover {
          background: var(--surface-inset);
        }
        [data-theme="dream"] .pip-cover-open-hint {
          color: #2b1e16;
        }
        [data-theme="dream"] .pip-quote-author {
          border-top-color: rgba(255, 255, 255, 0.08);
        }
        [data-theme="dream"] .pip-sheet-footer {
          border-top-color: rgba(255, 255, 255, 0.08);
        }
        [data-theme="dream"] .pip-stamp-box {
          background: rgba(245, 158, 11, 0.06);
          border-color: rgba(245, 158, 11, 0.3);
        }
        [data-theme="dream"] .pip-badge-clearance {
          color: #6ee7b7;
          background: rgba(110, 231, 183, 0.12);
        }
        [data-theme="dream"] .pip-stamp-badge,
        [data-theme="dream"] .pip-stamp-text,
        [data-theme="dream"] .pip-stamp-signature {
          color: #f59e0b;
        }

        @media (max-width: 640px) {
          .pip-book-stage {
            min-height: 440px;
          }
          .pip-sheet-title {
            font-size: 1.15rem;
          }
          .pip-page-sheet {
            padding: 18px 14px 14px;
          }
        }
      `}</style>
    </div>
  );
}

export default PipDossierBook;
