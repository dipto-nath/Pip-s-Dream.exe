// =============================================================
// PIP.EXE — HeroSection + PipCharacter
// =============================================================

import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Star } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { EasterEggTrigger } from './EasterEgg';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';

interface HeroSectionProps {
  chaosMode: boolean;
}

export function HeroSection({ chaosMode }: HeroSectionProps) {
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { playChime } = useSound(soundEnabled);
  const imgRef = useRef<HTMLImageElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number>(0);
  const targetTilt = useRef({ x: 0, y: 0 });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ((e.clientX - cx) / (rect.width / 2)) * 5;
    const dy = ((e.clientY - cy) / (rect.height / 2)) * -3;
    targetTilt.current = { x: dx, y: dy };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTilt((prev) => ({
        x: prev.x + (targetTilt.current.x - prev.x) * 0.1,
        y: prev.y + (targetTilt.current.y - prev.y) * 0.1,
      }));
    });
  }, [prefersReduced]);

  const handlePointerLeave = useCallback(() => {
    setHovered(false);
    targetTilt.current = { x: 0, y: 0 };
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      style={{
        padding: 'clamp(3rem, 6vw, 6rem) 0 clamp(2rem, 4vw, 4rem)',
        background: 'var(--surface)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative stars */}
      {!prefersReduced && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {[
            { top: '12%', left: '8%',  size: 18, rotate: 15,  color: 'var(--amber)' },
            { top: '70%', left: '5%',  size: 12, rotate: -20, color: 'var(--accent)' },
            { top: '25%', right: '6%', size: 22, rotate: 10,  color: 'var(--amber-bright)' },
            { top: '60%', right: '4%', size: 14, rotate: -8,  color: 'var(--accent)' },
            { top: '45%', left: '2%', size: 10,  rotate: 30,  color: 'var(--amber)' },
          ].map((s, i) => (
            <Star
              key={i}
              size={s.size}
              fill="currentColor"
              style={{
                position: 'absolute',
                top: s.top,
                left: (s as { left?: string }).left,
                right: (s as { right?: string }).right,
                color: s.color,
                transform: `rotate(${s.rotate}deg)`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
      )}

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: 'clamp(2rem, 4vw, 5rem)',
            alignItems: 'center',
          }}
          className="hero-grid"
        >
          {/* ── Text column ── */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div style={{ marginBottom: 'var(--sp-3)' }}>
              <span className="sticker" style={{ transform: 'rotate(-1deg)', display: 'inline-block', marginBottom: 8 }}>
                THE MIDNIGHT NURSERY
              </span>
              {' '}
              <span className="sticker" style={{ transform: 'rotate(0.5deg)', display: 'inline-block' }}>
                EMPLOYEE NO. 001
              </span>
            </div>

            <h1
              id="hero-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--body-text)',
                marginBottom: 'var(--sp-5)',
                fontStyle: 'italic',
              }}
            >
              Hi, I'm Pip.{' '}
              <span style={{ color: 'var(--accent)', fontStyle: 'normal' }}>
                I build the dreams you fall asleep inside.
              </span>
            </h1>

            <p
              style={{
                fontFamily: 'var(--font-story)',
                fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.75,
                marginBottom: 'var(--sp-6)',
                maxWidth: '52ch',
              }}
            >
              Junior Dream Engineer at the Midnight Nursery. Inventor of lullabies,
              calibrator of nightlights, and mapper of dream-delivery routes across
              the sleeping rooftops of the neighborhood.
            </p>

            <blockquote
              style={{
                borderLeft: '3px solid var(--amber)',
                paddingLeft: 'var(--sp-4)',
                marginBottom: 'var(--sp-8)',
                fontFamily: 'var(--font-story)',
                fontStyle: 'italic',
                fontSize: '0.95rem',
                color: 'var(--text-muted)',
              }}
            >
              "Every good night begins with good light. And sometimes a slightly off-key lullaby."
            </blockquote>

            <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
              <a
                href="#work"
                className="btn-primary"
                onClick={() => { if (soundEnabled) playChime(880); }}
              >
                Explore my work
                <ArrowDown size={15} />
              </a>
              <a
                href="#about"
                className="btn-secondary"
                onClick={() => { if (soundEnabled) playChime(660); }}
              >
                Meet Pip
                <Star size={14} />
              </a>
            </div>

            {/* Character dossier teaser */}
            {chaosMode && (
              <motion.div
                initial={{ opacity: 0, rotate: -3 }}
                animate={{ opacity: 1, rotate: -3 }}
                style={{
                  marginTop: 'var(--sp-6)',
                  background: 'var(--surface-panel)',
                  border: '2px dashed var(--border-warm)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-4)',
                  maxWidth: '300px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-ui)',
                  color: 'var(--text-muted)',
                  boxShadow: '4px 4px 0 var(--shadow-warm)',
                }}
              >
                📋 <strong>Employee File — Pip</strong><br />
                Role: Junior Dream Engineer<br />
                Clearance: Night Shift Only<br />
                Status: Happily Employed ⭐
              </motion.div>
            )}
          </motion.div>

          {/* ── Character column ── */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onPointerEnter={() => setHovered(true)}
              onClick={() => { if (soundEnabled) playChime(1046); }}
              style={{
                position: 'relative',
                display: 'inline-block',
                cursor: 'pointer',
              }}
            >
              {/* Easter egg trigger */}
              <EasterEggTrigger />

              {/* Ambient glow */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: '-15%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, rgba(245,158,11,${hovered ? 0.25 : 0.1}) 0%, transparent 70%)`,
                  transition: 'background 0.4s',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              <img
                ref={imgRef}
                src="/assets/pip_avatar_cloud.png"
                alt="Pip, the skull-faced baby dream engineer, wearing a star-decorated nightcap and riding a small cloud"
                loading="eager"
                fetchPriority="high"
                width={340}
                height={340}
                style={{
                  width: 'clamp(200px, 28vw, 340px)',
                  height: 'auto',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 1,
                  transform: prefersReduced
                    ? 'none'
                    : `rotate(${tilt.x}deg) translateY(${tilt.y}px)`,
                  transition: prefersReduced ? 'none' : 'transform 0.15s ease-out',
                  animation: prefersReduced ? 'none' : 'float-pip 6s ease-in-out infinite',
                  filter: hovered
                    ? 'drop-shadow(0 8px 24px rgba(245,158,11,0.45))'
                    : 'drop-shadow(0 4px 12px rgba(245,158,11,0.2))',
                  borderRadius: 'var(--radius-xl)',
                }}
              />

              {/* Floating star stickers */}
              {!prefersReduced && (
                <>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: '-12%',
                      fontSize: '1.5rem',
                      animation: 'float-pip 4s ease-in-out infinite 0.5s',
                      zIndex: 2,
                    }}
                  >
                    ✦
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      bottom: '18%',
                      right: '-10%',
                      fontSize: '1rem',
                      animation: 'float-pip 5s ease-in-out infinite 1.2s',
                      color: 'var(--accent)',
                      zIndex: 2,
                    }}
                  >
                    ★
                  </span>
                </>
              )}
            </div>

            {/* Name badge */}
            <div
              style={{
                marginTop: 'var(--sp-4)',
                textAlign: 'center',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8rem',
                color: 'var(--text-faint)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              ✦ PIP · Junior Dream Engineer ✦
            </div>
          </motion.div>
        </div>
      </div>

      {/* Responsive styles injected globally */}
      <style>{`
        @media (max-width: 640px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-grid > div:last-child {
            order: -1;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-grid p { margin-inline: auto; }
          .hero-grid blockquote { text-align: left; }
        }
      `}</style>
    </section>
  );
}
