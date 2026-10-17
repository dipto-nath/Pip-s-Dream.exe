// =============================================================
// PIP.EXE — Domain Types
// =============================================================

export type Theme = 'day' | 'dream';

export type LanternPreset = 'whisper' | 'moonbeam' | 'stardust';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  timestamp: number;
  dateDisplay: string;
}

export interface StoryScene {
  id: string;
  chapter: number;
  title: string;
  body: string;
  icon: string;
}

export interface ProjectMeta {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  asset?: string;
}

export interface NightlightPreset {
  id: LanternPreset;
  label: string;
  description: string;
  intensity: number;
  color: string;
}

export interface DeliveryDestination {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
}

export interface AppPreferences {
  theme: Theme;
  soundEnabled: boolean;
  chaosMode: boolean;
}

export interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  type: 'star' | 'cross' | 'dot';
}
