// =============================================================
// PIP.EXE — Audio Engine (Web Audio API)
// =============================================================

import { LULLABY_NOTES, LULLABY_DURATION } from './dreamContent';

export interface DreamChimeNote {
  freq: number;
  delay: number;
  duration: number;
}

export interface DreamChimeConfig {
  id: string;
  name: string;
  cycleDuration: number;
  notes: DreamChimeNote[];
}

export const DREAM_CHIMES: Record<string, DreamChimeConfig> = {
  'bakers-dream': {
    id: 'bakers-dream',
    name: "The Little Baker's Warm Hearth Chime",
    cycleDuration: 3.2,
    // Warm, comforting pastry melody (C major pentatonic, rich cozy hearth)
    notes: [
      { freq: 523.25, delay: 0.0, duration: 0.45 }, // C5
      { freq: 659.25, delay: 0.35, duration: 0.45 }, // E5
      { freq: 783.99, delay: 0.72, duration: 0.5 }, // G5
      { freq: 659.25, delay: 1.15, duration: 0.4 }, // E5
      { freq: 523.25, delay: 1.52, duration: 0.4 }, // C5
      { freq: 392.00, delay: 1.9, duration: 0.55 }, // G4
      { freq: 523.25, delay: 2.35, duration: 0.8 }, // C5
    ],
  },
  'hedgehog-den': {
    id: 'hedgehog-den',
    name: "The Hedgehog's Cloud Castle Chime",
    cycleDuration: 3.0,
    // Playful, bouncing cloud melody (E minor pentatonic, whimsical hop)
    notes: [
      { freq: 659.25, delay: 0.0, duration: 0.32 }, // E5
      { freq: 783.99, delay: 0.28, duration: 0.32 }, // G5
      { freq: 880.00, delay: 0.58, duration: 0.45 }, // A5
      { freq: 783.99, delay: 0.94, duration: 0.32 }, // G5
      { freq: 659.25, delay: 1.25, duration: 0.32 }, // E5
      { freq: 587.33, delay: 1.55, duration: 0.4 }, // D5
      { freq: 659.25, delay: 1.92, duration: 0.8 }, // E5
    ],
  },
  'stargazer-tower': {
    id: 'stargazer-tower',
    name: "The Stargazer's Kaleidoscope Chime",
    cycleDuration: 3.3,
    // Sparkling, celestial shooting star melody (G major / high twinkling octaves)
    notes: [
      { freq: 783.99, delay: 0.0, duration: 0.32 }, // G5
      { freq: 987.77, delay: 0.26, duration: 0.32 }, // B5
      { freq: 1174.66, delay: 0.54, duration: 0.5 }, // D6
      { freq: 1046.50, delay: 0.95, duration: 0.38 }, // C6
      { freq: 783.99, delay: 1.3, duration: 0.38 }, // G5
      { freq: 659.25, delay: 1.65, duration: 0.38 }, // E5
      { freq: 783.99, delay: 2.05, duration: 0.85 }, // G5
    ],
  },
  'whisper-lake': {
    id: 'whisper-lake',
    name: "The Whisper Lake Haven Chime",
    cycleDuration: 3.5,
    // Gentle flowing ripples, antique music box (A minor pentatonic, serene drift)
    notes: [
      { freq: 880.00, delay: 0.0, duration: 0.4 }, // A5
      { freq: 1046.50, delay: 0.35, duration: 0.45 }, // C6
      { freq: 1318.51, delay: 0.78, duration: 0.6 }, // E6
      { freq: 1174.66, delay: 1.28, duration: 0.45 }, // D6
      { freq: 880.00, delay: 1.7, duration: 0.4 }, // A5
      { freq: 783.99, delay: 2.08, duration: 0.45 }, // G5
      { freq: 880.00, delay: 2.5, duration: 0.85 }, // A5
    ],
  },
  'cloud-citadel': {
    id: 'cloud-citadel',
    name: "The High Cloud Citadel Grand Chime",
    cycleDuration: 3.8,
    // Grand celestial bells & liquid moonlight hourglass (C high octave majesty)
    notes: [
      { freq: 1046.50, delay: 0.0, duration: 0.48 }, // C6
      { freq: 783.99, delay: 0.42, duration: 0.38 }, // G5
      { freq: 880.00, delay: 0.82, duration: 0.38 }, // A5
      { freq: 1046.50, delay: 1.22, duration: 0.48 }, // C6
      { freq: 1318.51, delay: 1.72, duration: 0.68 }, // E6
      { freq: 1046.50, delay: 2.32, duration: 0.38 }, // C6
      { freq: 783.99, delay: 2.68, duration: 0.42 }, // G5
      { freq: 1046.50, delay: 3.08, duration: 0.9 }, // C6
    ],
  },
};

type AudioState = 'idle' | 'playing' | 'muted';

class PipAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private state: AudioState = 'idle';
  private scheduledOscillators: OscillatorNode[] = [];
  private lullabyTimer: ReturnType<typeof setTimeout> | null = null;
  private isLooping = false;
  private isStarting = false;
  private startGeneration = 0;

  // Destination dream chimes state
  private currentDreamId: string | null = null;
  private dreamChimeTimer: ReturnType<typeof setTimeout> | null = null;
  private isDreamChimeLooping = false;
  private isDreamChimeStarting = false;
  private dreamChimeGen = 0;

  private get isSupported(): boolean {
    return typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext !== 'undefined';
  }

  public getContext(): AudioContext | null {
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

  public async resumeContext(): Promise<boolean> {
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

  /**
   * Unlock AudioContext on direct user interaction (click, keydown, touch)
   */
  public async unlock(): Promise<boolean> {
    return this.resumeContext();
  }

  /**
   * Auto-unlock Web Audio on the very first user interaction anywhere on the window
   */
  public initUnlockListeners(): void {
    if (typeof window === 'undefined') return;
    const unlockHandler = () => {
      this.unlock().catch(() => {});
      const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
      events.forEach((evt) => window.removeEventListener(evt, unlockHandler));
    };
    const events = ['click', 'touchstart', 'keydown', 'pointerdown'];
    events.forEach((evt) => window.addEventListener(evt, unlockHandler, { once: true, passive: true }));
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
      this.startGeneration++;
      this.isStarting = false;
      this.state = 'muted';
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0, this.ctx?.currentTime ?? 0, 0.05);
      }
      this.stopLullaby();
      this.stopDreamChime();
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
      const idx = this.scheduledOscillators.indexOf(osc);
      if (idx !== -1) {
        this.scheduledOscillators.splice(idx, 1);
      }
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
      const idx = this.scheduledOscillators.indexOf(osc);
      if (idx !== -1) {
        this.scheduledOscillators.splice(idx, 1);
      }
    };
    this.scheduledOscillators.push(osc);
  }

  private scheduleChimeBell(freq: number, startTime: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;

    // Primary bell tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.26, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);

    // Harmonic sparkle overtone for celestial music box resonance
    const overtone = this.ctx.createOscillator();
    const overtoneGain = this.ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2.0, startTime);

    overtoneGain.gain.setValueAtTime(0, startTime);
    overtoneGain.gain.linearRampToValueAtTime(0.06, startTime + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0005, startTime + duration * 0.65);

    overtone.connect(overtoneGain);
    overtoneGain.connect(this.masterGain);
    overtone.start(startTime);
    overtone.stop(startTime + duration * 0.65 + 0.02);

    const cleanup = (o: OscillatorNode, g: GainNode) => {
      try { o.disconnect(); g.disconnect(); } catch { /* ignore */ }
      const idx = this.scheduledOscillators.indexOf(o);
      if (idx !== -1) this.scheduledOscillators.splice(idx, 1);
    };

    osc.onended = () => cleanup(osc, gain);
    overtone.onended = () => cleanup(overtone, overtoneGain);

    this.scheduledOscillators.push(osc, overtone);
  }

  async startLullaby(): Promise<void> {
    if (this.isMuted || this.isPlaying || this.isStarting) return;
    this.isStarting = true;
    const currentGen = ++this.startGeneration;

    try {
      const ok = await this.resumeContext();
      if (!ok || !this.ctx) return;
      if (this.isMuted || this.startGeneration !== currentGen) return;

      this.state = 'playing';
      this.isLooping = true;
      this.scheduleLullabyLoop();
    } finally {
      if (this.startGeneration === currentGen) {
        this.isStarting = false;
      }
    }
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
    this.startGeneration++;
    this.isStarting = false;
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

  // --- Destination Dream Chimes (5 unique melodies) ---
  get playingDreamId(): string | null {
    return this.isDreamChimeLooping ? this.currentDreamId : null;
  }

  get isDreamChiming(): boolean {
    return this.isDreamChimeLooping;
  }

  async startDreamChime(dreamId: string): Promise<boolean> {
    if (this.isMuted || (this.isDreamChimeLooping && this.currentDreamId === dreamId) || this.isDreamChimeStarting) return true;

    this.stopDreamChime();
    this.stopLullaby();

    this.isDreamChimeStarting = true;
    this.currentDreamId = dreamId;
    const currentGen = ++this.dreamChimeGen;

    try {
      const ok = await this.resumeContext();
      if (!ok || !this.ctx) return false;
      if (this.dreamChimeGen !== currentGen) return false;

      this.isDreamChimeLooping = true;
      this.scheduleDreamChimeLoop(dreamId);
      return true;
    } finally {
      if (this.dreamChimeGen === currentGen) {
        this.isDreamChimeStarting = false;
      }
    }
  }

  private scheduleDreamChimeLoop(dreamId: string): void {
    if (!this.isDreamChimeLooping || !this.ctx || this.isMuted) return;

    const config = DREAM_CHIMES[dreamId] || DREAM_CHIMES['bakers-dream'];
    const now = this.ctx.currentTime;
    for (const note of config.notes) {
      this.scheduleChimeBell(note.freq, now + note.delay, note.duration);
    }

    this.dreamChimeTimer = setTimeout(() => {
      if (this.isDreamChimeLooping && !this.isMuted && this.currentDreamId === dreamId) {
        this.scheduleDreamChimeLoop(dreamId);
      }
    }, Math.max(1200, config.cycleDuration * 1000 - 150));
  }

  stopDreamChime(): void {
    this.dreamChimeGen++;
    this.isDreamChimeStarting = false;
    this.isDreamChimeLooping = false;
    this.currentDreamId = null;

    if (this.dreamChimeTimer !== null) {
      clearTimeout(this.dreamChimeTimer);
      this.dreamChimeTimer = null;
    }

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
    this.stopDreamChime();
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
