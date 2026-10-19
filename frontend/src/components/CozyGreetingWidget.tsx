// =============================================================
// PIP.EXE — CozyGreetingWidget
// Warm welcoming widget for visitors at the start of the website.
// Greets returning visitors by their guestbook name,
// or as "friend" if they are new or have not signed yet.
// =============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, BookOpen, Trophy, X, ChevronDown } from 'lucide-react';
import { useVisitorMemory } from '../hooks/useVisitorMemory';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useIsMobile } from '../hooks/useIsMobile';

interface CozyGreetingWidgetProps {
  onPlayGame: () => void;
}

export function CozyGreetingWidget({ onPlayGame }: CozyGreetingWidgetProps) {
  const isMobile = useIsMobile();
  const { profile, greeting } = useVisitorMemory();
  const prefersReduced = useReducedMotionPreference();
  const [minimized, setMinimized] = useState(false);

  const visitorName = profile?.name;
  const isSigned = Boolean(visitorName);
  const bestScore = profile?.driftHighScore ?? 0;
  const visitCount = profile?.visitCount ?? 1;

  const scrollToGuestbook = () => {
    const el = document.getElementById('guestbook');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.aside
      aria-label="Nursery Visitor Welcome"
      initial={prefersReduced ? false : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="cozy-greeting-root"
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto clamp(0.75rem, 2vw, 1.25rem)',
        position: 'relative',
        zIndex: 10,
        padding: '0 clamp(4px, 2vw, 10px)',
      }}
    >
      <div
        className="cozy-greeting-card"
        style={{
          background: 'var(--control-surface, rgba(255, 252, 246, 0.94))',
          border: '2px solid var(--border-warm, #e8d8c3)',
          borderRadius: 'var(--radius-lg, 18px)',
          boxShadow: '0 12px 30px var(--shadow-warm), inset 0 1px 0 rgba(255,255,255,0.25)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top Header Tag Strip - guaranteed single line on all screen sizes */}
        <div
          className="cozy-greeting-header-strip"
          style={{
            background: 'linear-gradient(90deg, #3d2b20 0%, #52392c 100%)',
            color: '#fff',
            padding: '5px clamp(8px, 2vw, 14px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.64rem',
            fontFamily: 'var(--font-ui, system-ui)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{ color: '#ffd700', flexShrink: 0 }}>✦</span>
            <span
              style={{
                fontWeight: 700,
                color: '#f7eedf',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {isSigned
                ? (isMobile ? `WELCOME · ${visitorName}` : `NURSERY WELCOME · ${visitorName}`)
                : (isMobile ? 'WELCOME · FRIEND' : 'NURSERY WELCOME · DEAR FRIEND')}
            </span>
            <span style={{ color: '#ffd700', flexShrink: 0 }}>✦</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ color: '#f3c66f', fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>
              NIGHT #{visitCount}
            </span>
            <button
              type="button"
              onClick={() => setMinimized((v) => !v)}
              title={minimized ? 'Expand greeting' : 'Minimize greeting'}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: 'var(--body-text, #3a2418)',
                borderRadius: '4px',
                padding: '2px 5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '0.6rem',
              }}
            >
              {minimized ? <ChevronDown size={11} /> : <X size={11} />}
            </button>
          </div>
        </div>

        {/* Expanded Body */}
        <AnimatePresence initial={false}>
          {!minimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: 'clamp(10px, 2.5vw, 18px)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(8px, 2vw, 14px)' }}>
                  {/* Pip Warm Welcome Avatar / Emblem */}
                  <div
                    style={{
                      width: 'clamp(34px, 8vw, 44px)',
                      height: 'clamp(34px, 8vw, 44px)',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #fdedd6 0%, #e8cfb0 100%)',
                      border: '2px solid #dec3a7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(16px, 4vw, 22px)',
                      flexShrink: 0,
                      boxShadow: '0 4px 10px var(--shadow-warm)',
                    }}
                  >
                    {isSigned ? '⭐' : '🌸'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    {/* Main Greeting Quote */}
                    <h2
                      style={{
                        fontFamily: 'var(--font-display, serif)',
                        fontSize: 'clamp(0.95rem, 2.8vw, 1.25rem)',
                        fontWeight: 700,
                        color: 'var(--body-text, #2b1d16)',
                        margin: '0 0 3px 0',
                        lineHeight: 1.25,
                      }}
                    >
                      {isSigned ? (
                        <>
                          Welcome back,{' '}
                          <span style={{ color: 'var(--accent, #a34063)', fontStyle: 'italic' }}>
                            {visitorName}
                          </span>
                          ! ✨
                        </>
                      ) : (
                        <>
                          Welcome to the Midnight Nursery,{' '}
                          <span style={{ color: 'var(--accent, #a34063)', fontStyle: 'italic' }}>
                            friend
                          </span>
                          ! ✨
                        </>
                      )}
                    </h2>

                    <p
                      style={{
                        fontFamily: 'var(--font-story, serif)',
                        fontSize: 'clamp(0.78rem, 2vw, 0.88rem)',
                        color: 'var(--text-muted, #7c665a)',
                        margin: '0 0 10px 0',
                        lineHeight: 1.4,
                      }}
                    >
                      {greeting.text}
                    </p>

                    {/* Cozy Context Badges */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}
                    >
                      {isSigned ? (
                        <span
                          className="cozy-badge cozy-badge--signed"
                          style={{
                            fontFamily: 'var(--font-ui, system-ui)',
                            fontSize: '0.64rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: 'rgba(46, 125, 50, 0.12)',
                            color: 'var(--accent, #a34063)',
                            border: '1px solid rgba(46, 125, 50, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Star size={10} /> Signed Friend
                        </span>
                      ) : (
                        <span
                          className="cozy-badge cozy-badge--new"
                          style={{
                            fontFamily: 'var(--font-ui, system-ui)',
                            fontSize: '0.64rem',
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: 'rgba(230, 81, 0, 0.12)',
                            color: 'var(--amber, #f59e0b)',
                            border: '1px solid rgba(230, 81, 0, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Sparkles size={10} /> New Nursery Visitor
                        </span>
                      )}

                      {bestScore > 0 && (
                        <span
                          className="cozy-badge cozy-badge--score"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: 'var(--accent-fade-12, rgba(163, 64, 99, 0.12))',
                            color: 'var(--accent, #a34063)',
                            border: '1px solid var(--accent-fade-30, rgba(163, 64, 99, 0.30))',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trophy size={10} /> {isMobile ? 'Hop Best' : 'Drift Best'}: {bestScore.toLocaleString()} pts
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="cozy-greeting-actions">
                      <button
                        type="button"
                        onClick={onPlayGame}
                        className="stardust-pill cozy-greeting-play-btn"
                        style={{
                          background: 'linear-gradient(180deg, var(--accent, #a34063) 0%, var(--accent-hover, #8b3254) 100%)',
                          color: '#fff',
                          border: '1px solid #72203b',
                          borderRadius: '10px',
                          padding: '7px 14px',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-ui, system-ui)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 10px var(--shadow-warm)',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <span>🌸</span>
                        <span>{isMobile ? 'Play Sakura Hop' : 'Take a Cozy Midnight Sakura Drift'}</span>
                      </button>

                      {!isSigned && (
                        <button
                          type="button"
                          onClick={scrollToGuestbook}
                          className="cozy-greeting-sign-btn"
                          style={{
                            background: 'var(--control-surface, #fffdf8)',
                            color: 'var(--body-text, #3d2b20)',
                            border: '1px solid var(--border-warm, #decbb4)',
                            borderRadius: '10px',
                            padding: '7px 12px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-ui, system-ui)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <BookOpen size={12} style={{ color: 'var(--amber, #f59e0b)' }} />
                          <span>{isMobile ? 'Sign Guestbook' : 'Sign Guestbook & Share Name'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Responsive button & dream-mode overrides */}
      <style>{`
        .cozy-greeting-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        @media (max-width: 480px) {
          .cozy-greeting-actions {
            flex-direction: column;
            align-items: stretch !important;
          }
          .cozy-greeting-play-btn, .cozy-greeting-sign-btn {
            width: 100%;
          }
        }
        [data-theme="dream"] .cozy-badge--signed {
          background: rgba(110, 231, 183, 0.12) !important;
          color: #6ee7b7 !important;
          border-color: rgba(110, 231, 183, 0.3) !important;
        }
        [data-theme="dream"] .cozy-badge--new {
          background: rgba(251, 191, 36, 0.15) !important;
          color: #fbbf24 !important;
          border-color: rgba(251, 191, 36, 0.35) !important;
        }
        [data-theme="dream"] .cozy-badge--score {
          background: rgba(207, 110, 150, 0.15) !important;
          color: #f368b3 !important;
          border-color: rgba(207, 110, 150, 0.35) !important;
        }
      `}</style>
    </motion.aside>
  );
}

export default CozyGreetingWidget;
