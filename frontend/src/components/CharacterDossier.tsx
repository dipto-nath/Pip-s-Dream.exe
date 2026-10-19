// =============================================================
// PIP.EXE — CharacterDossier
// Pip's identity sheet displayed as an organized dossier & storytelling flipbook
// =============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, FileText, Star, Moon } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useVisitorMemory } from '../hooks/useVisitorMemory';
import { useIsMobile } from '../hooks/useIsMobile';
import { PipDossierBook } from './PipDossierBook';

const DOSSIER_ITEMS = [
  { label: 'Full Name',   value: 'Pip' },
  { label: 'Identity',   value: 'A baby with a smooth, cute skull face and warm amber eyes' },
  { label: 'Role',       value: 'Junior Dream Engineer' },
  { label: 'Workplace',  value: 'The Midnight Nursery' },
  { label: 'Department', value: 'Dream Delivery & Lullaby Synthesis' },
  { label: 'Clearance',  value: 'Night Shift — Level 1 (Enthusiastic)' },
  { label: 'Personality', value: 'Sleepy, curious, slightly clumsy, easily delighted' },
  { label: 'Interests',  value: 'Lullabies, lanterns, dream delivery, bedtime stories' },
  { label: 'Quirk',      value: 'Dislikes silence. Enjoys little giggles. Can sleep anywhere.' },
  { label: 'Tagline',    value: '"I build the dreams you fall asleep inside."' },
];

interface CharacterDossierProps {
  chaosMode: boolean;
}

