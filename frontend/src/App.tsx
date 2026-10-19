// =============================================================
// PIP.EXE — App Root
// =============================================================

import { useEffect, useState } from 'react';
import { SoundProvider } from './context/SoundProvider';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { CharacterDossier } from './components/CharacterDossier';
import { ProjectShelf } from './components/ProjectShelf';
import { OriginStoryboard } from './components/OriginStoryboard';
import { DreamGuestbook } from './components/DreamGuestbook';
import { SiteFooter } from './components/SiteFooter';
import { SparkleTrailCanvas } from './components/SparkleTrailCanvas';
import { SpotlightCursor } from './components/ui/spotlight-cursor';
import { DraggableDreamWindow } from './components/DraggableDreamWindow';
import { SakuraDriftModal } from './components/SakuraDriftModal';
import { SakuraHopModal } from './components/SakuraHopModal';
import { VisitorCounterModal } from './components/VisitorCounterModal';
import { usePersistentState } from './hooks/usePersistentState';
import { useIsMobile } from './hooks/useIsMobile';
import { getAudioEngine } from './lib/audioEngine';
import type { Theme } from './lib/types';

import './styles/global.css';

function isTheme(v: unknown): v is Theme {
  return v === 'day' || v === 'dream';
}
function isBool(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

export default function App() {
  const [theme, setTheme] = usePersistentState<Theme>('pip-theme', 'day', isTheme);
  const [chaosMode, setChaosMode] = usePersistentState<boolean>('pip-chaos', false, isBool);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const isMobile = useIsMobile();

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  function handleThemeToggle() {
    setTheme((prev) => (prev === 'day' ? 'dream' : 'day'));
  }

  function handleChaosToggle() {
    setChaosMode((prev) => !prev);
  }

  function handleOpenGame() {
    getAudioEngine().unlock().catch(() => {});
    setIsGameOpen(true);
  }

  return (
    <SoundProvider>
      {/* Global cursor trail (decorative) */}
      <SparkleTrailCanvas />
      {/* Soft theme-aware spotlight glow that follows the cursor */}
      <SpotlightCursor />

      {/* Skip link */}
      <a href="#hero" className="skip-link">
        Skip to content
      </a>

      {/* Draggable console (chaos mode only) — remount when chaos toggles to reset closed state */}
      <DraggableDreamWindow key={chaosMode ? 'chaos-on' : 'chaos-off'} chaosMode={chaosMode} />

      {/* Main layout */}
      <div
        id="pip-app"
        className={chaosMode ? 'chaos-mode' : ''}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <SiteHeader
          theme={theme}
          onThemeToggle={handleThemeToggle}
          chaosMode={chaosMode}
          onChaosToggle={handleChaosToggle}
          onPlayGame={handleOpenGame}
        />

        <main id="main-content" style={{ flex: 1 }}>
          <HeroSection chaosMode={chaosMode} onPlayGame={handleOpenGame} />

          <div
            aria-hidden="true"
            className="section-divider"
            style={{ margin: 0, padding: '0 clamp(1.5rem, 4vw, 3rem)' }}
          >
            ✦ Work ✦
          </div>

          <ProjectShelf chaosMode={chaosMode} />

          <div
            aria-hidden="true"
            className="section-divider"
            style={{ margin: 0, padding: '0 clamp(1.5rem, 4vw, 3rem)' }}
          >
            ✦ Story ✦
          </div>

          <OriginStoryboard />

          <div
            aria-hidden="true"
            className="section-divider"
            style={{ margin: 0, padding: '0 clamp(1.5rem, 4vw, 3rem)' }}
          >
            ✦ About ✦
          </div>

          <CharacterDossier chaosMode={chaosMode} />

          <div
            aria-hidden="true"
            className="section-divider"
            style={{ margin: 0, padding: '0 clamp(1.5rem, 4vw, 3rem)' }}
          >
            ✦ Guestbook ✦
          </div>

          <DreamGuestbook />
        </main>

        <SiteFooter />

        {/* Floating Cozy Game Trigger (bottom right) */}
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 40 }}>
          <button
            type="button"
            onClick={handleOpenGame}
            aria-label={isMobile ? "Play Sakura Cloud Hop Mini-Game" : "Play Sakura Drift Mini-Game"}
            title={isMobile ? "🌸 Hop through the nursery clouds!" : "🌸 Take a cozy 1-minute drift lap!"}
            style={{
              background: 'linear-gradient(180deg, var(--control-surface) 0%, var(--surface-panel) 100%)',
              border: '1.5px solid var(--border-warm)',
              borderRadius: '9999px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px var(--shadow-warm), inset 0 1px 0 rgba(255,255,255,0.25)',
              transition: 'all 0.22s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 12px 28px var(--shadow-warm)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-warm)';
              e.currentTarget.style.boxShadow = '0 8px 24px var(--shadow-warm)';
            }}
          >
            <span style={{ fontSize: '18px' }}>🌸</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--body-text)', lineHeight: 1.1 }}>
                {isMobile ? 'Sakura Hop' : 'Sakura Drift'}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.62rem', fontWeight: 600, color: 'var(--accent)' }}>
                {isMobile ? 'Cloud Hop 🌙' : 'Take a 1-min cozy lap ☕'}
              </div>
            </div>
          </button>
        </div>

        {/* Device-adaptive Mini-Game Modal */}
        {isMobile ? (
          <SakuraHopModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
        ) : (
          <SakuraDriftModal isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} />
        )}

        {/* Cozy Retro System Window Visitor Counter Widget */}
        <VisitorCounterModal />
      </div>
    </SoundProvider>
  );
}
