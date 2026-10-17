// =============================================================
// PIP.EXE — NightlightCollection
// Project 02: Working lantern controls with glow state
// =============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Power } from 'lucide-react';
import { NIGHTLIGHT_PRESETS } from '../lib/dreamContent';
import type { LanternPreset } from '../lib/types';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';

export function NightlightCollection() {
  const [activePreset, setActivePreset] = useState<LanternPreset>('moonbeam');
  const [on, setOn] = useState(true);
  const [intensity, setIntensity] = useState<number>(0.55);
  const { soundEnabled } = useSoundContext();
  const { playChime } = useSound(soundEnabled);

  const preset = NIGHTLIGHT_PRESETS.find((p) => p.id === activePreset)!;
  const effectiveIntensity = on ? intensity : 0;

  function selectPreset(id: LanternPreset) {
    setActivePreset(id);
    const p = NIGHTLIGHT_PRESETS.find((pp) => pp.id === id)!;
    setIntensity(p.intensity);
    playChime(660);
  }

  function handlePresetKeyDown(e: React.KeyboardEvent, index: number) {
    let nextIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % NIGHTLIGHT_PRESETS.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + NIGHTLIGHT_PRESETS.length) % NIGHTLIGHT_PRESETS.length;
    }
    if (nextIndex >= 0) {
      e.preventDefault();
      const nextPreset = NIGHTLIGHT_PRESETS[nextIndex];
      selectPreset(nextPreset.id);
      const container = e.currentTarget.parentElement;
      const radios = container?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      radios?.[nextIndex]?.focus();
    }
  }

  function toggleOn() {
    setOn((prev) => !prev);
    playChime(on ? 440 : 880);
  }

  const glowColor = `rgba(245, 158, 11, ${effectiveIntensity})`;
  const glowSize = `${effectiveIntensity * 80 + 20}px`;

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 'var(--sp-6)',
          alignItems: 'start',
        }}
        className="nightlight-grid"
      >
        {/* Lantern art */}
        <div
          style={{
            width: 'clamp(100px, 16vw, 150px)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--sp-3)',
          }}
        >
          <motion.div
            animate={{ scale: on ? 1 : 0.92 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'relative' }}
          >
            {/* Glow halo */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: `-${Number(glowSize.replace('px', '')) * 0.25}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                transition: 'all 0.5s ease-in-out',
                pointerEvents: 'none',
              }}
            />
            <img
              src="/assets/pip_dream_lantern.png"
              alt="Pip's dream lantern — a small amber lantern decorated with tiny star cutouts"
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-md)',
                transition: 'filter 0.5s ease-in-out, opacity 0.5s',
                opacity: on ? 1 : 0.5,
                filter: on
                  ? `drop-shadow(0 0 ${glowSize} ${glowColor})`
                  : 'grayscale(0.6)',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </motion.div>

          {/* On/Off toggle */}
          <button
            onClick={toggleOn}
            aria-pressed={on}
            aria-label={on ? 'Turn nightlight off' : 'Turn nightlight on'}
            style={{
              background: on ? 'var(--amber)' : 'var(--surface-inset)',
              color: on ? '#1a1014' : 'var(--text-faint)',
              border: `2px solid ${on ? 'var(--amber)' : 'var(--border-warm)'}`,
              borderRadius: 'var(--radius-pill)',
              padding: 'var(--sp-2) var(--sp-4)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              cursor: 'pointer',
              transition: 'all 0.25s',
              boxShadow: on ? `0 0 12px rgba(245,158,11,0.5)` : 'none',
            }}
          >
            <Power size={13} />
            {on ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Controls */}
        <div>
          <h4
            style={{
              fontFamily: 'var(--font-display)',
              marginBottom: 'var(--sp-4)',
              color: 'var(--body-text)',
            }}
          >
            Lantern Settings
          </h4>

          {/* Presets */}
          <div
            role="radiogroup"
            aria-label="Lantern brightness preset"
            style={{
              display: 'flex',
              gap: 'var(--sp-3)',
              marginBottom: 'var(--sp-5)',
              flexWrap: 'wrap',
            }}
          >
            {NIGHTLIGHT_PRESETS.map((p, idx) => (
              <button
                key={p.id}
                role="radio"
                aria-checked={activePreset === p.id}
                tabIndex={activePreset === p.id ? 0 : -1}
                onClick={() => selectPreset(p.id)}
                onKeyDown={(e) => handlePresetKeyDown(e, idx)}
                style={{
                  background: activePreset === p.id ? 'var(--surface-inset)' : 'var(--surface)',
                  border: activePreset === p.id
                    ? '2px solid var(--amber)'
                    : '2px solid var(--border-warm)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: activePreset === p.id ? `0 0 8px rgba(245,158,11,0.35)` : 'none',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activePreset === p.id ? 'var(--amber)' : 'var(--body-text)',
                    marginBottom: 2,
                  }}
                >
                  {p.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-story)',
                    fontSize: '0.75rem',
                    color: 'var(--text-faint)',
                  }}
                >
                  {Math.round(p.intensity * 100)}% brightness
                </div>
              </button>
            ))}
          </div>

          {/* Description */}
          <p
            style={{
              fontFamily: 'var(--font-story)',
              fontStyle: 'italic',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              marginBottom: 'var(--sp-5)',
            }}
          >
            {preset.description}
          </p>

          {/* Intensity slider */}
          <div>
            <label
              htmlFor="lantern-intensity"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display: 'block',
                marginBottom: 'var(--sp-2)',
              }}
            >
              Intensity — {Math.round(effectiveIntensity * 100)}%
            </label>
            <input
              id="lantern-intensity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={intensity}
              onChange={(e) => {
                setIntensity(parseFloat(e.target.value));
                if (!on) setOn(true);
              }}
              disabled={!on}
              aria-label="Lantern brightness intensity"
              style={{
                width: '100%',
                accentColor: 'var(--amber)',
                opacity: on ? 1 : 0.4,
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .nightlight-grid { grid-template-columns: 1fr !important; }
          .nightlight-grid > div:first-child { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
