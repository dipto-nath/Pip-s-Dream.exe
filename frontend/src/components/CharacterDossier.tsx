// =============================================================
// PIP.EXE — CharacterDossier
// Pip's identity sheet displayed as a retro window
// =============================================================

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useVisitorMemory } from '../hooks/useVisitorMemory';

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
  const prefersReduced = useReducedMotionPreference();
  const { profile, isReturningVisitor } = useVisitorMemory();

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      style={{ padding: 'clamp(3rem, 5vw, 5rem) 0', background: 'var(--surface-muted)' }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)',
            gap: 'clamp(2rem, 5vw, 5rem)',
            alignItems: 'start',
          }}
          className="dossier-grid"
        >
          {/* Portrait + label */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}
          >
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
                  boxShadow: '6px 6px 0 var(--shadow-warm)',
                  background: 'var(--surface-panel)',
                  padding: '1rem',
                }}
              >
                <img
                  src="/assets/pip_portrait.png"
                  alt="Pip's official portrait — a serene skull-baby in a starry nightcap"
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 'var(--radius-md)',
                    display: 'block',
                  }}
                />
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

            {/* Stats strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--sp-3)',
              }}
            >
              {[
                { num: '4,209', label: 'Lullabies Delivered' },
                { num: '17',    label: 'Rooftop Routes' },
                { num: '892',   label: 'Lanterns Calibrated' },
                { num: '∞',     label: 'Good Nights Ahead' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  style={{
                    background: 'var(--surface-panel)',
                    border: '1px solid var(--border-warm)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--sp-3)',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}
                  >
                    {num}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.72rem',
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
                background: 'rgba(255, 252, 246, 0.85)',
                border: '1.5px dashed var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-4)',
                boxShadow: '2px 2px 0 var(--shadow-warm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--sp-3)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={13} />
                  VISITOR MEMORY · YOUR DREAM RECORD
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: 'var(--surface-panel)',
                    padding: '2px 8px',
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
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Dreamer
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--body-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.name || 'Friend'}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-panel)',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Nights Visited
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {profile?.visitCount ?? 1}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--surface-panel)',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-warm)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>
                    Favorite Lamp
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--body-text)', textTransform: 'capitalize' }}>
                    {profile?.favoritePreset || 'Moonbeam'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Dossier */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <span className="section-eyebrow">Employee Dossier</span>
            <h2
              id="about-heading"
              style={{ marginBottom: 'var(--sp-6)', fontStyle: 'italic' }}
            >
              Meet Pip
            </h2>

            <div className="retro-window">
              <div className="retro-window__titlebar">
                <div className="retro-window__dots">
                  <span className="retro-window__dot retro-window__dot--red" />
                  <span className="retro-window__dot retro-window__dot--amber" />
                  <span className="retro-window__dot retro-window__dot--green" />
                </div>
                <span>pip://about/employee-file.txt</span>
              </div>
              <div className="retro-window__body">
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
                        }}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dossier-grid { grid-template-columns: 1fr !important; }
          .dossier-grid dl div { grid-template-columns: 100px 1fr !important; }
        }
      `}</style>
    </section>
  );
}
