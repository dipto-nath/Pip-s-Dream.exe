// =============================================================
// PIP.EXE — SiteHeader
// Navigation, audio toggle, theme toggle, chaos mode
// =============================================================

import { Volume2, VolumeX, Sun, Moon, Zap, ZapOff } from 'lucide-react';
import { useSoundContext } from '../context/SoundProvider';
import { useSound } from '../hooks/useSound';
import type { Theme } from '../lib/types';

interface SiteHeaderProps {
  theme: Theme;
  onThemeToggle: () => void;
  chaosMode: boolean;
  onChaosToggle: () => void;
}

export function SiteHeader({ theme, onThemeToggle, chaosMode, onChaosToggle }: SiteHeaderProps) {
  const { soundEnabled, toggleSound } = useSoundContext();
  const { playChime } = useSound(soundEnabled);

  function handleNavClick() {
    if (soundEnabled) playChime(660);
  }

  function handleSoundToggle() {
    toggleSound();
    if (!soundEnabled) {
      // Will enable — play a quick chime after toggle
      setTimeout(() => playChime(880), 100);
    }
  }

  return (
    <header
      style={{
        background: 'var(--deep-wood)',
        borderBottom: '2px solid var(--border-strong)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px var(--shadow-deep)',
      }}
    >
      {/* URL Bar */}
      <div
        style={{
          background: chaosMode ? 'var(--vintage-berry)' : '#3a2418',
          padding: '5px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          transition: 'background 0.4s',
        }}
      >
        <div style={{ display: 'flex', gap: '5px' }}>
          <span
            style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#ff6b6b', border: '1px solid rgba(0,0,0,0.2)',
            }}
          />
          <span
            style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#fbbf24', border: '1px solid rgba(0,0,0,0.2)',
            }}
          />
          <span
            style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#68d391', border: '1px solid rgba(0,0,0,0.2)',
            }}
          />
        </div>
        <code
          style={{
            fontFamily: 'monospace',
            fontSize: '0.72rem',
            color: 'rgba(255,248,241,0.65)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          pip://midnight-nursery/dream-desk
        </code>
        <span
          className="status-badge"
          style={{
            background: 'rgba(0,0,0,0.3)',
            color: 'var(--glow-amber-bright)',
            border: '1px solid rgba(245,158,11,0.4)',
            fontSize: '0.62rem',
          }}
        >
          Night Shift Active
        </span>
      </div>

      {/* Main navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Branding */}
        <a
          href="#hero"
          onClick={handleNavClick}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--dream-cream)',
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          PIP
          <span style={{ fontSize: '0.75rem', color: 'var(--glow-amber)', fontFamily: 'var(--font-ui)' }}>
            .EXE
          </span>
        </a>

        {/* Nav links */}
        <nav aria-label="Main navigation">
          <ul
            style={{
              display: 'flex',
              gap: '4px',
              listStyle: 'none',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { href: '#work', label: 'Work' },
              { href: '#story', label: 'Story' },
              { href: '#about', label: 'About' },
              { href: '#guestbook', label: 'Guestbook' },
            ].map(({ href, label }) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={handleNavClick}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: 'rgba(255,248,241,0.8)',
                    textDecoration: 'none',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,248,241,0.1)';
                    (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = '';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,248,241,0.8)';
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          {/* Sound toggle */}
          <button
            onClick={handleSoundToggle}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Turn sound off' : 'Turn sound on'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            style={{
              background: soundEnabled ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${soundEnabled ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 'var(--radius-sm)',
              color: soundEnabled ? 'var(--glow-amber-bright)' : 'rgba(255,248,241,0.5)',
              padding: '6px',
              display: 'flex',
              transition: 'all 0.2s',
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => { onThemeToggle(); if (soundEnabled) playChime(760); }}
            aria-pressed={theme === 'dream'}
            aria-label={theme === 'dream' ? 'Switch to day mode' : 'Switch to dream mode'}
            title={theme === 'dream' ? 'Day Mode' : 'Dream Mode'}
            style={{
              background: theme === 'dream' ? 'rgba(163,64,99,0.3)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${theme === 'dream' ? 'rgba(163,64,99,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 'var(--radius-sm)',
              color: theme === 'dream' ? '#cf6e96' : 'rgba(255,248,241,0.5)',
              padding: '6px',
              display: 'flex',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'dream' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Chaos Mode toggle */}
          <button
            onClick={() => { onChaosToggle(); if (soundEnabled) playChime(540); }}
            aria-pressed={chaosMode}
            aria-label={chaosMode ? 'Disable chaos mode' : 'Enable chaos mode'}
            title="Chaos Mode"
            style={{
              background: chaosMode ? 'rgba(163,64,99,0.3)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${chaosMode ? 'rgba(163,64,99,0.5)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 'var(--radius-sm)',
              color: chaosMode ? '#cf6e96' : 'rgba(255,248,241,0.5)',
              padding: '6px',
              display: 'flex',
              transition: 'all 0.2s',
            }}
          >
            {chaosMode ? <Zap size={15} fill="currentColor" /> : <ZapOff size={15} />}
          </button>
        </div>
      </div>

      {/* Marquee ticker */}
      <div className="marquee-wrapper" aria-hidden="true">
        <div className="marquee-track">
          {Array.from({ length: 2 }, (_, copy) =>
            [
              '✦ DREAM DELIVERIES IN PROGRESS',
              '★ LULLABIES SYNTHESIZED: 4,209',
              '🌙 NIGHTLIGHTS CALIBRATED',
              '⭐ PIP IS ON THE NIGHT SHIFT',
              '✦ ALL ROOFTOPS OPERATIONAL',
              '★ DREAM QUEUE: NOMINAL',
              '🎵 MUSIC BOX: TUNED & READY',
            ].map((text, i) => (
              <span key={`${copy}-${i}`} style={{ whiteSpace: 'nowrap' }}>
                {text}
              </span>
            ))
          )}
        </div>
      </div>
    </header>
  );
}
