// =============================================================
// PIP.EXE — Visitor Counter Popup Widget
// "Cozy Retro System Window" Style
//
// Layout Anatomy:
//   1. TITLE BAR: "VISITORS 🌸" + square bevelled close button (X)
//   2. BODY: sunken field containing:
//      - "You are visitor number"
//      - 6 LCD digit tiles (0 0 1 2 4 7) with retro stepped roll-up
//      - "Thanks for stopping by! 🌸"
//   3. FOOTER: primary [ Ok ] button that closes the popup
//
// Privacy-Friendly Counting:
// Zero personal data is collected or transmitted (no IP addresses,
// no user agents, no tracking cookies). A single localStorage key
// 'sd_visited' tracks whether this browser has already been counted.
// =============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'sd_visited';
const PAD_LENGTH = 6;

interface VisitorCounterModalProps {
  /** Optional custom trigger to manually open/close */
  isOpen?: boolean;
  onClose?: () => void;
}

export function VisitorCounterModal({ isOpen: controlledIsOpen, onClose }: VisitorCounterModalProps) {
  // Default minimized: starts docked as badge, expands on click
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const [digits, setDigits] = useState<string>('-'.repeat(PAD_LENGTH));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realTotal, setRealTotal] = useState<number | null>(null);

  const animFrameRef = useRef<number | null>(null);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  }, [onClose]);

  // Roll digits with stepped retro feel
  const rollTo = useCallback((total: number) => {
    const targetStr = String(total).padStart(PAD_LENGTH, '0');

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDigits(targetStr);
      return;
    }

    const start = performance.now();
    const duration = 600; // ~600ms roll

    const tick = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      // stepped easing: 4 retro intervals for an authentic mechanical odometer roll
      const eased = Math.floor(elapsed * 4) / 4;
      const currentVal = Math.round(total * eased);
      setDigits(String(currentVal).padStart(PAD_LENGTH, '0'));

      if (elapsed < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setDigits(targetStr);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Fetch or increment visitor counter
  useEffect(() => {
    let isCancelled = false;

    async function loadCounter() {
      setDigits('-'.repeat(PAD_LENGTH));
      setErrorMessage(null);

      try {
        const isFirstVisit = !localStorage.getItem(STORAGE_KEY);
        let total: number | null = null;

        // 1. Try /api/stats (authoritative production Supabase edge function & backend endpoint)
        try {
          const statsRes = await fetch('/api/stats', {
            headers: { 'Accept': 'application/json' },
          });
          if (statsRes.ok) {
            const data = await statsRes.json();
            const count = data?.data?.total_visits ?? data?.data?.total ?? data?.total;
            if (typeof count === 'number' && count >= 0) {
              total = count;
            }
          }
        } catch {
          // ignore and proceed to /api/visits
        }

        // 2. If stats endpoint did not return, try /api/visits
        if (total === null) {
          try {
            const res = await fetch('/api/visits', {
              method: isFirstVisit ? 'POST' : 'GET',
              headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
              const data = await res.json();
              const count = typeof data.total === 'number' ? data.total : (data?.data?.total ?? data?.data?.total_visits);
              if (typeof count === 'number' && count >= 0) {
                total = count;
              }
            }
          } catch {
            // ignore
          }
        }

        // 3. Fallback to local storage counter if both network calls failed
        if (total === null) {
          const localStored = localStorage.getItem('pip-exe-visits');
          if (localStored && !isNaN(parseInt(localStored, 10))) {
            total = parseInt(localStored, 10);
          }
        }

        if (isCancelled) return;

        if (total === null) {
          throw new Error('All counter endpoints unavailable');
        }

        if (isFirstVisit) {
          try {
            localStorage.setItem(STORAGE_KEY, '1');
          } catch {
            // Safe fallback if storage blocked
          }
        }

        setRealTotal(total);
        rollTo(total);
      } catch (err) {
        if (!isCancelled) {
          console.warn('[VisitorCounter] Could not reach counter:', err);
          setErrorMessage("Couldn't reach the counter, try again later 🌧");
        }
      }
    }

    loadCounter();

    return () => {
      isCancelled = true;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [rollTo]);

  // Handle Esc key to close popup
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleClose]);

  return (
    <>
      {/* Floating Widget Popup Window */}
      {isVisible && (
        <div className="rw-counter-dock">
          <div
            className="rw rw-counter"
            id="visitor-popup"
            role="dialog"
            aria-labelledby="vc-title"
            style={{ width: 'min(92vw, 340px)' }}
          >
            {/* Title Bar */}
            <div className="rw-title">
              <span id="vc-title">Visitors 🌸</span>
              <button
                className="rw-close"
                aria-label="Close"
                data-close
                onClick={handleClose}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Window Body with Sunken Field */}
            <div className="rw-body">
              <div className="rw-sunken vc-field">
                <p className="vc-label">You are visitor number</p>

                {errorMessage ? (
                  <p
                    style={{
                      fontFamily: 'var(--font-cozy)',
                      fontSize: '13px',
                      color: 'var(--win-title)',
                      margin: '12px 4px',
                      lineHeight: 1.4,
                    }}
                  >
                    {errorMessage}
                  </p>
                ) : (
                  <div
                    className="vc-digits"
                    id="vc-digits"
                    aria-live="polite"
                    aria-label={`Visitor count: ${digits}`}
                  >
                    {[...digits].map((d, idx) => (
                      <span key={idx} className="vc-digit">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                <p className="vc-note">Thanks for stopping by! 🌸</p>
              </div>
            </div>

            {/* Footer with Primary Ok Button */}
            <div className="rw-footer">
              <button
                className="rw-btn rw-btn--primary"
                data-close
                onClick={handleClose}
                type="button"
              >
                Ok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Docked Corner Badge when closed (allows reopening) */}
      {!isVisible && (
        <button
          onClick={() => {
            setInternalIsOpen(true);
            if (realTotal !== null) {
              rollTo(realTotal);
            }
          }}
          title="Open Visitor Counter"
          aria-label="Open Visitor Counter"
          style={{
            position: 'fixed',
            bottom: '18px',
            left: '18px',
            zIndex: 9975,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--win-face)',
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-pixel)',
            fontSize: '15px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--win-darkest)',
            boxShadow:
              'inset 1px 1px 0 var(--win-hilite), inset -1px -1px 0 var(--win-shadow), 0 4px 12px rgba(58, 29, 38, 0.25)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span>🌸</span>
          <span>Visitors</span>
          {realTotal !== null && (
            <span
              style={{
                background: 'rgba(58, 29, 38, 0.85)',
                color: 'var(--accent-gold)',
                padding: '0 4px',
                borderRadius: '2px',
                fontSize: '14px',
                letterSpacing: '0.04em',
              }}
            >
              {String(realTotal).padStart(PAD_LENGTH, '0')}
            </span>
          )}
        </button>
      )}
    </>
  );
}

export default VisitorCounterModal;
