// =============================================================
// PIP.EXE — EasterEgg Component
// Whimsical animated secret star charm + confetti celebration + bedtime note
// =============================================================

import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Heart, X, PartyPopper } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useSoundContext } from '../context/SoundProvider';
import { getAudioEngine } from '../lib/audioEngine';

const SECRET_NOTE =
  'Between the last lullaby and the first light, I saved one small dream just for you. Keep it somewhere warm. Visit again whenever the world gets a little too loud. — Pip ⭐';

interface EasterEggProps {
  onEggFound?: () => void;
}

export function EasterEggTrigger({ onEggFound }: EasterEggProps) {
  const [found, setFound] = useState(false);
  const [shown, setShown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled, setSoundEnabled } = useSoundContext();

  const fireConfetti = useCallback(() => {
    if (prefersReduced) return;
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.45 },
      colors: ['#fff8f1', '#a34063', '#f59e0b', '#fbbf24', '#f472b6', '#c084fc'],
      gravity: 0.75,
      scalar: 1,
      ticks: 240,
    });
  }, [prefersReduced]);

  const handleActivate = useCallback(async () => {
    setFound(true);
    setShown(true);
    onEggFound?.();

    fireConfetti();

    // Auto-unmute for the chime if sound was muted
    const engine = getAudioEngine();
    if (!soundEnabled) {
      setSoundEnabled(true);
    }
    engine.setMuted(false);
    await engine.playEasterEggChime();
  }, [fireConfetti, onEggFound, soundEnabled, setSoundEnabled]);

  return (
    <>
      {/* Floating Animated Easter Egg Charm */}
      <motion.button
        onClick={handleActivate}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Secret Stardust Charm — Poke to unlock Pip's hidden dream"
        title="✨ Poke Pip's secret charm!"
        animate={
          prefersReduced
            ? {}
            : {
                y: [0, -8, 0],
                rotate: isHovered ? [0, -6, 6, -3, 3, 0] : [0, 1.5, -1.5, 0],
              }
        }
        transition={
          prefersReduced
            ? {}
            : {
                y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
                rotate: isHovered
                  ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 5, repeat: Infinity, ease: 'easeInOut' },
              }
        }
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="easter-egg-btn"
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px 6px 10px',
          background: isHovered
            ? 'linear-gradient(135deg, rgba(254, 243, 199, 0.92), rgba(253, 230, 138, 0.92))'
            : 'rgba(255, 252, 246, 0.78)',
          backdropFilter: 'blur(12px) saturate(140%)',
          WebkitBackdropFilter: 'blur(12px) saturate(140%)',
          border: '1.5px solid rgba(245, 158, 11, 0.45)',
          borderRadius: 'var(--radius-pill)',
          cursor: 'pointer',
          boxShadow: isHovered
            ? '0 8px 24px rgba(245, 158, 11, 0.35), 0 0 16px rgba(251, 191, 36, 0.4), inset 0 1px 1px #fff'
            : '0 4px 16px rgba(163, 64, 99, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 1px #fff',
          fontFamily: 'var(--font-ui)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--body-text)',
          zIndex: 10,
          userSelect: 'none',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Soft magical ambient glow halo */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '-12px',
            borderRadius: 'var(--radius-pill)',
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: -1,
            animation: prefersReduced ? 'none' : 'pulse-glow 2.5s ease-in-out infinite',
          }}
        />

        {/* Playful Animated Star Icon */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
            transform: isHovered ? 'rotate(30deg) scale(1.15)' : 'rotate(0deg)',
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <Star size={13} fill="currentColor" />
        </span>

        {/* Text prompt with playful micro-copy */}
        <span style={{ letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
          {isHovered ? 'Poke Pip’s Secret! ✨' : found ? 'Pip’s Secret Dream ✦' : 'Secret Stardust 🤫'}
        </span>

        {/* Mini orbiting sparkles */}
        <Sparkles
          size={14}
          style={{
            color: 'var(--accent)',
            animation: prefersReduced ? 'none' : 'spin-slow 6s linear infinite',
          }}
        />
      </motion.button>

      {/* Secret Bedtime Modal Window */}
      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 400,
              maxWidth: '480px',
              width: 'calc(100% - 2.5rem)',
            }}
          >
            <div
              className="retro-window"
              style={{
                borderRadius: 'var(--radius-lg)',
                boxShadow:
                  '0 24px 60px rgba(0, 0, 0, 0.35), 0 0 30px rgba(245, 158, 11, 0.2), 4px 4px 0 var(--border-strong)',
                border: '2.5px solid var(--border-strong)',
              }}
            >
              {/* Window Header */}
              <div
                className="retro-window__titlebar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="retro-window__dots">
                    <span className="retro-window__dot retro-window__dot--red" />
                    <span className="retro-window__dot retro-window__dot--amber" />
                    <span className="retro-window__dot retro-window__dot--green" />
                  </div>
                  <span style={{ fontSize: '0.82rem', fontFamily: 'var(--font-ui)' }}>
                    pip://secret/bedtime-note.txt
                  </span>
                </div>
                <button
                  onClick={() => setShown(false)}
                  aria-label="Close note"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.7)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Window Content */}
              <div
                className="retro-window__body"
                style={{
                  background: 'var(--surface-panel)',
                  padding: 'clamp(1.5rem, 4vw, 2.25rem)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Midnight Nursery Stamp */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px dashed var(--amber)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    marginBottom: '1.25rem',
                    letterSpacing: '0.06em',
                  }}
                >
                  <Star size={12} fill="currentColor" />
                  OFFICIAL DREAM CERTIFICATE · NO. 001
                </div>

                {/* Moon Icon illustration */}
                <div
                  style={{
                    fontSize: '3rem',
                    lineHeight: 1,
                    marginBottom: '1rem',
                    filter: 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4))',
                  }}
                >
                  🌙
                </div>

                {/* Handwritten Bedtime Note */}
                <p
                  style={{
                    fontFamily: 'var(--font-story)',
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.05rem, 2vw, 1.15rem)',
                    lineHeight: 1.7,
                    color: 'var(--body-text)',
                    margin: '0 auto 1.75rem',
                    maxWidth: '42ch',
                  }}
                >
                  "{SECRET_NOTE}"
                </p>

                {/* Interactive Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    className="btn-primary"
                    onClick={fireConfetti}
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <PartyPopper size={14} />
                    More Stardust!
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setShown(false)}
                    style={{
                      fontSize: '0.85rem',
                      padding: '8px 16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Heart size={14} fill="currentColor" />
                    Sleep Well, Pip
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dimmed backdrop overlay */}
      {shown && (
        <div
          onClick={() => setShown(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 16, 28, 0.65)',
            zIndex: 399,
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
          }}
        />
      )}
    </>
  );
}
