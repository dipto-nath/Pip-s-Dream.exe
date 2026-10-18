// =============================================================
// PIP.EXE — HeroSection + Interactive Pip Stage
// Scenic nursery sky background + cursor-tracking Pip character
// =============================================================

import { motion } from 'framer-motion';
import { ArrowDown, Star, Sparkles } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { EasterEggTrigger } from './EasterEgg';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';
import { InteractivePip } from './InteractivePip';

interface HeroSectionProps {
  chaosMode: boolean;
}

export function HeroSection({ chaosMode }: HeroSectionProps) {
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { playChime } = useSound(soundEnabled);

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="hero-scenic-stage"
      style={{
        position: 'relative',
        minHeight: 'clamp(620px, 86vh, 900px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 'clamp(2.5rem, 5vw, 4.5rem) clamp(1rem, 3vw, 2.5rem)',
        overflow: 'hidden',
      }}
    >
      {/* Scenic Nursery Sky Background */}
      <div
        aria-hidden="true"
        className="hero-scenic-bg"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/assets/nursery_sky_bg.png')",
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* Gentle dream mode overlay so text and stars remain readable in dark theme */}
      <div
        aria-hidden="true"
        className="hero-theme-overlay"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Whimsical Floating Easter Egg Charm */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(24px, 5vh, 48px)',
          right: 'clamp(16px, 4vw, 48px)',
          zIndex: 10,
        }}
      >
        <EasterEggTrigger />
      </div>

      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '820px',
        }}
      >
        {/* Badges & Header Intro */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ marginBottom: 'var(--sp-2)' }}
        >
          <div
            style={{
              display: 'inline-flex',
              gap: '8px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 'var(--sp-2)',
            }}
          >
            <span className="sticker" style={{ transform: 'rotate(-1deg)' }}>
              THE MIDNIGHT NURSERY
            </span>
            <span className="sticker" style={{ transform: 'rotate(1deg)' }}>
              EMPLOYEE NO. 001
            </span>
          </div>

          <div
            className="hero-liquid-glass"
            style={{
              position: 'relative',
              zIndex: 2,
              background: 'rgba(255, 252, 246, 0.68)',
              backdropFilter: 'blur(14px) saturate(150%)',
              WebkitBackdropFilter: 'blur(14px) saturate(150%)',
              border: '1px solid rgba(255, 255, 255, 0.85)',
              borderRadius: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              padding: 'clamp(1.1rem, 2.2vw, 1.6rem) clamp(1.25rem, 3vw, 2.25rem)',
              boxShadow:
                '0 16px 38px rgba(184, 115, 51, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
              maxWidth: '680px',
              margin: '0 auto',
              transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
            }}
          >
            <h1
              id="hero-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.9rem, 4.2vw, 3.2rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                color: 'var(--body-text)',
                fontStyle: 'italic',
                margin: '0 0 var(--sp-2)',
                textShadow: '0 1px 10px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0,0,0,0.04)',
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
                fontSize: 'clamp(0.95rem, 1.6vw, 1.08rem)',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                maxWidth: '52ch',
                margin: '0 auto',
              }}
            >
              Junior Dream Engineer at the Midnight Nursery. Calibrator of nightlights,
              inventor of lullabies, and delivery runner across sleeping rooftops.
            </p>
          </div>
        </motion.div>

        {/* Center Stage: Interactive Pip with Cursor-Tracking Pupils and Body Shift */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
          style={{
            margin: 'var(--sp-2) 0 var(--sp-3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <InteractivePip
            soundEnabled={soundEnabled}
            onChime={playChime}
          />

          {/* Interactive cursor tip badge */}
          <div
            style={{
              marginTop: 'var(--sp-2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'rgba(255, 250, 240, 0.7)',
              backdropFilter: 'blur(8px)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent)' }} />
            <span>Pip tracks your cursor · Click for a chime</span>
          </div>
        </motion.div>

        {/* Actions & Bedtime Quote */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--sp-3)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--sp-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
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

          <blockquote
            style={{
              fontFamily: 'var(--font-story)',
              fontStyle: 'italic',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              margin: 'var(--sp-2) 0 0',
              maxWidth: '50ch',
            }}
          >
            "Every good night begins with good light. And sometimes a slightly off-key lullaby."
          </blockquote>

          {/* Character dossier teaser in chaos mode */}
          {chaosMode && (
            <motion.div
              initial={{ opacity: 0, rotate: -2 }}
              animate={{ opacity: 1, rotate: -2 }}
              style={{
                marginTop: 'var(--sp-3)',
                background: 'var(--surface-panel)',
                border: '2px dashed var(--border-warm)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--sp-3) var(--sp-4)',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-ui)',
                color: 'var(--text-muted)',
                boxShadow: '4px 4px 0 var(--shadow-warm)',
              }}
            >
              📋 <strong>Employee File — Pip</strong> · Role: Junior Dream Engineer · Clearance: Night Shift Only ⭐
            </motion.div>
          )}
        </motion.div>
      </div>

      <style>{`
        [data-theme='dream'] .hero-scenic-bg {
          filter: brightness(0.68) saturate(1.15) hue-rotate(205deg);
        }
        [data-theme='dream'] .hero-theme-overlay {
          background: radial-gradient(circle at 50% 50%, rgba(26, 18, 37, 0.4) 0%, rgba(15, 10, 24, 0.75) 100%);
        }
        [data-theme='dream'] .hero-liquid-glass {
          background: rgba(26, 17, 36, 0.72) !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.55), 0 0 24px rgba(245, 158, 11, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
        }
        [data-theme='dream'] .easter-egg-btn {
          background: rgba(36, 22, 50, 0.8) !important;
          border-color: rgba(245, 158, 11, 0.6) !important;
          color: #fff8f1 !important;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
        }
        [data-theme='dream'] #hero-heading {
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.25) !important;
        }
      `}</style>
    </section>
  );
}