export function CharacterDossier({ chaosMode }: CharacterDossierProps) {
  const isMobileOrTablet = useIsMobile(1024);
  const prefersReduced = useReducedMotionPreference();
  const { profile, isReturningVisitor } = useVisitorMemory();
  const [viewMode, setViewMode] = useState<'storybook' | 'table'>('storybook');

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{ padding: 'clamp(3rem, 6vw, 5.5rem) 0', background: 'var(--surface-muted)' }}
    >
      <div className="container">
        {/* Unified Section Header */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 'var(--sp-2)',
            }}
          >
            <Moon size={14} />
            EMPLOYEE DOSSIER · PERSONNEL ARCHIVE #001
            <Star size={14} />
          </div>
          <h2
            id="about-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)',
              fontStyle: 'italic',
              margin: '0 0 var(--sp-2) 0',
              color: 'var(--body-text)',
            }}
          >
            Meet Pip
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-story)',
              fontSize: '1rem',
              color: 'var(--text-muted)',
              maxWidth: '560px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            The Junior Dream Engineer at The Midnight Nursery — crafting warm lullabies, calibrating lanterns, and delivering cozy dreams across the night.
          </p>
        </motion.div>

        {/* Organized Two-Column Dossier Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
            gap: 'clamp(2rem, 4vw, 3.5rem)',
            alignItems: 'stretch',
          }}
          className="dossier-grid"
        >
          {/* Left Column: Official Portrait + Stats + Visitor Memory */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
          >
            {/* Framed Portrait */}
            <div
              style={{
                position: 'relative',
                transform: chaosMode ? 'rotate(-2deg)' : 'none',
                transition: 'transform 0.4s',
              }}
            >
              <div
                style={{
                  border: '3px solid var(--border-strong)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: '5px 5px 0 var(--shadow-warm)',
                  background: 'var(--surface-panel)',
                  padding: '0.85rem',
                }}
              >
                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
                  <img
                    src="/assets/pip_portrait.png"
                    alt="Pip's official portrait — a sweet skull-baby in a starry nightcap waving from a cloud"
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '440px',
                      objectFit: 'cover',
                      display: 'block',
                      margin: '0 auto',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '8px 12px',
                      background: 'linear-gradient(to top, rgba(35, 22, 16, 0.85), transparent)',
                      color: '#fff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
                        Pip ✦
                      </span>
                      <span style={{ display: 'block', fontFamily: 'var(--font-ui)', fontSize: '0.65rem', opacity: 0.85 }}>
                        Junior Dream Engineer
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        background: 'rgba(255, 215, 0, 0.25)',
                        border: '1px solid rgba(255, 215, 0, 0.5)',
                        color: '#ffd700',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      OFFICIAL ID #001
                    </span>
                  </div>
                </div>
              </div>

              {chaosMode && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '-10px',
                    background: 'var(--amber)',
                    color: '#000',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    transform: 'rotate(4deg)',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                  }}
                >
                  ★ OFFICIAL PHOTO ★
                </span>
              )}
            </div>

            {/* Organized Stats Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--sp-2)',
              }}
            >
              {[
                { num: '4,209', label: 'Lullabies Delivered', icon: '🎵' },
                { num: '17',    label: 'Rooftop Routes',      icon: '🌙' },
                { num: '892',   label: 'Lanterns Calibrated', icon: '🏮' },
                { num: '∞',     label: 'Good Nights Ahead',   icon: '✨' },
              ].map(({ num, label, icon }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--surface-panel)',
                    border: '1px solid var(--border-warm)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.75rem',
                    textAlign: 'center',
                    boxShadow: '1px 1px 0 var(--shadow-warm)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem' }}>{icon}</span>
                    <span>{num}</span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Visitor Memory — Your Dream Record */}
            <div
              style={{
                background: 'var(--control-surface)',
                border: '1.5px dashed var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3)',
                boxShadow: '2px 2px 0 var(--shadow-warm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--sp-2)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Sparkles size={12} />
                  VISITOR MEMORY · YOUR RECORD
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    background: 'var(--surface-panel)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--border-warm)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {isReturningVisitor ? '✦ Returning Friend' : '✦ First Visit'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 'var(--sp-2)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    background: 'var(--surface-panel)',
                    padding: '5px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Dreamer
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--body-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.name || 'Friend'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-panel)',
                    padding: '5px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Nights Visited
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {profile?.visitCount ?? 1}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-panel)',
                    padding: '5px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Favorite Lamp
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--body-text)', textTransform: 'capitalize' }}>
                    {profile?.favoritePreset || 'Moonbeam'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Retro Window with Storytelling Flip-Page Animated Book */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <div className="retro-window" style={{ boxShadow: '6px 6px 0 var(--shadow-warm)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Retro Window Titlebar with Mode Switcher */}
              <div className="retro-window__titlebar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="retro-window__dots">
                    <span className="retro-window__dot retro-window__dot--red" />
                    <span className="retro-window__dot retro-window__dot--amber" />
                    <span className="retro-window__dot retro-window__dot--green" />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    pip://about/employee-file.txt
                  </span>
                </div>

                {/* View Mode Toggle — only for PC/Laptop (not mobile/tablet) */}
                {!isMobileOrTablet && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('storybook')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-warm)',
                        background: viewMode === 'storybook' ? 'var(--accent)' : 'transparent',
                        color: viewMode === 'storybook' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <BookOpen size={12} />
                      <span>Story Flipbook</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.66rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-warm)',
                        background: viewMode === 'table' ? 'var(--accent)' : 'transparent',
                        color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <FileText size={12} />
                      <span>Raw File</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Retro Window Body */}
              <div className="retro-window__body" style={{ padding: 'clamp(0.85rem, 2vw, 1.25rem)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!isMobileOrTablet && viewMode === 'storybook' ? (
                  <PipDossierBook />
                ) : (
                  <dl style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                    {DOSSIER_ITEMS.map(({ label, value }) => (
                      <div
                        key={label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '120px 1fr',
                          gap: 'var(--sp-3)',
                          borderBottom: '1px dashed var(--border-warm)',
                          paddingBottom: 'var(--sp-3)',
                        }}
                      >
                        <dt
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--text-faint)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            paddingTop: 2,
                          }}
                        >
                          {label}
                        </dt>
                        <dd
                          style={{
                            fontFamily: 'var(--font-story)',
                            fontSize: '0.9rem',
                            color: 'var(--body-text)',
                            fontStyle: label === 'Tagline' ? 'italic' : 'normal',
                            fontWeight: label === 'Tagline' ? 500 : 400,
                            margin: 0,
                          }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .dossier-grid { 
            grid-template-columns: 1fr !important; 
            gap: 2rem !important;
          }
          .dossier-grid dl div { 
            grid-template-columns: 110px 1fr !important; 
          }
        }
        @media (max-width: 480px) {
          .dossier-grid dl div { 
            grid-template-columns: 1fr !important; 
            gap: 4px !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CharacterDossier;
