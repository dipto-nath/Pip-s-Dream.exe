// =============================================================
// PIP.EXE — LullabyLab
// Project 01: Functional synthesized lullaby player
// =============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Music } from 'lucide-react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';
import { getAudioEngine } from '../lib/audioEngine';

export function LullabyLab() {
  const prefersReduced = useReducedMotionPreference();
  const { soundEnabled } = useSoundContext();
  const { startLullaby, stopLullaby, playChime } = useSound(soundEnabled);
  const [isPlaying, setIsPlaying] = useState(false);

  async function handlePlay() {
    if (!soundEnabled) {
      // Guide user to enable sound
      return;
    }
    if (isPlaying) return;
    await startLullaby();
    setIsPlaying(true);
    playChime(880);
  }

  function handleStop() {
    stopLullaby();
    setIsPlaying(false);
    if (soundEnabled) playChime(440);
  }

  const engine = getAudioEngine();

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 'var(--sp-6)',
          alignItems: 'center',
        }}
        className="lullaby-grid"
      >
        {/* Artwork */}
        <div
          style={{
            width: 'clamp(100px, 18vw, 160px)',
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <motion.img
            src="/assets/pip_lullaby_box.png"
            alt="Pip's tiny music box — a small ornate box with stars carved into the lid"
            loading="lazy"
            animate={isPlaying && !prefersReduced ? { rotate: [0, 2, -2, 0] } : { rotate: 0 }}
            transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-md)',
              filter: isPlaying
                ? 'drop-shadow(0 0 16px rgba(245,158,11,0.5))'
                : 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
              transition: 'filter 0.4s',
            }}
          />

          {/* Playing indicator */}
          {isPlaying && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: -8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 3,
                alignItems: 'flex-end',
              }}
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    borderRadius: 2,
                    background: 'var(--amber)',
                    animation: prefersReduced
                      ? 'none'
                      : `equalizer-bar ${0.4 + i * 0.12}s ease-in-out infinite alternate`,
                    height: `${8 + i * 4}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--sp-2)',
              color: 'var(--body-text)',
            }}
          >
            Pentatonic Dream Sequence
          </h4>
          <p
            style={{
              fontFamily: 'var(--font-story)',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: 'var(--sp-4)',
            }}
          >
            A hand-tuned 23-note melody synthesized live in your browser.
            C5 · D5 · E5 · G5 · A5 · C6 — Pip's personal scale.
          </p>

          {/* Status */}
          <div
            role="status"
            aria-live="polite"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.78rem',
              color: isPlaying ? 'var(--amber)' : 'var(--text-faint)',
              marginBottom: 'var(--sp-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
            }}
          >
            <Music size={14} />
            {!soundEnabled
              ? 'Enable sound in the header to play'
              : isPlaying
                ? 'Playing — looping gently'
                : engine.isPlaying
                  ? 'Playing elsewhere'
                  : 'Stopped — ready to play'}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button
              onClick={handlePlay}
              disabled={isPlaying || !soundEnabled}
              aria-label="Play lullaby"
              className="btn-primary"
              style={{
                fontSize: '0.88rem',
                padding: 'var(--sp-2) var(--sp-5)',
                opacity: isPlaying || !soundEnabled ? 0.5 : 1,
              }}
            >
              <Play size={14} fill="currentColor" />
              Play Lullaby
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              aria-label="Stop lullaby"
              className="btn-secondary"
              style={{
                fontSize: '0.88rem',
                padding: 'var(--sp-2) var(--sp-5)',
                opacity: !isPlaying ? 0.5 : 1,
              }}
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes equalizer-bar {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
        @media (max-width: 480px) {
          .lullaby-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
