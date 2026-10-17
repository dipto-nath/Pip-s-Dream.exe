// =============================================================
// PIP.EXE — Audio Engine (Web Audio API)
// =============================================================

import { LULLABY_NOTES, LULLABY_DURATION } from './dreamContent';

type AudioState = 'idle' | 'playing' | 'muted';

class PipAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private state: AudioState = 'idle';
  private scheduledOscillators: OscillatorNode[] = [];
  private lullabyTimer: ReturnType<typeof setTimeout> | null = null;
  private isLooping = false;

  private get isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext !== 'undefined';
  }

  private getContext(): AudioContext | null {
    if (!this.isSupported) return null;
    if (!this.ctx) {
      try {
        const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.45;
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  private async resumeContext(): Promise<boolean> {
    const ctx = this.getContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  get audioState(): AudioState {
    return this.state;
  }

  get isMuted(): boolean {
    return this.state === 'muted';
  }

  get isPlaying(): boolean {
    return this.state === 'playing';
  }

  setMuted(muted: boolean): void {
    if (muted) {
      this.state = 'muted';
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx?.currentTime ?? 0, 0.05);
      }
      this.stopLullaby();
    } else {
      this.state = 'idle';
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0.45, this.ctx?.currentTime ?? 0, 0.05);
      }
    }
  }

  async playChime(frequency = 880, duration = 0.18): Promise<void> {
    if (this.isMuted) return;
    const ok = await this.resumeContext();
    if (!ok || !this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.12, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.22, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.02);

    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch { /* ignore */ }
    };
    this.scheduledOscillators.push(osc);
  }

  private scheduleNote(freq: number, startTime: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.025);
    gain.gain.setTargetAtTime(0.15, startTime + 0.025, duration * 0.3);
    gain.gain.setTargetAtTime(0.001, startTime + duration * 0.5, duration * 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    osc.onended = () => {
      try { osc.disconnect(); gain.disconnect(); } catch { /* ignore */ }
    };
    this.scheduledOscillators.push(osc);
  }

  async startLullaby(): Promise<void> {
    if (this.isMuted || this.isPlaying) return;
    const ok = await this.resumeContext();
    if (!ok || !this.ctx) return;

    this.state = 'playing';
    this.isLooping = true;
    this.scheduleLullabyLoop();
  }

  private scheduleLullabyLoop(): void {
    if (!this.isLooping || !this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    for (const note of LULLABY_NOTES) {
      this.scheduleNote(note.freq, now + note.delay, note.duration);
    }

    this.lullabyTimer = setTimeout(() => {
      if (this.isLooping && !this.isMuted) {
        this.scheduleLullabyLoop();
      }
    }, LULLABY_DURATION * 1000 - 200);
  }

  stopLullaby(): void {
    this.isLooping = false;
    if (this.state === 'playing') {
      this.state = 'idle';
    }
    if (this.lullabyTimer !== null) {
      clearTimeout(this.lullabyTimer);
      this.lullabyTimer = null;
    }
    // Stop scheduled oscillators
    const toStop = [...this.scheduledOscillators];
    this.scheduledOscillators = [];
    for (const osc of toStop) {
      try {
        osc.stop(this.ctx?.currentTime ?? 0);
      } catch { /* ignore */ }
    }
  }

  async playEasterEggChime(): Promise<void> {
    if (this.isMuted) return;
    const ok = await this.resumeContext();
    if (!ok || !this.ctx) return;

    const melody = [523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      this.scheduleNote(freq, (this.ctx?.currentTime ?? 0) + i * 0.15, 0.5);
    });
  }

  destroy(): void {
    this.stopLullaby();
    if (this.ctx) {
      try { this.ctx.close(); } catch { /* ignore */ }
      this.ctx = null;
    }
    this.masterGain = null;
  }
}

// Singleton
let engineInstance: PipAudioEngine | null = null;

export function getAudioEngine(): PipAudioEngine {
  if (!engineInstance) {
    engineInstance = new PipAudioEngine();
  }
  return engineInstance;
}
