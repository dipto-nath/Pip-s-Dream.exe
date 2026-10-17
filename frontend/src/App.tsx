// =============================================================
// PIP.EXE — App Root
// =============================================================

import { useEffect } from 'react';
import { SoundProvider } from './context/SoundProvider';
import { SiteHeader } from './components/SiteHeader';
import { HeroSection } from './components/HeroSection';
import { CharacterDossier } from './components/CharacterDossier';
import { ProjectShelf } from './components/ProjectShelf';
import { OriginStoryboard } from './components/OriginStoryboard';
import { DreamGuestbook } from './components/DreamGuestbook';
import { SiteFooter } from './components/SiteFooter';
import { SparkleTrailCanvas } from './components/SparkleTrailCanvas';
import { DraggableDreamWindow } from './components/DraggableDreamWindow';
import { usePersistentState } from './hooks/usePersistentState';
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

  return (
    <SoundProvider>
      {/* Global cursor trail (decorative) */}
      <SparkleTrailCanvas />

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
        />

        <main id="main-content" style={{ flex: 1 }}>
          <HeroSection chaosMode={chaosMode} />

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
      </div>
    </SoundProvider>
  );
}
