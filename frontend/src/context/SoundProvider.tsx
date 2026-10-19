// =============================================================
// PIP.EXE — Sound Provider Context
// =============================================================

import React, { createContext, useContext, useEffect } from 'react';
import { getAudioEngine } from '../lib/audioEngine';
import { usePersistentState } from '../hooks/usePersistentState';

interface SoundContextValue {
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggleSound: () => void;
}

const SoundContext = createContext<SoundContextValue>({
  soundEnabled: false,
  setSoundEnabled: () => {},
  toggleSound: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = usePersistentState<boolean>(
    'pip-sound',
    true,
    (v): v is boolean => typeof v === 'boolean',
  );

  useEffect(() => {
    const engine = getAudioEngine();
    engine.initUnlockListeners();
    engine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      getAudioEngine().destroy();
    };
  }, []);

  function toggleSound() {
    setSoundEnabled((prev) => {
      const next = !prev;
      const engine = getAudioEngine();
      engine.setMuted(!next);
      if (next) {
        engine.unlock().then(() => {
          engine.playChime(880);
        });
      }
      return next;
    });
  }

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
}

/**
 * Hook to access the sound context.
 * (This file exports both a provider component and a hook.)
 */
/* oxlint-disable-next-line react/only-export-components */
export function useSoundContext(): SoundContextValue {
  return useContext(SoundContext);
}
