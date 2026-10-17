// =============================================================
// PIP.EXE — EasterEgg Component
// Hidden bedtime note + confetti celebration
// =============================================================

import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';

const SECRET_NOTE =
  'Between the last lullaby and the first light, I saved one small dream just for you. Keep it somewhere warm. Visit again whenever the world gets a little too loud. — Pip ⭐';

interface EasterEggProps {
  onEggFound?: () => void;
}

export function EasterEggTrigger({ onEggFound }: EasterEggProps) {
  const [found, setFound] = useState(false);
  const [shown, setShown] = useState(false);
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { playEasterEgg } = useSound(soundEnabled);

  const handleActivate = useCallback(async () => {
    if (found) {
      setShown(true);
      return;
    }

    setFound(true);
    setShown(true);
    onEggFound?.();

    if (!prefersReduced) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#fff8f1', '#a34063', '#f59e0b', '#fbbf24'],
        gravity: 0.8,
        scalar: 0.85,
      });
    }

    await playEasterEgg();
  }, [found, prefersReduced, playEasterEgg, onEggFound]);

  return (
    <>
      <button
        onClick={handleActivate}
        aria-label="A secret star — there might be something hidden here"
        title="⭐ Something's hiding…"
        style={{
          position: 'absolute',
          top: '-8px',
          right: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.3rem',
          zIndex: 10,
          animation: 'pulse-glow 3s ease-in-out infinite',
          filter: 'drop-shadow(0 0 6px #f59e0b)',
          padding: '4px',
          borderRadius: '50%',
          lineHeight: 1,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.35) rotate(15deg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = '';
        }}
      >
        ✦
      </button>

      <AnimatePresence>
        {shown && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 300,
              maxWidth: '420px',
              width: 'calc(100% - 2rem)',
            }}
          >
            <div className="retro-window">
              <div className="retro-window__titlebar">
                <div className="retro-window__dots">
                  <span className="retro-window__dot retro-window__dot--red" />
                  <span className="retro-window__dot retro-window__dot--amber" />
                  <span className="retro-window__dot retro-window__dot--green" />
                </div>
                <span>pip://secret/bedtime-note.txt</span>
              </div>
              <div
                className="retro-window__body"
                style={{
                  background: 'var(--surface-panel)',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌙</div>
                <p
                  style={{
                    fontFamily: 'var(--font-story)',
                    fontStyle: 'italic',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    color: 'var(--body-text)',
                    marginBottom: '1.5rem',
                  }}
                >
                  {SECRET_NOTE}
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => setShown(false)}
                  style={{ fontSize: '0.85rem' }}
                >
                  Close ✦
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {shown && (
        <div
          onClick={() => setShown(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,16,20,0.6)',
            zIndex: 299,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}
    </>
  );
}
