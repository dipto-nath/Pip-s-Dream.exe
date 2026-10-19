// =============================================================
// PIP.EXE — SiteFooter
// Art credit, project identity, finishing details
// =============================================================

import { useState } from 'react';
import { HitCounterOdometer } from './HitCounterOdometer';

export function SiteFooter() {
  // Compute year once — Date is impure, but the year only changes on New Year's.
  const [year] = useState(() => new Date().getFullYear());

  return (
    <footer
      style={{
        background: 'var(--deep-wood)',
        borderTop: '2px solid var(--border-strong)',
        padding: 'var(--sp-10) 0 var(--sp-8)',
        color: 'rgba(255,248,241,0.75)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--sp-10)',
            marginBottom: 'var(--sp-10)',
          }}
        >
          {/* Identity */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.6rem',
                fontWeight: 700,
                color: 'var(--dream-cream)',
                marginBottom: 'var(--sp-3)',
                letterSpacing: '-0.02em',
              }}
            >
              PIP<span style={{ color: 'var(--glow-amber)', fontFamily: 'var(--font-ui)', fontSize: '0.9rem' }}>.EXE</span>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-story)',
                fontStyle: 'italic',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'rgba(255,248,241,0.6)',
                maxWidth: '28ch',
              }}
            >
              The Midnight Nursery Dream Desk.<br />
              "I build the dreams you fall asleep inside."
            </p>
          </div>

          {/* Links */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(255,248,241,0.4)',
                marginBottom: 'var(--sp-3)',
              }}
            >
              Navigate
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {[
                { href: '#hero',       label: 'Home' },
                { href: '#work',       label: 'Work' },
                { href: '#story',      label: 'Story' },
                { href: '#about',      label: 'About Pip' },
                { href: '#guestbook',  label: 'Guestbook' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    style={{
                      color: 'rgba(255,248,241,0.6)',
                      textDecoration: 'none',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.88rem',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = 'var(--glow-amber-bright)')}
                    onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(255,248,241,0.6)')}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Event credit */}
          <div>
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.72rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'rgba(255,248,241,0.4)',
                marginBottom: 'var(--sp-3)',
              }}
            >
              Official Credit
            </div>
            <p
              style={{
                fontFamily: 'var(--font-story)',
                fontSize: '0.85rem',
                lineHeight: 1.65,
                color: 'rgba(255,248,241,0.65)',
                maxWidth: '32ch',
              }}
            >
              Pip and the official character assets are provided by{' '}
              <a
                href="https://hax.baby/baby-problem"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--glow-amber-bright)' }}
              >
                haX.baby's Baby's First Website hackathon
              </a>
              .
            </p>
          </div>
        </div>

        {/* Global Dream Visits Showcase Centerpiece (preserved for mobile version, hidden on desktop) */}
        <div
          className="global-dream-visits-footer-section"
          style={{
            margin: 'var(--sp-8) 0 var(--sp-8)',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Subtle ambient halo glow behind odometer */}
          <div
            style={{
              position: 'absolute',
              width: 'min(520px, 90%)',
              height: '160px',
              background: 'radial-gradient(ellipse at center, rgba(243, 198, 111, 0.14) 0%, rgba(200, 62, 91, 0.06) 50%, transparent 75%)',
              filter: 'blur(28px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
            aria-hidden="true"
          />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <HitCounterOdometer />
          </div>
        </div>

        {/* Bottom strip */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 'var(--sp-5)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--sp-4)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'rgba(255,248,241,0.35)',
            }}
          >
            © {year} PIP.EXE — Built for haX.baby · Baby's First Website Hackathon · Track 1
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.72rem',
              color: 'rgba(255,248,241,0.25)',
            }}
          >
            Made with Web Audio API, Framer Motion, and a lot of warm amber light.
          </p>
        </div>
      </div>
    </footer>
  );
}
