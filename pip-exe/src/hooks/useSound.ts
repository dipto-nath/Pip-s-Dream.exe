// =============================================================
// PIP.EXE — useSound hook
// =============================================================

import { useCallback } from 'react';
import { getAudioEngine } from '../lib/audioEngine';

export function useSound(soundEnabled: boolean) {
  const playChime = useCallback(
    async (freq = 880) => {
      if (!soundEnabled) return;
      await getAudioEngine().playChime(freq);
    },
    [soundEnabled],
  );

  const startLullaby = useCallback(async () => {
    if (!soundEnabled) return;
    await getAudioEngine().startLullaby();
  }, [soundEnabled]);

  const stopLullaby = useCallback(() => {
    getAudioEngine().stopLullaby();
  }, []);

  const playEasterEgg = useCallback(async () => {
    if (!soundEnabled) return;
    await getAudioEngine().playEasterEggChime();
  }, [soundEnabled]);

  return { playChime, startLullaby, stopLullaby, playEasterEgg };
}
