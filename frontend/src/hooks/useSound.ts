// =============================================================
// PIP.EXE — useSound hook
// =============================================================

import { useCallback } from 'react';
import { getAudioEngine } from '../lib/audioEngine';

export function useSound(soundEnabled: boolean) {
  const playChime = useCallback(
    async (freq = 880) => {
      if (!soundEnabled) return;
      const engine = getAudioEngine();
      await engine.unlock();
      await engine.playChime(freq);
    },
    [soundEnabled],
  );

  const startLullaby = useCallback(async () => {
    if (!soundEnabled) return;
    const engine = getAudioEngine();
    await engine.unlock();
    await engine.startLullaby();
  }, [soundEnabled]);

  const stopLullaby = useCallback(() => {
    getAudioEngine().stopLullaby();
  }, []);

  const playEasterEgg = useCallback(async () => {
    if (!soundEnabled) return;
    const engine = getAudioEngine();
    await engine.unlock();
    await engine.playEasterEggChime();
  }, [soundEnabled]);

  return { playChime, startLullaby, stopLullaby, playEasterEgg };
}
